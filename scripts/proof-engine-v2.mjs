import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const tmp = path.join(root, ".booksmith-build", "proof-engine-v2-runner.mjs");

fs.mkdirSync(path.dirname(tmp), { recursive: true });

fs.writeFileSync(tmp, `
import fs from "node:fs";
import path from "node:path";
import { parseLatexLog } from "../src/lib/proof/log-parser.ts";
import { renderRepairQueue } from "../src/lib/proof/repair-queue.ts";

const slug = ${JSON.stringify(slug)};
const root = process.cwd();
const pdfDir = path.join(root, "books", slug, "exports", "pdf");
const logPath = path.join(pdfDir, "main.log");
const queuePath = path.join(pdfDir, "booksmith-repair-queue-v2.md");
const jsonPath = path.join(pdfDir, "booksmith-proof-diagnostics-v2.json");

if (!fs.existsSync(logPath)) {
  console.error("Missing log file:", logPath);
  process.exit(1);
}

const log = fs.readFileSync(logPath, "utf8");
const diagnostics = parseLatexLog(slug, log);

fs.writeFileSync(jsonPath, JSON.stringify({
  slug,
  generatedAt: new Date().toISOString(),
  diagnostics,
}, null, 2) + "\\n");

fs.writeFileSync(queuePath, renderRepairQueue(slug, diagnostics));

console.log("Proof Engine v2 diagnostics:", diagnostics.length);
console.log("Wrote:", path.relative(root, queuePath));
console.log("Wrote:", path.relative(root, jsonPath));
`, "utf8");

execFileSync(process.execPath, ["--import", "tsx", tmp], {
  cwd: root,
  stdio: "inherit",
});
