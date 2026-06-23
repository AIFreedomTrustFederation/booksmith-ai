# Federated Library Architecture

Booksmith AI should support a federated library of books rather than a single giant manuscript. This architecture mirrors the AI Freedom Trust Federation itself: sovereign works, shared doctrine, inspectable references, and coherent interconnection.

## Architecture Goal

Booksmith AI becomes the library operating system for AI Freedom Trust Publishing.

```text
Booksmith AI
├── books/                 # individualized book projects
├── library/               # shared canon, glossary, registry, cross-references
├── templates/             # reusable book and publishing packet templates
├── docs/                  # product and architecture documentation
└── exports/               # generated artifacts, usually ignored or externalized later
```

## Book Independence

Each book must be independently readable, citable, and publishable. A reader should not need the entire library to understand a book's core argument.

## Library Coherence

Each book should also declare how it relates to the larger library through:

- `book.config.json`
- shared glossary terms
- source lineage notes
- internal cross-references
- citation keys
- provenance logs
- publishing packet metadata

## When to Split a Book Into Its Own Repository

Keep a book in the monorepo while it is being developed as part of the shared library. Split it into a separate repository only when at least one of the following becomes true:

1. The book has a separate contributor community.
2. The book has a distinct release cycle.
3. The book contains large assets or build artifacts that make the monorepo heavy.
4. The book needs independent issue tracking, licensing, or distribution rules.
5. The book becomes an application, curriculum, or product with its own roadmap.

## Data Model Direction

The long-term Booksmith AI data model should treat each book as a project with:

- metadata
- manuscript sections
- source records
- citations
- glossary terms
- image and media assets
- prompts and model settings
- revision history
- approval state
- export targets
- publishing packet status
- provenance log entries

## Publishing Packet Direction

Each book should eventually produce a publishing packet containing:

```text
publishing-packet/
├── manuscript.md
├── manuscript.tex
├── manuscript.epub
├── print-proof.pdf
├── metadata.json
├── citations.bib
├── glossary.md
├── cover-assets/
├── launch-assets/
├── provenance-log.json
└── approval-record.md
```

## Design Principle

The library must preserve both sovereignty and coherence:

```text
Sovereign Book + Shared Canon + Provenance + Cross-References = Federated Knowledge
```
