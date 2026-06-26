import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const exportDir = path.join(root, "books", slug, "exports", "latex");
const outJson = path.join(exportDir, "booksmith-source-map.json");
const outMd = path.join(exportDir, "booksmith-source-map.md");

function readLines(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8").split(/\r?\n/) : [];
}

function rel(file) {
  return path.relative(exportDir, file).replaceAll("\\", "/");
}

function resolveInput(fromFile, inputPath) {
  const cleaned = inputPath.trim();
  const withExt = path.extname(cleaned) ? cleaned : `${cleaned}.tex`;
  return path.resolve(path.dirname(fromFile), withExt);
}

const entries = [];
const visited = new Set();

function mapFile(file, kind = "root") {
  if (!fs.existsSync(file)) return;
  const real = path.resolve(file);
  if (visited.has(real)) return;
  visited.add(real);

  const lines = readLines(real);
  const emittedFile = rel(real);

  for (let i = 0; i < lines.length; i++) {
    entries.push({
      emittedFile,
      emittedLine: i + 1,
      sourceFile: emittedFile,
      sourceLine: i + 1,
      kind,
    });

    const inputMatch = lines[i].match(/\\(?:input|include)\{([^}]+)\}/);
    if (inputMatch) {
      mapFile(resolveInput(real, inputMatch[1]), "input");
    }
  }
}

mapFile(path.join(exportDir, "main.tex"), "root");

const report = {
  slug,
  generatedAt: new Date().toISOString(),
  entries,
};

fs.writeFileSync(outJson, JSON.stringify(report, null, 2) + "\n");

const byFile = new Map();
for (const entry of entries) {
  byFile.set(entry.emittedFile, (byFile.get(entry.emittedFile) || 0) + 1);
}

fs.writeFileSync(outMd, [
  "# Booksmith LaTeX Source Map",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${report.generatedAt}`,
  `Mapped lines: ${entries.length}`,
  "",
  "## Files",
  "",
  ...[...byFile.entries()].sort().map(([file, count]) => `- ${file}: ${count} lines`),
  "",
].join("\n"));

console.log(`Source map written: ${path.relative(root, outJson)}`);
console.log(`Mapped lines: ${entries.length}`);
