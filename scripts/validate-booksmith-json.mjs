import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const targets = process.argv.slice(2);

const files = targets.length
  ? targets
  : [
      "books/fhqcm/exports/pdf/booksmith-autofix-report.json",
      "books/fhqcm/exports/pdf/booksmith-proof-diagnostics-v2.json",
      "books/fhqcm/exports/pdf/booksmith-proof-report.json",
      "books/fhqcm/exports/pdf/booksmith-quality-gate.json",
      "books/fhqcm/exports/pdf/booksmith-repair-engine-v2.json",
      "books/fhqcm/exports/pdf/booksmith-repair-queue.json",
      "books/fhqcm/exports/pdf/booksmith-repair-report.json",
    ];

let failed = 0;

for (const target of files) {
  const file = path.resolve(root, target);

  if (!fs.existsSync(file)) {
    console.log(`MISSING ${target}`);
    continue;
  }

  try {
    JSON.parse(fs.readFileSync(file, "utf8"));
    console.log(`VALID   ${target}`);
  } catch (error) {
    failed++;
    console.log(`INVALID ${target}`);
    console.log(`        ${error.message}`);
  }
}

if (failed) process.exit(1);
