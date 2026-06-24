import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "library", "book-registry.json");
const requiredBookFields = ["slug", "title", "series", "status", "purpose"];
const requiredConfigFields = [
  "slug",
  "title",
  "series",
  "status",
  "version",
  "purpose",
  "publishingTargets",
  "provenanceRequired",
];
const expectedFolders = ["manuscript", "sources", "assets", "latex", "exports"];
const allowedStatuses = new Set(["seed", "active", "drafting", "review", "published", "archived"]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function warn(message) {
  console.warn(`WARN: ${message}`);
}

if (!exists("library/book-registry.json")) {
  fail("Missing library/book-registry.json");
  process.exit();
}

const registry = readJson(registryPath);

if (!Array.isArray(registry.books) || registry.books.length === 0) {
  fail("Registry must contain at least one book");
}

const slugs = new Set();

for (const book of registry.books) {
  for (const field of requiredBookFields) {
    if (!book[field]) fail(`Registry book is missing ${field}: ${JSON.stringify(book)}`);
  }

  if (slugs.has(book.slug)) fail(`Duplicate book slug: ${book.slug}`);
  slugs.add(book.slug);

  if (!allowedStatuses.has(book.status)) {
    fail(`Unsupported status for ${book.slug}: ${book.status}`);
  }

  const bookRoot = `books/${book.slug}`;
  const configPath = `${bookRoot}/book.config.json`;

  if (!exists(configPath)) {
    fail(`Missing ${configPath}`);
    continue;
  }

  const config = readJson(path.join(root, configPath));

  for (const field of requiredConfigFields) {
    if (config[field] === undefined || config[field] === "") {
      fail(`${configPath} missing ${field}`);
    }
  }

  if (config.slug !== book.slug) fail(`${configPath} slug does not match registry`);
  if (config.title !== book.title) fail(`${configPath} title does not match registry`);
  if (config.series !== book.series) fail(`${configPath} series does not match registry`);
  if (config.status !== book.status) fail(`${configPath} status does not match registry`);
  if (!Array.isArray(config.publishingTargets) || config.publishingTargets.length === 0) {
    fail(`${configPath} must define publishingTargets`);
  }
  if (config.provenanceRequired !== true) {
    fail(`${configPath} must set provenanceRequired true`);
  }

  for (const folder of expectedFolders) {
    if (!exists(`${bookRoot}/${folder}`)) {
      warn(`${bookRoot}/${folder} does not exist yet; create it before active production.`);
    }
  }
}

if (process.exitCode) {
  console.error("Booksmith library validation failed.");
  process.exit(process.exitCode);
}

console.log(`Booksmith library validation passed: ${registry.books.length} books checked.`);
