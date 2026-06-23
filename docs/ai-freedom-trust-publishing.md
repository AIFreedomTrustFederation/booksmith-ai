# AI Freedom Trust Publishing

AI Freedom Trust Publishing is the publishing imprint and book-commerce arm for books created, prepared, packaged, or distributed through the AI Freedom Trust Federation ecosystem.

Booksmith AI is the authoring and publishing studio. AI Freedom Trust Publishing is the imprint that appears on finished books, metadata, copyright pages, marketplaces, catalogs, websites, and public-facing launch materials.

## Parent Structure

Recommended public structure:

```text
AI Freedom Trust Federation
├── AI Freedom Trust Publishing
│   ├── AI Freedom Trust Press
│   ├── Booksmith AI
│   ├── Author Services
│   ├── Rights and Licensing
│   ├── Distribution Operations
│   └── Direct Sales and Catalog
├── AIFT Forge
├── DynastyLink
└── Other federation projects
```

### AI Freedom Trust Federation

The parent mission and governance structure. It holds the long-term doctrine, ecosystem principles, federation standards, and sovereign infrastructure vision.

### AI Freedom Trust Publishing

The publishing company or DBA/imprint used for public book metadata, ISBN ownership, marketplace listings, author agreements, publishing packages, and royalty operations.

### AI Freedom Trust Press

Optional trade-facing imprint for polished public releases. Use this when a shorter, traditional publisher name is better for copyright pages, spine branding, and retailer metadata.

### Booksmith AI

The software studio that helps authors write, edit, typeset, package, and launch books. Booksmith should prepare publishing packages for AI Freedom Trust Publishing but should not itself be the legal publisher unless intentionally configured that way.

### Author Services

Editing, layout, cover coordination, metadata, launch copy, audiobook prep, and consulting. These services should be optional and transparent.

### Rights and Licensing

Handles ISBN assignment, copyright-page standards, license records, edition records, translation rights, audiobook rights, print rights, and permissions.

### Distribution Operations

Manages print-on-demand setup, ebook upload, metadata synchronization, price changes, file revisions, proof approvals, and marketplace compliance.

### Direct Sales and Catalog

Maintains the official AI Freedom Trust Publishing catalog and direct-sales pages for signed copies, bundles, PDFs, courses, workbooks, and federation member libraries.

## Brand Lines

Use one consistent brand line per book. Recommended defaults:

```text
Published by AI Freedom Trust Publishing
An AI Freedom Trust Federation imprint
```

or:

```text
AI Freedom Trust Press
A publishing imprint of AI Freedom Trust Federation
```

For Booksmith-created books:

```text
Prepared with Booksmith AI
Published by AI Freedom Trust Publishing
An AI Freedom Trust Federation imprint
```

## Copyright Page Standard

Every book should include a copyright page with:

- Title
- Subtitle, if any
- Author or editor
- Copyright holder
- Publisher/imprint name
- Edition and publication date
- ISBN for each format
- All rights statement or open license statement
- AI assistance/provenance statement when applicable
- Cover/art credits
- Interior design/typesetting credit
- Disclaimer, if needed
- Publisher contact or catalog URL

Recommended default:

```text
Published by AI Freedom Trust Publishing
An AI Freedom Trust Federation imprint

Prepared with Booksmith AI, a local-first authoring and publishing studio.
```

## ISBN Policy

AI Freedom Trust Publishing should own its ISBN block if it wants to appear as the publisher of record in metadata. Avoid free platform ISBNs for flagship titles because they usually identify the platform or platform imprint instead of AI Freedom Trust Publishing.

Each format needs its own ISBN:

- Paperback
- Hardcover
- EPUB
- Audiobook
- Large print edition
- Special edition
- Workbook edition

Booksmith AI should eventually include an ISBN registry table for internal tracking, but the source of truth should remain the publisher's official ISBN records.

## Imprint Metadata Policy

Marketplace metadata should use:

- Publisher: `AI Freedom Trust Publishing`
- Imprint: `AI Freedom Trust Press` when desired
- Contributor: author/editor/illustrator names
- Prepared with: `Booksmith AI` in internal/project metadata, not necessarily retailer metadata unless the author chooses to disclose it publicly

## Legal And Accounting Notes

This repository is not legal or tax advice. Before operating at scale, AI Freedom Trust Federation should consult qualified counsel and accounting support about:

- DBA vs dedicated LLC
- publishing contracts
- author royalty agreements
- tax reporting
- sales tax exposure for direct sales
- copyright registration strategy
- ISBN ownership
- rights reversions
- AI-assisted content disclosures
- privacy and data-handling policies

## Booksmith Product Implications

Booksmith AI should support AI Freedom Trust Publishing by generating a complete publishing packet:

- copyright page
- imprint block
- ISBN assignment notes
- metadata sheet
- BISAC/category candidates
- keywords
- short description
- long description
- author bio
- back cover copy
- launch emails
- social copy
- print-ready PDF
- EPUB
- editable LaTeX source
- cover-spec checklist
- proofing checklist
- distribution checklist
- provenance log

## Federation Alignment

AI Freedom Trust Publishing should not merely sell books. It should publish inspectable knowledge artifacts where authorship, provenance, human approval, rights, editions, and distribution records are clear.

The goal is a sovereign publishing pipeline: local-first creation through Booksmith AI, branded publication through AI Freedom Trust Publishing, global distribution through print-on-demand and ebook marketplaces, and long-term catalog stewardship through the Federation.
