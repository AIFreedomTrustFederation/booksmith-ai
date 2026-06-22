# Open Source Strategy

Booksmith AI should be local-first and self-hostable. The product must not rely
on paid AI APIs, proprietary hosted services, vendor rate limits, or closed
creative tooling for core functionality.

## Product Rule

Every core feature must work with open-source or open-weight components that can
run locally or on user-controlled infrastructure.

Core features include:

- Drafting and rewriting assistance
- Story Bible extraction and search
- Voice analysis
- Continuity checks
- Manuscript editing workflows
- Export and formatting
- Publishing metadata preparation
- Launch asset generation

Hosted services may be optional deployment choices later, but they cannot be
required for the default product experience.

## Recommended Architecture

### App

- Next.js, React, TypeScript, and Tailwind CSS for the web app
- Local development with npm scripts
- Docker Compose later for one-command self-hosting

### Editor

- Tiptap or ProseMirror for the manuscript editor
- Yjs for optional collaborative editing
- Markdown, HTML, DOCX, EPUB, and PDF export paths

### AI Runtime

Use a pluggable local model adapter so Booksmith can support different hardware:

- Ollama for the easiest desktop/local model setup
- llama.cpp for efficient local CPU/GPU inference
- vLLM for high-throughput self-hosted GPU inference

The app should talk to an internal `ModelProvider` interface instead of coding
against one runtime directly.

### Models

Use models only after checking the license for the exact model and weight file.
Good candidate families to evaluate:

- Qwen open-weight models with Apache 2.0 licensing
- Mistral 7B models released under Apache 2.0
- Phi models released under MIT licensing
- Nomic Embed Text for local embeddings under Apache 2.0

Avoid models with unclear, non-commercial, field-of-use, or redistribution
restrictions unless the app clearly marks them as optional user-installed
models.

### Storage

- PostgreSQL for projects, chapters, story bible records, settings, and assets
- Local filesystem or self-hosted object storage for manuscript exports
- Qdrant for vector search over manuscript passages, story bible facts, and
  style samples

### Publishing

- Generate EPUB with open-source libraries
- Generate print-ready PDF with open-source libraries
- Validate metadata and export packages before users upload to retailers
- Do not depend on retailer APIs for the MVP

## Feature Ideas That Fit This Strategy

### Local AI Control Panel

Let users choose a local model, see memory requirements, run a test prompt, and
set model roles such as drafting, editing, continuity, and marketing.

### Private Manuscript Vault

Make privacy a headline feature: manuscripts do not leave the user's machine or
self-hosted server unless the user explicitly exports or shares them.

### License-Aware Model Browser

Show only models that pass the project's license rules by default. Each model
entry should display license, size, hardware needs, strengths, and whether it is
approved for commercial author workflows.

### Offline Writing Mode

Allow authors to write, edit, search their story bible, and run local AI without
internet access.

### Bring Your Own Model

Advanced users can connect any local OpenAI-compatible endpoint, Ollama model,
llama.cpp server, or vLLM server. The app should label unverified models as
user-managed.

### Reproducible Book Pipeline

Exports should be generated from project data through deterministic templates so
the same manuscript creates the same EPUB, PDF, metadata sheet, and launch kit.

## Non-Goals

- No required OpenAI, Anthropic, Google, Meta hosted API, or other paid AI API
- No required hosted vector database
- No required proprietary cloud editor
- No hard dependency on SaaS authentication for local use
- No model whose license prevents commercial author use in the default setup

## Engineering Guardrails

- Add new dependencies only when their license is compatible with commercial use
  and redistribution.
- Prefer MIT, Apache 2.0, BSD, ISC, and PostgreSQL-style licenses.
- Record major runtime/model choices in this document before implementation.
- Keep AI calls behind internal interfaces so the app can change local runtimes
  without rewriting product features.
- Treat prompts, model selection, retrieval, and export templates as versioned
  product assets.
