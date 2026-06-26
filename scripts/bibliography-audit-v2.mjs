import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const bookDir = path.join(root, "books", slug);
const exportLatexDir = path.join(bookDir, "exports", "latex");
const exportPdfDir = path.join(bookDir, "exports", "pdf");
const bibliographyDir = path.join(bookDir, "bibliography");

const outJson = path.join(exportPdfDir, "booksmith-bibliography-audit-v2.json");
const outMd = path.join(exportPdfDir, "booksmith-bibliography-audit-v2.md");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function rel(file) {
  return path.relative(root, file).replaceAll("\\", "/");
}

function collectCitationsFromTex() {
  const citations = [];

  for (const file of walk(exportLatexDir).filter((f) => f.endsWith(".tex"))) {
    const lines = read(file).split(/\r?\n/);

    lines.forEach((line, index) => {
      for (const match of line.matchAll(/\\(?:cite|parencite|textcite|autocite|footcite|citep|citet)\{([^}]+)\}/g)) {
        const keys = match[1]
          .split(",")
          .map((key) => key.trim())
          .filter(Boolean);

        for (const key of keys) {
          citations.push({
            key,
            file: rel(file),
            line: index + 1,
            raw: match[0],
          });
        }
      }
    });
  }

  return citations;
}

function collectBibEntries() {
  const entries = [];
  const duplicateKeys = new Map();

  for (const file of walk(bibliographyDir).filter((f) => f.endsWith(".bib"))) {
    const content = read(file);

    for (const match of content.matchAll(/@\w+\s*\{\s*([^,\s]+)\s*,/g)) {
      const key = match[1].trim();
      const item = {
        key,
        file: rel(file),
        index: match.index ?? 0,
      };

      entries.push(item);
      duplicateKeys.set(key, [...(duplicateKeys.get(key) || []), item]);
    }
  }

  return {
    entries,
    duplicates: [...duplicateKeys.entries()]
      .filter(([, items]) => items.length > 1)
      .map(([key, items]) => ({ key, entries: items })),
  };
}

const citations = collectCitationsFromTex();
const bib = collectBibEntries();

const bibKeySet = new Set(bib.entries.map((entry) => entry.key));
const citationKeySet = new Set(citations.map((citation) => citation.key));

const missing = [...citationKeySet]
  .filter((key) => !bibKeySet.has(key))
  .sort()
  .map((key) => ({
    key,
    occurrences: citations.filter((citation) => citation.key === key),
  }));

const unused = [...bibKeySet]
  .filter((key) => !citationKeySet.has(key))
  .sort()
  .map((key) => bib.entries.find((entry) => entry.key === key));

const result = {
  slug,
  generatedAt: new Date().toISOString(),
  status: missing.length === 0 && bib.duplicates.length === 0 ? "PASS" : "FAIL",
  counts: {
    citationOccurrences: citations.length,
    uniqueCitationKeys: citationKeySet.size,
    bibliographyEntries: bib.entries.length,
    missingCitationKeys: missing.length,
    duplicateBibKeys: bib.duplicates.length,
    unusedBibEntries: unused.length,
  },
  missing,
  duplicateBibKeys: bib.duplicates,
  unused,
};

fs.mkdirSync(exportPdfDir, { recursive: true });
fs.writeFileSync(outJson, JSON.stringify(result, null, 2) + "\n");

fs.writeFileSync(outMd, [
  "# BookSmith Bibliography Audit v2",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${result.generatedAt}`,
  `Status: **${result.status}**`,
  "",
  "## Counts",
  "",
  ...Object.entries(result.counts).map(([key, value]) => `- ${key}: ${value}`),
  "",
  "## Missing Citation Keys",
  "",
  missing.length
    ? missing.map((item) => [
        `### ${item.key}`,
        "",
        ...item.occurrences.map((occurrence) => `- \`${occurrence.file}:${occurrence.line}\` — \`${occurrence.raw}\``),
        "",
      ].join("\n")).join("\n")
    : "None.",
  "",
  "## Duplicate BibTeX Keys",
  "",
  bib.duplicates.length
    ? bib.duplicates.map((item) => [
        `### ${item.key}`,
        "",
        ...item.entries.map((entry) => `- \`${entry.file}\``),
        "",
      ].join("\n")).join("\n")
    : "None.",
  "",
  "## Unused Bibliography Entries",
  "",
  unused.length
    ? unused.map((entry) => `- \`${entry.key}\` — ${entry.file}`).join("\n")
    : "None.",
  "",
].join("\n"));

console.log(`Bibliography audit written: ${rel(outMd)}`);
console.log(`Status: ${result.status}`);
console.log(JSON.stringify(result.counts, null, 2));

if (result.status !== "PASS") process.exitCode = 2;
