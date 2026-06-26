import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const bookDir = path.join(root, "books", slug);
const figuresDir = path.join(bookDir, "figures");
const exportLatexDir = path.join(bookDir, "exports", "latex");

const registryPath = path.join(figuresDir, "figure-registry.json");
const specsDir = path.join(figuresDir, "specifications");
const studioDir = path.join(figuresDir, "studio");
const contextDir = path.join(figuresDir, "context");

fs.mkdirSync(specsDir, { recursive: true });
fs.mkdirSync(studioDir, { recursive: true });
fs.mkdirSync(contextDir, { recursive: true });

function readJson(file, fallback) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback;
}

function readLines(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8").split(/\r?\n/) : [];
}

function rel(file, base = root) {
  return path.relative(base, file).replaceAll("\\", "/");
}

function classifyFigure(title, caption, contextText) {
  const text = `${title} ${caption} ${contextText}`.toLowerCase();

  if (/torus|toroidal|spiral|geometry|manifold|holographic/.test(text)) return "scientific-topology-diagram";
  if (/quantum|observer|wave|collapse|detector|choice/.test(text)) return "quantum-process-diagram";
  if (/federation|architecture|system|network|library/.test(text)) return "systems-architecture-diagram";
  if (/heart|love|sobriety|recovery|christic|unity/.test(text)) return "symbolic-concept-illustration";

  return "conceptual-scientific-illustration";
}

function extractContext(figure) {
  const sourceFile = path.join(exportLatexDir, figure.sourceFile);
  const lines = readLines(sourceFile);
  const index = Math.max(0, (figure.sourceLine || 1) - 1);

  const beforeStart = Math.max(0, index - 12);
  const afterEnd = Math.min(lines.length, index + 13);

  const before = lines.slice(beforeStart, index);
  const current = lines[index] || "";
  const after = lines.slice(index + 1, afterEnd);

  return {
    sourceFile: figure.sourceFile,
    sourceLine: figure.sourceLine,
    before,
    current,
    after,
    surroundingText: [...before, current, ...after]
      .join("\n")
      .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, "$1")
      .replace(/[{}\\]/g, "")
      .replace(/\s+/g, " ")
      .trim(),
  };
}

function buildSpec(figure, context) {
  const figureType = classifyFigure(figure.title, figure.caption, context.surroundingText);

  return {
    schema: "booksmith.figure-spec.v1",
    id: figure.id,
    title: figure.title,
    caption: figure.caption,
    status: "SPEC_READY",
    source: {
      file: figure.sourceFile,
      line: figure.sourceLine,
    },
    placementContext: {
      before: context.before,
      after: context.after,
      surroundingText: context.surroundingText,
    },
    artDirection: {
      figureType,
      audience: "serious academic and general intelligent readers",
      style: "museum-quality scientific book illustration",
      composition: "clear central concept, readable hierarchy, uncluttered layout",
      aspectRatio: "16:9",
      printIntent: {
        dpi: 300,
        minimumWidthPx: 2400,
        minimumHeightPx: 1800,
      },
    },
    required: {
      mustExplain: figure.caption,
      mustAvoid: [
        "fake citations",
        "fake equations",
        "unreadable text",
        "watermarks",
        "copyrighted characters",
        "random mystical clutter",
        "misleading scientific labels"
      ],
    },
    userRevision: {
      plainLanguageRequest: "",
      aiImprovedRequest: "",
      status: "awaiting-user-input"
    },
    promptCompiler: {
      promptStatus: "ready-to-compile",
      providerAgnostic: true,
      finalPrompt: null
    }
  };
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

const registry = readJson(registryPath, { figures: [] });
const studioCards = [];

for (const figure of registry.figures || []) {
  const context = extractContext(figure);
  const spec = buildSpec(figure, context);
  spec.promptCompiler.finalPrompt = compilePrompt(spec);

  const specPath = path.join(specsDir, `${figure.id}.json`);
  const contextPath = path.join(contextDir, `${figure.id}.json`);
  const promptPath = path.join(studioDir, `${figure.id}-prompt.md`);
  const cardPath = path.join(studioDir, `${figure.id}.json`);

  fs.writeFileSync(specPath, JSON.stringify(spec, null, 2) + "\n");
  fs.writeFileSync(contextPath, JSON.stringify(context, null, 2) + "\n");

  fs.writeFileSync(promptPath, [
    `# Figure Studio Prompt: ${figure.id}`,
    "",
    `## Title`,
    figure.title,
    "",
    `## Caption`,
    figure.caption,
    "",
    `## Context`,
    context.surroundingText || "No context found.",
    "",
    `## Final Prompt`,
    "",
    spec.promptCompiler.finalPrompt,
    "",
    `## Plain-Language User Revision`,
    "",
    "Add user feedback here before generation.",
    "",
  ].join("\n"));

  const card = {
    id: figure.id,
    title: figure.title,
    caption: figure.caption,
    status: figure.status || "needs-ai-figure",
    source: `${figure.sourceFile}:${figure.sourceLine}`,
    figureType: spec.artDirection.figureType,
    specFile: rel(specPath, bookDir),
    contextFile: rel(contextPath, bookDir),
    promptFile: rel(promptPath, bookDir),
    surroundingTextPreview: context.surroundingText.slice(0, 500),
    actions: [
      "review-context",
      "edit-plain-language-request",
      "improve-request-with-ai",
      "compile-prompt",
      "generate-draft-image",
      "approve-or-request-revision"
    ]
  };

  fs.writeFileSync(cardPath, JSON.stringify(card, null, 2) + "\n");
  studioCards.push(card);
}

const index = {
  schema: "booksmith.figure-studio.v1",
  slug,
  generatedAt: new Date().toISOString(),
  count: studioCards.length,
  cards: studioCards,
};

fs.writeFileSync(path.join(studioDir, "figure-studio-index.json"), JSON.stringify(index, null, 2) + "\n");

fs.writeFileSync(path.join(studioDir, "figure-studio-index.md"), [
  "# BookSmith Figure Studio v1",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${index.generatedAt}`,
  `Figures: ${studioCards.length}`,
  "",
  "## UI/UX Meaning",
  "",
  "Each card is ready for a future web UI where the user can inspect manuscript context, describe desired changes in plain language, let AI improve the request, then generate or import a figure asset.",
  "",
  "## Figure Cards",
  "",
  ...studioCards.map((card) => [
    `### ${card.id} — ${card.title}`,
    "",
    `- Status: ${card.status}`,
    `- Type: ${card.figureType}`,
    `- Source: \`${card.source}\``,
    `- Spec: \`${card.specFile}\``,
    `- Prompt: \`${card.promptFile}\``,
    "",
    `Context preview: ${card.surroundingTextPreview}`,
    "",
  ].join("\n")),
].join("\n"));

console.log(`Figure Studio index written: ${rel(path.join(studioDir, "figure-studio-index.md"))}`);
console.log(`Cards: ${studioCards.length}`);
