import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const slug = process.argv[2] || "fhqcm";
const repoRoot = process.cwd();
const tempDir = path.join(repoRoot, ".booksmith-build");
const tempScript = path.join(tempDir, "render-latex-runner.mjs");

await mkdir(tempDir, { recursive: true });

const runner = `
import { loadBookProject, renderLatexProject } from "../src/lib/publishing/latex-renderer.ts";

const slug = ${JSON.stringify(slug)};
const book = await loadBookProject(slug);
const exportPath = await renderLatexProject(book);

console.log(JSON.stringify({
  ok: true,
  slug,
  exportPath,
  sourceFiles: book.sourceFiles.length,
}, null, 2));
`;

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
