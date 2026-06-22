# Booksmith AI

Booksmith AI is an author-first writing, editing, publishing, and launch studio.
The product direction is simple: give writers full creative control while AI
handles the heavy support work around structure, continuity, revision, metadata,
and marketing.

## Open Source First

Booksmith AI is designed to avoid required paid APIs, outside AI rate limits, and
proprietary hosted services for core features. The default product direction is
local-first and self-hostable, using open-source tools and carefully verified
open-weight models.

See [docs/open-source-strategy.md](docs/open-source-strategy.md) for the
architecture rules.

## LaTeX First-Class Publishing

Booksmith AI will support beautiful book production through local LaTeX
tooling. The plan covers editable `.tex` project export, engine selection,
templates, typography controls, citations, indexes, glossaries, build logs, and
PDF proofing.

The LaTeX path is Unicode-first: XeLaTeX/LuaLaTeX, `fontspec`, OpenType font
profiles, CJK fallback fonts, math fonts, and full-page art layouts for visual
books and AI-generated art books.

See [docs/latex-integration.md](docs/latex-integration.md) for the LaTeX
architecture and [templates/latex/booksmith-book](templates/latex/booksmith-book)
for the first sample book template.

See [docs/unicode-fonts-and-art-books.md](docs/unicode-fonts-and-art-books.md)
for the font and art-book strategy.

## MVP

- Bookshelf for active writing projects
- Chapter Studio for drafting and revision workflows
- AI mode controls for drafting, rewriting, plotting, editing, and marketing
- Story Bible for voice, lore, audience, and creative boundaries
- Continuity Watch for contradictions and manuscript risks
- Publishing Pipeline for manuscript, editorial, package, and launch progress
- Launch Assets for blurbs, social hooks, emails, keywords, and retailer copy
- LaTeX Studio for local book typesetting and proof builds
- Unicode Font Studio for OpenType, multilingual, and art-book typography

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- React
- Local AI runtime adapter planned for Ollama, llama.cpp, or vLLM
- PostgreSQL and Qdrant planned for self-hosted storage and retrieval
- TeX Live, MiKTeX, Tectonic, latexmk, XeLaTeX, LuaLaTeX, and pdfLaTeX planned
  for local LaTeX publishing workflows
- Open/OFL font families such as Noto, EB Garamond, Cormorant Garamond,
  Alegreya, Libertinus, and TeX Gyre for default typography

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

The PDF is written to `.latex-build/booksmith-sample.pdf`.
The default build uses XeLaTeX for Unicode and OpenType font support.

## Product Notes

The first screen is intentionally an app workspace rather than a landing page.
Booksmith AI should feel like an operating system for authors: the manuscript,
story bible, editorial logic, publishing package, and launch campaign all share
one source of truth.
