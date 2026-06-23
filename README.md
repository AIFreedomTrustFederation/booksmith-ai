# Booksmith AI

Booksmith AI is an author-first writing, editing, publishing, and launch studio for the AI Freedom Trust Federation ecosystem.

The product direction is simple: give writers full creative control while AI handles the heavy support work around structure, continuity, revision, metadata, typesetting, publishing packets, and launch assets.

## Ecosystem Role

Booksmith AI is the authoring and production studio. AI Freedom Trust Publishing is the publishing imprint and book-commerce arm. The Federation provides the long-term doctrine, standards, and sovereign infrastructure vision.

Recommended structure:

```text
AI Freedom Trust Federation
├── AI Freedom Trust Publishing
│   ├── AI Freedom Trust Press
│   ├── Booksmith AI
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

## Open Source First

Booksmith AI is designed to avoid required paid APIs, outside AI rate limits, and proprietary hosted services for core features. The default product direction is local-first and self-hostable, using open-source tools and carefully verified open-weight models.

See [docs/open-source-strategy.md](docs/open-source-strategy.md) for the architecture rules.

## Publishing Company Workflow

Booksmith AI should help AI Freedom Trust Publishing prepare professional book releases for print-on-demand, ebook marketplaces, direct sales, catalogs, and launch campaigns.

The intended workflow is:

1. Author creates or imports a manuscript in Booksmith AI.
2. Booksmith helps with structure, revision, Story Bible, continuity, metadata, and launch assets.
3. The author approves final creative and editorial choices.
4. Booksmith exports a publishing packet.
5. AI Freedom Trust Publishing reviews, assigns ISBNs, prepares files, approves proofs, and distributes the book.
6. Marketplace listings, royalty records, rights, revisions, and provenance remain traceable.

See [docs/publishing-operations-playbook.md](docs/publishing-operations-playbook.md) and [docs/booksmith-publishing-packet.md](docs/booksmith-publishing-packet.md).

## LaTeX First-Class Publishing

Booksmith AI will support beautiful book production through local LaTeX tooling. The plan covers editable `.tex` project export, engine selection, templates, typography controls, citations, indexes, glossaries, build logs, and PDF proofing.

The LaTeX path is Unicode-first: XeLaTeX/LuaLaTeX, `fontspec`, OpenType font profiles, CJK fallback fonts, math fonts, and full-page art layouts for visual books and AI-generated art books.

See [docs/latex-integration.md](docs/latex-integration.md) for the LaTeX architecture and [templates/latex/booksmith-book](templates/latex/booksmith-book) for the first sample book template.

See [docs/unicode-fonts-and-art-books.md](docs/unicode-fonts-and-art-books.md) for the font and art-book strategy.

## MVP

- Bookshelf for active writing projects
- Chapter Studio for drafting and revision workflows
- AI mode controls for drafting, rewriting, plotting, editing, and marketing
- Story Bible for voice, lore, audience, and creative boundaries
- Continuity Watch for contradictions and manuscript risks
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

The first screen is intentionally an app workspace rather than a landing page. Booksmith AI should feel like an operating system for authors: the manuscript, story bible, editorial logic, publishing package, launch campaign, imprint metadata, and proof pipeline all share one source of truth.
