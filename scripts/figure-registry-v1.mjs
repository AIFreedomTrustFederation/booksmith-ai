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

const placeholders = [];

for (const file of walk(exportDir).filter((f) => f.endsWith(".tex"))) {
  const rel = path.relative(exportDir, file).replaceAll("\\", "/");
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

  lines.forEach((line, index) => {
    const m = line.match(/\\FHQCMFigurePlaceholder\{([^}]*)\}\{([^}]*)\}\{([^}]*)\}/);
    if (!m) return;

    placeholders.push({
      id: m[3],
      title: m[1],
      caption: m[2],
      sourceFile: rel,
      sourceLine: index + 1,
      status: "needs-ai-figure",
      asset: null,
      rights: {
        license: "pending",
        source: "pending",
        credit: "pending"
      },
      print: {
        targetDpi: 300,
        minWidthPx: 2400,
        minHeightPx: 1800
      }
    });
  });
}

const registry = {
  slug,
  generatedAt: new Date().toISOString(),
  policy: {
    placeholdersAllowedInDraft: true,
    placeholdersAllowedInPublication: false,
    aiImagesRequireLedger: true,
    provenanceRequired: true
  },
  figures: placeholders
};

fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");

const ledger = {
  slug,
  generatedAt: new Date().toISOString(),
  assets: placeholders.map((fig) => ({
    figureId: fig.id,
    title: fig.title,
    asset: fig.asset,
    status: fig.status,
    promptFile: `figures/ai-briefs/${fig.id}.md`,
    model: null,
    generatedAt: null,
    sourceImages: [],
    license: "pending",
    credit: "pending",
    approvedForPrint: false
  }))
};

fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2) + "\n");

for (const fig of placeholders) {
  const brief = `# AI Figure Brief: ${fig.id}

## Title
${fig.title}

## Caption
${fig.caption}

## Source
- File: \`${fig.sourceFile}\`
- Line: ${fig.sourceLine}

## Purpose
Create a publication-quality scientific/conceptual figure for the FHQCM manuscript.

## Visual Requirements
- Museum-quality scientific illustration.
- Clear visual hierarchy.
- No fake citations, fake equations, fake logos, or unreadable labels.
- Use clean labels only when necessary.
- Prefer symbolic geometry, field lines, layered diagrams, light cones, toroidal forms, observer axes, causal arrows, and coherent color logic.
- Must be suitable for print at 300 DPI.

## Prompt Draft
Create a high-resolution scientific concept illustration titled "${fig.title}". The image should visually explain: ${fig.caption}

Style: professional academic book figure, clean, precise, luminous, coherent, visually elegant, suitable for a serious theoretical physics and consciousness studies manuscript.

Avoid: clutter, random mystical symbols, fake text, distorted typography, misleading equations, copyrighted characters, watermarks.

## Required Ledger Fields After Creation
- image file path
- model/provider
- prompt used
- generation date
- license/usage rights
- human approval status
`;

  fs.writeFileSync(path.join(briefsDir, `${fig.id}.md`), brief);
}

console.log(`Figure registry written: ${path.relative(root, registryPath)}`);
console.log(`Asset ledger written: ${path.relative(root, ledgerPath)}`);
console.log(`AI briefs written: ${placeholders.length}`);
