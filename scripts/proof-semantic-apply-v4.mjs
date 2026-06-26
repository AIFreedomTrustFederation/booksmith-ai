import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const planIndex = Number(process.argv[3] || "0");
const root = process.cwd();
const exportDir = path.join(root, "books", slug, "exports", "latex");
const pdfDir = path.join(root, "books", slug, "exports", "pdf");

const planPath = path.join(pdfDir, "booksmith-proof-semantic-repair-plan-v4.json");
const auditPath = path.join(pdfDir, "booksmith-proof-semantic-apply-v4.json");

if (!fs.existsSync(planPath)) {
  console.error("Missing semantic repair plan.");
  process.exit(1);
}

const plans = JSON.parse(fs.readFileSync(planPath, "utf8")).plans;
const plan = plans[planIndex];

if (!plan || !plan.safe || plan.confidence < 0.9) {
  console.log("No safe high-confidence semantic repair at index", planIndex);
  process.exit(0);
}

const filePath = path.join(exportDir, plan.file);
const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

function wrapLines(startLine, endLine, before, after) {
  const start = startLine - 1;
  const end = endLine - 1;

  if (lines.slice(Math.max(0, start - 2), Math.min(lines.length, end + 3)).join("\n").includes(before.trim())) {
    return false;
  }

  lines.splice(start, 0, before);
  lines.splice(end + 2, 0, after);
  return true;
}

const actions = [];

if (plan.type === "paragraph-local-sloppy") {
  const changed = wrapLines(
    plan.startLine,
    plan.endLine,
    "\\begin{sloppypar}",
    "\\end{sloppypar}",
  );

  if (changed) actions.push(`Wrapped ${plan.file}:${plan.startLine}-${plan.endLine} in sloppypar`);
}

if (plan.type === "url-breakability") {
  for (let i = plan.startLine - 1; i < plan.endLine; i++) {
    lines[i] = lines[i].replace(/\\url\{([^}]+)\}/g, "\\path{$1}");
  }

  actions.push(`Improved URL breakability in ${plan.file}:${plan.startLine}-${plan.endLine}`);
}

if (actions.length) {
  fs.writeFileSync(filePath, lines.join("\n"), "utf8");
}

const audit = {
  slug,
  generatedAt: new Date().toISOString(),
  plan,
  actions,
  changed: actions.length > 0,
};

fs.writeFileSync(auditPath, JSON.stringify(audit, null, 2) + "\n");
console.log(JSON.stringify(audit, null, 2));
