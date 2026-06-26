#!/usr/bin/env bash
set -euo pipefail

mkdir -p src/lib/studio
mkdir -p src/app/studio/figures/[figureId]

cat > src/lib/studio/booksmith-studio-data.ts <<'TS'
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
TS

cat > src/app/studio/figures/page.tsx <<'TSX'
import Link from "next/link";
import { getFigureStudioIndex, getAssetLedger } from "@/lib/studio/booksmith-studio-data";

export default function FigureStudioPage() {
  const slug = "fhqcm";
  const index = getFigureStudioIndex(slug);
  const ledger = getAssetLedger(slug);

  const cards = index.cards ?? [];

  const counts = {
    total: cards.length,
    approved: ledger.assets?.filter((a: any) => a.approvedForPrint).length ?? 0,
    needsAi: ledger.assets?.filter((a: any) => !a.asset).length ?? 0,
    needsReview: ledger.assets?.filter((a: any) => a.asset && !a.approvedForPrint).length ?? 0,
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-8 text-zinc-100">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-400">BookSmith Studio</p>
          <h1 className="mt-2 text-4xl font-bold">Figure Studio</h1>
          <p className="mt-3 max-w-3xl text-zinc-400">
            Review figure context, art direction, prompt strategy, asset status, and approval readiness.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Stat label="Figures" value={counts.total} />
          <Stat label="Approved" value={counts.approved} />
          <Stat label="Needs AI" value={counts.needsAi} />
          <Stat label="Needs Review" value={counts.needsReview} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card: any) => (
            <Link
              key={card.id}
              href={`/studio/figures/${card.id}`}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow hover:border-amber-400"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-amber-400">{card.id}</p>
                  <h2 className="mt-1 text-xl font-semibold">{card.title}</h2>
                </div>
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                  {card.status}
                </span>
              </div>

              <p className="mt-3 text-sm text-zinc-400">{card.figureType}</p>
              <p className="mt-4 line-clamp-4 text-sm leading-6 text-zinc-300">
                {card.surroundingTextPreview}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-amber-300">{value}</p>
    </div>
  );
}
TSX

cat > src/app/studio/figures/[figureId]/page.tsx <<'TSX'
import Link from "next/link";
import { getFigureRecord } from "@/lib/studio/booksmith-studio-data";

export default function FigureDetailPage({ params }: { params: { figureId: string } }) {
  const slug = "fhqcm";
  const { card, art, spec, asset } = getFigureRecord(slug, params.figureId);

  if (!card) {
    return (
      <main className="min-h-screen bg-zinc-950 p-8 text-zinc-100">
        <p>Figure not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-8 text-zinc-100">
      <section className="mx-auto max-w-7xl">
        <Link href="/studio/figures" className="text-sm text-amber-400">← Back to Figure Studio</Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-400">{card.id}</p>
            <h1 className="mt-2 text-4xl font-bold">{card.title}</h1>
            <p className="mt-3 text-zinc-400">{card.caption}</p>

            <Panel title="Manuscript Context">
              <p className="whitespace-pre-wrap leading-7 text-zinc-300">
                {spec?.placementContext?.surroundingText ?? card.surroundingTextPreview}
              </p>
            </Panel>

            <Panel title="Art Direction">
              <div className="space-y-3 text-sm leading-6 text-zinc-300">
                <p><b>Type:</b> {art?.figureType ?? card.figureType}</p>
                <p><b>Composition:</b> {art?.composition?.layout}</p>
                <p><b>Camera:</b> {art?.composition?.camera}</p>
                <p><b>Color Logic:</b> {art?.composition?.colorLogic}</p>
                <p><b>Label Policy:</b> {art?.composition?.labelPolicy}</p>
              </div>
            </Panel>

            <Panel title="Provider-Agnostic Prompt">
              <pre className="whitespace-pre-wrap rounded-xl bg-black/40 p-4 text-sm leading-6 text-zinc-300">
                {art?.prompts?.providerAgnostic ?? spec?.promptCompiler?.finalPrompt ?? "No prompt yet."}
              </pre>
            </Panel>
          </div>

          <aside className="space-y-6">
            <Panel title="Asset Status">
              <div className="space-y-2 text-sm text-zinc-300">
                <p><b>Status:</b> {asset?.status ?? card.status}</p>
                <p><b>Approved:</b> {asset?.approvedForPrint ? "yes" : "no"}</p>
                <p><b>Asset:</b> {asset?.asset ?? "none"}</p>
                <p><b>Checksum:</b> {asset?.checksumSha256 ?? "none"}</p>
              </div>
            </Panel>

            <Panel title="Required Objects">
              <List items={art?.knowledge?.requiredObjects ?? []} />
            </Panel>

            <Panel title="Forbidden Objects">
              <List items={art?.knowledge?.forbiddenObjects ?? []} />
            </Panel>

            <Panel title="QA Checklist">
              <List items={art?.qaChecklist ?? []} />
            </Panel>

            <Panel title="Plain-Language Revision">
              <p className="text-sm leading-6 text-zinc-400">
                Next UI step: a text box here will let the author say things like
                “make this clearer, less mystical, more like a scientific diagram,” then BookSmith will rewrite that into a better prompt before generation.
              </p>
            </Panel>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
      <h2 className="mb-4 text-lg font-semibold text-amber-300">{title}</h2>
      {children}
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm text-zinc-300">
      {items.length ? items.map((item) => <li key={item}>• {item}</li>) : <li>None.</li>}
    </ul>
  );
}
TSX

node <<'NODE'
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

pkg.scripts = {
  ...pkg.scripts,
  "studio:figures:prepare": "npm run figure:art-director:pipeline:fhqcm",
  "studio:dev": "npm run studio:figures:prepare && npm run dev"
};

fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
NODE

npm run studio:figures:prepare

echo
echo "Studio installed."
echo "Run:"
echo "npm run dev"
echo
echo "Then open:"
echo "http://localhost:3000/studio/figures"
