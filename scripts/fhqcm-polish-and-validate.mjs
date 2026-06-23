import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = 'books/fhqcm';
const MANUSCRIPT = join(ROOT, 'manuscript');
const CHAPTERS = join(MANUSCRIPT, 'chapters');
const APPENDICES = join(MANUSCRIPT, 'appendices');
const REPORTS = join(ROOT, 'reports');

const requiredDirs = [
  CHAPTERS,
  APPENDICES,
  join(ROOT, 'math'),
  join(ROOT, 'source-canon'),
  join(ROOT, 'concept-tests'),
  join(ROOT, 'publishing'),
  join(ROOT, 'literature-review'),
  join(ROOT, 'assets/images/manifest'),
  REPORTS,
];

for (const dir of requiredDirs) mkdirSync(dir, { recursive: true });

function writeIfMissing(path, content) {
  if (!existsSync(path)) writeFileSync(path, content, 'utf8');
}

function read(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

function write(path, content) {
  writeFileSync(path, content, 'utf8');
}

writeIfMissing(join(APPENDICES, 'A-scientific-integrity.tex'), String.raw`\chapter{Scientific Integrity Appendix}

\section{Purpose}

This appendix distinguishes established science, mathematics, philosophy, theology, FHQCM hypotheses, and symbolic language.

\section{Classification Standard}

Every major claim in this book should be classified as one of: established science, established mathematics, philosophical interpretation, theological interpretation, FHQCM hypothesis, or poetic-symbolic language.

\section{Publication Rule}

No symbolic or theological statement should be presented as empirical physics. No scientific claim should be published without citation review.
`);

writeIfMissing(join(APPENDICES, 'B-equation-index.tex'), String.raw`\chapter{Equation Index}

This appendix indexes the major equations and symbolic formalisms used in the FHQCM manuscript.

\section{Core Equations}

\begin{itemize}
\item Mass-energy equivalence: established physics.
\item Fibonacci recurrence: established mathematics.
\item Coincidence function: FHQCM formal definition.
\item Harmonic coherence proxy: FHQCM theoretical construct.
\end{itemize}
`);

writeIfMissing(join(APPENDICES, 'C-figure-index.tex'), String.raw`\chapter{Figure Index}

This appendix indexes the FHQCM figure canon. Final publication should map every figure to a chapter, caption, source, and review status.
`);

writeIfMissing(join(APPENDICES, 'D-critiques-and-limitations.tex'), String.raw`\chapter{Critiques and Limitations}

\section{Purpose}

A rigorous theory must name its own weaknesses.

\section{Core Critiques}

Important critiques include apophenia, confirmation bias, statistical coincidence, predictive processing, overextension of quantum language, and the risk of confusing metaphor with mechanism.

\section{Research Requirement}

Every FHQCM hypothesis must eventually state what would weaken or falsify it.
`);

writeIfMissing(join(ROOT, 'math/equation-registry.md'), `# FHQCM Equation Registry

| ID | Equation | Status | Use |
| --- | --- | --- | --- |
| EQ001 | E = mc^2 | established physics | mass-energy equivalence |
| EQ002 | F_n = F_{n-1} + F_{n-2} | established mathematics | Fibonacci recursion |
| EQ003 | C(e_i,e_j)=P_observer(e_i ~ e_j | e_i,e_j in Omega) | FHQCM definition | coincidence theory |
| EQ004 | K = sum R(e_i,e_j) | FHQCM construct | coherence theory |
| EQ005 | D = 1 - K | FHQCM construct | decoherence as complement after normalization |

## Rule

Every equation in the manuscript should be listed here before final publication.
`);

writeIfMissing(join(ROOT, 'assets/images/manifest/figure-registry.md'), `# FHQCM Figure Registry

| ID | Title | Primary Chapter | Equation | Concept Test | Status |
| --- | --- | --- | --- | --- | --- |
| F001 | FHQCM Overview | Introduction | none | none | draft |
| F008 | Eternal Now | Chapter 11 | EQ003 | CT012 | draft |
| F031 | Dynamic Toroidal Flow | Chapter 11 | none | none | draft |
| F048 | Love as Harmonic Coherence | Chapter 11 | EQ004 | CT014 | draft |
| F050 | Federation Architecture | Federation Consciousness | none | none | draft |

## Rule

Every final figure must have title, chapter, caption, source, alt text, review status, and manuscript placement.
`);

writeIfMissing(join(ROOT, 'publishing/metadata.md'), `# FHQCM Publishing Metadata

## Publisher

AI Freedom Trust Publishing

## Imprint

An AI Freedom Trust Federation imprint

## Working Title

The Fractal-Holographic Quantum Consciousness Model

## Subtitle

A Unified Framework for Matter, Energy, Consciousness, and the Eternal Now

## Marketplace Checklist

- ISBN
- BISAC categories
- short description
- long description
- author bios
- publisher bio
- keywords
- back cover copy
- print PDF
- EPUB
- web edition
`);

const mainPath = join(MANUSCRIPT, 'main.tex');
let main = read(mainPath);
if (main) {
  const appendicesBlock = String.raw`
\appendix
\input{appendices/A-scientific-integrity.tex}
\input{appendices/B-equation-index.tex}
\input{appendices/C-figure-index.tex}
\input{appendices/D-critiques-and-limitations.tex}
`;

  if (!main.includes('appendices/A-scientific-integrity.tex')) {
    main = main.replace('\\backmatter', `${appendicesBlock}\n\\backmatter`);
  }

  if (!main.includes('chapters/11-coincidence-coherence-eternal-now.tex')) {
    main = main.replace('\\input{chapters/10-conclusion.tex}', '\\input{chapters/10-conclusion.tex}\n\\input{chapters/11-coincidence-coherence-eternal-now.tex}');
  }

  write(mainPath, main);
}

const requiredChapters = [
  '00-preface.tex',
  '01-introduction.tex',
  '02-fractal-time.tex',
  '03-quantum-observation.tex',
  '04-holographic-brain.tex',
  '05-spiral-torus-field.tex',
  '06-christic-equivalency.tex',
  '07-emotional-sobriety.tex',
  '08-ai-stewardship.tex',
  '09-federation-consciousness.tex',
  '10-conclusion.tex',
  '11-coincidence-coherence-eternal-now.tex',
];

const report = [];
report.push('# FHQCM Polish and Validation Report');
report.push('');
report.push(`Generated: ${new Date().toISOString()}`);
report.push('');

report.push('## Chapter Check');
for (const chapter of requiredChapters) {
  const ok = existsSync(join(CHAPTERS, chapter));
  report.push(`- ${ok ? 'OK' : 'MISSING'} ${chapter}`);
}

report.push('');
report.push('## Appendix Check');
for (const appendix of ['A-scientific-integrity.tex','B-equation-index.tex','C-figure-index.tex','D-critiques-and-limitations.tex']) {
  const ok = existsSync(join(APPENDICES, appendix));
  report.push(`- ${ok ? 'OK' : 'MISSING'} ${appendix}`);
}

report.push('');
report.push('## Registry Check');
for (const file of [
  'math/equation-registry.md',
  'math/coincidence-theory.md',
  'math/coherence-theory.md',
  'assets/images/manifest/figure-registry.md',
  'source-canon/README.md',
  'publishing/metadata.md',
]) {
  const ok = existsSync(join(ROOT, file));
  report.push(`- ${ok ? 'OK' : 'MISSING'} ${file}`);
}

report.push('');
report.push('## Manuscript Wiring');
const updatedMain = read(mainPath);
for (const marker of [
  'chapters/11-coincidence-coherence-eternal-now.tex',
  'appendices/A-scientific-integrity.tex',
  'appendices/B-equation-index.tex',
  'appendices/C-figure-index.tex',
  'appendices/D-critiques-and-limitations.tex',
]) {
  report.push(`- ${updatedMain.includes(marker) ? 'OK' : 'MISSING'} ${marker}`);
}

report.push('');
report.push('## Figure Count');
const imageDir = join(ROOT, 'assets/images/source');
let figureCount = 0;
if (existsSync(imageDir)) figureCount = readdirSync(imageDir).filter((name) => name.endsWith('.svg')).length;
report.push(`- SVG figures in source folder: ${figureCount}`);

report.push('');
report.push('## Build Notes');
report.push('- Run `npm run fhqcm:images` to regenerate SVG figure drafts.');
report.push('- Compile from `books/fhqcm/manuscript` with XeLaTeX or LuaLaTeX.');
report.push('- If bibliography is incomplete, run LaTeX first without final bibliography expectations.');

write(join(REPORTS, 'polish-validation-report.md'), report.join('\n'));

const imageScript = existsSync('scripts/generate-fhqcm-images.mjs');
if (imageScript) {
  const result = spawnSync('node', ['scripts/generate-fhqcm-images.mjs'], { stdio: 'inherit' });
  if (result.status !== 0) {
    console.warn('Image generation failed. See output above.');
  }
}

console.log('FHQCM polish and validation complete. See books/fhqcm/reports/polish-validation-report.md');
