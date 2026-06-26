import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const bookRoot = path.join(root, "books", slug);
const exportDir = path.join(bookRoot, "exports", "latex");
const pdfDir = path.join(bookRoot, "exports", "pdf");
const logPath = path.join(pdfDir, "main.log");
const auxPath = path.join(pdfDir, "main.aux");
const queueMd = path.join(pdfDir, "booksmith-repair-queue.md");
const queueJson = path.join(pdfDir, "booksmith-repair-queue.json");
const repairReportMd = path.join(pdfDir, "booksmith-repair-report.md");
const repairReportJson = path.join(pdfDir, "booksmith-repair-report.json");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function rel(file) {
  return path.relative(root, file).replaceAll("\\", "/");
}

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
}

function parseDuplicateLabels() {
  const aux = read(auxPath);
  const labels = new Map();

  for (const match of aux.matchAll(/\\newlabel\{([^}]+)\}/g)) {
    const label = match[1];
    labels.set(label, (labels.get(label) || 0) + 1);
  }

  return [...labels.entries()]
    .filter(([, count]) => count > 1)
    .map(([label, count]) => ({ label, count }));
}

function parseOverfullBoxes() {
  const log = read(logPath);
  const lines = log.split(/\r?\n/);
  const issues = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/Overfull \\hbox \(([\d.]+)pt too wide\).*?lines? ([\d-]+)/);
    if (!match) continue;

    const amountPt = Number(match[1]);
    const lineRange = match[2];
    const context = [lines[i + 1], lines[i + 2], lines[i + 3]]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    issues.push({
      type: "overfull-hbox",
      priority: amountPt >= 20 ? 1 : amountPt >= 10 ? 2 : 3,
      amountPt,
      logLine: i + 1,
      sourceLineRange: lineRange,
      context,
    });
  }

  return issues;
}

function buildRepairQueue() {
  const duplicateLabels = parseDuplicateLabels().map((item) => ({
    type: "duplicate-label",
    priority: 1,
    label: item.label,
    count: item.count,
    humanRequired: true,
    note: "Duplicate labels require source-level semantic review unless an exact duplicate can be safely renamed.",
  }));

  const overfull = parseOverfullBoxes().map((item) => ({
    ...item,
    humanRequired: item.amountPt >= 15,
    note:
      item.amountPt >= 15
        ? "Large overflow likely needs author/layout review."
        : "Small overflow may be improved by proof-stage typography controls.",
  }));

  const queue = [...duplicateLabels, ...overfull].sort((a, b) => a.priority - b.priority);

  write(queueJson, JSON.stringify({ slug, generatedAt: new Date().toISOString(), queue }, null, 2) + "\n");

  const md = [
    "# Booksmith Repair Queue",
    "",
    `Book slug: \`${slug}\``,
    `Generated: ${new Date().toISOString()}`,
    `Open repair tasks: ${queue.length}`,
    "",
    "## Priority 1",
    "",
    ...queue
      .filter((item) => item.priority === 1)
      .map(renderQueueItem),
    "",
    "## Priority 2",
    "",
    ...queue
      .filter((item) => item.priority === 2)
      .map(renderQueueItem),
    "",
    "## Priority 3",
    "",
    ...queue
      .filter((item) => item.priority === 3)
      .map(renderQueueItem),
    "",
  ].join("\n");

  write(queueMd, md);

  return queue;
}

