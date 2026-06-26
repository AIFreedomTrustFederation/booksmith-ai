import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const temp = path.join(root, ".booksmith-build", "latex-structure-report-runner.mjs");

fs.mkdirSync(path.dirname(temp), { recursive: true });

fs.writeFileSync(temp, `
import fs from "node:fs";
import path from "node:path";
import { loadLatexDocument, relativeLatexPath } from "../src/lib/proof/latex/document.ts";
import { findDuplicateLabels } from "../src/lib/proof/latex/labels.ts";

const slug = ${JSON.stringify(slug)};
const root = process.cwd();
const exportDir = path.join(root, "books", slug, "exports", "latex");
const reportPath = path.join(exportDir, "booksmith-latex-structure-report.md");
const jsonPath = path.join(exportDir, "booksmith-latex-structure-report.json");

const document = await loadLatexDocument(exportDir);
const duplicates = findDuplicateLabels(document);

const commandCounts = {};
for (const file of document.files) {
  for (const command of file.commands) {
    commandCounts[command.command] = (commandCounts[command.command] || 0) + 1;
  }
}

const result = {
  slug,
  generatedAt: new Date().toISOString(),
  texFiles: document.files.length,
  commandCounts,
  duplicateLabels: duplicates.map((duplicate) => ({
    label: duplicate.label,
    definitions: duplicate.definitions.map((definition) => ({
      file: relativeLatexPath(exportDir, definition.file),
      start: definition.start,
      end: definition.end,
    })),
  })),
};

fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2) + "\\n");

fs.writeFileSync(reportPath, [
  "# Booksmith LaTeX Structure Report",
  "",
  \`Book slug: \\\`\${slug}\\\`\`,
  \`Generated: \${result.generatedAt}\`,
  \`TeX files: \${result.texFiles}\`,
  "",
  "## Command Counts",
  "",
  ...Object.entries(commandCounts).sort().map(([command, count]) => \`- \\\\\${command}: \${count}\`),
  "",
  "## Duplicate Labels",
  "",
  duplicates.length
    ? duplicates.map((duplicate) => [
        \`### \${duplicate.label}\`,
        "",
        ...duplicate.definitions.map((definition) => \`- \${relativeLatexPath(exportDir, definition.file)} @ \${definition.start}\`),
        "",
      ].join("\\n")).join("\\n")
    : "None.",
  "",
].join("\\n"));

console.log("LaTeX structure report written:", path.relative(root, reportPath));
console.log("Duplicate labels:", duplicates.length);
`, "utf8");

execFileSync(process.execPath, ["--import", "tsx", temp], {
  cwd: root,
  stdio: "inherit",
});
