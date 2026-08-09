import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

export type FigureCard = {
  id: string;
  title: string;
  caption: string;
  status: string;
  figureType: string;
  surroundingTextPreview: string;
};

export type FigureStudioIndex = { cards: FigureCard[] };

export type FigureAsset = {
  figureId: string;
  status: string;
  asset: string | null;
  approvedForPrint: boolean;
  checksumSha256?: string | null;
};

export type AssetLedger = { assets: FigureAsset[] };

type FigureArtDirection = {
  figureType?: string;
  composition?: {
    layout?: string;
    camera?: string;
    colorLogic?: string;
    labelPolicy?: string;
  };
  prompts?: { providerAgnostic?: string };
  knowledge?: { requiredObjects?: string[]; forbiddenObjects?: string[] };
  qaChecklist?: string[];
};

type FigureSpec = {
  placementContext?: { surroundingText?: string };
  promptCompiler?: { finalPrompt?: string };
};

function readJson<T>(file: string, fallback: T): T {
  try {
    return fs.existsSync(file)
      ? JSON.parse(fs.readFileSync(file, "utf8"))
      : fallback;
  } catch {
    return fallback;
  }
}

export function getFigureStudioIndex(slug = "fhqcm") {
  return readJson<FigureStudioIndex>(
    path.join(root, "books", slug, "figures", "studio", "figure-studio-index.json"),
    { cards: [] },
  );
}

export function getFigureArtDirection(slug: string, figureId: string) {
  return readJson<FigureArtDirection | null>(
    path.join(root, "books", slug, "figures", "art-direction", `${figureId}.json`),
    null,
  );
}

export function getFigureSpec(slug: string, figureId: string) {
  return readJson<FigureSpec | null>(
    path.join(root, "books", slug, "figures", "specifications", `${figureId}.json`),
    null,
  );
}

export function getAssetLedger(slug = "fhqcm") {
  return readJson<AssetLedger>(
    path.join(root, "books", slug, "figures", "asset-ledger.json"),
    { assets: [] },
  );
}

export function getFigureRecord(slug: string, figureId: string) {
  const index = getFigureStudioIndex(slug);
  const card = index.cards.find((item) => item.id === figureId);
  const art = getFigureArtDirection(slug, figureId);
  const spec = getFigureSpec(slug, figureId);
  const ledger = getAssetLedger(slug);
  const asset = ledger.assets.find((item) => item.figureId === figureId);

  return { card, art, spec, asset };
}
