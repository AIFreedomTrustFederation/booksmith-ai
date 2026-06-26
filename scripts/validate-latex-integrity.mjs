import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "fhqcm";
const root = process.cwd();
const exportDir = path.join(root, "books", slug, "exports", "latex");
const reportMd = path.join(exportDir, "booksmith-integrity-report.md");
const reportJson = path.join(exportDir, "booksmith-integrity-report.json");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function normalize(value) {
  return value.replaceAll("\\", "/").replace(/^\.\//, "");
}

function withTexExt(value) {
  return path.extname(value) ? value : `${value}.tex`;
}

function shouldSkipReference(kind, raw) {
  if (!raw) return true;

  const value = raw.trim();

  if (!value) return true;

  // Ignore LaTeX macro parameters/placeholders such as #1, #2, \foo, /Root/#2.
  if (value.includes("#")) return true;
  if (value.includes("\\\\")) return true;
  if (value.includes("ImageRoot")) return true;
  if (value.includes("GraphicRoot")) return true;
  if (value.includes("graphicsRoot")) return true;

  // Absolute or generated macro paths should not be treated as concrete files.
  if (kind === "includegraphics" && value.startsWith("/")) return true;

  return false;
}

const texFiles = walk(exportDir).filter((file) => file.endsWith(".tex"));
const refs = [];

for (const file of texFiles) {
  const content = fs.readFileSync(file, "utf8");
  const relFile = path.relative(exportDir, file).replaceAll("\\", "/");
  const dir = path.dirname(file);

  const commands = [
    { kind: "input", regex: /\\input\{([^}]+)\}/g, ext: true },
    { kind: "include", regex: /\\include\{([^}]+)\}/g, ext: true },
    { kind: "includegraphics", regex: /\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}/g, ext: false },
  ];

  for (const command of commands) {
    for (const match of content.matchAll(command.regex)) {
      const raw = normalize(match[1].trim());
      if (shouldSkipReference(command.kind, raw)) continue;
      const candidate = command.ext ? withTexExt(raw) : raw;
      const absolute = path.resolve(dir, candidate);
      refs.push({
        file: relFile,
        kind: command.kind,
        raw,
        resolved: path.relative(exportDir, absolute).replaceAll("\\", "/"),
        exists: fs.existsSync(absolute),
      });
    }
  }

  for (const match of content.matchAll(/\\bibliography\{([^}]+)\}/g)) {
    const rawList = match[1].split(",").map((item) => normalize(item.trim())).filter(Boolean);
    for (const raw of rawList) {
      if (shouldSkipReference("bibliography", raw)) continue;
      const candidate = raw.endsWith(".bib") ? raw : `${raw}.bib`;
      const absolute = path.resolve(dir, candidate);
      refs.push({
        file: relFile,
        kind: "bibliography",
        raw,
        resolved: path.relative(exportDir, absolute).replaceAll("\\", "/"),
        exists: fs.existsSync(absolute),
      });
    }
  }
}

const missing = refs.filter((ref) => !ref.exists);

const result = {
  slug,
  generatedAt: new Date().toISOString(),
  exportDir: path.relative(root, exportDir),
  texFiles: texFiles.length,
  references: refs.length,
  missingReferences: missing.length,
  status: missing.length ? "FAIL" : "PASS",
  missing,
  references: refs,
};

const md = [
  "# Booksmith LaTeX Integrity Report",
  "",
  `Book slug: \`${slug}\``,
  `Generated: ${result.generatedAt}`,
  `Status: **${result.status}**`,
  `TeX files scanned: ${result.texFiles}`,
  `References checked: ${result.references}`,
  `Missing references: ${result.missingReferences}`,
  "",
  "## Missing References",
  "",
  missing.length
    ? missing.map((ref) => `- ${ref.file}: ${ref.kind} \`${ref.raw}\` -> \`${ref.resolved}\``).join("\n")
    : "None.",
  "",
].join("\n");

fs.writeFileSync(reportJson, JSON.stringify(result, null, 2) + "\n");
fs.writeFileSync(reportMd, md);

console.log(`Integrity report written: ${path.relative(root, reportMd)}`);
console.log(`Status: ${result.status}`);
console.log(`Missing references: ${missing.length}`);

if (missing.length) process.exit(2);
