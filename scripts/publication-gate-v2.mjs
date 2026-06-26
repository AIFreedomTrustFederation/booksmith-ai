import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const bookDir = path.join(root, "books", slug);
const pdfDir = path.join(bookDir, "exports", "pdf");

const proofPath = path.join(pdfDir, "booksmith-proof-report.json");
const figureAuditPath = path.join(pdfDir, "booksmith-figure-asset-audit-v1.json");
const qualityPath = path.join(pdfDir, "booksmith-quality-gate.json");
const outJson = path.join(pdfDir, "booksmith-publication-gate-v2.json");
const outMd = path.join(pdfDir, "booksmith-publication-gate-v2.md");

function readJson(file, fallback = null) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback;
}

const proof = readJson(proofPath, {});
const figureAudit = readJson(figureAuditPath, {});
const quality = readJson(qualityPath, {});

const counts = proof.counts ?? {};

const checks = [
  {
    id: "latex-errors",
    label: "No LaTeX errors",
    severity: "critical",
    pass: (counts.errors ?? 0) === 0,
    actual: counts.errors ?? 0,
  },
  {
    id: "missing-files",
    label: "No missing files",
    severity: "critical",
    pass: (counts.missingFiles ?? 0) === 0,
    actual: counts.missingFiles ?? 0,
  },
  {
    id: "missing-bibliography",
    label: "Bibliography output exists",
    severity: "critical",
    pass: (counts.missingBibliography ?? 0) === 0,
    actual: counts.missingBibliography ?? 0,
  },
  {
    id: "duplicate-labels",
    label: "No duplicate labels",
    severity: "critical",
    pass: (counts.duplicateLabels ?? 0) === 0,
    actual: counts.duplicateLabels ?? 0,
  },
  {
    id: "figure-placeholders",
    label: "No unresolved figure placeholders",
    severity: "publication",
    pass: (figureAudit.placeholderCount ?? 0) === 0,
    actual: figureAudit.placeholderCount ?? "unknown",
  },
  {
    id: "overfull-boxes",
    label: "Typography overfull boxes within draft tolerance",
    severity: "warning",
    pass: (counts.overfull ?? 0) <= 2,
    actual: counts.overfull ?? 0,
  },
  {
    id: "pdf-exists",
    label: "PDF artifact exists",
    severity: "critical",
    pass: fs.existsSync(path.join(pdfDir, "main.pdf")),
    actual: fs.existsSync(path.join(pdfDir, "main.pdf")) ? "yes" : "no",
  },
];

const criticalFailures = checks.filter((check) => !check.pass && check.severity === "critical");
const publicationFailures = checks.filter((check) => !check.pass && check.severity === "publication");
const warningFailures = checks.filter((check) => !check.pass && check.severity === "warning");

let status = "PASS_PUBLICATION_READY";

if (criticalFailures.length) status = "FAIL_BUILD_INTEGRITY";
else if (publicationFailures.length) status = "PASS_DRAFT_ONLY";
else if (warningFailures.length) status = "PASS_WITH_WARNINGS";

const result = {
  slug,
  generatedAt: new Date().toISOString(),
  status,
  checks,
  upstreamQualityStatus: quality.status ?? null,
  meaning:
    status === "PASS_PUBLICATION_READY"
      ? "This book passes the strict publication gate."
      : status === "PASS_DRAFT_ONLY"
        ? "This book is suitable for draft/internal review, but not final publication."
        : status === "PASS_WITH_WARNINGS"
          ? "This book builds and may be reviewable, but has typography warnings."
          : "This book has critical build-integrity failures.",
};

fs.writeFileSync(outJson, JSON.stringify(result, null, 2) + "\n");

fs.writeFileSync(outMd, [
  "# BookSmith Publication Gate v2",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${result.generatedAt}`,
  `Status: **${status}**`,
  "",
  result.meaning,
  "",
  "## Checks",
  "",
  "| Check | Severity | Actual | Result |",
  "|---|---:|---:|---:|",
  ...checks.map((check) =>
    `| ${check.label} | ${check.severity} | ${check.actual} | ${check.pass ? "PASS" : "FAIL"} |`
  ),
  "",
].join("\n"));

console.log(`Publication gate v2 written: ${path.relative(root, outMd)}`);
console.log(`Status: ${status}`);

if (criticalFailures.length) process.exit(1);
