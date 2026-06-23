# FHQCM Image Asset Pipeline

This folder is the canonical home for all FHQCM image assets used by the manuscript, web preview, publishing packet, and future Booksmith visual workflows.

## Folder Structure

```text
assets/images/
├── source/        # Editable source files: SVG, layered files, diagram source
├── generated/     # AI-generated or tool-generated working images
├── print/         # 300 DPI or vector print-ready exports
├── web/           # Web-optimized PNG/WebP/JPEG exports
├── thumbnails/    # Small preview images for dashboards and catalogs
├── manifest/      # Image manifest, placement map, naming rules
└── latex/         # LaTeX include snippets and figure macros
```

## Naming Convention

Every image file must start with its figure ID.

```text
F001-fhqcm-overview.svg
F001-fhqcm-overview-print.png
F001-fhqcm-overview-web.webp
F001-fhqcm-overview-thumb.jpg
```

Use lowercase words separated by hyphens after the figure ID.

## Required Asset Set Per Figure

Each approved figure should eventually have:

- `source/F###-short-title.svg` or equivalent editable source
- `print/F###-short-title-print.png` or print-ready PDF/vector export
- `web/F###-short-title-web.webp` or optimized PNG/JPEG
- `thumbnails/F###-short-title-thumb.jpg`
- manifest entry in `manifest/image-manifest.md`
- placement entry in `manifest/section-placement-map.md`
- LaTeX snippet in `latex/figure-includes.tex`

## Rule

Do not reference image files directly from manuscript chapters unless the image exists in this asset pipeline or is explicitly marked as a placeholder.
