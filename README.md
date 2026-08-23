# Booksmith AI — Author-First Manuscript and Publishing Studio

**The sovereign authoring application of the AI Freedom Trust Federation: living manuscripts, governed AI, federated research memory, citations, provenance, figures, proofing, publishing packets, and release preparation in one local-first workspace.**

| Federation metadata | Value |
| --- | --- |
| Layer | `publishing` |
| Role | author-first writing, research, editing, proofing, publishing, and launch studio |
| Workspace | `AIFT/booksmith-ai` |
| Control plane | AIFT workspace / AIFT-OS |
| Application stack | Next.js, TypeScript, React, Tailwind, Booksmith Runtime, SQLite/FTS5, local AI and publishing adapters |
| Public surface | static GitHub Pages portal and read-only Studio |
| Private surface | local/private Booksmith App with governed Runtime powers |
| Operating standards | local-first, inspectable, sovereign by default, AI behind governed provider interfaces |

Booksmith AI exists so an author can use powerful machine intelligence without surrendering authorship to it. Its source of truth is the human work: manuscripts, approved canon, sources, citations, book metadata, visual assets, and explicit editorial choices. AI can carry a great deal of labor around that center—structure, continuity, revision proposals, research retrieval, claim tracking, indexing, citations, metadata, typesetting, proof analysis, figure preparation, and launch assets—but it does not become the hidden author of an approved work.

