import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const bookDir = path.join(root, "books", slug);
const pdfDir = path.join(bookDir, "exports", "pdf");

const auditPath = path.join(pdfDir, "booksmith-bibliography-audit-v2.json");
const outJson = path.join(pdfDir, "booksmith-reference-intelligence-v1.json");
const outMd = path.join(pdfDir, "booksmith-reference-intelligence-v1.md");

if (!fs.existsSync(auditPath)) {
  console.error("Missing bibliography audit v2.");
  process.exit(1);
}

const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));

const records = [];

for (const item of audit.missing || []) {
  records.push({
    key: item.key,
    status: "MISSING",
    severity: "critical",
    meaning: "Citation appears in manuscript but has no bibliography entry.",
    occurrences: item.occurrences || [],
  });
}

for (const item of audit.duplicateBibKeys || []) {
  records.push({
    key: item.key,
    status: "DUPLICATE",
    severity: "critical",
    meaning: "Bibliography key appears more than once.",
    entries: item.entries || [],
  });
}

for (const item of audit.unused || []) {
  records.push({
    key: item.key,
    status: String(item.key || "").includes("TODO") ? "PLACEHOLDER" : "UNUSED",
    severity: "advisory",
    meaning: "Bibliography entry exists but is not cited in the current manuscript.",
    entry: item,
  });
}

const result = {
  slug,
  generatedAt: new Date().toISOString(),
  status: records.some((record) => record.severity === "critical") ? "FAIL" : "PASS",
  counts: {
    missing: records.filter((r) => r.status === "MISSING").length,
    duplicate: records.filter((r) => r.status === "DUPLICATE").length,
    unused: records.filter((r) => r.status === "UNUSED").length,
    placeholder: records.filter((r) => r.status === "PLACEHOLDER").length,
  },
  records,
};

fs.writeFileSync(outJson, JSON.stringify(result, null, 2) + "\n");

fs.writeFileSync(outMd, [
  "# BookSmith Reference Intelligence v1",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${result.generatedAt}`,
  `Status: **${result.status}**`,
  "",
  "## Counts",
  "",
  ...Object.entries(result.counts).map(([key, value]) => `- ${key}: ${value}`),
  "",
  "## Reference Records",
  "",
  records.length
    ? records.map((record) => [
        `### ${record.key}`,
        "",
        `- Status: **${record.status}**`,
        `- Severity: ${record.severity}`,
        `- Meaning: ${record.meaning}`,
        "",
      ].join("\n")).join("\n")
    : "No reference issues detected.",
  "",
].join("\n"));

console.log(`Reference intelligence written: ${path.relative(root, outMd)}`);
console.log(`Status: ${result.status}`);
