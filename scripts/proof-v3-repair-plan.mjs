import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const pdfDir = path.join(root, "books", slug, "exports", "pdf");
const contextPath = path.join(pdfDir, "booksmith-proof-v3-context.json");
const outJson = path.join(pdfDir, "booksmith-proof-v3-repair-plan.json");
const outMd = path.join(pdfDir, "booksmith-proof-v3-repair-plan.md");

if (!fs.existsSync(contextPath)) {
  console.error("Missing v3 context report.");
  process.exit(1);
}

const context = JSON.parse(fs.readFileSync(contextPath, "utf8"));

function planForDiagnostic(diagnostic, index) {
  const cls = diagnostic.classification;
  const source = diagnostic.sourceContext;

  if (!source) {
    return {
      id: `repair-${index + 1}`,
      type: "manual",
      confidence: 0,
      safe: false,
      reason: "No mapped source context.",
      diagnostic,
    };
  }

  if (cls === "heading") {
    return {
      id: `repair-${index + 1}`,
      type: "heading-ragged-right",
      confidence: 0.85,
      safe: true,
      file: source.file,
      line: source.line,
      reason: "Heading overflow can usually be repaired by ragged-right heading formatting or short optional titles.",
      diagnostic,
    };
  }

  if (cls === "url-or-path") {
    return {
      id: `repair-${index + 1}`,
      type: "url-breaks",
      confidence: 0.95,
      safe: true,
      file: source.file,
      line: source.line,
      reason: "URLs and paths can be safely made breakable.",
      diagnostic,
    };
  }

  if (cls === "long-token") {
    return {
      id: `repair-${index + 1}`,
      type: "long-token-allowbreak",
      confidence: 0.75,
      safe: true,
      file: source.file,
      line: source.line,
      reason: "Long tokens may be made breakable with discretionary breaks.",
      diagnostic,
    };
  }

  if (cls === "caption") {
    return {
      id: `repair-${index + 1}`,
      type: "caption-ragged-right",
      confidence: 0.8,
      safe: true,
      file: source.file,
      line: source.line,
      reason: "Captions can be given ragged-right formatting or short captions.",
      diagnostic,
    };
  }

  if (cls === "paragraph-or-generated") {
    return {
      id: `repair-${index + 1}`,
      type: "microtypography-relaxation",
      confidence: 0.7,
      safe: true,
      file: source.file,
      line: source.line,
      reason: "Small generated overfull boxes can usually be handled by localized tolerance or parbox relaxation.",
      diagnostic,
    };
  }

  return {
    id: `repair-${index + 1}`,
    type: "manual-review",
    confidence: 0.2,
    safe: false,
    file: source.file,
    line: source.line,
    reason: `No safe automatic rule yet for classification: ${cls}`,
    diagnostic,
  };
}

const plans = context.diagnostics.map(planForDiagnostic);

const result = {
  slug,
  generatedAt: new Date().toISOString(),
  plans,
};

fs.writeFileSync(outJson, JSON.stringify(result, null, 2) + "\n");

fs.writeFileSync(outMd, [
  "# Booksmith Proof v3 Repair Plan",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${result.generatedAt}`,
  `Plans: ${plans.length}`,
  "",
  ...plans.map((plan) => [
    `## ${plan.id}: ${plan.type}`,
    "",
    `- Safe: ${plan.safe ? "yes" : "no"}`,
    `- Confidence: ${Math.round(plan.confidence * 100)}%`,
    plan.file ? `- Source: \`${plan.file}:${plan.line}\`` : "- Source: unknown",
    `- Reason: ${plan.reason}`,
    "",
  ].join("\n")),
].join("\n"));

console.log(`Proof v3 repair plan written: ${path.relative(root, outMd)}`);
