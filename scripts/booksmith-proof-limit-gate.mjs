import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const pdfDir = path.join(root, "books", slug, "exports", "pdf");
const proofPath = path.join(pdfDir, "booksmith-proof-report.json");
const autofixPath = path.join(pdfDir, "booksmith-autofix-report.json");
const gatePath = path.join(pdfDir, "booksmith-proof-limit-gate.md");

const limits = {
  errors: 0,
  missingFiles: 0,
  missingBibliography: 0,
  duplicateLabels: 0,
  overfull: 0,
  underfull: 0,
};

if (!fs.existsSync(proofPath)) {
  console.error(`Missing ${proofPath}`);
  process.exit(1);
}

const proof = JSON.parse(fs.readFileSync(proofPath, "utf8"));
const autofix = fs.existsSync(autofixPath)
  ? JSON.parse(fs.readFileSync(autofixPath, "utf8"))
  : null;

const checks = Object.entries(limits).map(([key, limit]) => {
  const actual = proof.counts[key] ?? 0;
  return {
    key,
    actual,
    limit,
    passed: actual <= limit,
  };
});

const passed = checks.every((check) => check.passed);
const duplicateLabels = autofix?.duplicateLabels ?? [];

const md = [
  "# Booksmith Proof Limit Gate",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${new Date().toISOString()}`,
  `Status: **${passed ? "PASS" : "FAIL"}**`,
  "",
  "## Hard Limits",
  "",
  "| Metric | Actual | Limit | Result |",
  "|---|---:|---:|---:|",
  ...checks.map((check) => `| ${check.key} | ${check.actual} | ${check.limit} | ${check.passed ? "PASS" : "FAIL"} |`),
  "",
  "## Duplicate Label Details",
  "",
  duplicateLabels.length
    ? duplicateLabels.map((item) => `- \`${item.label}\` appears ${item.count} times`).join("\n")
    : "None detected in AUX.",
  "",
  "## Meaning",
  "",
  passed
    ? "This proof meets the strict no-overflow/no-missing/no-duplicate standard."
    : "This proof does not meet the strict Booksmith no-overflow publication standard.",
  "",
].join("\n");

fs.writeFileSync(gatePath, md);
console.log(`Limit gate written: ${path.relative(root, gatePath)}`);
console.log(`Status: ${passed ? "PASS" : "FAIL"}`);

if (!passed) process.exit(3);
