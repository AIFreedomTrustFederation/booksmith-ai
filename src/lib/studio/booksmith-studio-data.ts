import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

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
  return readJson<any>(
    path.join(root, "books", slug, "figures", "studio", "figure-studio-index.json"),
    { cards: [] },
  );
}

export function getFigureArtDirection(slug: string, figureId: string) {
  return readJson<any>(
    path.join(root, "books", slug, "figures", "art-direction", `${figureId}.json`),
    null,
  );
}

export function getFigureSpec(slug: string, figureId: string) {
  return readJson<any>(
    path.join(root, "books", slug, "figures", "specifications", `${figureId}.json`),
    null,
  );
}

export function getAssetLedger(slug = "fhqcm") {
  return readJson<any>(
    path.join(root, "books", slug, "figures", "asset-ledger.json"),
    { assets: [] },
  );
}

export function getFigureRecord(slug: string, figureId: string) {
  const index = getFigureStudioIndex(slug);
  const card = index.cards?.find((item: any) => item.id === figureId);
  const art = getFigureArtDirection(slug, figureId);
  const spec = getFigureSpec(slug, figureId);
  const ledger = getAssetLedger(slug);
  const asset = ledger.assets?.find((item: any) => item.figureId === figureId);

  return { card, art, spec, asset };
}
