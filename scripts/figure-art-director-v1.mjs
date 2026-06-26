import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const bookDir = path.join(root, "books", slug);
const figuresDir = path.join(bookDir, "figures");
const studioDir = path.join(figuresDir, "studio");
const specsDir = path.join(figuresDir, "specifications");
const artDir = path.join(figuresDir, "art-direction");
const outJson = path.join(artDir, "figure-art-director-v1.json");
const outMd = path.join(artDir, "figure-art-director-v1.md");

fs.mkdirSync(artDir, { recursive: true });

function readJson(file, fallback) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback;
}

function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}

function terms(text) {
  return String(text || "").toLowerCase();
}

function inferKnowledge(spec) {
  const text = terms([
    spec.title,
    spec.caption,
    spec.placementContext?.surroundingText,
    spec.artDirection?.figureType,
  ].join(" "));

  const requiredObjects = new Set();
  const concepts = new Set();
  const labels = new Set();
  const forbiddenObjects = new Set(spec.required?.mustAvoid || []);

  if (/wave|function|collapse|superposition/.test(text)) {
    concepts.add("wave-particle relationship");
    concepts.add("quantum state transition");
    requiredObjects.add("wavefront or probability field");
    requiredObjects.add("measurement boundary");
    labels.add("superposition");
    labels.add("measurement");
  }

  if (/delayed|choice|wheeler|detector|photon|beam/.test(text)) {
    concepts.add("delayed-choice measurement");
    concepts.add("observer-dependent experimental arrangement");
    requiredObjects.add("photon path");
    requiredObjects.add("beam splitter or choice point");
    requiredObjects.add("detector A");
    requiredObjects.add("detector B");
    requiredObjects.add("observer or measurement station");
    labels.add("choice point");
    labels.add("detector");
  }

  if (/observer|observation|participatory/.test(text)) {
    concepts.add("observer participation");
    requiredObjects.add("observer axis or observation node");
    requiredObjects.add("information flow arrows");
    labels.add("observer");
    labels.add("information");
  }

  if (/torus|toroidal|spiral|manifold|holographic|fractal/.test(text)) {
    concepts.add("topological recursion");
    concepts.add("holographic/fractal structure");
    requiredObjects.add("toroidal geometry");
    requiredObjects.add("nested or recursive field lines");
    labels.add("recursion");
    labels.add("field");
  }

  if (/federation|architecture|network|system|library/.test(text)) {
    concepts.add("federated systems architecture");
    requiredObjects.add("nodes");
    requiredObjects.add("links");
    requiredObjects.add("central registry or shared protocol layer");
    labels.add("node");
    labels.add("federation");
  }

  if (/heart|love|recovery|sobriety|unity|collapse/.test(text)) {
    concepts.add("symbolic integration");
    requiredObjects.add("central symbolic heart or integration point");
    requiredObjects.add("spiral or healing path");
    labels.add("integration");
    labels.add("recovery");
  }

  if (!concepts.size) {
    concepts.add("conceptual explanatory diagram");
    requiredObjects.add("central visual metaphor");
    requiredObjects.add("supporting arrows or structure");
  }

  forbiddenObjects.add("random galaxies unless explicitly required");
  forbiddenObjects.add("unreadable text");
  forbiddenObjects.add("decorative clutter");
  forbiddenObjects.add("fake equations");
  forbiddenObjects.add("fake citations");

  return {
    concepts: [...concepts],
    requiredObjects: [...requiredObjects],
    recommendedLabels: [...labels].slice(0, 6),
    forbiddenObjects: [...forbiddenObjects],
  };
}

function compositionFor(spec, knowledge) {
  const type = spec.artDirection?.figureType || "conceptual-scientific-illustration";

  if (type === "quantum-process-diagram") {
    return {
      camera: "orthographic",
      layout: "left-to-right experimental flow",
      visualHierarchy: [
        "source/emission",
        "path or choice point",
        "measurement/detector",
        "observer/information interpretation",
      ],
      colorLogic: "cool scientific background, bright path lines, restrained accent colors",
      labelPolicy: "minimal labels, no dense paragraphs inside image",
    };
  }

  if (type === "scientific-topology-diagram") {
    return {
      camera: "three-quarter orthographic or centered symbolic perspective",
      layout: "central topology with clean surrounding annotations",
      visualHierarchy: [
        "primary manifold or geometry",
        "recursive field lines",
        "observer or axis if relevant",
        "caption-level meaning implied by structure",
      ],
      colorLogic: "spectrum or luminous gradient only when it clarifies geometry",
      labelPolicy: "labels optional; prefer clean geometry over text-heavy design",
    };
  }

  if (type === "systems-architecture-diagram") {
    return {
      camera: "flat diagrammatic view",
      layout: "nodes and layers with clear flow arrows",
      visualHierarchy: [
        "core protocol or registry",
        "federated nodes",
        "data/provenance flow",
        "user/control layer",
      ],
      colorLogic: "clean interface palette, strong contrast",
      labelPolicy: "short readable labels allowed",
    };
  }

  return {
    camera: "orthographic or clean illustrative perspective",
    layout: "central subject with supporting explanatory structure",
    visualHierarchy: knowledge.requiredObjects.slice(0, 4),
    colorLogic: "coherent symbolic palette with print-safe contrast",
    labelPolicy: "minimal labels only when useful",
  };
}

