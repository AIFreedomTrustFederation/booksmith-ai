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

A canonical manuscript save may create a local Git commit when requested. That commit includes only the approved manuscript file; other staged changes remain staged and are not included. Booksmith does not silently push to a remote. Remote synchronization remains an explicit human-controlled operation.

**Manual Git sync verification:** `bash scripts/git-sync-rebase-push.sh` fetches `origin`, rebases the current branch onto `origin/main`, and attempts `git push origin HEAD:main` **only after** `npm run validate:library`, `npm run proof:v2:fhqcm`, and `npm run json:validate` all succeed. A failing command stops the script with a nonzero exit before pushing. Reproduce the failure-path checks with `python3 -m unittest discover -s tests -p 'test_git_sync_validation.py' -v`. This helper does not enforce that the current branch is `main`, check the entire application build, undo a completed local rebase, or guarantee a clean working tree; inspect `git status` and the intended commits before invoking it. A successful local check is not proof of hosted CI or production publishing readiness.

**Federation manifest verification scope:** The `verify` command in [`aift.repo.json`](aift.repo.json) runs `npm run lint --if-present && npm run typecheck --if-present && npm run test --if-present && npm run build --if-present`. The current [`package.json`](package.json) defines `lint` and `build` but has no `typecheck` or `test` script, so those two checks are skipped rather than executed. This metadata-driven command is not equivalent to the [hosted CI workflow](.github/workflows/ci.yml), which also validates the federated library, runs Runtime and manuscript/manual-sync regressions, and builds static Pages mode. Neither gate independently establishes author approval, operational AI inference, or publication authorization.

**Manuscript filesystem boundary:** the Runtime resolves existing filesystem links before manuscript reads and saves and rejects paths that resolve outside the selected `books/<slug>` directory. Symlinks remaining inside the selected book are supported. This is a pre-access check, not protection against another local process replacing filesystem links concurrently; keep the authoring workspace under trusted local control.

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

**Network exposure and startup checks:** `npm run server` launches the Next.js application on `0.0.0.0:3000` by default (`BOOKSMITH_HOST`), making the web UI reachable from other devices when firewall and network rules permit. The separate Runtime API defaults to `127.0.0.1:8787`; a loopback Runtime does **not** make the web UI loopback-only. For local-only authoring, launch with:

```bash
BOOKSMITH_HOST=127.0.0.1 npm run server
```

The launcher runs several health, registry, figure, bibliography, and publication diagnostics with `|| true`; failures in those preparatory checks do not necessarily stop the server. Review their output and run the relevant checks separately before relying on readiness or publishing. `npm run server` starts a Next.js **development** server, not a hardened production deployment.

The Runtime stays on loopback by default. Binding it to a LAN address requires `BOOKSMITH_RUNTIME_TOKEN`; allowed browser origins can be declared through `BOOKSMITH_ALLOWED_ORIGINS`. The Runtime exposes narrow manuscript, AI, source, index, Git, job, and provenance routes rather than a generic shell or arbitrary filesystem API.

The same Studio is also an installable Progressive Web App through `manifest.webmanifest` and the Booksmith service worker. Previously visited application surfaces and static assets can remain available offline; canonical writes and model execution still require the private Runtime process.

See [`docs/booksmith-app-runtime-v1.md`](docs/booksmith-app-runtime-v1.md) for the complete Runtime, security, ingestion, indexing, and application contract.

---

## Book IV — From Manuscript to Inheritance

This repository owns the **authoring and production studio**, not the entire publishing federation. Its active architecture includes `books/` for sovereign book projects, `library/` for shared registries and semantic memory, `templates/book/` for reusable structure, `docs/` for product and publishing contracts, the Living Manuscript and Claim Ledger for authorship discipline, the Runtime for private execution, SQLite for disposable retrieval state, and the existing LaTeX/proof/publishing engines for reproducible release artifacts.

Its relationship to neighboring projects remains explicit. **AI-Freedom-Trust** supplies doctrine and publications without making Booksmith the authority over doctrine. **AIFT-Genesis** supplies constitutional identity, trust, permission, and governance patterns. **AIFT-Forge** supplies reusable technical and provider patterns. **AIFT-OS / Runtime** can discover and coordinate local capabilities without becoming editorial truth. **BookSmith-Federation-OS** can eventually provide broader federation, identity, collaboration, sync, and marketplace surfaces around the authoring engine. **Aetherion** may eventually carry governed economic relationships such as licensing, royalties, or settlement without gaining authority over authorship or release approval.

### MoBox UXI: read-only library integration

