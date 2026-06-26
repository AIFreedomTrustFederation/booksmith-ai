import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const pdfDir = path.join(root, "books", slug, "exports", "pdf");
const proofJson = path.join(pdfDir, "booksmith-proof-report.json");
const gateJson = path.join(pdfDir, "booksmith-quality-gate.json");
const gateMd = path.join(pdfDir, "booksmith-quality-gate.md");

if (!fs.existsSync(proofJson)) {
  console.error(`Missing proof report JSON: ${proofJson}`);
  console.error("Run npm run proof:report first.");
  process.exit(1);
}

const proof = JSON.parse(fs.readFileSync(proofJson, "utf8"));

const thresholds = {
  maxErrors: 0,
  maxMissingFiles: 0,
  maxMissingBibliography: 0,
  maxDuplicateLabels: 0,
  maxOverfull: 75,
  maxUnderfull: 25,
};

const checks = [
  {
    id: "latex-errors",
    label: "No LaTeX errors",
    passed: proof.counts.errors <= thresholds.maxErrors,
    actual: proof.counts.errors,
    limit: thresholds.maxErrors,
    severity: "critical",
  },
  {
    id: "missing-files",
    label: "No missing files",
    passed: proof.counts.missingFiles <= thresholds.maxMissingFiles,
    actual: proof.counts.missingFiles,
    limit: thresholds.maxMissingFiles,
    severity: "critical",
  },
  {
    id: "missing-bibliography",
    label: "Bibliography generated",
    passed: proof.counts.missingBibliography <= thresholds.maxMissingBibliography,
    actual: proof.counts.missingBibliography,
    limit: thresholds.maxMissingBibliography,
    severity: "major",
  },
  {
    id: "duplicate-labels",
    label: "No duplicate labels",
    passed: proof.counts.duplicateLabels <= thresholds.maxDuplicateLabels,
    actual: proof.counts.duplicateLabels,
    limit: thresholds.maxDuplicateLabels,
    severity: "major",
  },
  {
    id: "overfull-hboxes",
    label: "Overfull hboxes within proof tolerance",
    passed: proof.counts.overfull <= thresholds.maxOverfull,
    actual: proof.counts.overfull,
    limit: thresholds.maxOverfull,
    severity: "minor",
  },
  {
    id: "underfull-hboxes",
    label: "Underfull hboxes within proof tolerance",
    passed: proof.counts.underfull <= thresholds.maxUnderfull,
    actual: proof.counts.underfull,
    limit: thresholds.maxUnderfull,
    severity: "minor",
  },
  {
    id: "pdf-exists",
    label: "PDF artifact exists",
    passed: proof.pdfExists === true && proof.pdfSize > 0,
    actual: proof.pdfSize,
    limit: "> 0 bytes",
    severity: "critical",
  },
];

const weights = {
  critical: 25,
  major: 15,
  minor: 5,
};

let score = 100;
for (const check of checks) {
  if (!check.passed) score -= weights[check.severity] ?? 5;
}
score = Math.max(0, score);

const failedCritical = checks.some((check) => !check.passed && check.severity === "critical");
const failedMajor = checks.some((check) => !check.passed && check.severity === "major");

const status =
  failedCritical ? "FAIL" :
  failedMajor ? "PASS_WITH_MAJOR_WARNINGS" :
  score < 95 ? "PASS_WITH_WARNINGS" :
  "PASS";

const result = {
  slug,
  generatedAt: new Date().toISOString(),
  status,
  score,
  thresholds,
  checks,
  proofReport: path.relative(root, proofJson),
};

const md = [
  "# Booksmith Quality Gate",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${result.generatedAt}`,
  `Status: **${status}**`,
  `Score: **${score}/100**`,
  "",
  "## Checks",
  "",
  "| Check | Severity | Actual | Limit | Result |",
  "|---|---:|---:|---:|---:|",
  ...checks.map((check) => `| ${check.label} | ${check.severity} | ${check.actual} | ${check.limit} | ${check.passed ? "PASS" : "FAIL"} |`),
  "",
  "## Publication Meaning",
  "",
  status === "PASS"
    ? "This proof passes the current Booksmith Phase 1 publishing quality gate."
    : "This proof is not yet clean enough for final publication, but it may be acceptable for internal proof review depending on status.",
  "",
].join("\n");

fs.writeFileSync(gateJson, JSON.stringify(result, null, 2) + "\n");
fs.writeFileSync(gateMd, md);

console.log(`Quality gate written: ${path.relative(root, gateMd)}`);
console.log(`Status: ${status}`);
console.log(`Score: ${score}/100`);

if (status === "FAIL") process.exit(2);
