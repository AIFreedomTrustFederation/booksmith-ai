import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const exportDir = path.join(root, "books", slug, "exports", "latex");
const pdfDir = path.join(root, "books", slug, "exports", "pdf");
const mainTex = path.join(exportDir, "main.tex");
const auxPath = path.join(pdfDir, "main.aux");
const reportPath = path.join(pdfDir, "booksmith-autofix-report.md");
const reportJson = path.join(pdfDir, "booksmith-autofix-report.json");

const actions = [];
const warnings = [];

function record(action, detail) {
  actions.push({ action, detail });
}

function warn(detail) {
  warnings.push(detail);
}

if (!fs.existsSync(mainTex)) {
  console.error(`Missing ${mainTex}`);
  process.exit(1);
}

let tex = fs.readFileSync(mainTex, "utf8");

function ensureAfter(anchor, insertion, label) {
  if (tex.includes(insertion.trim())) return;
  if (tex.includes(anchor)) {
    tex = tex.replace(anchor, `${anchor}\n${insertion}`);
    record("inserted", label);
  } else {
    warn(`Could not find anchor for ${label}`);
  }
}

function ensureBefore(anchor, insertion, label) {
  if (tex.includes(insertion.trim())) return;
  if (tex.includes(anchor)) {
    tex = tex.replace(anchor, `${insertion}\n${anchor}`);
    record("inserted", label);
  } else {
    warn(`Could not find anchor for ${label}`);
  }
}

ensureAfter("\\usepackage{csquotes}", "\\usepackage{xurl}", "xurl package for URL wrapping");
ensureAfter("\\usepackage{xurl}", "\\usepackage{ragged2e}", "ragged2e package for ragged chapter headings");
ensureAfter("\\usepackage{ragged2e}", "\\usepackage{etoolbox}", "etoolbox package for patching commands");

const proofControls = `
% Booksmith proof overflow controls.
\\emergencystretch=5em
\\tolerance=3000
\\hbadness=10000
\\hfuzz=2pt
\\vfuzz=2pt
\\sloppy
\\Urlmuskip=0mu plus 3mu
`;

ensureBefore("\\begin{document}", proofControls, "Booksmith proof overflow controls");

const chapterPatch = `
% Booksmith heading overflow controls.
\\titleformat{\\chapter}[display]
  {\\normalfont\\Large\\bfseries\\RaggedRight}
  {\\chaptertitlename\\ \\thechapter}
  {12pt}
  {\\large\\RaggedRight}
`;

if (!tex.includes("Booksmith heading overflow controls")) {
  tex = tex.replace(
    /\\titleformat\{\\chapter\}\[display\]\{[^]*?\}\{\\Huge\}/m,
    chapterPatch.trim()
  );
  record("patched", "chapter heading format for overflow reduction");
}

const duplicateLabels = [];
if (fs.existsSync(auxPath)) {
  const aux = fs.readFileSync(auxPath, "utf8");
  const labels = new Map();

  for (const match of aux.matchAll(/\\newlabel\{([^}]+)\}/g)) {
    const label = match[1];
    labels.set(label, (labels.get(label) || 0) + 1);
  }

  for (const [label, count] of labels.entries()) {
    if (count > 1) duplicateLabels.push({ label, count });
  }
} else {
  warn("No main.aux found yet, duplicate label extraction skipped.");
}

fs.writeFileSync(mainTex, tex, "utf8");

const result = {
  slug,
  generatedAt: new Date().toISOString(),
  actions,
  warnings,
  duplicateLabels,
};

fs.writeFileSync(reportJson, JSON.stringify(result, null, 2) + "\n");

fs.writeFileSync(reportPath, [
  "# Booksmith Proof AutoFix Report",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${result.generatedAt}`,
  "",
  "## Actions",
  "",
  actions.length ? actions.map((a) => `- ${a.action}: ${a.detail}`).join("\n") : "None.",
  "",
  "## Warnings",
  "",
  warnings.length ? warnings.map((w) => `- ${w}`).join("\n") : "None.",
  "",
  "## Duplicate Labels From AUX",
  "",
  duplicateLabels.length
    ? duplicateLabels.map((item) => `- \`${item.label}\` appears ${item.count} times`).join("\n")
    : "None detected.",
  "",
].join("\n"));

console.log(`AutoFix report written: ${path.relative(root, reportPath)}`);
console.log(`Actions: ${actions.length}`);
console.log(`Duplicate labels detected: ${duplicateLabels.length}`);
