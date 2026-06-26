import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const bookRoot = path.join(root, "books", slug);
const packetDir = path.join(bookRoot, "exports", "publishing-packet");
const latexDir = path.join(bookRoot, "exports", "latex");
const pdfDir = path.join(bookRoot, "exports", "pdf");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyIfExists(from, to) {
  if (!fs.existsSync(from)) return false;
  ensureDir(path.dirname(to));
  fs.copyFileSync(from, to);
  return true;
}

function sha256(file) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(file));
  return hash.digest("hex");
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

ensureDir(packetDir);
ensureDir(path.join(packetDir, "print"));
ensureDir(path.join(packetDir, "latex-source"));
ensureDir(path.join(packetDir, "reports"));
ensureDir(path.join(packetDir, "metadata"));
ensureDir(path.join(packetDir, "provenance"));

const copied = [];

for (const file of walk(latexDir)) {
  const rel = path.relative(latexDir, file);
  const target = path.join(packetDir, "latex-source", rel);
  ensureDir(path.dirname(target));
  fs.copyFileSync(file, target);
  copied.push(target);
}

const knownCopies = [
  ["print/main.pdf", path.join(pdfDir, "main.pdf")],
  ["reports/booksmith-proof-report.md", path.join(pdfDir, "booksmith-proof-report.md")],
  ["reports/booksmith-proof-report.json", path.join(pdfDir, "booksmith-proof-report.json")],
  ["reports/booksmith-quality-gate.md", path.join(pdfDir, "booksmith-quality-gate.md")],
  ["reports/booksmith-quality-gate.json", path.join(pdfDir, "booksmith-quality-gate.json")],
  ["reports/booksmith-integrity-report.md", path.join(latexDir, "booksmith-integrity-report.md")],
  ["reports/booksmith-integrity-report.json", path.join(latexDir, "booksmith-integrity-report.json")],
  ["metadata/book.config.json", path.join(bookRoot, "book.config.json")],
];

for (const [targetRel, source] of knownCopies) {
  const target = path.join(packetDir, targetRel);
  if (copyIfExists(source, target)) copied.push(target);
}

const checksumLines = copied
  .filter((file) => fs.existsSync(file) && fs.statSync(file).isFile())
  .sort()
  .map((file) => `${sha256(file)}  ${path.relative(packetDir, file).replaceAll("\\", "/")}`);

fs.writeFileSync(path.join(packetDir, "CHECKSUMS.sha256"), checksumLines.join("\n") + "\n");

const manifest = {
  slug,
  generatedAt: new Date().toISOString(),
  packetDir: path.relative(root, packetDir),
  files: checksumLines.length,
  includes: {
    pdf: fs.existsSync(path.join(packetDir, "print", "main.pdf")),
    latexSource: fs.existsSync(path.join(packetDir, "latex-source", "main.tex")),
    proofReport: fs.existsSync(path.join(packetDir, "reports", "booksmith-proof-report.md")),
    qualityGate: fs.existsSync(path.join(packetDir, "reports", "booksmith-quality-gate.md")),
    integrityReport: fs.existsSync(path.join(packetDir, "reports", "booksmith-integrity-report.md")),
  },
};

fs.writeFileSync(path.join(packetDir, "packet-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

fs.writeFileSync(path.join(packetDir, "README.md"), [
  "# Booksmith Publishing Packet",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${manifest.generatedAt}`,
  "",
  "## Included",
  "",
  `- Print PDF: ${manifest.includes.pdf ? "yes" : "no"}`,
  `- LaTeX source: ${manifest.includes.latexSource ? "yes" : "no"}`,
  `- Proof report: ${manifest.includes.proofReport ? "yes" : "no"}`,
  `- Quality gate: ${manifest.includes.qualityGate ? "yes" : "no"}`,
  `- Integrity report: ${manifest.includes.integrityReport ? "yes" : "no"}`,
  `- Checksums: yes`,
  "",
  "This packet is generated from local Booksmith project files for human review, proofing, and publishing operations.",
  "",
].join("\n"));

console.log(`Publishing packet written: ${path.relative(root, packetDir)}`);
console.log(`Files checksummed: ${checksumLines.length}`);
