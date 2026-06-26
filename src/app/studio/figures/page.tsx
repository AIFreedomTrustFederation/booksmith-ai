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
