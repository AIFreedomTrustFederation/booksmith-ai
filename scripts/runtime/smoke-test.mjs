import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { listJobKinds } from "./job-runner.mjs";
import { readManuscript } from "./manuscript-store.mjs";
import { readProviderSettings } from "./provider-settings.mjs";
import { booksmithGraph, indexStatus, rebuildBooksmithIndex, searchBooksmithIndex } from "./sqlite-index.mjs";

const root = process.cwd();

async function main() {
  assert.ok(fs.existsSync(path.join(root, "library", "book-registry.json")), "book registry must exist");

  const index = await rebuildBooksmithIndex();
  assert.ok(index.documentCount > 0, "SQLite index must contain canonical documents");
  assert.ok(index.entityCount > 0, "SQLite index must contain semantic entities");
  assert.ok(index.edgeCount > 0, "SQLite index must contain semantic relationships");

  const status = await indexStatus();
  assert.equal(status.ready, true, "SQLite index status must be ready after rebuild");

  const manuscript = await readManuscript("energence", "01-why-energence");
  assert.equal(manuscript.exists, true, "Energence Chapter 1 must remain readable as canonical manuscript");
  assert.ok(manuscript.text.length > 0, "canonical manuscript text must not be empty");
  assert.ok(manuscript.hash.length === 64, "canonical manuscript must have a SHA-256 hash");

  const search = await searchBooksmithIndex("Energence", { bookSlug: "energence", limit: 10 });
  assert.ok(search.length > 0, "FTS search must find indexed Energence material");

  const graph = await booksmithGraph("energence");
  assert.ok(graph.entities.length > 0, "Book Memory graph must expose entities");
  assert.ok(graph.edges.length > 0, "Book Memory graph must expose relationships");

  const providers = await readProviderSettings();
  assert.ok(Array.isArray(providers.providers), "private provider settings must normalize to an array");

  const jobs = listJobKinds();
  assert.ok(jobs.some((job) => job.kind === "proof"), "proof job must remain allowlisted");
  assert.ok(jobs.some((job) => job.kind === "publish" && job.consequential), "publish job must remain explicitly consequential");
  assert.ok(!jobs.some((job) => job.kind === "library-index"), "placeholder index job must not return");

  console.log(`Booksmith Runtime smoke test passed: ${index.documentCount} documents, ${index.entityCount} entities, ${index.edgeCount} relationships.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
