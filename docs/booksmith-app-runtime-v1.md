# Booksmith App + Runtime v1

Booksmith is now one authoring product with two execution modes built from the same Next.js Studio.

```text
GitHub Pages                         Local / Private Booksmith App
read-only static portal              read + governed write
        │                                      │
        └──────────── same Studio UI ───────────┘
                                               │
                                  Booksmith Runtime v1
                                               │
                    ┌──────────────┬────────────┼────────────┬─────────────┐
                    │              │            │            │             │
                Manuscripts     SQLite       AI tasks      Jobs          Git
                    │              │            │            │             │
                    └──────────────┴────────────┴────────────┴─────────────┘
                                               │
                                      canonical book files
```

The repository remains the source of truth. SQLite, job state, browser drafts, and Runtime provenance are rebuildable or local operational state.

## Launch

The existing application command now launches both layers:

```bash
npm run server
```

`npm run server` prepares Booksmith diagnostics, starts `scripts/booksmith-runtime.ts`, and then starts the Next.js Studio.

Default local addresses:

```text
Booksmith App      http://localhost:3000
Studio             http://localhost:3000/studio
Runtime Center     http://localhost:3000/studio/runtime
Runtime API        http://127.0.0.1:8787
```

On Android/Termux the Next.js application uses Webpack while the Runtime remains loopback-only by default.

## Static publishing remains separate

When `GITHUB_PAGES=true`, `next.config.ts` enables static export and the `/booksmith-ai` base path. The Runtime is not part of the exported site.

This separation is intentional:

- GitHub Pages may display books, registries, production state, and the Studio shell.
- browser-local drafts may still work as private local browser state;
- canonical saves, source ingestion, model execution, Git, proofing, and publishing require the local/private Runtime.

## Runtime security

The Runtime binds to `127.0.0.1:8787` by default.

A non-loopback binding is rejected unless `BOOKSMITH_RUNTIME_TOKEN` is configured.

Example for an explicitly protected LAN Runtime:

```bash
export BOOKSMITH_RUNTIME_HOST=0.0.0.0
export BOOKSMITH_RUNTIME_TOKEN='replace-with-a-long-random-secret'
export BOOKSMITH_ALLOWED_ORIGINS='http://192.168.1.20:3000'
npm run server
```

The browser stores the Runtime URL and optional token locally through **Studio → Runtime**.

Runtime mutation routes validate both origin policy and authorization. Consequential job types require an additional explicit confirmation string.

## Canonical manuscript lifecycle

The Living Manuscript Studio now uses this sequence:

```text
repository canon
      ↓
browser-local working draft
      ↓
Review diff
      ↓
explicit Accept into Canon
      ↓
optimistic hash check
      ↓
atomic manuscript write
      ↓
provenance event
      ↓
optional local Git commit
```

A stale working copy cannot silently overwrite a manuscript that changed after it was loaded. The Runtime returns a conflict and requires the author to reload/review canon.

Canonical files remain under:

```text
books/<book-slug>/manuscript/chapters/<chapter-slug>.md
```

Runtime operational provenance is stored under `.booksmith/provenance/` and intentionally ignored by Git unless the author deliberately exports it into a governed artifact.

## Booksmith Intelligence

The writing surface now calls the existing governed provider service rather than copying a prompt packet.

The Runtime exposes both a JSON task route and an SSE task-event route. The Studio uses the stream route to report task progress and receives output into **Proposal Staging**.

Provider output never writes manuscript canon directly.

```text
Author request
      ↓
chapter + claims + canon rule + current working draft
      ↓
runAiTask
      ↓
configured provider
      ↓
proposal
      ↓
Replace / Append working draft
      ↓
Review diff
      ↓
Accept into Canon
```

Supported provider kinds remain the existing Booksmith interfaces:

- Ollama local OpenAI-compatible endpoint;
- llama.cpp local server;
- vLLM self-hosted server.

