import fs from "node:fs";
import path from "node:path";

import type { BookshelfBook } from "@/lib/library/load-library";

const root = process.cwd();

export type BookCapabilitySnapshot = {
  slug: string;
  manuscriptFiles: number;
  sourceFiles: number;
  figureFiles: number;
  latexFiles: number;
  publishingFiles: number;
  exportFiles: number;
  bibliographyFiles: number;
  proofArtifacts: number;
  reportArtifacts: number;
  hasLivingManuscript: boolean;
  hasClaimLedger: boolean;
  hasProvenance: boolean;
  hasChapterPlan: boolean;
  hasFigureStudio: boolean;
  hasAssetLedger: boolean;
  hasPublishingMetadata: boolean;
  hasPublishingChecklist: boolean;
  hasLatexProject: boolean;
  capabilityScore: number;
};

function exists(relativePath: string) {
  return fs.existsSync(path.join(root, relativePath));
}

function filesUnder(relativePath: string): string[] {
  const absolute = path.join(root, relativePath);
  if (!fs.existsSync(absolute)) return [];

  const output: string[] = [];
  const stack = [absolute];

  while (stack.length) {
    const current = stack.pop();
    if (!current) continue;
    const stat = fs.statSync(current);
    if (stat.isFile()) {
      output.push(path.relative(root, current));
      continue;
    }

    for (const entry of fs.readdirSync(current)) {
      stack.push(path.join(current, entry));
    }
  }

  return output.sort();
}

export function getBookCapabilitySnapshot(book: BookshelfBook): BookCapabilitySnapshot {
  const slug = book.registry.slug;
  const base = `books/${slug}`;
  const allFiles = filesUnder(base);
  const manuscriptFiles = filesUnder(`${base}/manuscript`).length;
  const sourceFiles = filesUnder(`${base}/sources`).length;
  const figureFiles = filesUnder(`${base}/figures`).length + filesUnder(`${base}/assets`).length;
  const latexFiles = filesUnder(`${base}/latex`).length;
  const publishingFiles = filesUnder(`${base}/publishing`).length;
  const exportFiles = filesUnder(`${base}/exports`).length;
  const bibliographyFiles = filesUnder(`${base}/bibliography`).length;
  const proofFiles = allFiles.filter((file) => /(^|[\/_.-])proof([\/_.-]|$)/i.test(file));
  const reportFiles = allFiles.filter(
    (file) => !proofFiles.includes(file) && /(^|[\/_.-])(report|audit|diagnostic|quality|gate|inspection)([\/_.-]|$)/i.test(file),
  );
  const proofArtifacts = proofFiles.length;
  const reportArtifacts = reportFiles.length;

  const hasClaimLedger = exists(`${base}/sources/claim-ledger.json`);
  const hasProvenance = exists(`${base}/sources/provenance-log.json`);
  const hasChapterPlan = exists(`${base}/writing/chapter-plan.json`);
  const hasFigureStudio = exists(`${base}/figures/studio/figure-studio-index.json`);
  const hasAssetLedger = exists(`${base}/figures/asset-ledger.json`);
  const hasPublishingMetadata =
    exists(`${base}/publishing/metadata.md`) ||
    exists(`${base}/publishing/metadata-sheet.md`) ||
    exists(`${base}/metadata/metadata.md`);
  const hasPublishingChecklist = exists(`${base}/publishing/publisher-package-checklist.md`);
  const hasLatexProject = latexFiles > 0 || exists(`${base}/manuscript/main.tex`);
  const hasLivingManuscript = hasChapterPlan && hasClaimLedger && hasProvenance && hasFigureStudio;

  const capabilityFlags = [
    manuscriptFiles > 0,
    sourceFiles > 0,
    hasClaimLedger,
    hasProvenance,
    hasChapterPlan,
    hasFigureStudio,
    hasAssetLedger,
    hasLatexProject,
    hasPublishingMetadata,
    hasPublishingChecklist,
    exportFiles > 0,
    proofArtifacts > 0 || reportArtifacts > 0,
  ];

  return {
    slug,
    manuscriptFiles,
    sourceFiles,
    figureFiles,
    latexFiles,
    publishingFiles,
    exportFiles,
    bibliographyFiles,
    proofArtifacts,
    reportArtifacts,
    hasLivingManuscript,
    hasClaimLedger,
    hasProvenance,
    hasChapterPlan,
    hasFigureStudio,
    hasAssetLedger,
    hasPublishingMetadata,
    hasPublishingChecklist,
    hasLatexProject,
    capabilityScore: Math.round((capabilityFlags.filter(Boolean).length / capabilityFlags.length) * 100),
  };
}

export function getLibraryCapabilitySnapshots(books: BookshelfBook[]) {
  return books.map((book) => ({
    book,
    snapshot: getBookCapabilitySnapshot(book),
  }));
}

export function listBookFiles(slug: string, directory: string) {
  return filesUnder(`books/${slug}/${directory}`);
}
