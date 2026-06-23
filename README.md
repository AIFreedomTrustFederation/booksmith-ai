# Booksmith AI

Booksmith AI is an author-first writing, editing, publishing, and launch studio for the AI Freedom Trust Federation ecosystem.

The product direction is simple: give writers full creative control while AI handles the heavy support work around structure, continuity, revision, metadata, typesetting, publishing packets, citations, provenance, and launch assets.

Booksmith AI is also the library operating system for a federated collection of books, manuals, guides, theories, constitutions, and project doctrines. Each book is individualized as its own project while remaining cross-referenced through shared canon, glossary, citations, provenance, and publishing packet rules.

## Ecosystem Role

Booksmith AI is the authoring and production studio. AI Freedom Trust Publishing is the publishing imprint and book-commerce arm. The Federation provides the long-term doctrine, standards, and sovereign infrastructure vision.

Recommended structure:

```text
AI Freedom Trust Federation
├── AI Freedom Trust Publishing
│   ├── AI Freedom Trust Press
│   ├── Booksmith AI
│   ├── Federated Book Library
│   ├── Author Services
│   ├── Rights and Licensing
│   ├── Distribution Operations
│   └── Direct Sales and Catalog
├── AIFT Forge
├── DynastyLink
└── Other federation projects
```

Default imprint language:

```text
Published by AI Freedom Trust Publishing
An AI Freedom Trust Federation imprint

Prepared with Booksmith AI, a local-first authoring and publishing studio.
```

See [docs/ai-freedom-trust-publishing.md](docs/ai-freedom-trust-publishing.md) for the publishing structure.

## Federated Book Library

Booksmith AI now treats the repository as a library monorepo for sovereign but cross-referenced books.

```text
booksmith-ai/
├── books/                      # individualized book projects
│   ├── panentheism/
│   ├── universal-process-theosophy/
│   ├── towards-a-unified-reality/
│   ├── coincidence-and-the-eternal-now/
│   ├── krystal-spiral/
│   ├── greenshift-theory/
│   ├── the-green-zone/
│   ├── federation-theory/
│   ├── dynastylink/
│   ├── aift-constitution-and-doctrine/
│   ├── ai-stewardship-and-alignment/
│   ├── booksmith-ai-manual/
│   ├── civilizational-resilience/
│   └── library-of-the-federation/
├── library/                    # shared canon, registry, glossary, references
├── templates/book/             # reusable book project template
└── docs/                       # product and architecture documentation
```

The initial library architecture is documented in [docs/federated-library-architecture.md](docs/federated-library-architecture.md). The active book registry is maintained in [library/book-registry.json](library/book-registry.json).

### Library Principle

```text
Federated Library = Sovereign Books + Shared Canon + Cross References + Provenance
```

Each book should be complete enough to stand alone, but each book should also declare how it contributes to the whole AI Freedom Trust Federation library.

### Standard Book Project

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

The current seed projects are metadata-first. Manuscripts, source packets, LaTeX projects, and exports should be added as each book enters active production.

## Shared Reference Library

Booksmith AI uses one shared citation system for the whole federation library instead of recreating references inside every book.

```text
library/
├── references/
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

See [docs/shared-reference-library.md](docs/shared-reference-library.md) and [library/references/README.md](library/references/README.md) for the LaTeX import pattern and reference quality workflow.

## Open Source First

Booksmith AI is designed to avoid required paid APIs, outside AI rate limits, and proprietary hosted services for core features. The default product direction is local-first and self-hostable, using open-source tools and carefully verified open-weight models.

See [docs/open-source-strategy.md](docs/open-source-strategy.md) for the architecture rules.

## Publishing Company Workflow

Booksmith AI should help AI Freedom Trust Publishing prepare professional book releases for print-on-demand, ebook marketplaces, direct sales, catalogs, and launch campaigns.

The intended workflow is:

1. Author creates or imports a manuscript in Booksmith AI.
2. Booksmith helps with structure, revision, Story Bible, continuity, citations, metadata, and launch assets.
3. The author approves final creative and editorial choices.
4. Booksmith exports a publishing packet.
5. AI Freedom Trust Publishing reviews, assigns ISBNs, prepares files, approves proofs, and distributes the book.
6. Marketplace listings, royalty records, rights, revisions, citations, and provenance remain traceable.

See [docs/publishing-operations-playbook.md](docs/publishing-operations-playbook.md) and [docs/booksmith-publishing-packet.md](docs/booksmith-publishing-packet.md).

## LaTeX First-Class Publishing

Booksmith AI will support beautiful book production through local LaTeX tooling. The plan covers editable `.tex` project export, engine selection, templates, typography controls, citations, indexes, glossaries, build logs, and PDF proofing.

The LaTeX path is Unicode-first: XeLaTeX/LuaLaTeX, `fontspec`, OpenType font profiles, CJK fallback fonts, math fonts, and full-page art layouts for visual books and AI-generated art books.

See [docs/latex-integration.md](docs/latex-integration.md) for the LaTeX architecture and [templates/latex/booksmith-book](templates/latex/booksmith-book) for the first sample book template.

See [docs/unicode-fonts-and-art-books.md](docs/unicode-fonts-and-art-books.md) for the font and art-book strategy.

## MVP

- Bookshelf for active writing projects
- Chapter Studio for drafting and revision workflows
- Federated Library workspace for cross-referenced books
- AI mode controls for drafting, rewriting, plotting, editing, and marketing
- Story Bible for voice, lore, audience, and creative boundaries
- Continuity Watch for contradictions and manuscript risks
- Shared canon, glossary, citations, and cross-reference registry
- Publishing Pipeline for manuscript, editorial, package, and launch progress
- Launch Assets for blurbs, social hooks, emails, keywords, and retailer copy
- Publishing Packet export for AI Freedom Trust Publishing operations
- LaTeX Studio for local book typesetting and proof builds
- Unicode Font Studio for OpenType, multilingual, and art-book typography
- Provenance log for AI-assisted publishing assets

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- React
- Local AI runtime adapter planned for Ollama, llama.cpp, or vLLM
- PostgreSQL and Qdrant planned for self-hosted storage and retrieval
- TeX Live, MiKTeX, Tectonic, latexmk, XeLaTeX, LuaLaTeX, and pdfLaTeX planned for local LaTeX publishing workflows
- Open/OFL font families such as Noto, EB Garamond, Cormorant Garamond, Alegreya, Libertinus, and TeX Gyre for default typography

## Local Development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

To build the sample LaTeX book:

```powershell
npm run latex:sample
```

The PDF is written to `.latex-build/booksmith-sample.pdf`. The default build uses XeLaTeX for Unicode and OpenType font support.

## Agent And Contributor Guidance

Read [AGENTS.md](AGENTS.md) before changing code. The repo is aligned around author sovereignty, local-first architecture, open-source defaults, inspectable exports, and AI Freedom Trust Publishing as the publishing imprint.

## Product Notes

The first screen is intentionally an app workspace rather than a landing page. Booksmith AI should feel like an operating system for authors: the manuscript, story bible, editorial logic, publishing package, launch campaign, imprint metadata, proof pipeline, source lineage, and federated library references all share one source of truth.
