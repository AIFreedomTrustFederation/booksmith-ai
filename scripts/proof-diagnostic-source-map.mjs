import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const exportDir = path.join(root, "books", slug, "exports", "latex");
const pdfDir = path.join(root, "books", slug, "exports", "pdf");
const sourceMapPath = path.join(exportDir, "booksmith-source-map.json");
const proofPath = path.join(pdfDir, "booksmith-proof-report.json");
const outJson = path.join(pdfDir, "booksmith-diagnostic-source-map.json");
const outMd = path.join(pdfDir, "booksmith-diagnostic-source-map.md");

if (!fs.existsSync(sourceMapPath)) {
  console.error("Missing source map. Run: node scripts/build-latex-source-map.mjs", slug);
  process.exit(1);
}

if (!fs.existsSync(proofPath)) {
  console.error("Missing proof report. Run proof report first.");
  process.exit(1);
}

const sourceMap = JSON.parse(fs.readFileSync(sourceMapPath, "utf8"));
const proof = JSON.parse(fs.readFileSync(proofPath, "utf8"));

function nearestEntry(sourceLineRange) {
  const firstLine = Number(String(sourceLineRange || "").split("-")[0]);
  if (!Number.isFinite(firstLine)) return null;

  const candidates = sourceMap.entries
    .filter((entry) => Math.abs(entry.emittedLine - firstLine) <= 2)
    .sort((a, b) => Math.abs(a.emittedLine - firstLine) - Math.abs(b.emittedLine - firstLine));

  return candidates[0] || null;
}

const overfull = (proof.overfull || []).map((item) => {
  const match = item.text.match(/lines? ([\d-]+)/);
  const range = match ? match[1] : undefined;
  const mapped = nearestEntry(range);

  return {
    ...item,
    sourceLineRange: range,
    mappedSource: mapped,
  };
});

const result = {
  slug,
  generatedAt: new Date().toISOString(),
  overfull,
};

fs.writeFileSync(outJson, JSON.stringify(result, null, 2) + "\n");

fs.writeFileSync(outMd, [
  "# Booksmith Diagnostic Source Map",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${result.generatedAt}`,
  `Overfull diagnostics: ${overfull.length}`,
  "",
  "## Overfull Boxes",
  "",
  ...overfull.map((item, index) => [
    `### ${index + 1}. ${item.text}`,
    "",
    item.mappedSource
      ? `- Mapped source: \`${item.mappedSource.sourceFile}:${item.mappedSource.sourceLine}\``
      : "- Mapped source: unknown",
    item.context ? `- Context: ${item.context}` : "",
    "",
  ].filter(Boolean).join("\n")),
].join("\n"));

console.log(`Diagnostic source map written: ${path.relative(root, outMd)}`);
