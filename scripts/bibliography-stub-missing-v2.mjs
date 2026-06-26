import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const bookDir = path.join(root, "books", slug);
const pdfDir = path.join(bookDir, "exports", "pdf");
const bibliographyDir = path.join(bookDir, "bibliography");
const auditPath = path.join(pdfDir, "booksmith-bibliography-audit-v2.json");
const stubPath = path.join(bibliographyDir, "missing-citation-stubs.bib");
const reportPath = path.join(pdfDir, "booksmith-bibliography-stub-report-v2.md");

if (!fs.existsSync(auditPath)) {
  console.error("Missing bibliography audit. Run bibliography:audit:v2 first.");
  process.exit(1);
}

const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));
fs.mkdirSync(bibliographyDir, { recursive: true });

let existing = fs.existsSync(stubPath) ? fs.readFileSync(stubPath, "utf8") : "";
const added = [];

function titleFromKey(key) {
  return key
    .replace(/[0-9]{4}/g, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    || key;
}

for (const item of audit.missing || []) {
  const key = item.key;

  if (new RegExp(`@misc\\s*\\{\\s*${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*,`).test(existing)) {
    continue;
  }

  const stub = `

@misc{${key},
  title        = {${titleFromKey(key)}},
  author       = {{TODO: verify author}},
  year         = {TODO},
  note         = {TODO: BookSmith generated placeholder. Replace with verified bibliographic source before publication.},
  booksmith_status = {needs-verification}
}
`;

  existing += stub;
  added.push(key);
}

fs.writeFileSync(stubPath, existing.trimStart() + "\n");

fs.writeFileSync(reportPath, [
  "# BookSmith Bibliography Stub Report v2",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${new Date().toISOString()}`,
  `Stubs added: ${added.length}`,
  "",
  added.length
    ? added.map((key) => `- \`${key}\``).join("\n")
    : "No new stubs needed.",
  "",
  "## Warning",
  "",
  "These entries are placeholders for build completeness only. They must be verified before publication-ready status.",
  "",
].join("\n"));

console.log(`Stub bibliography updated: ${path.relative(root, stubPath)}`);
console.log(`Added stubs: ${added.length}`);
