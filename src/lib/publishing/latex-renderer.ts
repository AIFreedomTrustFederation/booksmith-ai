import { copyFile, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { BooksmithBookConfig, BooksmithManuscript, BooksmithSourceFile } from "./manuscript-model";
import { createRewriteReport, renderRewriteReport, rewriteLatexExportFile } from "./latex-export-rewriter";

const repoRoot = process.cwd();

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

async function walkFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkFiles(fullPath);
    return [fullPath];
  }));
  return files.flat().sort();
}

function classifyFile(filePath: string): BooksmithSourceFile["kind"] {
  if (filePath.endsWith(".tex")) return "latex";
  if (filePath.endsWith(".md")) return "markdown";
  if (filePath.endsWith(".json")) return "metadata";
  if (filePath.match(/\.(png|jpg|jpeg|webp|pdf|svg)$/i)) return "asset";
  return "unknown";
}

function toPosix(value: string): string {
  return value.split(path.sep).join("/");
}

function outputPathFor(relativePath: string): string {
  return relativePath.replace(/^books\/[^/]+\//, "");
}

export async function loadBookProject(slug: string): Promise<BooksmithManuscript> {
  const rootPath = path.join(repoRoot, "books", slug);
  const configPath = path.join(rootPath, "book.config.json");
  const manuscriptPath = path.join(rootPath, "manuscript");
  const assetPath = path.join(rootPath, "assets");

  const config = await readJson<BooksmithBookConfig>(configPath);
  const files = [
    ...(await walkFiles(manuscriptPath)),
    ...(await walkFiles(assetPath).catch(() => [])),
  ];

  const sourceFiles = await Promise.all(files.map(async (filePath) => {
    const relativePath = toPosix(path.relative(repoRoot, filePath));
    return {
      relativePath,
      outputPath: toPosix(outputPathFor(relativePath)),
      kind: classifyFile(filePath),
      content: await readFile(filePath, "utf8"),
    } satisfies BooksmithSourceFile;
  }));

  return {
    slug,
    rootPath: toPosix(path.relative(repoRoot, rootPath)),
    config,
    sourceFiles,
    generatedAt: new Date().toISOString(),
  };
}

export function renderLatexManifest(book: BooksmithManuscript): string {
  return [
    "# Booksmith LaTeX Export Manifest",
    "",
    `Book: ${book.config.title}`,
    book.config.subtitle ? `Subtitle: ${book.config.subtitle}` : undefined,
    `Slug: ${book.slug}`,
    `Version: ${book.config.version}`,
    `Generated: ${book.generatedAt}`,
    "",
    "## Source Files",
    "",
    ...book.sourceFiles.map((file) => `- ${file.relativePath} -> ${file.outputPath} (${file.kind})`),
    "",
    "## Provenance",
    "",
    "This export was generated from local Booksmith project source files.",
    "No AI model call is performed by this renderer.",
    "No network service is required.",
    "",
  ].filter(Boolean).join("\n");
}

export async function renderLatexProject(book: BooksmithManuscript): Promise<string> {
  const exportRoot = path.join(repoRoot, "books", book.slug, "exports", "latex");

  await rm(exportRoot, { recursive: true, force: true });
  await mkdir(exportRoot, { recursive: true });

  const rewriteReport = createRewriteReport();

  for (const source of book.sourceFiles.filter((file) => file.kind === "latex")) {
    const relativeOutputPath = source.outputPath.replace(/^manuscript\//, "");
    const destination = path.join(exportRoot, relativeOutputPath);
    const rewrittenContent = rewriteLatexExportFile(relativeOutputPath, source.content, rewriteReport);

    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, rewrittenContent, "utf8");
  }

  for (const source of book.sourceFiles.filter((file) => file.kind === "asset")) {
    const sourcePath = path.join(repoRoot, source.relativePath);
    const destination = path.join(exportRoot, source.outputPath);
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(sourcePath, destination);
  }

  await writeFile(path.join(exportRoot, "booksmith-export-manifest.md"), renderLatexManifest(book), "utf8");
  await writeFile(path.join(exportRoot, "booksmith-rewrite-report.md"), renderRewriteReport(rewriteReport), "utf8");
  return toPosix(path.relative(repoRoot, exportRoot));
}
