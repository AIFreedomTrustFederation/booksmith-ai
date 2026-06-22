# Booksmith LaTeX Book Template

This template is the first source-controlled LaTeX book target for Booksmith AI.
It is designed to be readable, editable, and suitable for future app-generated
output.

## Files

- `main.tex` controls document structure and typography.
- `metadata.tex` stores title, author, copyright, and edition metadata.
- `booksmith-fonts.tex` defines Unicode/OpenType font profiles.
- `booksmith-art.tex` defines reusable art plate helpers.
- `chapters/01-opening.tex` is a sample chapter.
- `assets/art/` stores generated or commissioned book art.
- `assets/fonts/` stores project-specific open fonts when needed.

## Build

From the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build-latex.ps1
```

The generated PDF is written to `.latex-build/booksmith-sample.pdf`.

## Design Direction

The template uses standard LaTeX packages that are widely available in TeX Live
and MiKTeX. The default build uses XeLaTeX so authors can use Unicode,
OpenType font features, multilingual text, and beautiful installed fonts through
`fontspec`.

Booksmith should later generate clean project folders following this same shape,
then let authors customize or replace the template.