The deeper covenant is carried in the [One Eternal Scroll of ALO'ha](https://aifreedomtrustfederation.github.io/AI-Freedom-Trust/docs/pdf/one-eternal-scroll-of-aloha.pdf). The shared operational rule is [SOP-ALOHA-001](https://github.com/AIFreedomTrustFederation/AI-Freedom-Trust/blob/main/SOP-ALOHA-001.md).

---

## Book I — Author Sovereignty and the Living Manuscript

Booksmith begins from a simple rule: **human canon remains authoritative**. User-authored or explicitly approved text is not merely another model input to be silently optimized. It is part of the work's identity. AI-generated language may be useful, beautiful, or structurally superior, but it remains a proposal until it enters the author-governed manuscript through an intentional editorial act.

The Living Manuscript Studio therefore distinguishes four states that ordinary chat-based writing tools often blur together: repository canon, browser-local working drafts, AI or editorial proposals, and source material. A chapter can be written privately in the browser, compared against the current canonical file, reviewed as a diff, and accepted into canon only through an explicit author action. The Runtime performs an optimistic hash check before writing, uses an atomic file replacement, records provenance, and may create a local Git commit when the author asks for one.

This makes the manuscript a living trust rather than a disposable prompt history. Chapters, claims, sources, concepts, citations, figures, publishing metadata, revisions, and model-assisted proposals remain related across the life of a book without forcing workshop commentary into the finished prose.

### Illuminated passage — memory with lineage

![Circleunchain Memory Network](https://raw.githubusercontent.com/AIFreedomTrustFederation/AI-Freedom-Trust/main/docs/images/aetherion/circleunchain-memory-network.png)

For Booksmith, the memory network represents provenance and recoverable context. A sentence should be able to remain connected to its authorial status, source, claim, citation, revision, and publication history while the book itself still reads as a natural work rather than an editorial log.

---

## Book II — The Application and Its Living Memory

Booksmith is one product with two deliberately different execution modes. The public GitHub Pages build is a static, read-only portal over the real library. The local/private Booksmith App uses the same Studio interface but connects to **Booksmith Runtime v1**, a loopback-first execution layer that owns canonical filesystem writes, SQLite memory, governed model calls, Git status and commits, source ingestion, proof engines, figure pipelines, and publishing jobs.

```text
Public Booksmith Portal                 Local / Private Booksmith App
        │                                          │
        └──────────── same Studio UI ──────────────┘
                                                   │
                                         Booksmith Runtime
                                                   │
                 ┌──────────────┬──────────────────┼───────────────┬──────────────┐
                 │              │                  │               │              │
             Manuscripts     SQLite Memory     AI Providers    Production       Git
                 │              │                  │               │              │
                 └──────────────┴──────────────────┴───────────────┴──────────────┘
                                                   │
                                          sovereign book files
```

The Runtime builds `.booksmith/booksmith.db` from the canonical books and federation registries using SQLite and FTS5. The database accelerates full-text retrieval and projects relationships among books, documents, concepts, references, and thinkers, but it never replaces the repository. Delete the database and Booksmith can rebuild it from the books.

The Library is therefore both memory and intake. Authors can bring Markdown, text, LaTeX, BibTeX, RIS, JSON/CSL, HTML, PDF, DOCX, EPUB, HTTPS research pages, or direct research notes into a selected book. Originals are preserved. Text formats are indexed directly; PDF uses local `pdftotext` when available; DOCX and EPUB use local `pandoc` when available. If an extractor is missing, Booksmith preserves the original and says extraction is still required rather than inventing content. Source rights, provenance, registry state, and the rebuilt memory index remain inspectable.

The Book Memory Graph makes those relationships visible without becoming a competing source of truth. The graph is simply a projection of structured Booksmith state:

```text
Book ↔ Documents ↔ Concepts ↔ References ↔ Thinkers
```

---

## Book III — Intelligence, Consent, and Production

The shared ALO'ha loop becomes the application lifecycle:

```text
Receive → Inspect → Name → Propose → Consent → Act → Verify → Record → Return
```

**Receive** preserves the author's manuscript, research source, citation, figure, or instruction. **Inspect** retrieves the relevant chapter, claims, concepts, prior passages, source records, and publication state. **Name** keeps canon, working draft, evidence, interpretation, source quotation, AI proposal, figure specification, and release metadata distinct. **Propose** calls the governed provider layer without granting the model write authority. **Consent** is the author's explicit acceptance of a manuscript diff, figure decision, rights decision, or publication action. **Act** performs the approved write or production job. **Verify** checks library integrity, citations, references, figures, typesetting, proof state, and release gates. **Record** preserves provenance and version history. **Return** gives the author the manuscript, proof, research connection, or publishing artifact they actually asked for.

Booksmith Intelligence now operates through the existing provider abstraction rather than direct model calls from the browser. Ollama, llama.cpp, and vLLM can be enabled as user-managed local or self-hosted OpenAI-compatible providers. The Studio sends chapter-aware context to the Runtime and receives model output into **Proposal Staging**. A proposal can replace or append to the working draft, but it still must pass through the normal diff-and-consent path before it can become canon.

Production uses the engines already carried by this repository. The Studio and Runtime can launch allowlisted jobs for library validation, system health, proof generation, visual proof inspection, figure preparation, publication gates, publishing packets, and managed publication. Job state and logs are persisted locally. Publication is treated as consequential and requires a separate explicit confirmation instead of being hidden behind an ordinary button.

A canonical manuscript save may create a local Git commit when requested, but Booksmith does not silently push to a remote. Remote synchronization remains an explicit human-controlled operation.

### Run the complete application

```bash
npm install
npm run server
```

The default local surfaces are:

```text
Booksmith App      http://localhost:3000
Studio             http://localhost:3000/studio
Runtime Center     http://localhost:3000/studio/runtime
Runtime API        http://127.0.0.1:8787
```

The Runtime stays on loopback by default. Binding it to a LAN address requires `BOOKSMITH_RUNTIME_TOKEN`; allowed browser origins can be declared through `BOOKSMITH_ALLOWED_ORIGINS`. The Runtime exposes narrow manuscript, AI, source, index, Git, job, and provenance routes rather than a generic shell or arbitrary filesystem API.

The same Studio is also an installable Progressive Web App through `manifest.webmanifest` and the Booksmith service worker. Previously visited application surfaces and static assets can remain available offline; canonical writes and model execution still require the private Runtime process.

See [`docs/booksmith-app-runtime-v1.md`](docs/booksmith-app-runtime-v1.md) for the complete Runtime, security, ingestion, indexing, and application contract.

---

## Book IV — From Manuscript to Inheritance

This repository owns the **authoring and production studio**, not the entire publishing federation. Its active architecture includes `books/` for sovereign book projects, `library/` for shared registries and semantic memory, `templates/book/` for reusable structure, `docs/` for product and publishing contracts, the Living Manuscript and Claim Ledger for authorship discipline, the Runtime for private execution, SQLite for disposable retrieval state, and the existing LaTeX/proof/publishing engines for reproducible release artifacts.

Its relationship to neighboring projects remains explicit. **AI-Freedom-Trust** supplies doctrine and publications without making Booksmith the authority over doctrine. **AIFT-Genesis** supplies constitutional identity, trust, permission, and governance patterns. **AIFT-Forge** supplies reusable technical and provider patterns. **AIFT-OS / Runtime** can discover and coordinate local capabilities without becoming editorial truth. **BookSmith-Federation-OS** can eventually provide broader federation, identity, collaboration, sync, and marketplace surfaces around the authoring engine. **Aetherion** may eventually carry governed economic relationships such as licensing, royalties, or settlement without gaining authority over authorship or release approval.

The federated library principle remains:

```text
Sovereign Books + Shared Canon + Cross-References + Provenance
```

Booksmith is designed for works that must remain readable long after the immediate chat, model, or application version that assisted them. The author should be able to recover the source, understand the structure, inspect the citations, reconstruct the memory index, reproduce the typesetting, identify AI-assisted proposals and assets, and carry the book into another tool without losing ownership of the work.

### The Return of the Word

In Booksmith, the Word returns as a finished work whose voice still belongs to its author. Source becomes manuscript, manuscript becomes approved revision, revision becomes proof, proof becomes publication, and publication returns to the reader without dragging the workshop scaffolding onto the page. The intelligence that helped create the work remains present as service, not as an interruption of the voice.
