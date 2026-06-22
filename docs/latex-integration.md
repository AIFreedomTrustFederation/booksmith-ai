# LaTeX Integration

Booksmith AI should treat LaTeX as a first-class publishing system, not a final
export afterthought. The goal is to let authors produce beautiful, reproducible
books with local open-source typesetting tools.

## Product Goal

Authors should be able to write in Booksmith, manage structure and metadata in
the app, then build polished LaTeX output for print, PDF review, academic work,
technical books, fiction, poetry, illustrated books, and premium editions.

## Core Principles

- LaTeX output must be editable by advanced users.
- Generated LaTeX must be clean, readable, and deterministic.
- The app should support both friendly controls and raw LaTeX escape hatches.
- The build pipeline must run locally or on self-hosted infrastructure.
- Engine, template, package, bibliography, glossary, and index choices must be
  visible to the author.
- Unicode, OpenType fonts, and art-book image layouts must be first-class
  settings rather than hidden template hacks.

## Supported Local Tooling

Recommended engines and tools:

- TeX Live for broad cross-platform TeX coverage
- MiKTeX as a supported Windows distribution
- Tectonic for modern reproducible builds
- latexmk for automated multi-pass builds
- XeLaTeX and LuaLaTeX for modern font workflows
- pdfLaTeX for simple portable projects
- BibLaTeX/Biber and BibTeX for citations
- MakeIndex and xindy for indexes
- Pandoc as an optional document conversion bridge

## Booksmith LaTeX Studio

The app should include a dedicated LaTeX Studio with:

- Engine selector: `pdflatex`, `xelatex`, `lualatex`, `tectonic`
- Build profile selector: draft, proof, print, hardcover, paperback, ebook PDF
- Template selector: novel, nonfiction, academic, poetry, workbook, technical
- Paper and trim controls: 5x8, 5.5x8.5, 6x9, A5, custom
- Typography controls: font family, leading, margins, headers, drop caps
- Font profile controls: text, display, sans, mono, math, and CJK fallback fonts
- Unicode proofing: missing glyph checks and multilingual preview text
- Chapter styling controls: part pages, openers, ornaments, running heads
- Front matter builder: title page, copyright, dedication, epigraph, TOC
- Back matter builder: acknowledgments, author bio, bibliography, index
- Bibliography manager: BibTeX, BibLaTeX, CSL import/export
- Glossary and index manager
- Equation and symbol support
- Figure, table, caption, and cross-reference manager
- Full-page art plates, image spreads, and captioned gallery layouts
- Raw LaTeX block support for power users
- Package manager for project-level LaTeX packages
- Build logs with friendly error explanations
- PDF preview and page proofing
- Diff view for generated `.tex` files

## Data Flow

1. The manuscript remains structured inside Booksmith.
2. Chapters, scenes, notes, metadata, citations, figures, and index terms are
   normalized into an internal book model.
3. A deterministic renderer emits a LaTeX project folder.
4. The selected local engine compiles the project.
5. Build logs are parsed into actionable messages.
6. The final PDF and generated source remain available to the author.

## Internal Architecture

Use a dedicated renderer boundary:

```ts
interface TypesetProvider {
  id: string;
  label: string;
  detect(): Promise<TypesetAvailability>;
  build(projectPath: string, options: TypesetOptions): Promise<TypesetResult>;
}
```

Planned providers:

- `LatexmkProvider`
- `PdfLatexProvider`
- `XeLatexProvider`
- `LuaLatexProvider`
- `TectonicProvider`

The manuscript renderer should not call shell commands directly. It should emit
source files, then let a provider perform the build.

## Template System

Templates should be source-controlled and user-copyable. A template should
include:

- `main.tex`
- `metadata.tex`
- `chapters/`
- optional `assets/`
- optional `assets/art/`
- optional `assets/fonts/`
- optional `bibliography.bib`
- optional `booksmith.sty` or class file
- `README.md`

Booksmith should support project-level overrides without modifying the base
template. This lets authors update Booksmith while keeping custom typography.

## AI-Assisted LaTeX Features

Local AI should help with LaTeX without hiding the source:

- Explain compiler errors in plain language
- Suggest package fixes
- Suggest font pairings and OpenType settings for genre and trim size
- Detect missing glyphs and font fallback risks
- Convert messy manuscript structure into clean LaTeX
- Generate front matter and copyright pages
- Propose typography settings for genre and trim size
- Detect overfull boxes and suggest wording or layout fixes
- Build index term candidates from the manuscript
- Generate figure captions and cross-reference labels
- Generate art prompts, image captions, and image credit pages
- Check that chapter titles, TOC, headers, and metadata agree

## MVP Build Order

1. Add a source-controlled sample book template.
2. Add a local build script that prefers `latexmk`.
3. Add UI cards for LaTeX Studio and publishing checks.
4. Add a renderer that exports project metadata and chapters to `.tex`.
5. Add Unicode font profiles with XeLaTeX/LuaLaTeX builds.
6. Add art plate helpers and image asset folders.
7. Add build log parsing for common errors.
8. Add PDF preview in the app.
9. Add template customization and project overrides.

## License Notes

LaTeX is free software under LPPL. TeX Live includes major free TeX programs,
packages, and fonts. Tectonic is MIT licensed, while latexmk and Pandoc are GPL.
If Booksmith distributes third-party binaries later, their license obligations
must be reviewed before bundling. The safer default is to detect installed local
tools and call them as external programs.
