# Federation Canon Reference Library

This directory is the shared citation source for every Booksmith AI book.

The goal is to avoid recreating references for each manuscript. Every book can import the same canonical BibTeX files, then optionally add a small book-specific `.bib` file for references unique to that book.

## Recommended LaTeX Import Pattern

From a book-level LaTeX project, import the shared references first:

```latex
\addbibresource{../../library/references/federation-canon.bib}
\addbibresource{../../library/references/physics.bib}
\addbibresource{../../library/references/mathematics.bib}
\addbibresource{../../library/references/biology.bib}
\addbibresource{../../library/references/consciousness.bib}
\addbibresource{../../library/references/philosophy.bib}
\addbibresource{../../library/references/theology.bib}
\addbibresource{../../library/references/process-theology.bib}
\addbibresource{../../library/references/patristics.bib}
\addbibresource{../../library/references/universal-reconciliation.bib}
\addbibresource{../../library/references/ai.bib}
\addbibresource{../../library/references/open-source-ai.bib}
\addbibresource{../../library/references/systems-cybernetics.bib}
\addbibresource{../../library/references/sociology.bib}
\addbibresource{../../library/references/indigenous-red-road.bib}
\addbibresource{../../library/references/civilization.bib}
```

Then add book-specific references when needed:

```latex
\addbibresource{../references.bib}
```

## Reference Layers

1. `federation-canon.bib` — core thinkers and works that recur across the canon.
2. Subject files — discipline-specific references used by many books.
3. Book-specific references — sources unique to one manuscript.

## Production Foundation Status

This is the real production foundation for the Federation Library, not a throwaway draft. The entries are intended to seed the canon and make the books buildable as a unified library. Every entry should still receive normal publishing-quality bibliographic verification before print release.

## Legal and Regulated Domains

Trust law, securities, insurance, tax, medical, and jurisdiction-specific sources require separate specialist review before they become canon references. Add them only after verifying editions, jurisdiction, date, and professional-use boundaries.

## Key Naming Rule

Use stable citation keys in the pattern:

```text
authorYYYYShortTitle
```

Examples:

```text
jung1960Synchronicity
whitehead1929Process
bohm1980Wholeness
ostrom1990Governing
```

## Quality Passes Still Required

This is a production seed reference library. Before print publication, every entry should receive a bibliography quality pass for edition, publisher, translator, DOI/URL, date, and citation style consistency.
