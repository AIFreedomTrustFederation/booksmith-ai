# Living Manuscript Studio v2 — Author Workspace

## Purpose

Living Manuscript Studio v2 turns Booksmith AI from a registry-and-production dashboard into a real author-facing writing surface while preserving the repository's author-sovereignty rules.

The interface is built around one operational relationship:

```text
Book Tree → Working Manuscript → Booksmith Intelligence
```

The repository manuscript remains canonical human work. Browser editing is deliberately treated as a local working draft until a governed persistence path is connected. AI or editorial language remains a proposal until the author intentionally moves it into the working draft and later approves a repository change.

## Real-data boundary

The Studio reads only real Booksmith state:

- `books/<slug>/writing/chapter-plan.json`
- `books/<slug>/manuscript/chapters/*.md`
- `books/<slug>/sources/claim-ledger.json`
- `books/<slug>/sources/provenance-log.json`
- `books/<slug>/figures/studio/figure-studio-index.json`
- `library/concept-registry.json`

A chapter without a manuscript file is shown as not drafted. The UI does not invent manuscript text, progress, citations, source verification, or AI output.

## Writing workspace

The primary `Write` mode uses three responsive panes.

### Book Tree

The Book Tree shows the real part and chapter plan, canonical manuscript availability, canonical word counts, and writing-queue readiness. Selecting a chapter changes the full author context without duplicating graph data in the UI.

### Working Manuscript

When a canonical chapter file exists, its Markdown source is loaded into the writing surface. The browser-local working draft is stored under a namespaced `localStorage` key:

```text
booksmith:<book-slug>:draft:<chapter-slug>
```

This is intentionally not represented as a repository save. The UI distinguishes:

- canonical repository text;
- browser-local changes;
- chapters with no canonical manuscript yet.

The author can restore the local draft to repository canon at any time. Write and Preview modes operate on the same working draft.

### Booksmith Intelligence

The intelligence panel does not call a model runtime directly. It assembles a deterministic provider context containing:

- book and chapter identity;
- canonical manuscript state;
- writing queue state;
- editorial target;
- primary texts;
- author-canon rule;
- required chapter movement;
- Claim Ledger entries in scope;
- the current browser-local working draft;
- the author's explicit request.

The context can be copied into a configured provider workflow today and is structured so a governed provider adapter can replace that bridge later.

## Proposal staging

AI and editorial language is staged separately from the manuscript. Applying a proposal changes only the browser-local working draft. It does not write the repository manuscript or claim author approval.

The intended future persistence sequence is:

```text
Proposal
  ↓
Author review
  ↓
Local working draft
  ↓
Diff / provenance review
  ↓
Explicit approval
  ↓
Governed repository save
  ↓
Verification and record
```

## Claim Ledger

Claim Ledger remains a first-class mode. It preserves distinctions among author canon, constructive theology, philosophical inference, theological hypothesis, editorial safeguards, support status, source references, and chapter scope.

## Chapter Forge

Chapter Forge remains deterministic. It assembles the real chapter requirements and Claim Ledger state into an author context packet. It does not present a copied prompt as a completed draft or confuse a model proposal with canonical manuscript progress.

## Book Memory

Book Memory now exposes the concepts already connected to the active book through `library/concept-registry.json`, including their domains and reference keys. This is the first author-facing projection of the future semantic Book Memory Graph.

The next graph phase should add relationships among:

```text
Concept ↔ Book ↔ Chapter ↔ Claim ↔ Source ↔ Reference ↔ Figure
```

The graph must remain a projection of structured Booksmith data rather than a second source of truth.

## Next implementation layer

The next technological layer should connect governed local persistence and AI providers without weakening the current boundaries:

1. Add a server/local-runtime save adapter that writes manuscript changes only after explicit author approval.
2. Generate a structured diff between repository canon and the working draft.
3. Record accepted revisions in provenance.
4. Connect `runAiTask` or the governed provider interface to the existing context packet.
5. Return provider output into Proposal Staging rather than directly into manuscript canon.
6. Add retrieval across the federated library, sources, claims, concepts, thinkers, and references.
7. Add Proof Studio and publishing actions as downstream surfaces of the same author workspace.

## Invariant

The interface may become more intelligent, immersive, and automated, but one rule remains fixed:

**The author writes the book. Intelligence serves the book. Canon changes only through an intentional author-governed act.**
