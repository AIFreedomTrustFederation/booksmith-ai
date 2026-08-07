import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const bookDir = path.join(root, "books", slug);
const exportDir = path.join(bookDir, "exports", "latex");
const registryDir = path.join(bookDir, "figures");
const registryPath = path.join(registryDir, "figure-registry.json");
const briefsDir = path.join(registryDir, "ai-briefs");
const ledgerPath = path.join(registryDir, "asset-ledger.json");

fs.mkdirSync(registryDir, { recursive: true });
fs.mkdirSync(briefsDir, { recursive: true });

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function readJson(file, fallback) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback;
}

const previousRegistry = readJson(registryPath, { figures: [] });
const previousLedger = readJson(ledgerPath, { assets: [] });
const discovered = [];

for (const file of walk(exportDir).filter((item) => item.endsWith(".tex"))) {
  const rel = path.relative(exportDir, file).replaceAll("\\", "/");
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

  lines.forEach((line, index) => {
    const match = line.match(/\\(?:FHQCM|Booksmith)FigurePlaceholder\{([^}]*)\}\{([^}]*)\}\{([^}]*)\}/);
    if (!match) return;

    discovered.push({
      id: match[3],
      title: match[1],
      caption: match[2],
      sourceFile: rel,
      sourceLine: index + 1,
      status: "needs-ai-figure",
      asset: null,
      rights: { license: "pending", source: "pending", credit: "pending" },
      print: { targetDpi: 300, minWidthPx: 2400, minHeightPx: 1800 },
    });
  });
}

const discoveredIds = new Set(discovered.map((figure) => figure.id));
const retained = (previousRegistry.figures || []).filter((figure) => !discoveredIds.has(figure.id));
const figures = [...discovered, ...retained];

const registry = {
  slug,
  generatedAt: new Date().toISOString(),
  policy: {
    placeholdersAllowedInDraft: true,
    placeholdersAllowedInPublication: false,
    aiImagesRequireLedger: true,
    provenanceRequired: true,
  },
  figures,
};

const assets = figures.map((figure) => {
  const previous = (previousLedger.assets || []).find((asset) => asset.figureId === figure.id);
  return previous || {
    figureId: figure.id,
    title: figure.title,
    asset: figure.asset || null,
    status: figure.status || "needs-ai-figure",
    promptFile: `figures/ai-briefs/${figure.id}.md`,
    model: null,
    provider: null,
    generatedAt: null,
    sourceImages: [],
    license: "pending",
    credit: "pending",
    approvedForPrint: false,
  };
});

const ledger = { slug, generatedAt: new Date().toISOString(), assets };
fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");
fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2) + "\n");

let briefsWritten = 0;
for (const figure of figures) {
  const briefPath = path.join(briefsDir, `${figure.id}.md`);
  if (fs.existsSync(briefPath)) continue;

  const brief = `# AI Figure Brief: ${figure.id}

## Title
${figure.title}

## Caption
${figure.caption}

## Source
- File: \`${figure.sourceFile}\`
- Line: ${figure.sourceLine}

## Purpose
Create a publication-quality scientific or conceptual figure for the current Booksmith manuscript.

## Requirements
- Clear visual hierarchy and editable labels.
- No fake citations, fake equations, fake logos, watermarks, or unreadable text.
- Preserve the distinction between scientific description and theological interpretation.
- Provide sufficient resolution for 300-DPI print production.
- Record model, provider, prompt, license, provenance, and human approval.
`;

  fs.writeFileSync(briefPath, brief);
  briefsWritten += 1;
}

console.log(`Figure registry written: ${path.relative(root, registryPath)}`);
console.log(`Asset ledger written: ${path.relative(root, ledgerPath)}`);
console.log(`Figures retained or discovered: ${figures.length}`);
console.log(`New AI briefs written: ${briefsWritten}`);
