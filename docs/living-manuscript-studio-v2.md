# Booksmith Author Portal — Living Manuscript Studio v2

## Purpose

Booksmith now presents one coherent author-facing portal over the repository's manuscript, library, figure, proof, provenance, and publishing systems. It is no longer organized as a collection of unrelated diagnostic pages.

The authoring center remains:

```text
Book Tree → Working Manuscript → Booksmith Intelligence
```

Around that center, the portal now connects:

```text
Studio
├── Bookshelf and real capability state
├── Book Cockpit
│   ├── Living Manuscript
│   ├── Library & Sources
│   ├── Figure Studio
│   └── Proof & Publish
├── Federated Library
├── Production Studio
├── Figure Studio
└── System Health
```

## Author-sovereignty boundary

The repository manuscript remains canonical human work. Browser editing is deliberately treated as local working-draft state until a governed persistence adapter is connected. AI or editorial language remains a proposal until the author intentionally accepts it.

The portal must never imply that a browser edit, generated passage, proof command, or publication command has changed repository canon when it has not.

## Real-data boundary

Booksmith reads real repository state, including:

- `library/book-registry.json`
- `library/source-registry.json`
- `library/concept-registry.json`
- `library/thinker-registry.json`
- `library/reference-registry.json`
- `library/citation-registry.json`
- `books/<slug>/book.config.json`
- `books/<slug>/writing/chapter-plan.json`
- `books/<slug>/manuscript/`
- `books/<slug>/sources/`
- `books/<slug>/figures/`
- `books/<slug>/assets/`
- `books/<slug>/latex/`
- `books/<slug>/publishing/`
- `books/<slug>/exports/`

A missing manuscript, source, asset, proof artifact, metadata file, or export is shown as missing. The portal does not fabricate progress.

## Public portal

The root Booksmith page now presents the product around the actual system: registered books, active/drafting books, Living Manuscript eligibility, production-rich books, concepts, and thinkers. It routes directly into the Studio, Living Manuscript, Library, Figures, Production, and System Health surfaces.

## Studio

`/studio` is the central bookshelf and operating surface. Each registered book receives a capability snapshot derived from actual repository files rather than static product labels.

The snapshot reports manuscript, sources, Claim Ledger, provenance, figures, LaTeX, publishing state, proof/report artifacts, and exports. A production-surface percentage is an index of those observable capabilities, not a claim that a book is percentage-complete as a manuscript.

## Book Cockpit

Every registered book receives `/studio/books/<slug>`. The cockpit shows the real book configuration, canonical terms, publishing targets, related books, repository manuscript files, source files, integrity issues, and available workflow surfaces.

A Living Manuscript link appears only when the book satisfies the current structured data contract.

## Living Manuscript

The Living Manuscript route is generated for every book that actually provides the required structured files rather than being hardcoded to one slug.

### Book Tree

The Book Tree shows the real part and chapter plan, canonical manuscript availability, canonical word counts, and writing-queue readiness.

### Working Manuscript

When a canonical Markdown chapter exists, its source is loaded into the writing surface. Browser-local working state uses:

```text
booksmith:<book-slug>:draft:<chapter-slug>
```

The editor distinguishes canonical repository text from local changes and can restore the browser draft to canon. Write and Preview modes use the same local working state.

### Booksmith Intelligence

The intelligence panel does not call a model runtime from the browser. It assembles deterministic provider context containing book and chapter identity, manuscript state, writing queue, editorial target, primary texts, author-canon rule, required movement, Claim Ledger entries, local working draft, and the author's instruction.

This preserves the existing provider boundary and keeps a future `runAiTask` integration server/local-runtime governed.

### Proposal staging

AI and editorial language is staged separately. Applying a proposal modifies browser-local working state only. It does not write repository canon or claim author approval.

### Claim Ledger

Claim Ledger remains first-class and preserves distinctions among author canon, constructive theology, philosophical inference, theological hypothesis, editorial safeguards, support state, source references, and chapter scope.

### Chapter Forge

Chapter Forge remains deterministic and generates a real chapter context packet from the current plan, canon boundary, source state, and claims.

### Book Memory

Book Memory exposes concepts already connected to the active book through the federation concept registry, including domain and reference keys. It is the first interactive projection of a larger semantic graph:

```text
Concept ↔ Book ↔ Chapter ↔ Claim ↔ Source ↔ Reference ↔ Figure
```

The graph remains a projection of structured Booksmith data rather than a competing source of truth.

## Federated Library

`/studio/library` provides searchable client-side exploration across the registry data already shipped with Booksmith:

- books;
- concepts;
- thinkers;
- reference keys;
- connected source records.

This is structured retrieval over indexed Booksmith state, not a claim that full semantic/vector retrieval or external-source ingestion is already running in the static portal.

## Figure Studio

Figure Studio now discovers every registered book with a real Figure Studio index instead of being hardcoded to FHQCM. Detail routes carry the owning book and figure ID together, allowing manuscript context, art direction, provider-agnostic prompt, asset state, checksum, required/forbidden objects, and QA state to remain book-aware.

Print approval remains an explicit human decision.

## Production Studio

`/studio/production` indexes real manuscript, bibliography, figure, LaTeX, proof/report, publishing, and export files by book. It also surfaces the existing local production commands without pretending the static website executed them.

Booksmith's local-first production engines remain responsible for actual rendering, proof inspection, publication gates, publishing packets, and managed publication.

## System Health

`/studio/system` reports a generated `.booksmith-build/system-health/system-health-v1.json` snapshot when one exists. If it does not exist, the portal shows an honest command to generate it rather than assuming provider, LaTeX, or system availability.

## Remaining runtime boundary

The visual portal is integrated. The remaining work is runtime plumbing that cannot truthfully be simulated by static GitHub Pages:

1. a governed local/server manuscript-save adapter;
2. canonical-vs-working-draft diff review before persistence;
3. accepted-revision provenance recording;
4. `runAiTask` provider execution returning into Proposal Staging;
5. full semantic/vector retrieval and source ingestion;
6. browser controls that invoke the existing proof/publish engines through an authorized local runtime.

These are execution boundaries, not missing portal concepts. The UI now exposes where they belong without claiming they are already active.

## Invariant

**The author writes the book. Intelligence serves the book. Canon changes only through an intentional author-governed act.**
