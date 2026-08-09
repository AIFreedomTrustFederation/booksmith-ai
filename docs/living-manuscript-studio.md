# Living Manuscript Studio

The Living Manuscript Studio turns a Booksmith project’s existing structured sources into three connected views without treating AI output as author-approved manuscript text.

## Book Tree

The tree reads the real chapter plan and groups chapters by part. Claims, canonical terms, figure briefs, and writing-queue files remain connected to their repository paths. Visual status communicates workflow state, not truth: accepted author canon, verification-required support, open questions, and planned chapters remain distinct.

## Claim and Revelation Ledger

`books/<slug>/sources/claim-ledger.json` classifies important statements by type, editorial status, support state, source references, chapter relationships, and canonical terms. The ledger does not declare scientific verification. Its purpose is to prevent author canon, theology, philosophy, hypothesis, metaphor, and scientific evidence from silently collapsing into one category.

## Chapter Forge

The Forge assembles a chapter packet from the real chapter plan, accepted canon relationships, primary-text fields, figure briefs, writing-queue path, required sections, and provenance policy. It is a deterministic planning surface. Future drafting actions must use the provider boundary and remain proposals until author approval.

## Source contract

The initial Energence implementation reads:

- `book.config.json`
- `writing/chapter-plan.json`
- `writing/queue/*.md`
- `sources/author-canon.md`
- `sources/claim-ledger.json`
- `sources/provenance-log.json`
- `figures/studio/figure-studio-index.json`

Missing sources produce honest empty states. The workspace never fabricates manuscript progress, evidence, citations, or approval.
