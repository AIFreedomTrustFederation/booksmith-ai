import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "library", "book-registry.json");
const requiredRegistryFields = ["libraryId", "title", "description", "defaultImprint", "preparedWith", "version", "books"];
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
const allowedPublishingTargets = new Set([
  "markdown",
  "latex",
  "pdf",
  "epub",
  "web",
  "docx",
  "print",
  "publishing-packet",
]);

const errors = [];
const warnings = [];

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`Invalid JSON at ${path.relative(root, filePath)}: ${error.message}`);
    return null;
  }
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function requireFields(record, fields, context) {
  for (const field of fields) {
    if (record?.[field] === undefined || record?.[field] === "") {
      fail(`${context} missing ${field}`);
    }
  }
}

if (!exists("library/book-registry.json")) {
  fail("Missing library/book-registry.json");
} else {
  const registry = readJson(registryPath);

  if (registry) {
    requireFields(registry, requiredRegistryFields, "library/book-registry.json");

    if (!Array.isArray(registry.books) || registry.books.length === 0) {
      fail("Registry must contain at least one book");
    }

    const slugs = new Set();

    for (const book of registry.books || []) {
      if (!isPlainObject(book)) {
        fail(`Registry book must be an object: ${JSON.stringify(book)}`);
        continue;
      }

      requireFields(book, requiredBookFields, `Registry book ${book.slug || "<unknown>"}`);

      if (!book.slug) continue;

      if (slugs.has(book.slug)) fail(`Duplicate book slug: ${book.slug}`);
      slugs.add(book.slug);

      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(book.slug)) {
        fail(`Book slug must be lowercase kebab-case: ${book.slug}`);
      }

      if (!allowedStatuses.has(book.status)) {
        fail(`Unsupported status for ${book.slug}: ${book.status}`);
      }

      const bookRoot = `books/${book.slug}`;
      const configPath = `${bookRoot}/book.config.json`;

      if (!exists(bookRoot)) {
        fail(`Missing book directory: ${bookRoot}`);
        continue;
      }

      if (!exists(configPath)) {
        fail(`Missing ${configPath}`);
        continue;
      }

      const config = readJson(path.join(root, configPath));
      if (!config) continue;

      if (!isPlainObject(config)) {
        fail(`${configPath} must be a JSON object`);
        continue;
      }

      requireFields(config, requiredConfigFields, configPath);

      if (config.slug !== book.slug) fail(`${configPath} slug does not match registry`);
      if (config.title !== book.title) fail(`${configPath} title does not match registry`);
      if (config.series !== book.series) fail(`${configPath} series does not match registry`);
      if (config.status !== book.status) fail(`${configPath} status does not match registry`);

      if (!allowedStatuses.has(config.status)) {
        fail(`${configPath} has unsupported status: ${config.status}`);
      }

      if (!Array.isArray(config.publishingTargets) || config.publishingTargets.length === 0) {
        fail(`${configPath} must define publishingTargets`);
      } else {
        for (const target of config.publishingTargets) {
          if (!allowedPublishingTargets.has(target)) {
            fail(`${configPath} has unsupported publishing target: ${target}`);
          }
        }
      }

      if (config.provenanceRequired !== true) {
        fail(`${configPath} must set provenanceRequired true`);
      }

      for (const optionalArrayField of ["relatedBooks", "canonicalTerms"]) {
        if (config[optionalArrayField] !== undefined && !Array.isArray(config[optionalArrayField])) {
          fail(`${configPath} ${optionalArrayField} must be an array when present`);
        }
      }

      for (const relatedSlug of config.relatedBooks || []) {
        if (!slugs.has(relatedSlug)) {
          fail(`${configPath} references unknown related book: ${relatedSlug}`);
        }
      }

      for (const folder of expectedFolders) {
        if (!exists(`${bookRoot}/${folder}`)) {
          warn(`${bookRoot}/${folder} does not exist yet; create it before active production.`);
        }
      }
    }

    if (exists("library/source-registry.json")) {
      const sourceRegistry = readJson(path.join(root, "library", "source-registry.json"));
      if (sourceRegistry) {
        if (!Array.isArray(sourceRegistry.sources)) fail("source-registry.json must contain sources array");
        const sourceIds = new Set();

        for (const source of sourceRegistry.sources || []) {
          requireFields(source, ["sourceId", "bookSlug", "sourceType", "location", "rightsStatus", "status"], "Source record");
          if (!source.sourceId) continue;
          if (sourceIds.has(source.sourceId)) fail(`Duplicate sourceId: ${source.sourceId}`);
          sourceIds.add(source.sourceId);
          if (!slugs.has(source.bookSlug)) fail(`Source references unknown bookSlug: ${source.bookSlug}`);
          if (source.status === "connected" && !exists(source.location)) {
            fail(`Connected source location does not exist: ${source.location}`);
          }
        }
      }
    } else {
      warn("Missing library/source-registry.json");
    }

    if (exists("library/citation-registry.json")) {
      const citationRegistry = readJson(path.join(root, "library", "citation-registry.json"));
      if (citationRegistry) {
        if (!Array.isArray(citationRegistry.citationSets)) fail("citation-registry.json must contain citationSets array");
        const citationSetIds = new Set();

        for (const set of citationRegistry.citationSets || []) {
          requireFields(set, ["id", "path", "domain", "status"], "Citation set");
          if (!set.id) continue;
          if (citationSetIds.has(set.id)) fail(`Duplicate citation set id: ${set.id}`);
          citationSetIds.add(set.id);
          if (!exists(set.path)) fail(`Citation set path does not exist: ${set.path}`);
        }
      }
    } else {
      warn("Missing library/citation-registry.json");
    }
  }
}

for (const message of warnings) {
  console.warn(`WARN: ${message}`);
}

if (errors.length > 0) {
  for (const message of errors) {
    console.error(`FAIL: ${message}`);
  }
  console.error(`Booksmith library validation failed with ${errors.length} error(s).`);
  process.exit(1);
}

console.log(`Booksmith library validation passed${warnings.length ? ` with ${warnings.length} warning(s)` : ""}.`);
