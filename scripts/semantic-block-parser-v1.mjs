import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const exportDir = path.join(root, "books", slug, "exports", "latex");
const pdfDir = path.join(root, "books", slug, "exports", "pdf");

const contextPath = path.join(pdfDir, "booksmith-proof-semantic-context-v4.json");
const outJson = path.join(pdfDir, "booksmith-semantic-blocks-v1.json");
const outMd = path.join(pdfDir, "booksmith-semantic-blocks-v1.md");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function rel(file) {
  return path.relative(exportDir, file).replaceAll("\\", "/");
}

function classifyLine(line) {
  const text = line.trim();

  if (!text) return "blank";
  if (/^%/.test(text)) return "comment";
  if (/^\\chapter\{/.test(text)) return "chapter";
  if (/^\\section\{/.test(text)) return "section";
  if (/^\\subsection\{/.test(text)) return "subsection";
  if (/^\\subsubsection\{/.test(text)) return "subsubsection";
  if (/^\\FHQCMFigurePlaceholder\{/.test(text)) return "figure-placeholder";
  if (/^\\caption/.test(text)) return "caption";
  if (/^\\begin\{figure\}/.test(text)) return "figure";
  if (/^\\begin\{table\}/.test(text)) return "table";
  if (/^\\begin\{(equation|align|multline|gather|aligned)\}/.test(text)) return "equation";
  if (/^\\begin\{(itemize|enumerate|description)\}/.test(text)) return "list";
  if (/^\\begin\{quote\}/.test(text)) return "quote";
  if (/^\\end\{/.test(text)) return "environment-end";
  if (/^\\/.test(text)) return "command";
  return "paragraph";
}

function headingTitle(line) {
  const match = line.match(/^\\(chapter|section|subsection|subsubsection)\{([^}]+)\}/);
  return match ? match[2] : null;
}

function parseFile(file) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const blocks = [];
  let currentParagraph = null;
  let currentHeading = null;

  function closeParagraph(endLine) {
    if (!currentParagraph) return;
    currentParagraph.endLine = endLine;
    currentParagraph.text = currentParagraph.lines.join(" ").replace(/\s+/g, " ").trim();
    blocks.push(currentParagraph);
    currentParagraph = null;
  }

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const kind = classifyLine(line);

    if (kind === "paragraph") {
      if (!currentParagraph) {
        currentParagraph = {
          id: `${rel(file)}:${lineNumber}:paragraph`,
          type: "paragraph",
          file: rel(file),
          startLine: lineNumber,
          endLine: lineNumber,
          parentHeading: currentHeading,
          lines: [],
          text: "",
        };
      }

      currentParagraph.lines.push(line.trim());
      currentParagraph.endLine = lineNumber;
      return;
    }

    closeParagraph(lineNumber - 1);

    if (["chapter", "section", "subsection", "subsubsection"].includes(kind)) {
      currentHeading = {
        type: kind,
        title: headingTitle(line),
        line: lineNumber,
      };
    }

    if (!["blank", "comment"].includes(kind)) {
      blocks.push({
        id: `${rel(file)}:${lineNumber}:${kind}`,
        type: kind,
        file: rel(file),
        startLine: lineNumber,
        endLine: lineNumber,
        parentHeading: currentHeading,
        text: line.trim(),
      });
    }
  });

  closeParagraph(lines.length);

  return blocks;
}

const texFiles = walk(exportDir).filter((file) => file.endsWith(".tex"));
const blocks = texFiles.flatMap(parseFile);

const semanticContext = fs.existsSync(contextPath)
  ? JSON.parse(fs.readFileSync(contextPath, "utf8"))
  : { diagnostics: [] };

function blockForDiagnostic(diagnostic) {
  const inspected = diagnostic.inspected;
  if (!inspected) return null;

  const candidates = blocks
    .filter((block) => block.file === inspected.file)
    .filter((block) => block.startLine <= inspected.line && block.endLine >= inspected.line);

  if (candidates.length) {
    return candidates.sort((a, b) => (a.endLine - a.startLine) - (b.endLine - b.startLine))[0];
  }

  const nearby = blocks
    .filter((block) => block.file === inspected.file)
    .map((block) => ({
      block,
      distance: Math.min(
        Math.abs(block.startLine - inspected.line),
        Math.abs(block.endLine - inspected.line),
      ),
    }))
    .sort((a, b) => a.distance - b.distance)[0];

  return nearby?.distance <= 2 ? nearby.block : null;
}

const diagnosticBlocks = semanticContext.diagnostics.map((diagnostic, index) => ({
  diagnosticIndex: index + 1,
  amountPt: diagnostic.amountPt,
  semanticClass: diagnostic.semanticClass,
  source: diagnostic.inspected ? `${diagnostic.inspected.file}:${diagnostic.inspected.line}` : null,
  block: blockForDiagnostic(diagnostic),
}));

const report = {
  slug,
  generatedAt: new Date().toISOString(),
  files: texFiles.map(rel),
  blockCount: blocks.length,
  blocks,
  diagnosticBlocks,
};

fs.writeFileSync(outJson, JSON.stringify(report, null, 2) + "\n");

fs.writeFileSync(outMd, [
  "# Booksmith Semantic Blocks v1",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${report.generatedAt}`,
  `Files: ${texFiles.length}`,
  `Blocks: ${blocks.length}`,
  "",
  "## Diagnostic Block Mapping",
  "",
  ...diagnosticBlocks.map((item) => [
    `### Diagnostic ${item.diagnosticIndex}`,
    "",
    `- Amount: ${item.amountPt}pt`,
    `- Prior semantic class: ${item.semanticClass}`,
    `- Source: ${item.source ?? "unknown"}`,
    item.block
      ? `- Block: **${item.block.type}** \`${item.block.file}:${item.block.startLine}-${item.block.endLine}\``
      : "- Block: unknown",
    item.block?.parentHeading
      ? `- Parent heading: ${item.block.parentHeading.type} "${item.block.parentHeading.title}"`
      : "- Parent heading: none",
    item.block?.text ? `- Text: ${item.block.text}` : "",
    "",
  ].join("\n")),
  "",
  "## Block Counts",
  "",
  ...Object.entries(blocks.reduce((acc, block) => {
    acc[block.type] = (acc[block.type] || 0) + 1;
    return acc;
  }, {})).sort().map(([type, count]) => `- ${type}: ${count}`),
  "",
].join("\n"));

console.log(`Semantic block report written: ${path.relative(root, outMd)}`);
console.log(`Blocks: ${blocks.length}`);
console.log(`Diagnostic mappings: ${diagnosticBlocks.length}`);
