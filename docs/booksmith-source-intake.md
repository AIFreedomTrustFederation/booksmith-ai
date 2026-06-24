# Booksmith Source Intake

Booksmith AI should ingest real sources only. Do not invent manuscripts, projects, authors, progress, citations, or launch assets.

## Accepted real source types

- GitHub repository files
- Markdown manuscripts
- LaTeX manuscripts
- Google Docs exports
- DOCX source manuscripts
- PDF source packets with provenance notes
- bibliography files
- image or cover assets with rights notes
- author-approved notes, outlines, transcripts, or whitepapers

## Intake record

Every source packet should eventually record:

```json
{
  "sourceId": "stable-source-id",
  "bookSlug": "registered-book-slug",
  "sourceType": "github|drive|local|docx|pdf|markdown|latex|other",
  "location": "path-or-connector-reference",
  "owner": "human-or-organization",
  "rightsStatus": "owned|licensed|public-domain|fair-use-review|unknown",
  "importedAt": "YYYY-MM-DD",
  "approvedBy": "human-approver",
  "notes": "short provenance note"
}
```

## Empty state rule

If a book has no manuscript yet, show an honest empty state:

```text
No manuscript source connected yet. Import a real source packet, connect a repository, or create an author-approved starter document.
```

Do not replace this with fake chapters or fictional samples.

## Folder rule

Each registered book may use:

```text
books/<slug>/manuscript/   approved manuscript source
books/<slug>/sources/      source packets and provenance notes
books/<slug>/assets/       images, covers, figures, rights notes
books/<slug>/latex/        book-specific LaTeX project files
books/<slug>/exports/      generated exports when intentionally tracked
```

Generated exports should normally be ignored or externalized unless the file is a deliberate source-controlled proof or release artifact.

## Validation

Run:

```bash
npm run ensure:book-folders
npm run validate:library
```
