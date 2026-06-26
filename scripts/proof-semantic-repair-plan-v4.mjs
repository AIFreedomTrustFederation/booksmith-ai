import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const pdfDir = path.join(root, "books", slug, "exports", "pdf");

const semanticPath = path.join(pdfDir, "booksmith-proof-semantic-context-v4.json");
const outJson = path.join(pdfDir, "booksmith-proof-semantic-repair-plan-v4.json");
const outMd = path.join(pdfDir, "booksmith-proof-semantic-repair-plan-v4.md");

if (!fs.existsSync(semanticPath)) {
  console.error("Missing semantic context report.");
  process.exit(1);
}

const semantic = JSON.parse(fs.readFileSync(semanticPath, "utf8"));

function plan(item, index) {
  const cls = item.semanticClass;
  const anchor = item.anchor;
  const inspected = item.inspected;

  if (!inspected || !anchor) {
    return {
      id: `semantic-repair-${index + 1}`,
      type: "manual-review",
      confidence: 0,
      safe: false,
      reason: "No inspected source context.",
      diagnostic: item,
    };
  }

  if (cls === "heading-following-paragraph") {
    return {
      id: `semantic-repair-${index + 1}`,
      type: "paragraph-local-sloppy",
      confidence: 0.94,
      safe: true,
      file: inspected.file,
      startLine: anchor.paragraph.startLine,
      endLine: anchor.paragraph.endLine,
      reason: "The overflow is in the first paragraph after a heading. A local sloppypar wrapper is safe and does not rewrite author prose.",
      diagnostic: item,
    };
  }

  if (cls === "url") {
    return {
      id: `semantic-repair-${index + 1}`,
      type: "url-breakability",
      confidence: 0.96,
      safe: true,
      file: inspected.file,
      startLine: anchor.paragraph.startLine,
      endLine: anchor.paragraph.endLine,
      reason: "URL/path overflow can be safely repaired by breakable URL handling.",
      diagnostic: item,
    };
  }

  if (cls === "caption") {
    return {
      id: `semantic-repair-${index + 1}`,
      type: "caption-ragged-right",
      confidence: 0.9,
      safe: true,
      file: inspected.file,
      startLine: anchor.paragraph.startLine,
      endLine: anchor.paragraph.endLine,
      reason: "Caption overflow can be handled by caption typography without changing text.",
      diagnostic: item,
    };
  }

  return {
    id: `semantic-repair-${index + 1}`,
    type: "manual-review",
    confidence: 0.4,
    safe: false,
    file: inspected.file,
    startLine: anchor.paragraph?.startLine,
    endLine: anchor.paragraph?.endLine,
    reason: `No high-confidence semantic repair rule for ${cls}.`,
    diagnostic: item,
  };
}

const plans = semantic.diagnostics.map(plan);

const report = {
  slug,
  generatedAt: new Date().toISOString(),
  plans,
};

fs.writeFileSync(outJson, JSON.stringify(report, null, 2) + "\n");

fs.writeFileSync(outMd, [
  "# Booksmith Semantic Repair Plan v4",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${report.generatedAt}`,
  `Plans: ${plans.length}`,
  "",
  ...plans.map((item) => [
    `## ${item.id}: ${item.type}`,
    "",
    `- Safe: ${item.safe ? "yes" : "no"}`,
    `- Confidence: ${Math.round(item.confidence * 100)}%`,
    item.file ? `- Source: \`${item.file}:${item.startLine}-${item.endLine}\`` : "- Source: unknown",
    `- Reason: ${item.reason}`,
    "",
  ].join("\n")),
].join("\n"));

console.log(`Semantic repair plan written: ${path.relative(root, outMd)}`);
