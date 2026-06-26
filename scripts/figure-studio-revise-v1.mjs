import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const figureId = process.argv[3];
const plainRequest = process.argv.slice(4).join(" ");

if (!figureId || !plainRequest) {
  console.error('Usage: npm run figure:revise -- fhqcm F014 "make it more like a clean scientific diagram with less mystical clutter"');
  process.exit(1);
}

const root = process.cwd();
const bookDir = path.join(root, "books", slug);
const specPath = path.join(bookDir, "figures", "specifications", `${figureId}.json`);
const promptPath = path.join(bookDir, "figures", "studio", `${figureId}-prompt.md`);

if (!fs.existsSync(specPath)) {
  console.error(`Missing spec: ${specPath}`);
  process.exit(1);
}

const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));

function improveRequest(input) {
  return [
    "Refine the figure according to this author direction:",
    input,
    "",
    "Preserve scientific clarity, reduce unnecessary visual clutter, improve explanatory composition, and keep the image suitable for a serious academic book.",
    "Use clean symbolic structure, coherent geometry, accurate visual hierarchy, and only minimal readable labels."
  ].join(" ");
}

function compilePrompt(spec) {
  const userIntent = spec.userRevision.aiImprovedRequest || spec.userRevision.plainLanguageRequest;

  return [
    `Create a high-resolution ${spec.artDirection.figureType} titled "${spec.title}".`,
    "",
    `The image must visually explain: ${spec.caption}`,
    "",
    spec.placementContext.surroundingText
      ? `Use this manuscript context to decide what belongs in the image: ${spec.placementContext.surroundingText}`
      : "",
    "",
    userIntent ? `User revision direction: ${userIntent}` : "",
    "",
    `Style: ${spec.artDirection.style}.`,
    `Composition: ${spec.artDirection.composition}.`,
    `Aspect ratio: ${spec.artDirection.aspectRatio}.`,
    "Use coherent scientific visual language, clean labels only when helpful, and strong print readability.",
    "",
    `Avoid: ${spec.required.mustAvoid.join(", ")}.`,
  ].filter(Boolean).join("\n");
}

spec.userRevision = {
  plainLanguageRequest: plainRequest,
  aiImprovedRequest: improveRequest(plainRequest),
  status: "ai-improved-request-ready",
  updatedAt: new Date().toISOString()
};

spec.promptCompiler.finalPrompt = compilePrompt(spec);
spec.promptCompiler.promptStatus = "compiled-after-user-revision";

fs.writeFileSync(specPath, JSON.stringify(spec, null, 2) + "\n");

fs.writeFileSync(promptPath, [
  `# Figure Studio Prompt: ${figureId}`,
  "",
  `## Title`,
  spec.title,
  "",
  `## Caption`,
  spec.caption,
  "",
  `## User Request`,
  plainRequest,
  "",
  `## AI-Improved Request`,
  spec.userRevision.aiImprovedRequest,
  "",
  `## Final Prompt`,
  "",
  spec.promptCompiler.finalPrompt,
  "",
].join("\n"));

console.log(`Updated figure spec: figures/specifications/${figureId}.json`);
console.log(`Updated prompt: figures/studio/${figureId}-prompt.md`);
