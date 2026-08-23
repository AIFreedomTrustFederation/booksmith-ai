# Living Manuscript Studio

The Living Manuscript Studio is Booksmith's authoring center. It joins the real Book Tree, canonical manuscript, browser-local working draft, Claim Ledger, Book Memory, Chapter Forge, governed AI proposals, provenance, diff review, and explicit canonical persistence without confusing any of those states.

```text
Book Tree → Working Manuscript → Booksmith Intelligence
                         │
                         ↓
                    Review Diff
                         ↓
                  Accept into Canon
```

## Canon and working state

The repository manuscript remains canonical human work. When Booksmith Runtime is connected, the Studio loads the current canonical chapter from:

```text
books/<slug>/manuscript/chapters/<chapter-slug>.md
```

Edits remain browser-local until the author chooses **Review diff** and then **Accept into Canon**. The Runtime checks the canonical hash before writing, performs an atomic replacement, records an author-save provenance event, and may create a local Git commit when explicitly requested.

A conflicting canonical change cannot be silently overwritten.

## Book Tree

The Book Tree reads the real chapter plan, parts, manuscript availability, canonical word counts, and writing-queue state. Selecting a chapter changes the entire author context without duplicating chapter meaning in a second data structure.

## Claim Ledger

`books/<slug>/sources/claim-ledger.json` classifies important statements by type, editorial status, support state, source references, chapter relationships, and canonical terms. The ledger exists to keep author canon, theology, philosophy, hypothesis, metaphor, interpretation, and scientific evidence from silently collapsing into one category.

## Booksmith Intelligence

The Intelligence pane assembles chapter-aware context from the actual book, current chapter, author-canon rule, required chapter movement, claims in scope, and the current working draft. It sends that context through Booksmith Runtime to the configured governed provider.

Model output enters **Proposal Staging**, never canon. The author may replace or append the proposal to the working draft and then use the ordinary diff-and-consent path if they want it to become part of the book.

Local/self-hosted providers are configured through **Studio → Models**.

## Book Memory

The manuscript can query the Runtime's SQLite/FTS5 Book Memory for related passages in the active book. The wider Library also exposes the semantic Book Memory Graph across books, documents, concepts, references, and thinkers.

SQLite is retrieval state, not editorial truth. It can always be rebuilt from canonical files and registries.

## Chapter Forge

Chapter Forge remains deterministic. It assembles the real chapter requirements, primary texts, Claim Ledger state, author-canon rule, and working draft into an inspectable context packet. It does not claim that a planning packet is a completed chapter.

## Source contract

A fully structured Living Manuscript book may draw from:

- `book.config.json`
- `writing/chapter-plan.json`
- `writing/queue/*.md`
- `manuscript/chapters/*.md`
- `sources/author-canon.md`
- `sources/claim-ledger.json`
- `sources/provenance-log.json`
- `figures/studio/figure-studio-index.json`
- shared `library/` registries
- Runtime SQLite retrieval derived from those sources.

Missing manuscript or evidence remains an honest empty state. Booksmith does not fabricate manuscript progress, evidence, citations, verification, or approval.

The complete application and Runtime contract is documented in [`booksmith-app-runtime-v1.md`](booksmith-app-runtime-v1.md).
