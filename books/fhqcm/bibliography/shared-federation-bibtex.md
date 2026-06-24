# FHQCM Shared Federation BibTeX Wiring

The FHQCM manuscript is wired to use both its book-local bibliography and the shared federation reference library.

## Manuscript Entry Point

`books/fhqcm/manuscript/main.tex`

## Local Bibliography

```latex
../bibliography/references
```

## Shared Federation Bibliographies

From `books/fhqcm/manuscript`, the shared library is reached with `../../../library/references/`.

The manuscript currently calls:

```latex
\bibliography{../bibliography/references,../../../library/references/federation-canon,../../../library/references/physics,../../../library/references/mathematics,../../../library/references/biology,../../../library/references/consciousness,../../../library/references/philosophy,../../../library/references/theology,../../../library/references/ai,../../../library/references/sociology,../../../library/references/civilization}
```

## Compile Pattern

From `books/fhqcm/manuscript`:

```bash
xelatex main.tex
bibtex main
xelatex main.tex
xelatex main.tex
```

## Citation Rule

Book-specific citations can remain in `books/fhqcm/bibliography/references.bib`.

Shared canon citations should go into the appropriate file under `library/references/` so other books can reuse them.

## Future Upgrade

The current manuscript uses classic BibTeX. A later publishing pass may migrate the federation library to `biblatex` and `biber` for stronger Unicode, source categories, and multi-bibliography support.
