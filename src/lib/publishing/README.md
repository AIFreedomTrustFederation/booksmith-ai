# Booksmith Publishing Core

Initial Phase One goal:

```text
books/<slug>/book.config.json
books/<slug>/manuscript/**/*.tex
        ↓
BooksmithManuscript
        ↓
deterministic LaTeX export folder
        ↓
books/<slug>/exports/latex/
```

Rules:

- Server-side only.
- No React UI imports.
- No AI model calls.
- No network calls.
- No fake manuscripts.
- Preserve editable source.
- Emit provenance/manifest files with every export.