Providers are enabled through the existing environment configuration. If no provider is enabled, the UI says so rather than simulating AI output.

## SQLite Book Memory

Booksmith Runtime uses Node 22's `node:sqlite` module to build:

```text
.booksmith/booksmith.db
```

The index contains:

- canonical book files;
- manuscript source;
- sources and bibliography material;
- canon and writing plans;
- concepts;
- thinkers;
- references;
- book/entity relationships.

FTS5 provides local full-text retrieval. A relationship table projects the semantic Book Memory Graph.

The database is disposable. **Deleting it cannot delete a book.** Rebuild it from **Studio → Runtime → Rebuild Book Memory** or simply restart the Runtime with default settings.

## Research intake

**Studio → Library** now accepts three governed intake modes:

1. local file;
2. HTTPS source URL;
3. author research note.

Supported direct-text formats include Markdown, plain text, LaTeX, BibTeX, RIS, JSON/CSL, and HTML.

For binary publishing/research formats:

- PDF extraction uses local `pdftotext` when available;
- DOCX and EPUB extraction use local `pandoc` when available;
- if the extractor is unavailable, Booksmith preserves the original and marks extraction as required rather than inventing text.

Every import:

```text
preserves original
→ writes source metadata
→ updates library/source-registry.json
→ records source provenance
→ rebuilds SQLite memory when available
```

Direct web imports accept HTTPS only and reject credential-bearing, local/private-network, and unsafe redirect targets.

## Semantic memory graph

The Library exposes a Runtime-backed Book Memory Graph that projects:

```text
Book ↔ Documents ↔ Concepts ↔ References ↔ Thinkers
```

The visualization is a view of the SQLite relationship index, never a competing source of truth.

## Governed production jobs

Booksmith Runtime exposes only an allowlist of known Booksmith engines.

Current job classes include:

- library validation;
- system health;
- proof;
- visual proof;
- figure preparation;
- publication gate;
- publishing packet;
- managed publish.

The Production Studio can launch non-publishing jobs for each real book. Runtime Center shows persistent job state and logs from `.booksmith/jobs/`.

Managed publication requires the explicit `publish` confirmation string before the Runtime starts it.

## Git boundary

A canonical manuscript save can optionally create a **local Git commit** after the file has been written and provenance recorded.

Booksmith Runtime does not silently push to a remote. Remote publication/synchronization remains an explicit user-controlled operation.

## PWA / installable application

Booksmith now includes:

```text
public/manifest.webmanifest
public/booksmith-icon.svg
public/sw.js
src/app/pwa-registration.tsx
```

The Studio can therefore be installed from a supporting browser as a standalone Progressive Web App. The service worker provides an offline application shell for previously visited pages and static assets.

Offline UI availability does not imply that Runtime powers are available: canonical writes and local model execution still require the local Runtime process.

## Runtime API

The initial local API is intentionally narrow:

```text
GET  /v1/health
GET  /v1/manuscript
POST /v1/manuscript/diff
POST /v1/manuscript/save
POST /v1/ai/task
POST /v1/ai/stream
POST /v1/sources/import
POST /v1/index/rebuild
GET  /v1/index/status
GET  /v1/search
GET  /v1/graph
GET  /v1/git/status
POST /v1/jobs
GET  /v1/jobs
GET  /v1/jobs/:id
GET  /v1/provenance
```

No generic shell endpoint exists. The browser cannot ask the Runtime to execute arbitrary commands or arbitrary filesystem paths.

## Private state

`.gitignore` protects:

```text
.booksmith/
data/provenance/*.jsonl
```

Canonical manuscript and explicitly imported research source files remain normal repository content because those are part of the author-governed book itself.

## Operating invariant

The application may retrieve more context, run stronger models, automate more production work, and become easier to install, but the governing rule is unchanged:

**The author writes the book. Intelligence serves the book. Canon changes only through an intentional author-governed act.**
