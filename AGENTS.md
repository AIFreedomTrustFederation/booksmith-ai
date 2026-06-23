<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Booksmith AI Agent Guide

Booksmith AI is an author-first writing, editing, publishing, and launch studio for sovereign creative work. Every agent, contributor, and automation should strengthen author control, local-first operation, reproducibility, inspectability, privacy, and open-source readiness.

## Mission

Build Booksmith AI into a self-hostable creative foundry where writers can draft, revise, typeset, package, and launch books without surrendering their manuscripts to proprietary platforms or required paid AI APIs.

The product should feel like an operating system for authors: manuscript, story bible, continuity logic, editorial workflow, publishing package, launch campaign, typography, and proof builds all share one source of truth.

## Non-Negotiable Product Principles

1. Author sovereignty comes first. The human author owns the manuscript, creative direction, approval workflow, exports, and final decisions.
2. Core features must be local-first and self-hostable. Hosted services may be optional later, but cannot be required for the default experience.
3. Avoid required paid AI APIs, proprietary hosted services, closed creative tooling, hosted vector databases, or SaaS-only authentication for core workflows.
4. Keep manuscripts private by default. No manuscript text should leave the user's machine or self-hosted server unless explicitly configured by the user.
5. Treat prompts, model choices, retrieval settings, typography templates, export pipelines, and launch templates as versioned product assets.
6. Prefer open-source and commercially compatible licenses: MIT, Apache 2.0, BSD, ISC, PostgreSQL-style, and SIL Open Font License for bundled fonts.
7. Do not introduce dependencies, models, fonts, or binaries with unclear, non-commercial, field-of-use, or redistribution restrictions into the default setup.
8. Keep AI calls behind internal interfaces so Ollama, llama.cpp, vLLM, OpenAI-compatible local endpoints, and future providers can be swapped without rewriting product features.
9. Generated outputs should be inspectable and reproducible. Authors should be able to see source files, prompts, citations, build logs, and version history.
10. Do not hide LaTeX, EPUB, DOCX, Markdown, metadata, or image assets behind opaque exports. Advanced users should be able to inspect and edit generated source.

## Repository Orientation

Before changing code, read:

- `README.md`
- `docs/open-source-strategy.md`
- `docs/latex-integration.md`
- `docs/unicode-fonts-and-art-books.md`
- `package.json`
- Existing source files under `src/`
- Existing templates under `templates/`

When working in a cloned checkout, also inspect:

- `git status`
- current branch name
- recent commits relevant to the task
- local build or lint output when available

## Current Technical Direction

- App framework: Next.js App Router, React, TypeScript, Tailwind CSS.
- Local AI targets: Ollama, llama.cpp, vLLM, and OpenAI-compatible local endpoints.
- Storage targets: PostgreSQL for structured project data, Qdrant for local retrieval, local filesystem or self-hosted object storage for assets and exports.
- Publishing targets: Markdown, HTML, DOCX, EPUB, LaTeX project export, and PDF proof builds.
- Typesetting targets: TeX Live, MiKTeX, Tectonic, latexmk, XeLaTeX, LuaLaTeX, and pdfLaTeX.
- Font direction: open/OFL fonts such as Noto, EB Garamond, Cormorant Garamond, Alegreya, Libertinus, and TeX Gyre.

## Architecture Boundaries To Preserve

### AI Runtime

Do not call any model runtime directly from UI components. Introduce or use an internal provider boundary such as:

```ts
interface ModelProvider {
  id: string;
  label: string;
  detect(): Promise<ModelAvailability>;
  generate(request: ModelRequest): Promise<ModelResult>;
}
```

Provider implementations may include Ollama, llama.cpp, vLLM, or user-managed OpenAI-compatible endpoints. Keep provider selection and runtime configuration explicit.

### Retrieval And Memory

Story Bible, continuity checks, voice analysis, and manuscript search should use structured project data plus local retrieval. Do not rely on a single model context window as the source of truth.

### Publishing And Typesetting

Do not shell out to LaTeX directly from manuscript UI components. Keep a renderer/provider boundary like the planned `TypesetProvider`. The manuscript model should emit deterministic project source, then a provider should build it.

### Exports

Every export should be reproducible from project data and templates. Preserve editable source whenever possible.

## MVP Build Order

Prefer work that moves the project from mock workspace to usable local product:

1. Define core domain models for projects, chapters, manuscript sections, story bible facts, creative boundaries, continuity notes, assets, exports, and launch assets.
2. Add a local project data layer with simple filesystem or SQLite/dev storage before heavier production storage.
3. Convert the current static workspace into components fed by typed sample data.
4. Add create/open/save project flows.
5. Add a basic chapter editor and revision note workflow.
6. Add Story Bible CRUD and continuity note CRUD.
7. Add a `ModelProvider` interface and an Ollama proof-of-concept adapter.
8. Add prompt templates as versioned files, not hidden strings scattered through components.
9. Add deterministic Markdown export.
10. Add LaTeX project export from the internal book model.
11. Add local LaTeX detection and sample PDF build integration.
12. Add EPUB export and package validation.
13. Add launch asset generation from manuscript metadata and approved creative source.
14. Add provenance logs for AI-assisted outputs.
15. Add tests, CI, and documented local setup.

## Coding Rules

- Use TypeScript types intentionally. Avoid `any` unless the boundary is genuinely unknown and documented.
- Keep UI components clean and small. Move domain logic, providers, renderers, and sample data out of page components.
- Prefer accessible, semantic HTML.
- Avoid hardcoding real author data into examples. Use clearly fictional sample projects.
- Keep styling consistent with the existing calm, editorial workspace aesthetic unless a design task says otherwise.
- Do not introduce network calls for core manuscript workflows unless explicitly user-configured.
- Do not commit secrets, API keys, tokens, private manuscripts, or generated build artifacts that do not belong in source control.
- Do not vendor proprietary fonts or model weights.
- Update docs when changing architecture, scripts, dependencies, export behavior, or setup steps.

## Validation Expectations

For code changes, run what is reasonable for the change:

```bash
npm install
npm run lint
npm run build
```

For LaTeX-related changes, also verify the documented sample build when the local toolchain is available:

```powershell
npm run latex:sample
npm run latex:sample:lua
```

If a command cannot be run because the environment lacks Node, TeX, PowerShell, or system packages, state that clearly in the PR or change summary.

## Documentation Rules

Documentation should be direct, practical, and implementation-facing. When adding a new system, include:

- purpose
- user value
- local-first/privacy implications
- dependency and license notes
- data flow
- failure modes
- validation steps
- future extension points

## GitHub Issue And PR Guidance

Good issues should include:

- user story
- scope
- acceptance criteria
- architecture notes
- privacy/local-first notes
- test or validation plan

Good pull requests should include:

- summary
- changed files
- screenshots for UI changes when possible
- validation commands run
- known limitations
- follow-up issues

## AIFT Alignment

Booksmith AI belongs inside the AI Freedom Trust Federation ecosystem as a sovereign knowledge-production tool. It should help people create books, guides, doctrine, manuals, research packets, memoirs, curricula, and launch assets while preserving agency, privacy, auditability, and federation readiness.

The goal is not merely to generate text. The goal is to build trustworthy authorship infrastructure where human judgment, provenance, creative boundaries, local AI, and reproducible publishing work together.
