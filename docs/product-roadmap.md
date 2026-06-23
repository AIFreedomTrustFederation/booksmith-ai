# Product Roadmap

Booksmith AI should become a local-first creative operating system for authors.
The strongest next features are the ones that connect writing, layout, AI,
rights, and publishing into one controlled workflow.

## Near-Term Features

### Manuscript To LaTeX Renderer

Turn Booksmith project data into clean `.tex` files automatically:

- metadata to `metadata.tex`
- chapters to `chapters/*.tex`
- art assets to `assets/art/`
- font choices to a template override file
- citations, glossary entries, and index terms to source files

### Unicode Font Studio

Add UI for font selection and proofing:

- installed font browser
- bundled open-font browser
- font pairing preview
- missing glyph checks
- CJK fallback checks
- math font checks
- redistribution/license warnings

### Visual Art Book Studio

A workspace for building beautiful image-heavy books:

- AI art prompt boards
- image asset library
- full-page plates
- two-page spreads
- captioned galleries
- section opener art
- image credit pages
- proof and print resolution checks

### PDF Proofing Dashboard

Make LaTeX build output understandable:

- page thumbnails
- build log summaries
- overfull and underfull box warnings
- missing font warnings
- missing image warnings
- before/after PDF comparisons
- proof annotations

### Local Model Router

Let Booksmith assign different local models to different jobs:

- drafting model
- editing model
- continuity model
- metadata model
- image-prompt model
- LaTeX repair model

The router should benchmark local models and recommend which one is best for
each task on the user's hardware.

## Differentiating Features

### Rights And License Ledger

Track rights for everything used in a book:

- fonts
- images
- generated art
- reference images
- datasets
- model licenses
- contributors
- excerpts and quotations

This is especially important for commercial books and public repos.

### Story Bible Graph

Represent the book as a graph:

- characters
- locations
- objects
- timelines
- secrets
- promises
- unresolved threads
- relationships

The graph should power continuity checks and AI retrieval.

### Series Universe Manager

Support multi-book projects:

- cross-book continuity
- character arc tracking
- shared maps and timelines
- lore versioning
- sequel hooks
- spin-off candidates

### Voice And Style Lock

Give authors control over AI output:

- author sample library
- forbidden phrasing list
- style drift detection
- genre convention controls
- rewrite intensity controls
- chapter-level tone targets

### Publishing Package Builder

Generate launch-ready assets from the same book source:

- EPUB
- LaTeX source
- print PDF
- metadata sheet
- book description
- keywords
- categories
- cover brief
- press kit
- email launch sequence
- ad copy variants

## Technical Priorities

- Keep every core feature local-first and self-hostable.
- Keep all AI providers behind internal adapters.
- Keep LaTeX output human-readable.
- Keep font and image licenses visible.
- Keep generated book packages reproducible.
- Prefer open standards and source-controlled artifacts.
