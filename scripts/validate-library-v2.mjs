import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const booksDir = path.join(root, "books");
const registryPath = path.join(booksDir, "registry.json");

let failures = 0;
const warnings = [];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function listBookConfigs() {
  if (!fs.existsSync(booksDir)) return [];

  return fs.readdirSync(booksDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(booksDir, entry.name, "book.config.json"))
    .filter((file) => fs.existsSync(file));
}

const registry = fs.existsSync(registryPath) ? readJson(registryPath) : { books: {} };
const registryBooks = registry.books || {};

const configBooks = {};

for (const configPath of listBookConfigs()) {
  const config = readJson(configPath);
  const slug = config.slug || path.basename(path.dirname(configPath));
  configBooks[slug] = { config, configPath };

  if (!registryBooks[slug]) {
    warnings.push(`${slug} exists as a book folder but is not listed in books/registry.json`);
  }
}

for (const [slug, entry] of Object.entries(configBooks)) {
  const related = Array.isArray(entry.config.relatedBooks) ? entry.config.relatedBooks : [];

  for (const relatedSlug of related) {
    const target = registryBooks[relatedSlug] || configBooks[relatedSlug]?.config;

    if (!target) {
      console.log(`FAIL: ${path.relative(root, entry.configPath)} references unknown related book: ${relatedSlug}`);
      failures++;
      continue;
    }

    const status = target.status || "draft";

    if (status === "planned") {
      console.log(`OK: ${slug} references planned book: ${relatedSlug}`);
    } else {
      console.log(`OK: ${slug} references known book: ${relatedSlug}`);
    }
  }
}

for (const warning of warnings) {
  console.log(`WARN: ${warning}`);
}

if (failures) {
  console.log(`Booksmith library validation failed with ${failures} error(s).`);
  process.exit(1);
}

console.log("Booksmith library validation passed.");
