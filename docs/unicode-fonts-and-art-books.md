# Unicode Fonts And Art Books

Booksmith AI should support visually rich books through Unicode-first LaTeX,
OpenType typography, and image-heavy art layouts.

## Product Goal

Authors should be able to create literary books, multilingual editions,
technical books, poetry collections, graphic novels, art books, and AI-generated
visual books from one source-controlled LaTeX project.

## Engine Rule

Use XeLaTeX or LuaLaTeX for modern book production. These engines support
`fontspec`, OpenType fonts, Unicode text, advanced font features, and better
multilingual workflows than pdfLaTeX.

pdfLaTeX can remain as a compatibility option, but it is not the default for
Booksmith's premium typography and art-book pipeline.

## Default Open Font Families

Booksmith should prefer open fonts with licenses that allow print, digital, and
commercial book use.

Recommended default families:

- Noto Serif and Noto Sans for broad Unicode coverage
- Noto Serif CJK and Noto Sans CJK for Chinese, Japanese, and Korean workflows
- EB Garamond for literary books
- Cormorant Garamond for display-heavy art books
- Alegreya and Alegreya Sans for humanist book design
- Libertinus for text, math, and scholarly books
- TeX Gyre as a reliable TeX-native fallback family

Each font profile should expose:

- main text font
- display font
- sans font
- mono font
- math font
- CJK fallback font
- numeral style
- ligature settings
- small caps availability

## Custom Font Workflow

Authors should be able to:

- choose installed system fonts
- add project-specific font files under `assets/fonts/`
- preview font pairings before compiling
- see whether a selected font is redistributable
- export a package that includes only fonts the license allows
- keep proprietary fonts out of public repos by default

## Art Book Workflow

Art-heavy books need more than normal manuscript export. Booksmith should support:

- full-page image plates
- image spreads
- captioned gallery pages
- section opener art
- image credits and license metadata
- bleed, trim, and safe-area guides
- color profile notes
- alt text and accessibility metadata
- low-resolution proof builds and high-resolution print builds

## LaTeX Features To Support

- `fontspec` for OpenType font selection
- `unicode-math` for math fonts where needed
- `graphicx` for image placement
- `xcolor` for palettes and branded book themes
- `microtype` for professional spacing where supported
- reusable macros for art plates, captions, and image spreads

## AI-Assisted Features

Local AI can help without taking away source control:

- suggest font pairings by genre and trim size
- detect missing glyphs before compile
- explain fontspec and OpenType errors
- generate art prompts connected to chapter themes
- write image captions and image credit pages
- check whether image dimensions are high enough for print
- recommend full-bleed, margin-safe, or captioned layouts per image
- build visual style guides for a whole series

## Template Status

The sample template at `templates/latex/booksmith-book` now uses:

- XeLaTeX by default through `npm run latex:sample`
- `booksmith-fonts.tex` for font profiles
- `booksmith-art.tex` for art plate helpers
- Unicode proof text in the sample chapter
- `assets/art/` and `assets/fonts/` folders for project assets

## License Guardrails

Open-source software is not enough; font licenses matter separately. Booksmith
should default to OFL/open fonts and mark custom fonts as user-managed unless
their redistribution rights are known.