The [UXI integration manifest](.aift/uxi.json) declares one source, `booksmith.library`, pointing to the canonical [federated book registry](library/book-registry.json) as JSON with status `ready`. This is a **local, read-only source declaration**, not a hosted API, repository synchronization, manuscript-write permission, or publishing capability. `ready` describes the declared source; it does not prove that a running MoBox UXI instance has discovered this checkout.

The [AIFT-OS integration reader](https://github.com/AIFreedomTrustFederation/AIFT-OS/blob/main/internal/uxi/integration.go) discovers `.aift/uxi.json` manifests in immediate Git worktrees under its configured AIFT workspace. It checks repository identity, relative-path and symlink containment, regular-file type, JSON validity, and a 4 MiB source-size limit before reading. When the local AIFT-OS MoBox UXI service is running, `/v1/sources` exposes discovered declarations; its governed `source.inspect` action can read an eligible source into an evidence-backed artifact. Neither mechanism executes Booksmith's private Runtime, AI models, Git writes, proof builds, or publication jobs. Run `npm run validate:library` in this repository to validate the library separately; that command does **not** test AIFT-OS discovery or live HTTP access.

### FHQCM PDF proof: build artifact versus publication

The [FHQCM PDF Proof workflow](.github/workflows/fhqcm-pdf-proof.yml) runs on its configured FHQCM file changes or manual dispatch. It invokes `npm run fhqcm:polish` (which generates draft SVG figures and a validation report), compiles [the FHQCM LaTeX manuscript](books/fhqcm/manuscript/main.tex) with XeLaTeX, and uploads the `fhqcm-first-proof` Actions artifact containing `fhqcm-first-proof.pdf` and `polish-validation-report.md`. For a local preflight, run `npm run fhqcm:polish` from the repository root; local PDF compilation additionally requires XeLaTeX and the necessary TeX packages. Download the proof from the successful workflow run's **Artifacts** section (also linked in the run summary), not from the public Pages site.

On successful runs targeting `main`, the workflow also creates a **public, versioned GitHub prerelease** containing `fhqcm-first-proof.pdf`, `polish-validation-report.md`, and `SHA256SUMS.txt` with SHA-256 hashes for the two files. See the [FHQCM proof releases](https://github.com/AIFreedomTrustFederation/booksmith-ai/releases?q=fhqcm-proof). These release assets are distinct from the 90-day Actions artifact and are publicly downloadable; a prerelease is **still a draft proof, not an author-approved or final publication**. The workflow verifies that the PDF is nonempty and has PDF header and EOF markers, but does not establish visual quality, source-to-PDF fidelity, editorial approval, or scientific validity.

**FHQCM proof input-provenance boundary:** `npm run fhqcm:polish` is not read-only: [`scripts/fhqcm-polish-and-validate.mjs`](scripts/fhqcm-polish-and-validate.mjs) can create missing appendices and registries and rewrite `books/fhqcm/manuscript/main.tex`; it invokes [`scripts/generate-fhqcm-images.mjs`](scripts/generate-fhqcm-images.mjs), which rewrites generated SVGs in `source/`, `web/`, `print/`, and `thumbnails/`. The [proof workflow](.github/workflows/fhqcm-pdf-proof.yml) does not check for generated working-tree changes or record a post-generation source-tree digest before publishing its prerelease. The release tag targets `$GITHUB_SHA`, while `SHA256SUMS.txt` covers the PDF and polish report, not the exact source-tree inputs used to build them. Inspect generated inputs and the proof before relying on commit-bound reproducibility; generated figures are drafts, not approved artwork.

A passing PDF build verifies the configured proof pipeline, **not** final artwork, editorial approval, scientific validation, or publication. The introduction still uses [draft figure placeholders](books/fhqcm/assets/images/latex/figure-includes.tex); [FHQCM proof issue #4](https://github.com/AIFreedomTrustFederation/booksmith-ai/issues/4) tracks outstanding figure and proof acceptance work.

### Unified Reality proof workflow: verification versus release

The [Unified Reality production workflow](.github/workflows/unified-reality-booksmith-production.yml) builds the `towards-a-unified-reality` LaTeX/PDF proof, runs bibliography and [quality checks](scripts/quality-gate.mjs), prepares figures and a publishing packet, and uploads the `relational-coherence-booksmith-production` Actions artifact. This is a downloadable **proof/production packet**, not an automatic GitHub Pages publication or an author-approved edition.

A green workflow is not by itself a publication-ready verdict. The quality gate exits unsuccessfully for critical failures but can return success with warning statuses. The [figure pipeline](scripts/figure-pipeline-v1.sh) tolerates failures from its [publication gate](scripts/publication-gate-v2.mjs), whose draft-only and warning statuses also do not fail the command. Moreover, the figure pipeline re-renders LaTeX **after** the workflow has compiled the PDF, without a subsequent PDF rebuild; verify that the downloaded PDF corresponds to the final intended source and figures. The [publishing-packet builder](scripts/build-publishing-packet.mjs) records SHA-256 checksums for copied packet files, but checksums alone do not confer editorial approval or establish public release.

Before promoting an edition, inspect the artifact's proof, bibliography, quality, figure, and publication-gate reports (including their status fields), confirm packet completeness and hashes, visually review the PDF, and rebuild from the approved source if the figure pipeline changed it.

**Publishing-packet checksum coverage boundary:** [`scripts/build-publishing-packet.mjs`](scripts/build-publishing-packet.mjs) generates `CHECKSUMS.sha256` from copied packet files **before** writing `packet-manifest.json` and the packet's own `README.md`, so those two generated metadata files are not covered by that checksum list. The manifest records the book slug, generation time, file count, and inclusion flags, but does not bind the packet to a Git commit or source-tree digest. Independently verify the packet metadata and exact source revision before treating its checksums as provenance evidence; they do not establish author approval or publication authorization.

**Publishing-packet completeness boundary:** The [publishing-packet specification](docs/booksmith-publishing-packet.md) describes a target package including manuscript, EPUB, cover, launch, rights, approval, and distribution materials. The current [packet builder](scripts/build-publishing-packet.mjs) stages existing LaTeX exports, a PDF, selected reports, figure records, and book metadata; missing inputs are skipped, while its `includes` flags check presence for only a subset. It neither generates nor validates the full specified distribution packet, and it does not establish rights clearance, human approval, or marketplace readiness. A successful packet build therefore proves only that available files were staged, not that a complete distributor-ready edition was produced.

**Publishing-packet stale-output boundary:** [`scripts/build-publishing-packet.mjs`](scripts/build-publishing-packet.mjs) creates or reuses `exports/publishing-packet` without clearing earlier files. If an input disappears between builds, `copyIfExists` skips that copy but the old packet file can remain; the generated `includes` flags can then report stale output as present even though `CHECKSUMS.sha256` omits files not copied in the current run. Inspect or clear the packet directory before relying on a regenerated packet as evidence of the current source.

**Publication-gate missing-evidence boundary:** [`scripts/publication-gate-v2.mjs`](scripts/publication-gate-v2.mjs) substitutes empty objects when the proof, figure-audit, or quality JSON report is missing. Missing proof counts and figure placeholder counts then default to zero, while the upstream quality status may be `null`; with an existing `exports/pdf/main.pdf`, the gate can report `PASS_PUBLICATION_READY` without those inputs. The status is not evidence that the required reports were present, current for the source revision, or author-approved. Inspect all three reports and their provenance before treating the result as a publication-readiness claim. Missing-evidence enforcement belongs to the separate Verification & Repair task.

**Publication-engine optional-step reporting boundary:** [`scripts/publication-engine-v1.mjs`](scripts/publication-engine-v1.mjs) treats bibliography audit, reference intelligence, figure asset audit, figure intelligence, quality gate, publication gate, and ZIP export as optional (`allowFailure`). Its recorded `ok` flag and Markdown `PASS` label remain true for those steps even when their commands exit nonzero; inspect each step's numeric `status` and underlying reports before relying on a publication-engine summary. The engine derives `PASS_PUBLICATION_READY` from the publication-gate report, not from successful execution of every optional check. This is not proof of author approval or permission to publish.

**Publication-engine command-launch boundary:** [`scripts/publication-engine-v1.mjs`](scripts/publication-engine-v1.mjs) records `spawnSync` results using `result.status ?? 0` without checking `result.error`. If a required executable fails to launch (for example, a missing `npm` or `bash`), Node can return `status: null` with a process error, which the engine records as status `0` and `PASS`. Therefore a passing step record does not establish that its command actually started. Verify required commands and their generated artifacts independently; correcting failed-process handling belongs to Federation Verification & Repair.

The federated library principle remains:

```text
Sovereign Books + Shared Canon + Cross-References + Provenance
```

Booksmith is designed for works that must remain readable long after the immediate chat, model, or application version that assisted them. The author should be able to recover the source, understand the structure, inspect the citations, reconstruct the memory index, reproduce the typesetting, identify AI-assisted proposals and assets, and carry the book into another tool without losing ownership of the work.

### The Return of the Word

In Booksmith, the Word returns as a finished work whose voice still belongs to its author. Source becomes manuscript, manuscript becomes approved revision, revision becomes proof, proof becomes publication, and publication returns to the reader without dragging the workshop scaffolding onto the page. The intelligence that helped create the work remains present as service, not as an interruption of the voice.