function qaChecklist(spec, knowledge) {
  return [
    "Matches figure title and caption",
    "Reflects surrounding manuscript context",
    "Includes required visual objects",
    "Avoids forbidden objects and fake text",
    "No fake citations or equations",
    "No copyrighted characters or watermarks",
    "Readable at book-print size",
    "Suitable for 300 DPI print workflow",
    "Has clear visual hierarchy",
    "Does not overuse mystical or decorative elements",
  ];
}

function compileProviderPrompts(spec, knowledge, composition) {
  const base = [
    `Create a publication-quality scientific book figure titled "${spec.title}".`,
    `Purpose: ${spec.caption}`,
    "",
    `Manuscript context: ${spec.placementContext?.surroundingText || "No surrounding text available."}`,
    "",
    `Scientific/conceptual concepts: ${knowledge.concepts.join(", ")}.`,
    `Required visual objects: ${knowledge.requiredObjects.join(", ")}.`,
    `Recommended short labels: ${knowledge.recommendedLabels.join(", ") || "none"}.`,
    "",
    `Composition: ${composition.layout}.`,
    `Camera/view: ${composition.camera}.`,
    `Visual hierarchy: ${composition.visualHierarchy.join(" → ")}.`,
    `Color logic: ${composition.colorLogic}.`,
    `Label policy: ${composition.labelPolicy}.`,
    "",
    `Avoid: ${knowledge.forbiddenObjects.join(", ")}.`,
    "",
    "Make it clean, serious, elegant, uncluttered, and suitable for an academic manuscript.",
  ].join("\n");

  return {
    providerAgnostic: base,
    chatgptImage: `${base}\n\nUse high-resolution scientific illustration style. Keep text minimal and legible.`,
    localDiffusion: `${base}\n\nStyle tokens: scientific diagram, clean vector-like composition, high detail, sharp, print ready, no watermark, no illegible text.`,
    svgDiagram: `${base}\n\nIf rendered as SVG, prefer simple geometric primitives, arrows, gradients, and readable labels.`,
  };
}

const index = readJson(path.join(studioDir, "figure-studio-index.json"), { cards: [] });
const directed = [];

for (const card of index.cards || []) {
  const specPath = path.join(bookDir, card.specFile);
  const spec = readJson(specPath, null);
  if (!spec) continue;

  const knowledge = inferKnowledge(spec);
  const composition = compositionFor(spec, knowledge);
  const prompts = compileProviderPrompts(spec, knowledge, composition);

  const record = {
    schema: "booksmith.figure-art-direction.v1",
    id: spec.id,
    title: spec.title,
    status: "ART_DIRECTION_READY",
    source: spec.source,
    figureType: spec.artDirection?.figureType,
    knowledge,
    composition,
    qaChecklist: qaChecklist(spec, knowledge),
    revisionWorkflow: {
      userPlainLanguage: "",
      aiImprovedInstruction: "",
      currentVersion: 0,
      versions: [],
      approvalRequired: true,
    },
    prompts,
  };

  const recordJson = path.join(artDir, `${spec.id}.json`);
  const recordMd = path.join(artDir, `${spec.id}.md`);

  writeJson(recordJson, record);

  fs.writeFileSync(recordMd, [
    `# Figure Art Direction: ${spec.id}`,
    "",
    `Title: ${spec.title}`,
    `Type: ${record.figureType}`,
    `Status: ${record.status}`,
    "",
    "## Concepts",
    "",
    ...knowledge.concepts.map((item) => `- ${item}`),
    "",
    "## Required Objects",
    "",
    ...knowledge.requiredObjects.map((item) => `- ${item}`),
    "",
    "## Composition",
    "",
    `- Camera: ${composition.camera}`,
    `- Layout: ${composition.layout}`,
    `- Color logic: ${composition.colorLogic}`,
    `- Label policy: ${composition.labelPolicy}`,
    "",
    "## QA Checklist",
    "",
    ...record.qaChecklist.map((item) => `- [ ] ${item}`),
    "",
    "## Provider-Agnostic Prompt",
    "",
    prompts.providerAgnostic,
    "",
  ].join("\n"));

  directed.push({
    id: record.id,
    title: record.title,
    type: record.figureType,
    status: record.status,
    artDirectionFile: path.relative(bookDir, recordJson).replaceAll("\\", "/"),
    promptPreview: prompts.providerAgnostic.slice(0, 500),
  });
}

const report = {
  schema: "booksmith.figure-art-director-index.v1",
  slug,
  generatedAt: new Date().toISOString(),
  count: directed.length,
  figures: directed,
};

writeJson(outJson, report);

fs.writeFileSync(outMd, [
  "# BookSmith Figure Art Director v1",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${report.generatedAt}`,
  `Figures directed: ${directed.length}`,
  "",
  "## Meaning",
  "",
  "Each figure now has a provider-agnostic art-direction record that can power a UI, prompt compiler, AI image generation, QA review, and human approval workflow.",
  "",
  "## Figures",
  "",
  ...directed.map((item) => [
    `### ${item.id} — ${item.title}`,
    "",
    `- Type: ${item.type}`,
    `- Status: ${item.status}`,
    `- File: \`${item.artDirectionFile}\``,
    "",
    `Prompt preview: ${item.promptPreview}`,
    "",
  ].join("\n")),
].join("\n"));

console.log(`Figure Art Director report written: ${path.relative(root, outMd)}`);
console.log(`Figures directed: ${directed.length}`);
