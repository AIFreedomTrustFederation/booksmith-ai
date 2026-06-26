import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const pdfDir = path.join(root, "books", slug, "exports", "pdf");
const latexDir = path.join(root, "books", slug, "exports", "latex");

const logPath = path.join(pdfDir, "main.log");
const tocPath = path.join(pdfDir, "main.toc");
const outPath = path.join(pdfDir, "main.out");
const auxPath = path.join(pdfDir, "main.aux");
const bblPath = path.join(pdfDir, "main.bbl");

const mappedPath = path.join(pdfDir, "booksmith-diagnostic-source-map.json");
const outJson = path.join(pdfDir, "booksmith-typography-diagnostics-v4.json");
const outMd = path.join(pdfDir, "booksmith-typography-diagnostics-v4.md");

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function lines(file) {
  return read(file).split(/\r?\n/);
}

function parseOverfull(log) {
  const result = [];
  const logLines = log.split(/\r?\n/);

  for (let i = 0; i < logLines.length; i++) {
    const line = logLines[i];
    const match = line.match(/Overfull \\hbox \(([\d.]+)pt too wide\).*?lines? ([\d-]+)/);
    if (!match) continue;

    result.push({
      id: `overfull-${result.length + 1}`,
      amountPt: Number(match[1]),
      logLine: i + 1,
      emittedLineRange: match[2],
      message: line.trim(),
      context: [logLines[i + 1], logLines[i + 2], logLines[i + 3]].filter(Boolean).join(" ").replace(/\s+/g, " ").trim(),
    });
  }

  return result;
}

function parseTocEntries(toc) {
  return toc.split(/\r?\n/)
    .map((line, index) => ({ line: index + 1, text: line }))
    .filter((item) => item.text.trim());
}

function parseOutEntries(out) {
  return out.split(/\r?\n/)
    .map((line, index) => ({ line: index + 1, text: line }))
    .filter((item) => item.text.trim());
}

function parseAuxLabels(aux) {
  const labels = [];
  for (const match of aux.matchAll(/\\newlabel\{([^}]+)\}/g)) {
    labels.push({ label: match[1], index: match.index ?? 0 });
  }
  return labels;
}

function classifyDiagnostic(diagnostic, mapped, artifactData) {
  const ctx = diagnostic.context || "";
  const mappedSource = mapped?.mappedSource;

  if (/\\contentsline|numberline/.test(ctx)) {
    return {
      class: "toc-entry",
      confidence: 0.92,
      reason: "Log context contains TOC-style contentsline/numberline data.",
    };
  }

  if (/BOOKMARK|Hy@writebookmark|\\BOOKMARK/.test(ctx)) {
    return {
      class: "pdf-bookmark",
      confidence: 0.92,
      reason: "Log context looks like hyperref bookmark output.",
    };
  }

  if (/\\TU\/.*?\s+\d+\.\d+\s+\[\]/.test(ctx)) {
    return {
      class: "generated-object",
      confidence: 0.85,
      reason: "Context contains only a numbered generated object and no manuscript text.",
    };
  }

  if (mappedSource?.sourceFile) {
    const sourcePath = path.join(latexDir, mappedSource.sourceFile);
    const sourceLines = lines(sourcePath);
    const n = mappedSource.sourceLine;
    const excerpt = sourceLines.slice(Math.max(0, n - 6), Math.min(sourceLines.length, n + 6)).join("\n");

    if (/\\section|\\subsection|\\chapter/.test(excerpt)) {
      return {
        class: "section-heading",
        confidence: 0.75,
        reason: "Mapped source region contains a heading command.",
      };
    }

    if (/\\caption/.test(excerpt)) {
      return {
        class: "caption",
        confidence: 0.75,
        reason: "Mapped source region contains a caption command.",
      };
    }

    if (/\\begin\{(equation|align|multline|gather|aligned)/.test(excerpt)) {
      return {
        class: "math-display",
        confidence: 0.75,
        reason: "Mapped source region contains display math.",
      };
    }

    if (/\\cite|\\bibliography|\\printbibliography/.test(excerpt)) {
      return {
        class: "citation-or-bibliography",
        confidence: 0.7,
        reason: "Mapped source region contains citation or bibliography commands.",
      };
    }

    return {
      class: "source-paragraph",
      confidence: 0.55,
      reason: "Mapped source exists but no more specific artifact type matched.",
    };
  }

  return {
    class: "unknown",
    confidence: 0.1,
    reason: "No source or artifact classifier matched.",
  };
}

const log = read(logPath);
const mapped = fs.existsSync(mappedPath) ? JSON.parse(read(mappedPath)) : { overfull: [] };

const artifactData = {
  tocEntries: parseTocEntries(read(tocPath)),
  outEntries: parseOutEntries(read(outPath)),
  auxLabels: parseAuxLabels(read(auxPath)),
  hasBbl: fs.existsSync(bblPath),
};

const overfull = parseOverfull(log).map((diag, index) => {
  const mappedDiag = mapped.overfull?.[index] || null;
  const classification = classifyDiagnostic(diag, mappedDiag, artifactData);

  return {
    ...diag,
    mappedSource: mappedDiag?.mappedSource ?? null,
    classification,
  };
});

const report = {
  slug,
  generatedAt: new Date().toISOString(),
  artifactPresence: {
    log: fs.existsSync(logPath),
    aux: fs.existsSync(auxPath),
    toc: fs.existsSync(tocPath),
    out: fs.existsSync(outPath),
    bbl: fs.existsSync(bblPath),
  },
  artifactCounts: {
    tocEntries: artifactData.tocEntries.length,
    outEntries: artifactData.outEntries.length,
    auxLabels: artifactData.auxLabels.length,
    overfull: overfull.length,
  },
  overfull,
};

fs.writeFileSync(outJson, JSON.stringify(report, null, 2) + "\n");

fs.writeFileSync(outMd, [
  "# Booksmith Typography Diagnostics v4",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${report.generatedAt}`,
  "",
  "## Artifact Presence",
  "",
  ...Object.entries(report.artifactPresence).map(([key, value]) => `- ${key}: ${value ? "yes" : "no"}`),
  "",
  "## Counts",
  "",
  ...Object.entries(report.artifactCounts).map(([key, value]) => `- ${key}: ${value}`),
  "",
  "## Overfull Classification",
  "",
  ...overfull.map((item) => [
    `### ${item.id}`,
    "",
    `- Amount: ${item.amountPt}pt`,
    `- Class: **${item.classification.class}**`,
    `- Confidence: ${Math.round(item.classification.confidence * 100)}%`,
    `- Reason: ${item.classification.reason}`,
    item.mappedSource ? `- Mapped source: \`${item.mappedSource.sourceFile}:${item.mappedSource.sourceLine}\`` : "- Mapped source: unknown",
    `- Context: ${item.context || "none"}`,
    "",
  ].join("\n")),
].join("\n"));

console.log(`Typography diagnostics v4 written: ${path.relative(root, outMd)}`);
console.log(`Overfull: ${overfull.length}`);
