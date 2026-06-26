import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const planIndex = Number(process.argv[3] || "0");
const root = process.cwd();
const exportDir = path.join(root, "books", slug, "exports", "latex");
const pdfDir = path.join(root, "books", slug, "exports", "pdf");
const planPath = path.join(pdfDir, "booksmith-proof-v3-repair-plan.json");
const auditPath = path.join(pdfDir, "booksmith-proof-v3-apply-audit.json");

if (!fs.existsSync(planPath)) {
  console.error("Missing v3 repair plan.");
  process.exit(1);
}

const plan = JSON.parse(fs.readFileSync(planPath, "utf8")).plans[planIndex];

if (!plan || !plan.safe) {
  console.log("No safe plan at index", planIndex);
  process.exit(0);
}

const sourceFile = path.join(exportDir, plan.file);
if (!fs.existsSync(sourceFile)) {
  console.error("Missing source file:", sourceFile);
  process.exit(1);
}

const original = fs.readFileSync(sourceFile, "utf8");
let next = original;
const actions = [];

function ensureMainControl(controlName, controlText) {
  const mainTex = path.join(exportDir, "main.tex");
  let main = fs.readFileSync(mainTex, "utf8");

  if (!main.includes(controlName)) {
    main = main.replace("\\begin{document}", `${controlText}\n\\begin{document}`);
    fs.writeFileSync(mainTex, main, "utf8");
    actions.push(`Inserted ${controlName} in main.tex`);
  }
}

if (plan.type === "url-breaks") {
  next = next.replace(/\\url\{([^}]+)\}/g, "\\path{$1}");
  next = next.replace(/\\href\{([^}]+)\}\{([^}]+)\}/g, "\\href{$1}{\\path{$2}}");
  actions.push("Converted URL/path commands to more breakable forms where possible.");
}

if (plan.type === "long-token-allowbreak") {
  next = next.replace(/([A-Za-z0-9_]{12,})([-_])([A-Za-z0-9_]{8,})/g, "$1$2\\\\allowbreak $3");
  actions.push("Inserted allowbreaks after long token separators.");
}

if (plan.type === "heading-ragged-right" || plan.type === "caption-ragged-right") {
  ensureMainControl(
    "Booksmith v3 localized ragged typography",
    `% Booksmith v3 localized ragged typography
\\usepackage{ragged2e}
\\makeatletter
\\g@addto@macro\\@afterheading{\\RaggedRight}
\\makeatother
`,
  );
}

if (plan.type === "microtypography-relaxation") {
  ensureMainControl(
    "Booksmith v3 final microtypography relaxation",
    `% Booksmith v3 final microtypography relaxation
\\emergencystretch=12em
\\tolerance=7000
\\hfuzz=8pt
`,
  );
}

if (next !== original) {
  fs.writeFileSync(sourceFile, next, "utf8");
  actions.push(`Changed ${plan.file}`);
}

const result = {
  slug,
  generatedAt: new Date().toISOString(),
  plan,
  actions,
  changed: actions.length > 0,
};

fs.writeFileSync(auditPath, JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify({ changed: result.changed, actions }, null, 2));
