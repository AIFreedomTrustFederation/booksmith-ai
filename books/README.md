# Federated Book Library

Booksmith AI uses this `books/` workspace as a library monorepo for sovereign but cross-referenced books.

Each book is intentionally individualized as its own folder, with its own metadata, manuscript, sources, assets, LaTeX package, and exports. The books remain together in this repository so Booksmith AI can maintain shared glossary terms, citations, canon references, provenance, and publishing packet rules across the whole AI Freedom Trust Federation library.

## Why a Library Monorepo First

The first phase keeps books together so they can be searched, cross-linked, versioned, and typeset as one coherent knowledge system. A book can later be extracted into its own repository when it becomes large enough, needs independent release cycles, or requires its own contributor governance.

## Standard Book Folder

```text
books/<book-slug>/
├── book.config.json
├── manuscript/
│   ├── 00-preface.md
│   └── references.md
├── sources/
├── assets/
├── latex/
└── exports/
```

## Seed Library

- `panentheism`
- `universal-process-theosophy`
- `towards-a-unified-reality`
- `coincidence-and-the-eternal-now`
- `krystal-spiral`
- `greenshift-theory`
- `the-green-zone`
- `federation-theory`
- `dynastylink`
- `aift-constitution-and-doctrine`
- `ai-stewardship-and-alignment`
- `booksmith-ai-manual`
- `civilizational-resilience`
- `library-of-the-federation`

## Cross-Reference Rule

Every book should be complete enough to stand alone, but every book should also declare its relationship to the larger federation library through `book.config.json`, citations, glossary terms, and explicit references to related books.
