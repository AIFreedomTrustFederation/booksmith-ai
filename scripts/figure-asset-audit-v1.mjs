import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const bookDir = path.join(root, "books", slug);
const exportDir = path.join(bookDir, "exports", "latex");
const pdfDir = path.join(bookDir, "exports", "pdf");

const outJson = path.join(pdfDir, "booksmith-figure-asset-audit-v1.json");
const outMd = path.join(pdfDir, "booksmith-figure-asset-audit-v1.md");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function rel(file, base = root) {
  return path.relative(base, file).replaceAll("\\", "/");
}

const texFiles = walk(exportDir).filter((file) => file.endsWith(".tex"));
const assetFiles = walk(path.join(bookDir, "assets")).filter((file) =>
  /\.(png|jpg|jpeg|webp|pdf|svg)$/i.test(file),
);

const placeholders = [];

for (const file of texFiles) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

  lines.forEach((line, index) => {
    const match = line.match(/\\FHQCMFigurePlaceholder\{([^}]*)\}\{([^}]*)\}\{([^}]*)\}/);

    if (match) {
      placeholders.push({
        file: rel(file, exportDir),
        line: index + 1,
        title: match[1],
        caption: match[2],
        key: match[3],
      });
    }
  });
}

const result = {
  slug,
  generatedAt: new Date().toISOString(),
  status: placeholders.length === 0 ? "PASS" : "FAIL_PLACEHOLDERS_PRESENT",
  assetCount: assetFiles.length,
  placeholderCount: placeholders.length,
  placeholders,
  assets: assetFiles.map((file) => rel(file, bookDir)),
};

fs.mkdirSync(pdfDir, { recursive: true });
fs.writeFileSync(outJson, JSON.stringify(result, null, 2) + "\n");

fs.writeFileSync(outMd, [
  "# Booksmith Figure Asset Audit v1",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${result.generatedAt}`,
  `Status: **${result.status}**`,
  `Figure/image assets found: ${result.assetCount}`,
  `Figure placeholders found: ${result.placeholderCount}`,
  "",
  "## Meaning",
  "",
  placeholders.length
    ? "This proof still contains unresolved figure placeholders. It is acceptable for draft review, but it should not be marked publication-clean."
    : "No unresolved figure placeholders were found.",
  "",
  "## Placeholders",
  "",
  placeholders.length
    ? placeholders.map((item, i) => [
        `### ${i + 1}. ${item.key}`,
        "",
        `- Source: \`${item.file}:${item.line}\``,
        `- Title: ${item.title}`,
        `- Caption: ${item.caption}`,
        "",
      ].join("\n")).join("\n")
    : "None.",
  "",
  "## Existing Assets",
  "",
  result.assets.length ? result.assets.map((asset) => `- ${asset}`).join("\n") : "None.",
  "",
].join("\n"));

console.log(`Figure asset audit written: ${path.relative(root, outMd)}`);
console.log(`Placeholders: ${placeholders.length}`);

if (placeholders.length > 0) {
  process.exitCode = 2;
}
