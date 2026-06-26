import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const exportDir = path.join(root, "books", slug, "exports", "latex");
const pdfDir = path.join(root, "books", slug, "exports", "pdf");

const contextPath = path.join(pdfDir, "booksmith-proof-context-inspector.json");
const outJson = path.join(pdfDir, "booksmith-proof-semantic-context-v4.json");
const outMd = path.join(pdfDir, "booksmith-proof-semantic-context-v4.md");

if (!fs.existsSync(contextPath)) {
  console.error("Missing context inspector report.");
  process.exit(1);
}

function readLines(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8").split(/\r?\n/) : [];
}

function nearestHeading(lines, lineNumber) {
  let current = null;

  for (let i = 0; i < Math.min(lines.length, lineNumber); i++) {
    const match = lines[i].match(/\\(chapter|section|subsection|subsubsection)\{([^}]+)\}/);
    if (match) {
      current = {
        command: match[1],
        title: match[2],
        line: i + 1,
      };
    }
  }

  return current;
}

function paragraphBounds(lines, lineNumber) {
  const index = Math.max(0, lineNumber - 1);

  let start = index;
  while (start > 0 && lines[start - 1].trim() !== "") start--;

  let end = index;
  while (end < lines.length - 1 && lines[end + 1].trim() !== "") end++;

  return { start: start + 1, end: end + 1 };
}

function paragraphIndexAfterHeading(lines, headingLine, paragraphStart) {
  if (!headingLine) return null;

  let count = 0;
  let inParagraph = false;

  for (let i = headingLine; i < paragraphStart; i++) {
    const text = lines[i]?.trim() ?? "";

    if (!text) {
      inParagraph = false;
      continue;
    }

    if (text.startsWith("\\")) continue;

    if (!inParagraph) {
      count++;
      inParagraph = true;
    }
  }

  return count + 1;
}

function sentenceIndexInParagraph(paragraphText, targetLineText) {
  const sentences = paragraphText
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const target = targetLineText.trim();
  const found = sentences.findIndex((sentence) => sentence.includes(target) || target.includes(sentence));

  return found >= 0 ? found + 1 : null;
}

function refineClass(lines, lineNumber, originalClass) {
  const index = Math.max(0, lineNumber - 1);
  const current = lines[index]?.trim() ?? "";
  const prevNonEmptyIndex = (() => {
    for (let i = index - 1; i >= 0; i--) {
      if (lines[i].trim()) return i;
    }
    return -1;
  })();

  const prevNonEmpty = prevNonEmptyIndex >= 0 ? lines[prevNonEmptyIndex].trim() : "";

  if (/\\(chapter|section|subsection|subsubsection)\{/.test(current)) return "heading";
  if (/\\(chapter|section|subsection|subsubsection)\{/.test(prevNonEmpty) && current && !current.startsWith("\\")) {
    return "heading-following-paragraph";
  }

  const window = lines.slice(Math.max(0, index - 8), Math.min(lines.length, index + 9)).join("\n");

  if (/\\caption(?:\[[^\]]*\])?\{/.test(window)) return "caption";
  if (/\\FHQCMFigurePlaceholder/.test(window)) return "figure-placeholder";
  if (/\\begin\{(equation|align|multline|gather|aligned)/.test(window)) return "equation";
  if (/\\begin\{(tabular|tabularx|longtable)/.test(window)) return "table";
  if (/\\begin\{(enumerate|itemize|description)/.test(window) || /\\item/.test(window)) return "list";
  if (/\\(url|href|path)\{/.test(window)) return "url";
  if (/\\cite/.test(window)) return "citation";
  if (/\\(ref|autoref|cref|pageref)\{/.test(window)) return "reference";

  return originalClass === "heading" ? "heading-following-paragraph" : originalClass || "paragraph";
}

const context = JSON.parse(fs.readFileSync(contextPath, "utf8"));

const semanticDiagnostics = context.diagnostics.map((item) => {
  const inspected = item.inspected;

  if (!inspected) {
    return {
      ...item,
      semanticClass: "unknown",
      anchor: null,
    };
  }

  const filePath = path.join(exportDir, inspected.file);
  const lines = readLines(filePath);
  const heading = nearestHeading(lines, inspected.line);
  const bounds = paragraphBounds(lines, inspected.line);
  const paragraphText = lines.slice(bounds.start - 1, bounds.end).join(" ").replace(/\s+/g, " ").trim();
  const semanticClass = refineClass(lines, inspected.line, item.refinedClass);
  const paragraphIndex = paragraphIndexAfterHeading(lines, heading?.line ?? null, bounds.start);
  const sentenceIndex = sentenceIndexInParagraph(paragraphText, lines[inspected.line - 1] ?? "");

  return {
    ...item,
    semanticClass,
    anchor: {
      heading,
      paragraph: {
        startLine: bounds.start,
        endLine: bounds.end,
        indexAfterHeading: paragraphIndex,
        text: paragraphText,
      },
      sentenceIndex,
    },
  };
});

const report = {
  slug,
  generatedAt: new Date().toISOString(),
  diagnostics: semanticDiagnostics,
};

fs.writeFileSync(outJson, JSON.stringify(report, null, 2) + "\n");

fs.writeFileSync(outMd, [
  "# Booksmith Proof Semantic Context v4",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${report.generatedAt}`,
  `Diagnostics: ${semanticDiagnostics.length}`,
  "",
  ...semanticDiagnostics.map((item, index) => [
    `## ${index + 1}. ${item.semanticClass}`,
    "",
    `- Amount: ${item.amountPt}pt`,
    `- Refined class: ${item.refinedClass}`,
    `- Semantic class: **${item.semanticClass}**`,
    item.inspected ? `- Source: \`${item.inspected.file}:${item.inspected.line}\`` : "- Source: unknown",
    item.anchor?.heading ? `- Anchor heading: ${item.anchor.heading.command} "${item.anchor.heading.title}" at line ${item.anchor.heading.line}` : "- Anchor heading: none",
    item.anchor?.paragraph ? `- Paragraph: ${item.anchor.paragraph.indexAfterHeading ?? "unknown"} after heading, lines ${item.anchor.paragraph.startLine}-${item.anchor.paragraph.endLine}` : "- Paragraph: none",
    item.anchor?.sentenceIndex ? `- Sentence: ${item.anchor.sentenceIndex}` : "- Sentence: unknown",
    "",
    "### Paragraph Text",
    "",
    item.anchor?.paragraph?.text ?? "None.",
    "",
  ].join("\n")),
].join("\n"));

console.log(`Semantic context written: ${path.relative(root, outMd)}`);
