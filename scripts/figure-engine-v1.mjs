import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const slug = process.argv[2] || "fhqcm";
const mode = process.argv[3] || "queue";
const figureId = process.argv[4] || null;
const assetPathArg = process.argv[5] || null;

const root = process.cwd();
const bookDir = path.join(root, "books", slug);
const figuresDir = path.join(bookDir, "figures");
const assetDir = path.join(figuresDir, "assets");
const queueDir = path.join(figuresDir, "generation-queue");
const registryPath = path.join(figuresDir, "figure-registry.json");
const ledgerPath = path.join(figuresDir, "asset-ledger.json");
const reportPath = path.join(figuresDir, "figure-engine-report.md");
const reportJsonPath = path.join(figuresDir, "figure-engine-report.json");

fs.mkdirSync(assetDir, { recursive: true });
fs.mkdirSync(queueDir, { recursive: true });

function readJson(file, fallback) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback;
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function safeName(value) {
  return String(value).replace(/[^A-Za-z0-9._-]+/g, "-");
}

const registry = readJson(registryPath, { slug, figures: [] });
const ledger = readJson(ledgerPath, { slug, assets: [] });

function save() {
  writeJson(registryPath, registry);
  writeJson(ledgerPath, ledger);
}

function findFigure(id) {
  return registry.figures.find((figure) => figure.id === id);
}

function findLedger(id) {
  let record = ledger.assets.find((asset) => asset.figureId === id);

  if (!record) {
    record = {
      figureId: id,
      status: "NEEDS_AI_FIGURE",
      asset: null,
      promptFile: `figures/ai-briefs/${id}.md`,
      model: null,
      provider: null,
      generatedAt: null,
      sourceImages: [],
      license: "pending",
      credit: "pending",
      checksumSha256: null,
      approvedForPrint: false,
      approval: null,
      history: [],
    };

    ledger.assets.push(record);
  }

  return record;
}

function buildQueue() {
  const items = [];

  for (const figure of registry.figures || []) {
    const record = findLedger(figure.id);
    const briefPath = path.join(bookDir, record.promptFile);

    const status = record.approvedForPrint
      ? "APPROVED"
      : record.asset
        ? "NEEDS_HUMAN_APPROVAL"
        : "NEEDS_AI_FIGURE";

    record.status = status;

    const queueItem = {
      figureId: figure.id,
      title: figure.title,
      caption: figure.caption,
      status,
      sourceFile: figure.sourceFile,
      sourceLine: figure.sourceLine,
      promptFile: record.promptFile,
      asset: record.asset,
      approvedForPrint: record.approvedForPrint,
      nextAction:
        status === "APPROVED"
          ? "No action needed."
          : status === "NEEDS_HUMAN_APPROVAL"
            ? "Review image and approve or regenerate."
            : "Generate image from AI brief or import a manually created asset.",
    };

    items.push(queueItem);

    const queueMarkdown = [
      `# Figure Generation Queue Item: ${figure.id}`,
      "",
      `Title: ${figure.title}`,
      `Status: ${status}`,
      `Source: ${figure.sourceFile}:${figure.sourceLine}`,
      `Prompt: ${record.promptFile}`,
      "",
      "## Caption",
      "",
      figure.caption || "",
      "",
      "## Next Action",
      "",
      queueItem.nextAction,
      "",
      "## Commands",
      "",
      "Import generated/manual asset:",
      "",
      "```bash",
      `npm run figure:import -- ${slug} ${figure.id} /path/to/image.png`,
      "```",
      "",
      "Approve for print:",
      "",
      "```bash",
      `npm run figure:approve -- ${slug} ${figure.id}`,
      "```",
      "",
      "Reject / send back to queue:",
      "",
      "```bash",
      `npm run figure:reject -- ${slug} ${figure.id}`,
      "```",
      "",
    ].join("\n");

    fs.writeFileSync(path.join(queueDir, `${figure.id}.md`), queueMarkdown);
  }

  save();
  writeReport("queue", items);
}

