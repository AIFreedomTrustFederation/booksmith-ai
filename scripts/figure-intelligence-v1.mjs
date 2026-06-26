import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const bookDir = path.join(root, "books", slug);
const figureDir = path.join(bookDir, "figures");
const pdfDir = path.join(bookDir, "exports", "pdf");

const registryPath = path.join(figureDir, "figure-registry.json");
const ledgerPath = path.join(figureDir, "asset-ledger.json");
const outJson = path.join(pdfDir, "booksmith-figure-intelligence-v1.json");
const outMd = path.join(pdfDir, "booksmith-figure-intelligence-v1.md");

if (!fs.existsSync(registryPath)) {
  console.error("Missing figure registry.");
  process.exit(1);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const ledger = fs.existsSync(ledgerPath) ? JSON.parse(fs.readFileSync(ledgerPath, "utf8")) : { assets: [] };

const records = (registry.figures || []).map((figure) => {
  const assetRecord = (ledger.assets || []).find((asset) => asset.figureId === figure.id);
  const hasAsset = Boolean(figure.asset || assetRecord?.asset);
  const approved = Boolean(assetRecord?.approvedForPrint);

  let status = "NEEDS_AI_FIGURE";
  let severity = "publication";

  if (hasAsset && approved) {
    status = "APPROVED";
    severity = "none";
  } else if (hasAsset && !approved) {
    status = "NEEDS_HUMAN_APPROVAL";
    severity = "publication";
  }

  return {
    id: figure.id,
    title: figure.title,
    source: `${figure.sourceFile}:${figure.sourceLine}`,
    status,
    severity,
    hasAsset,
    approvedForPrint: approved,
    promptFile: assetRecord?.promptFile || `figures/ai-briefs/${figure.id}.md`,
    asset: figure.asset || assetRecord?.asset || null,
  };
});

const result = {
  slug,
  generatedAt: new Date().toISOString(),
  status: records.every((record) => record.status === "APPROVED") ? "PASS" : "PASS_DRAFT_ONLY",
  counts: {
    figures: records.length,
    approved: records.filter((r) => r.status === "APPROVED").length,
    needsHumanApproval: records.filter((r) => r.status === "NEEDS_HUMAN_APPROVAL").length,
    needsAiFigure: records.filter((r) => r.status === "NEEDS_AI_FIGURE").length,
  },
  records,
};

fs.writeFileSync(outJson, JSON.stringify(result, null, 2) + "\n");

fs.writeFileSync(outMd, [
  "# BookSmith Figure Intelligence v1",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${result.generatedAt}`,
  `Status: **${result.status}**`,
  "",
  "## Counts",
  "",
  ...Object.entries(result.counts).map(([key, value]) => `- ${key}: ${value}`),
  "",
  "## Figure Records",
  "",
  ...records.map((record) => [
    `### ${record.id}`,
    "",
    `- Title: ${record.title}`,
    `- Status: **${record.status}**`,
    `- Source: \`${record.source}\``,
    `- Prompt: \`${record.promptFile}\``,
    record.asset ? `- Asset: \`${record.asset}\`` : "- Asset: none",
    "",
  ].join("\n")),
].join("\n"));

console.log(`Figure intelligence written: ${path.relative(root, outMd)}`);
console.log(`Status: ${result.status}`);
