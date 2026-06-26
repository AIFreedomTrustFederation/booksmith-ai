import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const pdfDir = path.join(root, "books", slug, "exports", "pdf");
const latexDir = path.join(root, "books", slug, "exports", "latex");
const outDir = path.join(root, "books", slug, "exports", "proof-inspector");
const logPath = path.join(pdfDir, "main.log");
const pdfPath = path.join(pdfDir, "main.pdf");
const diagnosticSourceMapPath = path.join(pdfDir, "booksmith-diagnostic-source-map.json");

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

if (!fs.existsSync(logPath)) {
  console.error(`Missing log: ${logPath}`);
  process.exit(1);
}

if (!fs.existsSync(pdfPath)) {
  console.error(`Missing PDF: ${pdfPath}`);
  process.exit(1);
}

const log = fs.readFileSync(logPath, "utf8");
const lines = log.split(/\r?\n/);

const sourceMappings = fs.existsSync(diagnosticSourceMapPath)
  ? JSON.parse(fs.readFileSync(diagnosticSourceMapPath, "utf8")).overfull ?? []
  : [];

const diagnostics = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const overfull = line.match(/Overfull \\hbox \(([\d.]+)pt too wide\).*?lines? ([\d-]+)/);

  if (!overfull) continue;

  const mapped = sourceMappings[diagnostics.length]?.mappedSource ?? null;

  diagnostics.push({
    id: `overfull-${diagnostics.length + 1}`,
    type: "overfull-hbox",
    amountPt: Number(overfull[1]),
    logLine: i + 1,
    sourceLineRange: overfull[2],
    message: line.trim(),
    context: [lines[i + 1], lines[i + 2], lines[i + 3]].filter(Boolean).join(" ").replace(/\s+/g, " ").trim(),
    classification: classify(lines[i + 1] || "", lines[i + 2] || ""),
    mappedSource: mapped,
  });
}

function classify(a, b) {
  const value = `${a} ${b}`;

  if (/\\TU\/.*?\s+\d+\.\d+/.test(value)) return "numbered-heading-or-toc-entry";
  if (/\\hbox|\\vbox|\\math|equation|align/i.test(value)) return "math-or-box";
  if (/http|www|url|path/i.test(value)) return "url-or-path";
  if (/CHAPTER|Appendix|SOURCE MAP|COINCIDENCE|ETERNAL NOW/i.test(value)) return "running-heading-or-title";
  return "unknown";
}

function commandExists(command) {
  try {
    execFileSync("command", ["-v", command], { stdio: "ignore", shell: true });
    return true;
  } catch {
    return false;
  }
}

let renderedPages = [];

if (commandExists("pdftoppm")) {
  const prefix = path.join(outDir, "page");
  try {
    execFileSync("pdftoppm", ["-png", "-r", "140", pdfPath, prefix], { stdio: "inherit" });
    renderedPages = fs.readdirSync(outDir)
      .filter((file) => /^page-\d+\.png$/.test(file))
      .sort();
  } catch (error) {
    console.error("pdftoppm failed; continuing without page PNGs.");
  }
} else {
  console.log("pdftoppm not found. Install poppler if desired: pkg install poppler");
}

const report = {
  slug,
  generatedAt: new Date().toISOString(),
  pdf: path.relative(root, pdfPath).replaceAll("\\", "/"),
  log: path.relative(root, logPath).replaceAll("\\", "/"),
  diagnostics,
  renderedPages,
  nextRecommendation:
    diagnostics.length === 0
      ? "No overfull boxes detected."
      : "Inspect PDF pages visually and classify remaining overfull boxes before applying automatic repair.",
};

fs.writeFileSync(path.join(outDir, "proof-inspector.json"), JSON.stringify(report, null, 2) + "\n");

fs.writeFileSync(path.join(outDir, "index.html"), `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Booksmith Visual Proof Inspector - ${slug}</title>
  <style>
    body { font-family: sans-serif; max-width: 1100px; margin: 2rem auto; line-height: 1.5; }
    .diagnostic { border: 1px solid #ccc; padding: 1rem; margin: 1rem 0; border-radius: 8px; }
    .major { border-color: #b00020; }
    code, pre { background: #f4f4f4; padding: .2rem .4rem; border-radius: 4px; }
    img { max-width: 100%; border: 1px solid #ddd; margin: 1rem 0; }
  </style>
</head>
<body>
  <h1>Booksmith Visual Proof Inspector</h1>
  <p><strong>Book:</strong> ${slug}</p>
  <p><strong>Generated:</strong> ${report.generatedAt}</p>
  <p><strong>Overfull diagnostics:</strong> ${diagnostics.length}</p>

  <h2>Diagnostics</h2>
  ${diagnostics.map((d) => `
    <div class="diagnostic ${d.amountPt >= 10 ? "major" : ""}">
      <h3>${d.id}: ${d.amountPt}pt too wide</h3>
      <p><strong>Classification:</strong> ${d.classification}</p>\n      <p><strong>Mapped source:</strong> ${d.mappedSource ? `${d.mappedSource.sourceFile}:${d.mappedSource.sourceLine}` : "unknown"}</p>
      <p><strong>Log line:</strong> ${d.logLine}</p>
      <p><strong>Source line range:</strong> ${d.sourceLineRange}</p>
      <p><strong>Message:</strong> <code>${escapeHtml(d.message)}</code></p>
      <p><strong>Context:</strong></p>
      <pre>${escapeHtml(d.context)}</pre>
    </div>
  `).join("\n")}

  <h2>Rendered Pages</h2>
  <p>Rendered pages are included for visual inspection. Current version does not yet map warnings to exact page regions.</p>
  ${renderedPages.map((page) => `<h3>${page}</h3><img src="${page}" />`).join("\n")}
</body>
</html>`);

fs.writeFileSync(path.join(outDir, "README.md"), [
  "# Booksmith Visual Proof Inspector",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${report.generatedAt}`,
  `Overfull diagnostics: ${diagnostics.length}`,
  "",
  "## Purpose",
  "",
  "This folder packages proof diagnostics, rendered PDF pages, and an HTML index so remaining typography issues can be visually inspected.",
  "",
  "## Next",
  "",
  "- Map diagnostics to exact PDF pages.",
  "- Add highlight boxes around suspected overflow regions.",
  "- Teach repair rules from visual classifications.",
  "",
].join("\n"));

fs.copyFileSync(pdfPath, path.join(outDir, "main.pdf"));
fs.copyFileSync(logPath, path.join(outDir, "main.log"));

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

console.log(`Visual proof inspector written: ${path.relative(root, outDir)}`);
console.log(`Overfull diagnostics: ${diagnostics.length}`);
console.log(`Rendered pages: ${renderedPages.length}`);
