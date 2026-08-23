import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

export type ClaimType =
  | "author-canon"
  | "constructive-theology"
  | "philosophical-inference"
  | "theological-hypothesis"
  | "editorial-safeguard";

export type LivingClaim = {
  id: string;
  title: string;
  summary: string;
  type: ClaimType;
  status: string;
  support: string;
  sourceRefs: string[];
  chapterSlugs: string[];
  canonicalTerms: string[];
};

export type LivingChapter = {
  number: number;
  slug: string;
  title: string;
  part: number;
  primaryTexts: string;
  targetWords: number;
  status: string;
  canon: string;
  requiredSections: string[];
  queuePath: string;
  queueReady: boolean;
  manuscriptPath: string;
  manuscriptReady: boolean;
  manuscriptText: string;
  manuscriptWords: number;
};

export type LivingFigure = {
  id: string;
  title: string;
  caption: string;
  status: string;
  source: string;
};

export type LivingPart = {
  number: number;
  title: string;
  theme: string;
  chapterSlugs: string[];
};

export type LivingConcept = {
  id: string;
  label: string;
  domain: string;
  referenceKeys: string[];
};

export type LivingManuscriptData = {
  slug: string;
  title: string;
  subtitle: string;
  purpose: string;
  authorCanon: string;
  canonicalTerms: string[];
  parts: LivingPart[];
  chapters: LivingChapter[];
  claims: LivingClaim[];
  figures: LivingFigure[];
  relatedConcepts: LivingConcept[];
  provenance: {
    entries: Array<{ id: string; type: string; author: string; status: string; notes: string }>;
    rules: Record<string, string>;
  };
};

type PlannedChapter = Omit<
  LivingChapter,
  "queuePath" | "queueReady" | "manuscriptPath" | "manuscriptReady" | "manuscriptText" | "manuscriptWords"
>;
type ChapterPlan = { chapters: PlannedChapter[] };
type ClaimLedger = { claims: LivingClaim[] };
type FigureIndex = { cards: LivingFigure[] };
type ConceptRegistry = {
  concepts: Array<LivingConcept & { relatedBooks: string[] }>;
};
type BookConfig = {
  slug: string;
  title: string;
  subtitle?: string;
  purpose: string;
  authorCanon?: string;
  canonicalTerms?: string[];
};

const partDefinitions: Omit<LivingPart, "chapterSlugs">[] = [
  { number: 1, title: "Naming the Unnamed", theme: "Identity, method, participation, and divine language" },
  { number: 2, title: "The Three Modes of Energence", theme: "Nonconscious ground, formative intelligence, embodiment, and awakened consciousness" },
  { number: 3, title: "Evolution as Divine Immanence", theme: "Physical information, life, evolution, and the development of consciousness" },
  { number: 4, title: "Evil, Death, and Extinction", theme: "Suffering, contingency, accusation, cooperation, and safeguards" },
  { number: 5, title: "The Omega of Communion", theme: "Liberation, resurrection, reconciliation, and ethical participation" },
];

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8")) as T;
}

function readText(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function countWords(value: string) {
  const normalized = value.trim();
  return normalized ? normalized.split(/\s+/).length : 0;
}

export function getLivingManuscript(slug: string): LivingManuscriptData | null {
  const base = path.join("books", slug);
  const required = [
    `${base}/book.config.json`,
    `${base}/writing/chapter-plan.json`,
    `${base}/sources/claim-ledger.json`,
    `${base}/sources/provenance-log.json`,
    `${base}/figures/studio/figure-studio-index.json`,
  ];

  if (required.some((file) => !fs.existsSync(path.join(root, file)))) return null;

  const config = readJson<BookConfig>(`${base}/book.config.json`);
  const plan = readJson<ChapterPlan>(`${base}/writing/chapter-plan.json`);
  const ledger = readJson<ClaimLedger>(`${base}/sources/claim-ledger.json`);
  const figureIndex = readJson<FigureIndex>(`${base}/figures/studio/figure-studio-index.json`);
  const provenance = readJson<LivingManuscriptData["provenance"]>(`${base}/sources/provenance-log.json`);
  const conceptRegistry = readJson<ConceptRegistry>("library/concept-registry.json");

  const chapters = plan.chapters.map((chapter) => {
    const queuePath = `${base}/writing/queue/${chapter.slug}.md`;
    const manuscriptPath = `${base}/manuscript/chapters/${chapter.slug}.md`;
    const manuscriptReady = fs.existsSync(path.join(root, manuscriptPath));
    const manuscriptText = manuscriptReady ? readText(manuscriptPath) : "";

    return {
      ...chapter,
      queuePath,
      queueReady: fs.existsSync(path.join(root, queuePath)),
      manuscriptPath,
      manuscriptReady,
      manuscriptText,
      manuscriptWords: countWords(manuscriptText),
    };
  });

  const parts = partDefinitions.map((part) => ({
    ...part,
    chapterSlugs: chapters.filter((chapter) => chapter.part === part.number).map((chapter) => chapter.slug),
  }));

  return {
    slug,
    title: config.title,
    subtitle: config.subtitle ?? "",
    purpose: config.purpose,
    authorCanon: config.authorCanon ?? "AI output remains proposal until author approval.",
    canonicalTerms: config.canonicalTerms ?? [],
    parts,
    chapters,
    claims: ledger.claims,
    figures: figureIndex.cards,
    relatedConcepts: conceptRegistry.concepts
      .filter((concept) => concept.relatedBooks.includes(slug))
      .map(({ id, label, domain, referenceKeys }) => ({ id, label, domain, referenceKeys })),
    provenance,
  };
}
