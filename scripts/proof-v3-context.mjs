import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const exportDir = path.join(root, "books", slug, "exports", "latex");
const pdfDir = path.join(root, "books", slug, "exports", "pdf");
const mappedPath = path.join(pdfDir, "booksmith-diagnostic-source-map.json");
const outJson = path.join(pdfDir, "booksmith-proof-v3-context.json");
const outMd = path.join(pdfDir, "booksmith-proof-v3-context.md");

if (!fs.existsSync(mappedPath)) {
  console.error("Missing diagnostic source map. Run npm run phase1:source-mapped-proof first.");
  process.exit(1);
}

function readLines(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8").split(/\r?\n/) : [];
}

function classify(lines) {
  const text = lines.join("\n");

  if (/\\caption\{/.test(text)) return "caption";
  if (/\\begin\{(equation|align|aligned|multline|gather)/.test(text)) return "display-math";
  if (/\\begin\{(enumerate|itemize|description)/.test(text) || /\\item/.test(text)) return "list";
  if (/\\begin\{(tabular|tabularx|longtable)/.test(text)) return "table";
  if (/\\(url|href|path)\{/.test(text)) return "url-or-path";
  if (/\\section|\\subsection|\\chapter/.test(text)) return "heading";
  if (/\\ref\{|\\autoref\{|\\cref\{|\\cite/.test(text)) return "reference-or-citation";
  if (/[A-Za-z0-9_-]{24,}/.test(text)) return "long-token";
  return "paragraph-or-generated";
}

const mapped = JSON.parse(fs.readFileSync(mappedPath, "utf8"));
const contexts = [];

for (const item of mapped.overfull || []) {
  const source = item.mappedSource;
  if (!source) {
    contexts.push({ ...item, sourceContext: null, classification: "unknown" });
    continue;
  }

  const sourceFile = path.join(exportDir, source.sourceFile);
  const lines = readLines(sourceFile);
  const line = source.sourceLine;
  const start = Math.max(1, line - 15);
  const end = Math.min(lines.length, line + 15);
  const excerpt = lines.slice(start - 1, end);

  contexts.push({
    ...item,
    sourceContext: {
      file: source.sourceFile,
      line,
      start,
      end,
      excerpt,
    },
    classification: classify(excerpt),
  });
}

const result = {
  slug,
  generatedAt: new Date().toISOString(),
  diagnostics: contexts,
};

fs.writeFileSync(outJson, JSON.stringify(result, null, 2) + "\n");

fs.writeFileSync(outMd, [
  "# Booksmith Proof v3 Context Report",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${result.generatedAt}`,
  `Diagnostics: ${contexts.length}`,
  "",
  ...contexts.map((item, index) => [
    `## ${index + 1}. ${item.type || "overfull"} — ${item.amountPt}pt`,
    "",
    `- Classification: ${item.classification}`,
    item.sourceContext ? `- Source: \`${item.sourceContext.file}:${item.sourceContext.line}\`` : "- Source: unknown",
    `- Log: ${item.text || item.message}`,
    "",
    "```tex",
    item.sourceContext
      ? item.sourceContext.excerpt.map((line, offset) => {
          const n = item.sourceContext.start + offset;
          const marker = n === item.sourceContext.line ? ">>" : "  ";
          return `${marker} ${String(n).padStart(4, " ")} | ${line}`;
        }).join("\n")
      : "No source context.",
    "```",
    "",
  ].join("\n")),
].join("\n"));

console.log(`Proof v3 context written: ${path.relative(root, outMd)}`);
console.log(`Diagnostics: ${contexts.length}`);
