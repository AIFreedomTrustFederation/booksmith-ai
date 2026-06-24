<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Booksmith AI Agent Guide

Booksmith AI is an author-first, local-first, open-source publishing studio and federated library system for AI Freedom Trust Publishing.

## Mandatory Operating Rules

Read `docs/agent-operating-rules.md` before changing anything.

The standing rules are:

1. Work directly on `main` unless the human explicitly asks for a branch or PR.
2. Do not create speculative dead-end branches.
3. Do not use mock books, fake manuscripts, fake projects, fake word counts, fake progress, fake authors, or fictional placeholder data in product UI.
4. Use real registry data, real book configs, real source folders, connected-source status, or honest empty states.
5. Preserve the federated library spine: `library/book-registry.json` and `books/<slug>/book.config.json`.

## Required Reading Before Edits

- `README.md`
- `AGENTS.md`
- `docs/agent-operating-rules.md`
- `library/book-registry.json`
- relevant `books/*/book.config.json`
- the file being edited

## Non-Negotiable Principles

- Author sovereignty comes first.
- Core workflows must be local-first and self-hostable.
- Avoid required paid AI APIs for core features.
- Keep manuscripts private by default.
- Keep prompts, model choices, retrieval settings, templates, exports, citations, and provenance inspectable.
- Prefer open-source and commercially compatible licenses.
- Keep AI calls behind provider interfaces.
- Preserve editable source for Markdown, LaTeX, EPUB, DOCX, metadata, images, and publishing packets.

## Architecture Boundaries

Do not call model runtimes directly from UI components. Use a provider boundary.

Do not shell out to LaTeX directly from manuscript UI components. Emit deterministic project source, then let a renderer/provider build it.

Do not rely on a single model context window as the source of truth. Use structured project data, source files, registries, and local retrieval.

## MVP Build Order

1. Keep `library/book-registry.json` as the root bookshelf source of truth.
2. Ensure every registered book has `books/<slug>/book.config.json`.
3. Ensure every registered book has honest folders or documented source paths.
4. Validate registry integrity before advanced UI.
5. Convert UI to read registry/config/source data instead of hardcoded fake projects.
6. Add local create/open/save flows.
7. Add chapter, Story Bible, continuity, export, LaTeX, EPUB, launch, and provenance workflows.

## Coding Rules

- Use TypeScript intentionally.
- Keep UI components small.
- Prefer accessible, semantic HTML.
- Do not introduce network calls for core manuscript workflows unless explicitly configured.
- Do not commit secrets, API keys, private manuscripts, proprietary fonts, model weights, or inappropriate generated artifacts.
- Update docs when changing architecture, scripts, dependencies, exports, registry behavior, or setup.

## Validation

For app changes, run when possible:

```bash
npm install
npm run lint
npm run build
```

For library/book registry changes, run when available:

```bash
npm run validate:library
```

If validation cannot run in the current environment, state that clearly.

## AIFT Alignment

The goal is not merely to generate text. The goal is trustworthy authorship infrastructure where human judgment, provenance, creative boundaries, local AI, reproducible publishing, and federation readiness work together.
