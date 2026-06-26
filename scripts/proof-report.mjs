import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();

const pdfDir = path.join(root, "books", slug, "exports", "pdf");
const logPath = path.join(pdfDir, "main.log");
const reportPath = path.join(pdfDir, "booksmith-proof-report.md");
const jsonPath = path.join(pdfDir, "booksmith-proof-report.json");

if (!fs.existsSync(logPath)) {
  console.error(`Missing LaTeX log: ${logPath}`);
  console.error("Run the PDF build first.");
  process.exit(1);
}

const log = fs.readFileSync(logPath, "utf8");
const lines = log.split(/\r?\n/);

const warnings = [];
const errors = [];
const overfull = [];
const underfull = [];
const missingFiles = [];
const missingBibliography = [];
const duplicateLabels = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.startsWith("! LaTeX Error:")) {
    errors.push({
      line: i + 1,
      text: line.trim(),
    });
  }

  if (/LaTeX Warning:/.test(line)) {
    warnings.push({
      line: i + 1,
      text: line.trim(),
    });
  }

  if (/Overfull \\hbox/.test(line)) {
    overfull.push({
      line: i + 1,
      text: line.trim(),
      context: [lines[i + 1], lines[i + 2]].filter(Boolean).join(" ").trim(),
    });
  }

  if (/Underfull \\hbox/.test(line)) {
    underfull.push({
      line: i + 1,
      text: line.trim(),
      context: [lines[i + 1], lines[i + 2]].filter(Boolean).join(" ").trim(),
    });
  }

  const missingMatch = line.match(/(?:File `([^']+)' not found|No file ([^.\s]+(?:\.[A-Za-z0-9]+)?))/);
  if (missingMatch) {
    const file = missingMatch[1] || missingMatch[2];
    missingFiles.push({
      line: i + 1,
      file,
      text: line.trim(),
    });

    if (file.endsWith(".bbl")) {
      missingBibliography.push(file);
    }
  }

  if (/multiply-defined labels/i.test(line)) {
    duplicateLabels.push({
      line: i + 1,
      text: line.trim(),
    });
  }
}

const pdfPath = path.join(pdfDir, "main.pdf");
const pdfExists = fs.existsSync(pdfPath);
const pdfSize = pdfExists ? fs.statSync(pdfPath).size : 0;

const severity =
  errors.length > 0 ? "failed" :
  missingBibliography.length > 0 || duplicateLabels.length > 0 || overfull.length > 0 ? "proof-warnings" :
  "clean";

const result = {
  slug,
  generatedAt: new Date().toISOString(),
  logPath: path.relative(root, logPath),
  pdfPath: pdfExists ? path.relative(root, pdfPath) : null,
  pdfExists,
  pdfSize,
  severity,
  counts: {
    errors: errors.length,
    warnings: warnings.length,
    overfull: overfull.length,
    underfull: underfull.length,
    missingFiles: missingFiles.length,
    missingBibliography: missingBibliography.length,
    duplicateLabels: duplicateLabels.length,
  },
  errors,
  warnings,
  overfull,
  underfull,
  missingFiles,
  duplicateLabels,
};

function section(title, items, render) {
  if (!items.length) return [`## ${title}`, "", "None.", ""].join("\n");
  return [
    `## ${title}`,
    "",
    ...items.map(render),
    "",
  ].join("\n");
}

const markdown = [
  "# Booksmith PDF Proof Report",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${result.generatedAt}`,
  `Severity: **${severity}**`,
  `PDF: ${result.pdfPath ? `\`${result.pdfPath}\`` : "not found"}`,
  `PDF size: ${pdfSize} bytes`,
  "",
  "## Summary",
  "",
  `- Errors: ${errors.length}`,
  `- LaTeX warnings: ${warnings.length}`,
  `- Overfull hboxes: ${overfull.length}`,
  `- Underfull hboxes: ${underfull.length}`,
  `- Missing files: ${missingFiles.length}`,
  `- Missing bibliography outputs: ${missingBibliography.length}`,
  `- Duplicate label warnings: ${duplicateLabels.length}`,
  "",
  section("Errors", errors, (item) => `- line ${item.line}: ${item.text}`),
  section("Missing Files", missingFiles, (item) => `- line ${item.line}: \`${item.file}\` — ${item.text}`),
  section("Duplicate Labels", duplicateLabels, (item) => `- line ${item.line}: ${item.text}`),
  section("Overfull Boxes", overfull.slice(0, 50), (item) => `- line ${item.line}: ${item.text}${item.context ? `\n  - context: ${item.context}` : ""}`),
  section("Underfull Boxes", underfull.slice(0, 50), (item) => `- line ${item.line}: ${item.text}${item.context ? `\n  - context: ${item.context}` : ""}`),
  "## Next Recommended Fixes",
  "",
  missingBibliography.length
    ? "- Run BibTeX/Biber support or add bibliography generation to the PDF build script."
    : "- Bibliography output was not flagged as missing.",
  duplicateLabels.length
    ? "- Inspect duplicate LaTeX labels and make section/figure/equation labels unique."
    : "- Duplicate labels were not flagged.",
  overfull.length
    ? "- Review overfull boxes for long titles, technical phrases, equations, or unbreakable words."
    : "- No overfull boxes were flagged.",
  "",
].join("\n");

fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2) + "\n");
fs.writeFileSync(reportPath, markdown);

console.log(`Proof report written: ${path.relative(root, reportPath)}`);
console.log(`Proof JSON written: ${path.relative(root, jsonPath)}`);
console.log(JSON.stringify(result.counts, null, 2));