function renderQueueItem(item) {
  if (item.type === "duplicate-label") {
    return [
      `- [ ] Duplicate label: \`${item.label}\``,
      `  - Count: ${item.count}`,
      `  - Human required: ${item.humanRequired ? "yes" : "no"}`,
      `  - Note: ${item.note}`,
    ].join("\n");
  }

  return [
    `- [ ] Overfull hbox: ${item.amountPt}pt too wide`,
    `  - Log line: ${item.logLine}`,
    `  - Source line range: ${item.sourceLineRange}`,
    `  - Priority: ${item.priority}`,
    `  - Human required: ${item.humanRequired ? "yes" : "no"}`,
    item.context ? `  - Context: ${item.context}` : "",
    `  - Note: ${item.note}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function ensureMainProofControls(actions) {
  const mainTex = path.join(exportDir, "main.tex");
  let tex = read(mainTex);
  if (!tex) return;

  function addAfter(anchor, insertion, label) {
    if (tex.includes(insertion.trim())) return;
    if (tex.includes(anchor)) {
      tex = tex.replace(anchor, `${anchor}\n${insertion}`);
      actions.push(`Inserted ${label}`);
    }
  }

  addAfter("\\usepackage{csquotes}", "\\usepackage{xurl}", "xurl");
  addAfter("\\usepackage{xurl}", "\\usepackage{ragged2e}", "ragged2e");
  addAfter("\\usepackage{ragged2e}", "\\usepackage{microtype}", "microtype fallback");

  if (!tex.includes("Booksmith repair-stage overflow controls")) {
    tex = tex.replace(
      "\\begin{document}",
      `% Booksmith repair-stage overflow controls.
\\emergencystretch=8em
\\tolerance=5000
\\hbadness=10000
\\hfuzz=3pt
\\vfuzz=3pt
\\sloppy
\\Urlmuskip=0mu plus 4mu

\\begin{document}`,
    );
    actions.push("Inserted repair-stage overflow controls");
  }

  const oldTitleFormat = /\\titleformat\{\\chapter\}\[display\][\s\S]*?\{\\Huge\}/m;
  if (oldTitleFormat.test(tex) && !tex.includes("Booksmith repair-stage heading controls")) {
    tex = tex.replace(
      oldTitleFormat,
      `% Booksmith repair-stage heading controls.
\\titleformat{\\chapter}[display]
  {\\normalfont\\Large\\bfseries\\RaggedRight}
  {\\chaptertitlename\\ \\thechapter}
  {12pt}
  {\\large\\RaggedRight}`,
    );
    actions.push("Reduced chapter heading size and enabled ragged-right chapter headings");
  }

  write(mainTex, tex);
}

function addLocalLineBreakHints(actions) {
  const texFiles = walk(exportDir).filter((file) => file.endsWith(".tex"));
  let touched = 0;

  for (const file of texFiles) {
    let content = read(file);
    const original = content;

    content = content.replaceAll("Fractal-Holographic", "Fractal-\\allowbreak Holographic");
    content = content.replaceAll("Quantum Consciousness", "Quantum\\allowbreak Consciousness");
    content = content.replaceAll("Christic Equivalency", "Christic\\allowbreak Equivalency");
    content = content.replaceAll("AI Freedom Trust Federation", "AI Freedom Trust\\allowbreak Federation");
    content = content.replaceAll("biozonecurrency", "biozone\\allowbreak currency");
    content = content.replaceAll("Biozoecurrency", "Biozoe\\allowbreak currency");

    if (content !== original) {
      write(file, content);
      touched++;
    }
  }

  if (touched) actions.push(`Added safe line-break hints in ${touched} TeX files`);
}

function applySafeRepairs() {
  const actions = [];
  ensureMainProofControls(actions);
  addLocalLineBreakHints(actions);

  const result = {
    slug,
    generatedAt: new Date().toISOString(),
    actions,
    safeRepairsApplied: actions.length,
  };

  write(repairReportJson, JSON.stringify(result, null, 2) + "\n");
  write(
    repairReportMd,
    [
      "# Booksmith Proof Repair Report",
      "",
      `Book slug: \`${slug}\``,
      `Generated: ${result.generatedAt}`,
      `Safe repairs applied: ${actions.length}`,
      "",
      "## Actions",
      "",
      actions.length ? actions.map((a) => `- ${a}`).join("\n") : "None.",
      "",
    ].join("\n"),
  );

  console.log(`Repair report written: ${rel(repairReportMd)}`);
  console.log(`Safe repairs applied: ${actions.length}`);

  return actions.length;
}

const mode = process.argv[3] || "repair";

if (mode === "queue") {
  const queue = buildRepairQueue();
  console.log(`Repair queue written: ${rel(queueMd)}`);
  console.log(`Tasks: ${queue.length}`);
} else {
  applySafeRepairs();
  const queue = buildRepairQueue();
  console.log(`Repair queue written: ${rel(queueMd)}`);
  console.log(`Tasks: ${queue.length}`);
}
