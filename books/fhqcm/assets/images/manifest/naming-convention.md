# FHQCM Image Naming Convention

## Canonical Pattern

```text
F###-short-title.ext
F###-short-title-print.ext
F###-short-title-web.ext
F###-short-title-thumb.ext
```

Examples:

```text
F001-fhqcm-overview.svg
F001-fhqcm-overview-print.png
F001-fhqcm-overview-web.webp
F001-fhqcm-overview-thumb.jpg
```

## Folder Rules

- `source/`: editable SVG/vector/source files.
- `generated/`: generated drafts and experiments.
- `print/`: final print assets.
- `web/`: web-optimized images.
- `thumbnails/`: small previews.
- `manifest/`: registry and placement maps.
- `latex/`: figure include macros and LaTeX snippets.

## Slug Rules

- lowercase letters only
- words separated by hyphens
- no spaces
- no punctuation except hyphens
- keep the registry slug stable once assigned

## Manuscript Rule

Manuscript files should not hardcode arbitrary image paths. Use the paths defined in `image-manifest.md` and the macros in `latex/figure-includes.tex`.
