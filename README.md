# Booksmith AI — Author-First Manuscript and Publishing Studio

**The publishing studio of the AI Freedom Trust Federation: author-first writing, editing, manuscript intelligence, federated library management, citations, provenance, LaTeX production, publishing packets, and launch preparation.**

| Federation metadata | Value |
| --- | --- |
| Layer | `publishing` |
| Role | author-first writing, editing, publishing, and launch studio |
| Workspace | `AIFT/booksmith-ai` |
| Control plane | AIFT workspace / AIFT-OS |
| Application stack | Next.js, TypeScript, React, Tailwind; local AI and publishing adapters |
| Verification | lint, typecheck, tests, and build when present |
| Operating standards | local-first, inspectable, sovereign by default, AI behind governed provider interfaces |

Booksmith AI exists so an author can use powerful machine intelligence without surrendering authorship to it. Its source of truth is the human work: manuscripts, approved canon, sources, citations, book metadata, visual assets, and explicit editorial choices. AI can carry a great deal of labor around that center—structure, continuity, revision proposals, claim tracking, indexing, citations, metadata, typesetting, proof analysis, and launch assets—but it does not become the hidden author of an approved work.

The deeper covenant is carried in the [One Eternal Scroll of ALO'ha](https://aifreedomtrustfederation.github.io/AI-Freedom-Trust/docs/pdf/one-eternal-scroll-of-aloha.pdf). The shared operational rule is [SOP-ALOHA-001](https://github.com/AIFreedomTrustFederation/AI-Freedom-Trust/blob/main/SOP-ALOHA-001.md).

---

## Book I — Author Sovereignty and the Living Manuscript

Booksmith begins from a simple rule: **human canon remains authoritative**. User-authored or explicitly approved text is not merely another model input to be silently optimized. It is part of the work's identity. AI-generated language may be useful, beautiful, or structurally superior, but it remains a proposal until it enters the author-governed manuscript through an intentional editorial act.

This makes the manuscript a living trust rather than a disposable prompt history. Chapters, Story Bible material, claims, sources, glossary terms, citations, figures, publishing metadata, and revision state can remain related across the life of a book.

### Illuminated passage — memory with lineage

![Circleunchain Memory Network](https://raw.githubusercontent.com/AIFreedomTrustFederation/AI-Freedom-Trust/main/docs/images/aetherion/circleunchain-memory-network.png)

For Booksmith, the memory network represents provenance. A sentence should be able to remain connected to its authorial status, source, claim, citation, revision, and publication history without requiring the reader to endure an editorial correction log inside the finished prose.

---

## Book II — What Booksmith AI Owns

This repository owns the **authoring and production studio**, not the entire publishing federation. Its active architecture includes:

- `books/` for individualized sovereign book projects.
- `library/` for shared canon, book registry, glossary, concept registry, thinker registry, and references.
- `templates/book/` for reusable project structure.
- `docs/` for product, publishing, library, AI, and typesetting architecture.
- manuscript and source-aware workflows such as the Living Manuscript Studio, Book Tree, Claim Ledger, and Chapter Forge.
- LaTeX publishing with Unicode-first XeLaTeX/LuaLaTeX pathways and local proof builds.
- publishing packets that carry manuscript, metadata, rights/provenance, proof, and launch information toward AI Freedom Trust Publishing.

Its relationship to neighboring projects is explicit:

- **AI-Freedom-Trust → Booksmith:** doctrine and ALO'ha publications can be authored, typeset, indexed, and preserved through Booksmith without making Booksmith the authority over doctrine.
- **AIFT-Genesis → Booksmith:** Genesis supplies identity, trust, permission, and governance structures that can become the constitutional frame for an author's sovereign workspace.
- **AIFT-Forge → Booksmith:** reusable agent/provider patterns may support editing, retrieval, build, and export while author approval remains local to the book.
- **AIFT-OS / Runtime ↔ Booksmith:** the operating layers may discover builds, files, repositories, and local AI providers without becoming the source of editorial truth.
- **BookSmith-Federation-OS ↔ Booksmith AI:** Booksmith AI is the manuscript and production engine; BookSmith-Federation-OS is the broader workspace, federation, sync, identity, marketplace, and operating-system surface.
- **Aetherion ↔ Booksmith:** royalties, licenses, marketplace settlement, or treasury relationships may integrate through governed economic interfaces while authorship, rights, and release approval remain in the publishing domain.

The federated library principle remains:

```text
Sovereign Books + Shared Canon + Cross-References + Provenance
```

A book should stand on its own while declaring how it relates to the wider library.

---

## Book III — SOP-ALOHA-001 in Booksmith

The shared loop becomes an editorial and publishing lifecycle:

```text
Receive → Inspect → Name → Propose → Consent → Act → Verify → Record → Return
```

**Receive** preserves the author's text, source, file, citation, figure, or instruction. **Inspect** determines the current book, chapter, canon, claim authority, source context, publication state, and requested transformation. **Name** distinguishes author canon from source quotation, AI proposal, editorial note, research claim, figure specification, and release metadata. **Propose** allows AI to draft or revise without silently replacing approved text. **Consent** governs manuscript changes, figure approval, rights decisions, publication, and other consequential editorial acts. **Act** applies an approved patch or builds the requested artifact. **Verify** checks continuity, citations, references, typesetting, missing figures, build errors, and rendered output. **Record** preserves provenance and version history outside the natural prose of the finished work. **Return** gives the author a coherent manuscript or publication artifact—not a pile of correction fragments.

Local development begins with:

```bash
npm install
npm run dev
```

The sample LaTeX path can be built with:

```powershell
npm run latex:sample
```

Alternative engines include:

```powershell
npm run latex:sample:lua
npm run latex:sample:tectonic
```

Publication verification is both technical and visual. A PDF that compiles but contains broken hierarchy, repeated headings, clipped figures, unreadable pages, or malformed spacing has not completed the covenant loop.

---

## Book IV — From Manuscript to Inheritance

Booksmith AI is designed for works that must remain readable long after the immediate chat that helped produce them. The author should be able to recover the source, understand the structure, inspect the citations, reproduce the typesetting, identify AI-assisted assets, and carry the book into another tool without losing ownership of the work.

Local-first and open-source defaults matter because publishing is an inheritance problem. A book should not become inaccessible because one hosted model, proprietary editor, or paid API disappears. The publishing system should help knowledge outlive the software that assisted it.

### The Return of the Word

In Booksmith, the Word returns as a finished work whose voice still belongs to its author. Source becomes manuscript, manuscript becomes approved revision, revision becomes proof, proof becomes publication, and publication returns to the reader without dragging the workshop scaffolding onto the page. The intelligence that helped create the work remains present as service, not as an interruption of the voice.
