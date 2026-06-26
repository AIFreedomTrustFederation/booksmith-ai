import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const exportDir = path.join(root, "books", slug, "exports", "latex");
const pdfDir = path.join(root, "books", slug, "exports", "pdf");

const diagnosticsPath = path.join(pdfDir, "booksmith-typography-diagnostics-v4.json");
const outJson = path.join(pdfDir, "booksmith-proof-context-inspector.json");
const outMd = path.join(pdfDir, "booksmith-proof-context-inspector.md");

if (!fs.existsSync(diagnosticsPath)) {
  console.error("Missing typography diagnostics v4.");
  process.exit(1);
}

function readLines(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8").split(/\r?\n/) : [];
}

function detectEnvironment(lines, currentIndex) {
  const before = lines.slice(0, currentIndex + 1).join("\n");
  const after = lines.slice(currentIndex).join("\n");

  function inside(env) {
    const begins = [...before.matchAll(new RegExp(`\\\\begin\\{${env}\\}`, "g"))].length;
    const ends = [...before.matchAll(new RegExp(`\\\\end\\{${env}\\}`, "g"))].length;
    return begins > ends;
  }

  const environments = [
    "figure", "table", "equation", "align", "multline",
    "enumerate", "itemize", "description", "quote"
  ];

  const active = environments.filter(inside);

  const nearby = lines.slice(Math.max(0, currentIndex - 8), currentIndex + 9).join("\n");

  return {
    active,
    insideFigure: active.includes("figure"),
    insideTable: active.includes("table"),
    insideEquation: active.some((x) => ["equation", "align", "multline"].includes(x)),
    insideList: active.some((x) => ["enumerate", "itemize", "description"].includes(x)),
    insideHeading: /\\(chapter|section|subsection|subsubsection)\{/.test(nearby),
    insideCaption: /\\caption(?:\[[^\]]*\])?\{/.test(nearby),
    hasUrl: /\\(url|href|path)\{/.test(nearby),
    hasCitation: /\\cite/.test(nearby),
    hasReference: /\\(ref|autoref|cref|pageref)\{/.test(nearby),
    nextEnd: after.match(/\\end\{([^}]+)\}/)?.[1] ?? null,
  };
}

function classify(env, originalClass) {
  if (env.insideEquation) return "equation";
  if (env.insideTable) return "table";
  if (env.insideFigure && env.insideCaption) return "figure-caption";
  if (env.insideFigure) return "figure";
  if (env.insideList) return "list";
  if (env.insideHeading) return "heading";
  if (env.hasUrl) return "url";
  if (env.hasCitation) return "citation";
  if (env.hasReference) return "reference";
  return originalClass || "paragraph";
}

const diagnostics = JSON.parse(fs.readFileSync(diagnosticsPath, "utf8"));

const inspected = diagnostics.overfull.map((item) => {
  const mapped = item.mappedSource;
  if (!mapped) return { ...item, inspected: null };

  const filePath = path.join(exportDir, mapped.sourceFile);
  const lines = readLines(filePath);
  const line = mapped.sourceLine;
  const index = Math.max(0, line - 1);

  const start = Math.max(1, line - 12);
  const end = Math.min(lines.length, line + 12);
  const excerpt = lines.slice(start - 1, end);

  const environment = detectEnvironment(lines, index);
  const refinedClass = classify(environment, item.classification?.class);

  return {
    ...item,
    refinedClass,
    inspected: {
      file: mapped.sourceFile,
      line,
      start,
      end,
      environment,
      excerpt,
    },
  };
});

const report = {
  slug,
  generatedAt: new Date().toISOString(),
  diagnostics: inspected,
};

fs.writeFileSync(outJson, JSON.stringify(report, null, 2) + "\n");

fs.writeFileSync(outMd, [
  "# Booksmith Proof Context Inspector",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${report.generatedAt}`,
  `Diagnostics: ${inspected.length}`,
  "",
  ...inspected.map((item, i) => [
    `## ${i + 1}. ${item.refinedClass}`,
    "",
    `- Amount: ${item.amountPt}pt`,
    `- Original class: ${item.classification?.class ?? "unknown"}`,
    `- Refined class: **${item.refinedClass}**`,
    item.inspected ? `- Source: \`${item.inspected.file}:${item.inspected.line}\`` : "- Source: unknown",
    "",
    "```tex",
    item.inspected
      ? item.inspected.excerpt.map((line, offset) => {
          const n = item.inspected.start + offset;
          const marker = n === item.inspected.line ? ">>" : "  ";
          return `${marker} ${String(n).padStart(4, " ")} | ${line}`;
        }).join("\n")
      : "No inspected source.",
    "```",
    "",
  ].join("\n")),
].join("\n"));

console.log(`Context inspector written: ${path.relative(root, outMd)}`);
