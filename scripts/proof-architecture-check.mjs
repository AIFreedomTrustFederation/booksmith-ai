import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const pdfDir = path.join(root, "books", slug, "exports", "pdf");

const required = [
  "booksmith-proof-report.json",
  "booksmith-quality-gate.json",
  "booksmith-typography-diagnostics-v4.json",
  "booksmith-proof-context-inspector.json",
  "booksmith-diagnostic-source-map.json",
];

let failed = false;

for (const name of required) {
  const file = path.join(pdfDir, name);
  if (!fs.existsSync(file)) {
    console.log(`MISSING ${name}`);
    failed = true;
    continue;
  }

  try {
    JSON.parse(fs.readFileSync(file, "utf8"));
    console.log(`VALID   ${name}`);
  } catch (e) {
    console.log(`INVALID ${name}`);
    console.log(`        ${e.message}`);
    failed = true;
  }
}

const proofPath = path.join(pdfDir, "booksmith-proof-report.json");
if (fs.existsSync(proofPath)) {
  const proof = JSON.parse(fs.readFileSync(proofPath, "utf8"));
  const c = proof.counts ?? {};

  console.log("");
  console.log("Proof counts:");
  console.log(JSON.stringify(c, null, 2));

  if ((c.errors ?? 0) > 0) failed = true;
  if ((c.missingFiles ?? 0) > 0) failed = true;
  if ((c.missingBibliography ?? 0) > 0) failed = true;
  if ((c.duplicateLabels ?? 0) > 0) failed = true;
}

if (failed) process.exit(1);
