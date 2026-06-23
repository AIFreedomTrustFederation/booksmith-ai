# Booksmith Publishing Packet

The Booksmith Publishing Packet is the standardized export package that turns a manuscript project into a professional publishing-ready title under AI Freedom Trust Publishing.

## Purpose

A publishing packet should collect everything AI Freedom Trust Publishing needs to review, approve, upload, distribute, and steward a book.

It should be generated from project data, not from scattered manual notes.

## Packet Folder Structure

Recommended export shape:

```text
booksmith-publishing-packet/
├── README.md
├── metadata/
│   ├── title-metadata.json
│   ├── marketplace-copy.md
│   ├── categories-and-keywords.md
│   ├── isbn-record.md
│   └── rights-and-license.md
├── manuscript/
│   ├── manuscript.md
│   ├── manuscript.docx
│   └── editorial-notes.md
├── epub/
│   ├── book.epub
│   └── epub-validation.md
├── print/
│   ├── interior-print.pdf
│   ├── latex-source/
│   ├── print-specs.md
│   └── proof-checklist.md
├── cover/
│   ├── ebook-cover.png
│   ├── paperback-cover.pdf
│   ├── hardcover-cover.pdf
│   └── cover-specs.md
├── launch/
│   ├── back-cover-blurb.md
│   ├── short-description.md
│   ├── long-description.md
│   ├── launch-emails.md
│   ├── social-hooks.md
│   └── press-kit.md
├── provenance/
│   ├── ai-assistance-log.md
│   ├── prompt-versions.md
│   ├── source-scope.md
│   └── human-approvals.md
└── distribution/
    ├── upload-checklist.md
    ├── amazon-kdp.md
    ├── ingram-or-wholesale-pod.md
    ├── ebook-aggregator.md
    └── live-listing-verification.md
```

## Metadata Fields

The metadata builder should support:

- title
- subtitle
- series title
- series number
- author name
- editor name
- illustrator name
- publisher
- imprint
- copyright holder
- publication date
- edition
- language
- ISBN by format
- trim size
- page count
- price by territory/format
- BISAC or category candidates
- keywords
- short description
- long description
- author bio
- audience
- age range when applicable
- territory rights
- license statement
- AI assistance/provenance statement

## Publisher Defaults

Default publisher profile:

```text
Publisher: AI Freedom Trust Publishing
Imprint: AI Freedom Trust Press
Parent: AI Freedom Trust Federation
Prepared with: Booksmith AI
```

Default copyright page language:

```text
Published by AI Freedom Trust Publishing
An AI Freedom Trust Federation imprint

Prepared with Booksmith AI, a local-first authoring and publishing studio.
```

## Provenance Requirements

Each AI-assisted generated asset should record:

- source project ID or version
- source chapters/sections used
- prompt template ID
- prompt template version
- model provider
- model name
- generation timestamp
- human reviewer
- approval status
- final edited output path

## Human Approval Statuses

Use clear statuses:

- draft
- generated
- edited
- author-approved
- publisher-approved
- uploaded
- live
- revised
- retired

## Marketplace Copy Outputs

Booksmith should prepare:

- one-line hook
- short description
- long description
- back cover copy
- author bio
- subtitle alternatives
- keyword list
- category candidates
- series copy
- launch email
- social posts
- review request copy
- press/reviewer pitch

## Print Outputs

Booksmith should prepare:

- print-ready PDF
- editable LaTeX source folder
- trim size notes
- margin notes
- font list
- image resolution notes
- cover specs
- barcode/ISBN notes
- proof checklist

## Ebook Outputs

Booksmith should prepare:

- EPUB
- EPUB validation notes
- ebook cover
- table of contents review
- image alt text where applicable
- link check
- accessibility notes

## Distribution Checklists

The packet should include one checklist per channel. Each checklist should be simple enough for a human operator to follow without guessing.

Examples:

- upload account used
- files uploaded
- metadata entered
- categories selected
- price entered
- territories selected
- proof ordered
- proof approved
- live listing verified
- publisher/imprint displayed correctly

## Future Automation

Eventually Booksmith may support direct API integrations where allowed, but the MVP should prioritize reliable export packets that a human can upload manually. Manual-first keeps the workflow inspectable, avoids platform lock-in, and works before every marketplace integration exists.
