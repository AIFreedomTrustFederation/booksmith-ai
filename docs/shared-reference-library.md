# Shared Reference Library Workflow

Booksmith AI uses a shared reference library so every book can draw from one canonical citation system instead of recreating references repeatedly.

## Purpose

The shared reference library supports:

- consistent BibTeX citation keys
- reusable LaTeX bibliography imports
- cross-book bibliographies
- thinker profiles
- concept maps
- citation quality passes
- provenance records
- future knowledge graph features

## Files

```text
library/
├── references/
│   ├── README.md
│   ├── federation-canon.bib
│   ├── physics.bib
│   ├── mathematics.bib
│   ├── biology.bib
│   ├── consciousness.bib
│   ├── philosophy.bib
│   ├── theology.bib
│   ├── process-theology.bib
│   ├── patristics.bib
│   ├── universal-reconciliation.bib
│   ├── ai.bib
│   ├── open-source-ai.bib
│   ├── systems-cybernetics.bib
│   ├── sociology.bib
│   ├── indigenous-red-road.bib
│   └── civilization.bib
├── thinker-registry.json
├── reference-registry.json
└── concept-registry.json
```

Trust law, dynasty trusts, securities, insurance, and jurisdiction-specific governance sources require a separate legal quality pass before becoming canon references.

## LaTeX Pattern

A book's LaTeX project should import shared references like this:

```latex
\addbibresource{../../library/references/federation-canon.bib}
\addbibresource{../../library/references/physics.bib}
\addbibresource{../../library/references/mathematics.bib}
\addbibresource{../../library/references/biology.bib}
\addbibresource{../../library/references/consciousness.bib}
\addbibresource{../../library/references/philosophy.bib}
\addbibresource{../../library/references/theology.bib}
\addbibresource{../../library/references/process-theology.bib}
\addbibresource{../../library/references/patristics.bib}
\addbibresource{../../library/references/universal-reconciliation.bib}
\addbibresource{../../library/references/ai.bib}
\addbibresource{../../library/references/open-source-ai.bib}
\addbibresource{../../library/references/systems-cybernetics.bib}
\addbibresource{../../library/references/sociology.bib}
\addbibresource{../../library/references/indigenous-red-road.bib}
\addbibresource{../../library/references/civilization.bib}
```

Book-specific references should be added after shared references:

```latex
\addbibresource{../references.bib}
```

## Registry Roles

### `thinker-registry.json`

Maps canonical thinkers to domains, concepts, and books.

### `reference-registry.json`

Maps citation keys to disciplines, importance, and books that should consider the source.

### `concept-registry.json`

Maps shared concepts to definitions, related books, and relevant citation keys.

## Quality Pass Procedure

Before a book is released, run four passes over its references:

1. **Completeness pass:** confirm every cited key exists in a `.bib` file.
2. **Bibliographic pass:** verify author names, titles, years, editions, publishers, translators, DOI/URL, and page references.
3. **Domain pass:** confirm every source is assigned to the correct subject library.
4. **Canon pass:** confirm foundational works are represented in `thinker-registry.json`, `reference-registry.json`, and `concept-registry.json`.

## Booksmith AI Future Feature Direction

Booksmith AI should eventually provide:

- citation search
- missing citation detection
- duplicate reference detection
- source lineage tracking
- auto-generated bibliographies
- thinker profile pages
- concept-to-book dependency maps
- reference quality check reports
