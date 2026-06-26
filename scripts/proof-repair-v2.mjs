import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const tmp = path.join(root, ".booksmith-build", "proof-repair-v2-runner.mjs");

fs.mkdirSync(path.dirname(tmp), { recursive: true });

fs.writeFileSync(tmp, `
import fs from "node:fs";
import path from "node:path";
import { createProofContext } from "../src/lib/proof/repair-context.ts";
import { parseLatexLog } from "../src/lib/proof/log-parser.ts";
import { renderRepairQueue } from "../src/lib/proof/repair-queue.ts";
import { applyRepairRules } from "../src/lib/proof/repair-engine.ts";

const slug = ${JSON.stringify(slug)};
const context = createProofContext(slug);
const logPath = path.join(context.pdfDir, "main.log");

if (!fs.existsSync(logPath)) {
  console.error("Missing log file:", logPath);
  process.exit(1);
}

const diagnostics = parseLatexLog(slug, fs.readFileSync(logPath, "utf8"));
const queuePath = path.join(context.pdfDir, "booksmith-repair-queue-v2.md");
const diagnosticsPath = path.join(context.pdfDir, "booksmith-proof-diagnostics-v2.json");

fs.writeFileSync(diagnosticsPath, JSON.stringify({
  slug,
  generatedAt: new Date().toISOString(),
  diagnostics,
}, null, 2) + "\\n");

fs.writeFileSync(queuePath, renderRepairQueue(slug, diagnostics));

const result = await applyRepairRules(context, diagnostics);

console.log(JSON.stringify({
  diagnostics: diagnostics.length,
  attempted: result.attempted,
  fixed: result.fixed,
}, null, 2));
`, "utf8");

execFileSync(process.execPath, ["--import", "tsx", tmp], {
  cwd: root,
  stdio: "inherit",
});
