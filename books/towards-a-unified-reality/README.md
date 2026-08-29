# Relational Coherence and the Languages of Reality

**Subtitle:** Invariant Form, Wave Dynamics, Descriptive Resolution, and the Physical–Experiential Boundary

This Booksmith project is the canonical long-form synthesis of the AI Freedom Trust Federation's relational-coherence audit. It develops the full argument from descriptive language and persistence through oscillator dynamics, Platonic symmetry, the exact \(\ell=5\) quartic calculation, sixth-order invariant resolution, wave conjugation, materialism/idealism, descriptive adequacy versus ontological sufficiency, and the admissibility/occupancy boundary in consciousness science.

The manuscript is deliberately layered. Main chapters use long-form scientific prose with equations separated for readability. Exact derivations, notation, claim status, conditional antiunitary machinery, limitations, and falsification conditions are retained in appendices rather than diluted or omitted.

## Canonical source

- `manuscript/main.tex` — Booksmith/LaTeX entry point
- `manuscript/chapters/` — complete book chapters
- `manuscript/appendices/` — notation, derivation ledger, conditional hypotheses, limitations, and related work
- `bibliography/references.bib` — book-specific research references
- shared Federation bibliography — `library/references/*.bib`

## Governing distinctions

The book keeps three boundaries explicit throughout:

1. Indistinguishability under a restricted descriptive algebra does not imply identity under every richer descriptive algebra.
2. Descriptive-language adequacy does not imply ontological sufficiency.
3. Mathematical admissibility does not imply phenomenal occupancy.

These distinctions do not soften the philosophical argument. They keep mathematical result, empirical inference, and ontological interpretation from being substituted for one another.

## Booksmith commands

From the repository root:

```bash
npm run validate:library
node scripts/render-latex.mjs towards-a-unified-reality
node scripts/quality-gate.mjs towards-a-unified-reality
node scripts/build-publishing-packet.mjs towards-a-unified-reality
```

The project remains source-first and publication-ready; generated PDF/EPUB artifacts should be produced by the Booksmith pipeline rather than treated as canonical manuscript source.