function importAsset() {
  if (!figureId || !assetPathArg) {
    console.error("Usage: npm run figure:import -- fhqcm FIGURE_ID /path/to/image.png");
    process.exit(1);
  }

  const figure = findFigure(figureId);
  if (!figure) {
    console.error(`Unknown figure: ${figureId}`);
    process.exit(1);
  }

  const sourcePath = path.resolve(assetPathArg);
  if (!fs.existsSync(sourcePath)) {
    console.error(`Missing asset: ${sourcePath}`);
    process.exit(1);
  }

  const ext = path.extname(sourcePath).toLowerCase() || ".png";
  const destRel = `figures/assets/${safeName(figureId)}${ext}`;
  const dest = path.join(bookDir, destRel);

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(sourcePath, dest);

  const record = findLedger(figureId);

  record.asset = destRel;
  record.status = "NEEDS_HUMAN_APPROVAL";
  record.generatedAt = new Date().toISOString();
  record.provider = record.provider || "manual-import";
  record.model = record.model || "external-or-manual";
  record.checksumSha256 = sha256(dest);
  record.approvedForPrint = false;
  record.history = record.history || [];
  record.history.push({
    at: new Date().toISOString(),
    action: "imported-asset",
    asset: destRel,
    checksumSha256: record.checksumSha256,
  });

  figure.asset = destRel;
  figure.status = "needs-human-approval";

  save();
  writeReport("import", [{ figureId, asset: destRel, status: record.status }]);
}

function approveFigure() {
  if (!figureId) {
    console.error("Usage: npm run figure:approve -- fhqcm FIGURE_ID");
    process.exit(1);
  }

  const figure = findFigure(figureId);
  const record = findLedger(figureId);

  if (!figure || !record.asset) {
    console.error(`Figure has no imported asset: ${figureId}`);
    process.exit(1);
  }

  record.status = "APPROVED";
  record.approvedForPrint = true;
  record.approval = {
    approvedAt: new Date().toISOString(),
    approvedBy: "local-author",
    note: "Approved through BookSmith Figure Engine v1.",
  };
  record.history = record.history || [];
  record.history.push({
    at: new Date().toISOString(),
    action: "approved-for-print",
    asset: record.asset,
  });

  figure.status = "approved";
  figure.asset = record.asset;

  save();
  writeReport("approve", [{ figureId, asset: record.asset, status: record.status }]);
}

function rejectFigure() {
  if (!figureId) {
    console.error("Usage: npm run figure:reject -- fhqcm FIGURE_ID");
    process.exit(1);
  }

  const figure = findFigure(figureId);
  const record = findLedger(figureId);

  if (!figure || !record) {
    console.error(`Unknown figure: ${figureId}`);
    process.exit(1);
  }

  record.status = "NEEDS_AI_FIGURE";
  record.approvedForPrint = false;
  record.approval = null;
  record.history = record.history || [];
  record.history.push({
    at: new Date().toISOString(),
    action: "rejected",
    asset: record.asset,
  });

  figure.status = "needs-ai-figure";

  save();
  writeReport("reject", [{ figureId, asset: record.asset, status: record.status }]);
}

function writeReport(action, items) {
  const counts = {
    total: ledger.assets.length,
    approved: ledger.assets.filter((asset) => asset.approvedForPrint).length,
    needsHumanApproval: ledger.assets.filter((asset) => asset.asset && !asset.approvedForPrint).length,
    needsAiFigure: ledger.assets.filter((asset) => !asset.asset).length,
  };

  const report = {
    slug,
    generatedAt: new Date().toISOString(),
    action,
    counts,
    items,
  };

  writeJson(reportJsonPath, report);

  fs.writeFileSync(reportPath, [
    "# BookSmith Figure Engine v1",
    "",
    `Book slug: \`${slug}\``,
    `Generated: ${report.generatedAt}`,
    `Action: ${action}`,
    "",
    "## Counts",
    "",
    ...Object.entries(counts).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Items",
    "",
    items.length
      ? items.map((item) => [
          `### ${item.figureId}`,
          "",
          `- Status: ${item.status}`,
          item.title ? `- Title: ${item.title}` : "",
          item.asset ? `- Asset: \`${item.asset}\`` : "",
          item.nextAction ? `- Next action: ${item.nextAction}` : "",
          "",
        ].filter(Boolean).join("\n")).join("\n")
      : "None.",
    "",
  ].join("\n"));

  console.log(`Figure Engine report written: ${path.relative(root, reportPath)}`);
  console.log(JSON.stringify(counts, null, 2));
}

if (mode === "queue") buildQueue();
else if (mode === "import") importAsset();
else if (mode === "approve") approveFigure();
else if (mode === "reject") rejectFigure();
else {
  console.error(`Unknown mode: ${mode}`);
  process.exit(1);
}
