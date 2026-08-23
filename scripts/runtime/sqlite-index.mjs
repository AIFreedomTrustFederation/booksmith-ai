import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const stateDir = path.join(root, ".booksmith");
const dbPath = path.join(stateDir, "booksmith.db");

function safeJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  const output = [];
  const stack = [directory];
  while (stack.length) {
    const current = stack.pop();
    if (!current) continue;
    const stat = fs.statSync(current);
    if (stat.isFile()) {
      output.push(current);
      continue;
    }
    for (const name of fs.readdirSync(current)) stack.push(path.join(current, name));
  }
  return output.sort();
}

function readableSource(file) {
  return /\.(md|mdx|txt|tex|json|bib|yaml|yml)$/i.test(file);
}

function stripForSearch(file, raw) {
  if (file.endsWith(".json")) {
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return raw;
    }
  }
  return raw;
}

function titleFor(file, body) {
  const heading = body.match(/^#{1,3}\s+(.+)$/m)?.[1]?.trim();
  return heading || path.basename(file, path.extname(file)).replaceAll("-", " ");
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function openDatabase() {
  const sqlite = await import("node:sqlite");
  fs.mkdirSync(stateDir, { recursive: true });
  const db = new sqlite.DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      book_slug TEXT NOT NULL,
      kind TEXT NOT NULL,
      path TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      sha256 TEXT NOT NULL,
      mtime_ms INTEGER NOT NULL
    );
    CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
      id UNINDEXED,
      book_slug UNINDEXED,
      kind UNINDEXED,
      path UNINDEXED,
      title,
      body
    );
    CREATE TABLE IF NOT EXISTS entities (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      label TEXT NOT NULL,
      domain TEXT,
      payload_json TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS edges (
      source_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      relation TEXT NOT NULL,
      book_slug TEXT,
      PRIMARY KEY (source_id, target_id, relation, book_slug)
    );
    CREATE INDEX IF NOT EXISTS idx_documents_book ON documents(book_slug);
    CREATE INDEX IF NOT EXISTS idx_edges_book ON edges(book_slug);
  `);
  return db;
}

function classify(relative) {
  const normalized = relative.replaceAll("\\", "/");
  if (normalized.includes("/manuscript/")) return "manuscript";
  if (normalized.includes("/sources/")) return "source";
  if (normalized.includes("/bibliography/")) return "bibliography";
  if (normalized.includes("/canon/")) return "canon";
  if (normalized.includes("/notes/")) return "note";
  if (normalized.includes("/writing/")) return "writing-plan";
  if (normalized.includes("/publishing/")) return "publishing";
  return "book-file";
}

export async function rebuildBooksmithIndex() {
  const db = await openDatabase();
  const registry = safeJson(path.join(root, "library", "book-registry.json"), { books: [] });
  const concepts = safeJson(path.join(root, "library", "concept-registry.json"), { concepts: [] });
  const thinkers = safeJson(path.join(root, "library", "thinker-registry.json"), { thinkers: [] });
  const references = safeJson(path.join(root, "library", "reference-registry.json"), { references: [] });

  db.exec("BEGIN IMMEDIATE");
  try {
    db.exec("DELETE FROM documents; DELETE FROM documents_fts; DELETE FROM entities; DELETE FROM edges;");
    const insertDocument = db.prepare("INSERT INTO documents (id, book_slug, kind, path, title, body, sha256, mtime_ms) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    const insertFts = db.prepare("INSERT INTO documents_fts (id, book_slug, kind, path, title, body) VALUES (?, ?, ?, ?, ?, ?)");
    const insertEntity = db.prepare("INSERT OR REPLACE INTO entities (id, kind, label, domain, payload_json) VALUES (?, ?, ?, ?, ?)");
    const insertEdge = db.prepare("INSERT OR IGNORE INTO edges (source_id, target_id, relation, book_slug) VALUES (?, ?, ?, ?)");

    let documentCount = 0;
    for (const book of registry.books ?? []) {
      insertEntity.run(`book:${book.slug}`, "book", book.title, book.series ?? null, JSON.stringify(book));
      const directory = path.join(root, "books", book.slug);
      for (const file of walk(directory).filter(readableSource)) {
        const relative = path.relative(root, file).replaceAll("\\", "/");
        const raw = fs.readFileSync(file, "utf8");
        const body = stripForSearch(file, raw);
        const stat = fs.statSync(file);
        const id = `doc:${relative}`;
        const kind = classify(relative);
        const title = titleFor(file, body);
        insertDocument.run(id, book.slug, kind, relative, title, body, hash(raw), Math.round(stat.mtimeMs));
        insertFts.run(id, book.slug, kind, relative, title, body);
        insertEdge.run(`book:${book.slug}`, id, "contains", book.slug);
        documentCount += 1;
      }
    }

    for (const concept of concepts.concepts ?? []) {
      const id = `concept:${concept.id}`;
      insertEntity.run(id, "concept", concept.label, concept.domain ?? null, JSON.stringify(concept));
      for (const slug of concept.relatedBooks ?? concept.books ?? []) {
        insertEdge.run(id, `book:${slug}`, "appears-in", slug);
      }
      for (const related of concept.relatedConcepts ?? []) {
        const relatedId = typeof related === "string" ? related : related.id;
        if (relatedId) insertEdge.run(id, `concept:${relatedId}`, "related-concept", null);
      }
      for (const key of concept.referenceKeys ?? []) {
        insertEdge.run(id, `reference:${key}`, "supported-by", null);
      }
    }

    for (const thinker of thinkers.thinkers ?? []) {
      const key = thinker.id ?? thinker.key ?? thinker.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const id = `thinker:${key}`;
      insertEntity.run(id, "thinker", thinker.name ?? thinker.label ?? key, (thinker.domains ?? []).join(", ") || null, JSON.stringify(thinker));
      for (const slug of thinker.relatedBooks ?? []) insertEdge.run(id, `book:${slug}`, "informs", slug);
      for (const concept of thinker.concepts ?? []) insertEdge.run(id, `concept:${concept}`, "associated-concept", null);
    }

    for (const reference of references.references ?? []) {
      const key = reference.key ?? reference.id;
      if (!key) continue;
      const id = `reference:${key}`;
      const label = reference.title ?? reference.citation ?? key;
      insertEntity.run(id, "reference", label, reference.discipline ?? null, JSON.stringify(reference));
      for (const slug of reference.relatedBooks ?? []) insertEdge.run(id, `book:${slug}`, "cited-by", slug);
    }

    db.prepare("INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)").run("rebuilt_at", new Date().toISOString());
    db.prepare("INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)").run("document_count", String(documentCount));
    db.exec("COMMIT");

    return {
      dbPath,
      documentCount,
      entityCount: db.prepare("SELECT COUNT(*) AS count FROM entities").get().count,
      edgeCount: db.prepare("SELECT COUNT(*) AS count FROM edges").get().count,
      rebuiltAt: db.prepare("SELECT value FROM metadata WHERE key='rebuilt_at'").get().value,
    };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  } finally {
    db.close();
  }
}

function ftsQuery(value) {
  const terms = String(value ?? "").trim().split(/\s+/).filter(Boolean).slice(0, 12);
  return terms.map((term) => `"${term.replaceAll('"', '""')}"`).join(" AND ");
}

export async function searchBooksmithIndex(query, options = {}) {
  if (!String(query ?? "").trim()) return [];
  const db = await openDatabase();
  try {
    const match = ftsQuery(query);
    const book = options.bookSlug ? String(options.bookSlug) : null;
    const limit = Math.max(1, Math.min(Number(options.limit ?? 30), 100));
    const sql = book
      ? `SELECT id, book_slug AS bookSlug, kind, path, title, snippet(documents_fts, 5, '<mark>', '</mark>', ' … ', 28) AS snippet, bm25(documents_fts) AS rank FROM documents_fts WHERE documents_fts MATCH ? AND book_slug = ? ORDER BY rank LIMIT ?`
      : `SELECT id, book_slug AS bookSlug, kind, path, title, snippet(documents_fts, 5, '<mark>', '</mark>', ' … ', 28) AS snippet, bm25(documents_fts) AS rank FROM documents_fts WHERE documents_fts MATCH ? ORDER BY rank LIMIT ?`;
    return book ? db.prepare(sql).all(match, book, limit) : db.prepare(sql).all(match, limit);
  } finally {
    db.close();
  }
}

export async function booksmithGraph(bookSlug) {
  const db = await openDatabase();
  try {
    const entities = db.prepare(`
      SELECT DISTINCT e.id, e.kind, e.label, e.domain
      FROM entities e
      LEFT JOIN edges edge ON edge.source_id = e.id OR edge.target_id = e.id
      WHERE ? IS NULL OR edge.book_slug = ? OR e.id = ('book:' || ?)
      ORDER BY e.kind, e.label
      LIMIT 500
    `).all(bookSlug ?? null, bookSlug ?? null, bookSlug ?? null);
    const edges = db.prepare(`
      SELECT source_id AS source, target_id AS target, relation, book_slug AS bookSlug
      FROM edges
      WHERE ? IS NULL OR book_slug = ? OR source_id = ('book:' || ?) OR target_id = ('book:' || ?)
      LIMIT 1000
    `).all(bookSlug ?? null, bookSlug ?? null, bookSlug ?? null, bookSlug ?? null);
    return { entities, edges };
  } finally {
    db.close();
  }
}

export async function indexStatus() {
  if (!fs.existsSync(dbPath)) return { ready: false, dbPath };
  const db = await openDatabase();
  try {
    const rows = db.prepare("SELECT key, value FROM metadata").all();
    return { ready: true, dbPath, metadata: Object.fromEntries(rows.map((row) => [row.key, row.value])) };
  } finally {
    db.close();
  }
}
