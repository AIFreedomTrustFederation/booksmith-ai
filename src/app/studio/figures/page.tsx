import Link from "next/link";

import { loadFederatedLibrary } from "@/lib/library/load-library";
import { getAssetLedger, getFigureStudioIndex } from "@/lib/studio/booksmith-studio-data";
import { getBookCapabilitySnapshot } from "@/lib/studio/studio-capabilities";

export default async function FigureStudioPage() {
  const library = await loadFederatedLibrary();
  const figureBooks = library.books
    .map((book) => ({ book, snapshot: getBookCapabilitySnapshot(book), index: getFigureStudioIndex(book.registry.slug), ledger: getAssetLedger(book.registry.slug) }))
    .filter(({ snapshot, index }) => snapshot.hasFigureStudio || index.cards.length > 0);

  const totals = figureBooks.reduce(
    (sum, item) => ({
      figures: sum.figures + item.index.cards.length,
      approved: sum.approved + item.ledger.assets.filter((asset) => asset.approvedForPrint).length,
      missing: sum.missing + item.ledger.assets.filter((asset) => !asset.asset).length,
      review: sum.review + item.ledger.assets.filter((asset) => asset.asset && !asset.approvedForPrint).length,
    }),
    { figures: 0, approved: 0, missing: 0, review: 0 },
  );

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1600px]">
        <header className="rounded-[2rem] border border-[#2e4b37] bg-[#0a1a11] p-6 sm:p-8 lg:p-10">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#d4a85f]">Figure Studio</p>
          <h1 className="mt-4 max-w-5xl text-4xl font-black tracking-[-0.03em] sm:text-6xl">Illustration with context, direction, and approval.</h1>
          <p className="mt-5 max-w-4xl text-base leading-8 text-[#9eb2a2]">
            Figures remain connected to the manuscript around them. Booksmith surfaces real figure cards, art direction, prompt strategy, asset state, and print approval instead of treating image generation as a disconnected prompt box.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Figures indexed" value={totals.figures} />
            <Stat label="Approved for print" value={totals.approved} />
            <Stat label="Assets missing" value={totals.missing} />
            <Stat label="Needs review" value={totals.review} />
          </div>
        </header>

        <div className="mt-6 space-y-8">
          {figureBooks.map(({ book, index, ledger }) => {
            const display = book.config ?? book.registry;
            return (
              <section key={book.registry.slug}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#718978]">{display.series}</p>
                    <h2 className="mt-1 text-2xl font-black">{display.title}</h2>
                  </div>
                  <Link className="text-xs font-bold text-[#b8cbbd] hover:text-white" href={`/studio/books/${book.registry.slug}`}>Book cockpit →</Link>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {index.cards.map((card) => {
                    const asset = ledger.assets.find((item) => item.figureId === card.id);
                    return (
                      <Link
                        className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5 transition hover:-translate-y-0.5 hover:border-[#6d5a37] hover:bg-[#15180f]"
                        href={`/studio/figures/${book.registry.slug}--${encodeURIComponent(card.id)}`}
                        key={`${book.registry.slug}-${card.id}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#d4a85f]">{card.id}</p>
                            <h3 className="mt-2 text-lg font-black">{card.title}</h3>
                          </div>
                          <span className={`rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] ${asset?.approvedForPrint ? "border-[#41664d] bg-[#173522] text-[#bfe2c7]" : "border-[#755f34] bg-[#302818] text-[#f0c979]"}`}>
                            {asset?.approvedForPrint ? "approved" : asset?.status ?? card.status}
                          </span>
                        </div>
                        <p className="mt-3 text-xs font-bold uppercase tracking-[0.11em] text-[#718978]">{card.figureType}</p>
                        <p className="mt-3 line-clamp-4 text-sm leading-7 text-[#91a997]">{card.surroundingTextPreview}</p>
                        <div className="mt-4 border-t border-[#213b2b] pt-3 text-[10px] text-[#718978]">{asset?.asset ? "Asset connected" : "Asset not connected"} · Open context →</div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {!figureBooks.length ? <div className="rounded-3xl border border-dashed border-[#35513e] bg-[#09170f] p-10 text-center text-sm text-[#718978]">No book currently exposes a Figure Studio index.</div> : null}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#294735] bg-[#07130d] p-4">
      <p className="text-2xl font-black text-[#f1dfb7]">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.13em] text-[#718978]">{label}</p>
    </div>
  );
}
