import fs from "node:fs";

function write(file, content) {
  fs.mkdirSync(file.split("/").slice(0, -1).join("/"), { recursive: true });
  fs.writeFileSync(file, content.trimStart(), "utf8");
  console.log("wrote", file);
}

write("src/lib/publishing/manuscript-model.ts", `
export type PublishingTarget =
  | "markdown" | "latex" | "pdf" | "epub" | "web" | "docx" | "print" | "publishing-packet";

export type BooksmithBookConfig = {
  slug: string;
  title: string;
  subtitle?: string;
  series: string;
  status: string;
  version: string;
  purpose: string;
  relatedBooks?: string[];
  canonicalTerms?: string[];
  publishingTargets: PublishingTarget[];
  provenanceRequired: boolean;
};

export type BooksmithSourceFile = {
  relativePath: string;
  outputPath: string;
  kind: "latex" | "markdown" | "asset" | "metadata" | "unknown";
  content: string;
};

export type BooksmithManuscript = {
  slug: string;
  rootPath: string;
  config: BooksmithBookConfig;
  sourceFiles: BooksmithSourceFile[];
  generatedAt: string;
};
`);

write("src/lib/publishing/latex-renderer.ts", `
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { BooksmithBookConfig, BooksmithManuscript, BooksmithSourceFile } from "./manuscript-model";

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
  return "unknown";
}

function toPosix(value: string): string {
  return value.split(path.sep).join("/");
}

function outputPathFor(relativePath: string): string {
  return relativePath.replace(/^books\\/[^/]+\\//, "");
}

export async function loadBookProject(slug: string): Promise<BooksmithManuscript> {
  const rootPath = path.join(repoRoot, "books", slug);
  const configPath = path.join(rootPath, "book.config.json");
  const manuscriptPath = path.join(rootPath, "manuscript");

  const config = await readJson<BooksmithBookConfig>(configPath);
  const files = await walkFiles(manuscriptPath);

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
    \`Book: \${book.config.title}\`,
    book.config.subtitle ? \`Subtitle: \${book.config.subtitle}\` : undefined,
    \`Slug: \${book.slug}\`,
    \`Version: \${book.config.version}\`,
    \`Generated: \${book.generatedAt}\`,
    "",
    "## Source Files",
    "",
    ...book.sourceFiles.map((file) => \`- \${file.relativePath} -> \${file.outputPath} (\${file.kind})\`),
    "",
    "## Provenance",
    "",
    "This export was generated from local Booksmith project source files.",
    "No AI model call is performed by this renderer.",
    "No network service is required.",
    "",
  ].filter(Boolean).join("\\n");
}

export async function renderLatexProject(book: BooksmithManuscript): Promise<string> {
  const exportRoot = path.join(repoRoot, "books", book.slug, "exports", "latex");

  await rm(exportRoot, { recursive: true, force: true });
  await mkdir(exportRoot, { recursive: true });

  for (const source of book.sourceFiles.filter((file) => file.kind === "latex")) {
    const destination = path.join(exportRoot, source.outputPath.replace(/^manuscript\\//, ""));
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, source.content, "utf8");
  }

  await writeFile(path.join(exportRoot, "booksmith-export-manifest.md"), renderLatexManifest(book), "utf8");
  return toPosix(path.relative(repoRoot, exportRoot));
}
`);

write("src/lib/publishing/publishing-packet.ts", `
import type { BooksmithManuscript } from "./manuscript-model";

export function createPublishingPacketReadme(book: BooksmithManuscript): string {
  return [
    \`# \${book.config.title} Publishing Packet\`,
    "",
    "This packet is intended to collect the files needed for human review, proofing, distribution, and long-term provenance.",
    "",
    "## Book",
    "",
    \`- Slug: \${book.slug}\`,
    \`- Version: \${book.config.version}\`,
    \`- Series: \${book.config.series}\`,
    \`- Status: \${book.config.status}\`,
    \`- Provenance required: \${book.config.provenanceRequired ? "yes" : "no"}\`,
    "",
    "## Current Phase One Status",
    "",
    "- LaTeX export folder generation: started",
    "- PDF proof dashboard: pending",
    "- EPUB/DOCX export: pending",
    "- Full publishing packet builder: pending",
    "",
  ].join("\\n");
}
`);

write("src/lib/publishing/README.md", `
# Booksmith Publishing Core

Initial Phase One goal:

\`\`\`text
books/<slug>/book.config.json
books/<slug>/manuscript/**/*.tex
        ↓
BooksmithManuscript
        ↓
deterministic LaTeX export folder
        ↓
books/<slug>/exports/latex/
\`\`\`

Rules:

- Server-side only.
- No React UI imports.
- No AI model calls.
- No network calls.
- No fake manuscripts.
- Preserve editable source.
- Emit provenance/manifest files with every export.
`);

write("scripts/render-latex.mjs", `
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const slug = process.argv[2] || "fhqcm";
const repoRoot = process.cwd();
const tempDir = path.join(repoRoot, ".booksmith-build");
const tempScript = path.join(tempDir, "render-latex-runner.mjs");

await mkdir(tempDir, { recursive: true });

const runner = \`
import { loadBookProject, renderLatexProject } from "../src/lib/publishing/latex-renderer.ts";

const slug = \${JSON.stringify(slug)};
const book = await loadBookProject(slug);
const exportPath = await renderLatexProject(book);

console.log(JSON.stringify({
  ok: true,
  slug,
  exportPath,
  sourceFiles: book.sourceFiles.length,
}, null, 2));
\`;

await writeFile(tempScript, runner, "utf8");

try {
  execFileSync(process.execPath, ["--import", "tsx", tempScript], {
    cwd: repoRoot,
    stdio: "inherit",
  });
} catch {
  console.error("");
  console.error("Booksmith LaTeX render failed.");
  console.error("Install tsx if needed: npm install -D tsx");
  process.exit(1);
}
`);

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
pkg.scripts = {
  ...pkg.scripts,
  "render:latex": "node scripts/render-latex.mjs",
  "render:latex:fhqcm": "node scripts/render-latex.mjs fhqcm"
};
pkg.devDependencies = {
  ...pkg.devDependencies,
  tsx: "^4.20.0"
};
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\\n");

console.log("Phase 1 publishing core files written.");
