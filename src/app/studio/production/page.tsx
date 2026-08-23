import Link from "next/link";

import { ProductionActions } from "@/app/studio/components/production-actions";
import { loadFederatedLibrary } from "@/lib/library/load-library";
import { getLibraryCapabilitySnapshots, listBookFiles } from "@/lib/studio/studio-capabilities";

function Flag({ ready, children }: { ready: boolean; children: React.ReactNode }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.11em] ${ready ? "border-[#41664d] bg-[#173522] text-[#bfe2c7]" : "border-[#34493b] bg-[#101e15] text-[#718978]"}`}>
      {children}
    </span>
  );
}

export default async function ProductionPage() {
  const library = await loadFederatedLibrary();
  const indexed = getLibraryCapabilitySnapshots(library.books).sort((a, b) => b.snapshot.capabilityScore - a.snapshot.capabilityScore);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1600px]">
        <header className="rounded-[2rem] border border-[#2e4b37] bg-[#0a1a11] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#d4a85f]">Production Studio</p>
              <h1 className="mt-4 max-w-5xl text-4xl font-black tracking-[-0.03em] sm:text-6xl">From manuscript to proof to publication.</h1>
              <p className="mt-5 max-w-4xl text-base leading-8 text-[#9eb2a2]">Booksmith now reports the real production state present in each book and can launch the existing proof, figure, publication-gate and packet engines when the local/private Runtime is connected. GitHub Pages remains an honest read-only view.</p>
            </div>
            <Link className="rounded-xl bg-[#d4a85f] px-4 py-2.5 text-sm font-black text-[#172015]" href="/studio/runtime">Open Runtime Center</Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#294735] bg-[#07130d] p-4"><p className="text-2xl font-black text-[#f1dfb7]">{indexed.filter(({ snapshot }) => snapshot.hasLatexProject).length}</p><p className="mt-1 text-[10px] font-black uppercase tracking-[0.13em] text-[#718978]">LaTeX-capable books</p></div>
            <div className="rounded-2xl border border-[#294735] bg-[#07130d] p-4"><p className="text-2xl font-black text-[#f1dfb7]">{indexed.filter(({ snapshot }) => snapshot.proofArtifacts || snapshot.reportArtifacts).length}</p><p className="mt-1 text-[10px] font-black uppercase tracking-[0.13em] text-[#718978]">Proof/report-bearing books</p></div>
            <div className="rounded-2xl border border-[#294735] bg-[#07130d] p-4"><p className="text-2xl font-black text-[#f1dfb7]">{indexed.filter(({ snapshot }) => snapshot.hasPublishingMetadata).length}</p><p className="mt-1 text-[10px] font-black uppercase tracking-[0.13em] text-[#718978]">Publishing metadata</p></div>
            <div className="rounded-2xl border border-[#294735] bg-[#07130d] p-4"><p className="text-2xl font-black text-[#f1dfb7]">{indexed.filter(({ snapshot }) => snapshot.exportFiles).length}</p><p className="mt-1 text-[10px] font-black uppercase tracking-[0.13em] text-[#718978]">Books with exports</p></div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 xl:grid-cols-2">
          {indexed.map(({ book, snapshot }) => {
            const display = book.config ?? book.registry;
            const publishingFiles = listBookFiles(book.registry.slug, "publishing").slice(0, 6);
            const exportFiles = listBookFiles(book.registry.slug, "exports").slice(0, 6);
            return (
              <article className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5 sm:p-6" key={book.registry.slug}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#718978]">{display.series} · {display.status}</p>
                    <h2 className="mt-2 text-2xl font-black">{display.title}</h2>
                  </div>
                  <div className="rounded-2xl border border-[#685632] bg-[#1f1a10] px-4 py-3 text-center"><p className="text-2xl font-black text-[#e3bc72]">{snapshot.capabilityScore}%</p><p className="text-[9px] font-black uppercase tracking-[0.11em] text-[#927b50]">surface</p></div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Flag ready={snapshot.manuscriptFiles > 0}>manuscript {snapshot.manuscriptFiles}</Flag>
                  <Flag ready={snapshot.bibliographyFiles > 0}>bibliography {snapshot.bibliographyFiles}</Flag>
                  <Flag ready={snapshot.figureFiles > 0}>visuals {snapshot.figureFiles}</Flag>
                  <Flag ready={snapshot.hasLatexProject}>LaTeX {snapshot.latexFiles}</Flag>
                  <Flag ready={snapshot.proofArtifacts > 0 || snapshot.reportArtifacts > 0}>proof/report {snapshot.proofArtifacts + snapshot.reportArtifacts}</Flag>
                  <Flag ready={snapshot.hasPublishingMetadata}>metadata</Flag>
                  <Flag ready={snapshot.hasPublishingChecklist}>checklist</Flag>
                  <Flag ready={snapshot.exportFiles > 0}>exports {snapshot.exportFiles}</Flag>
                </div>

                <ProductionActions bookSlug={book.registry.slug} />

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-[#213b2b] bg-[#08160e] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#718978]">Publishing assets</p>
                    <div className="mt-3 space-y-2">{publishingFiles.length ? publishingFiles.map((file) => <p className="break-all font-mono text-[10px] leading-5 text-[#9caf9f]" key={file}>{file}</p>) : <p className="text-xs leading-6 text-[#607765]">No publishing files detected.</p>}</div>
                  </div>
                  <div className="rounded-2xl border border-[#213b2b] bg-[#08160e] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#718978]">Exports</p>
                    <div className="mt-3 space-y-2">{exportFiles.length ? exportFiles.map((file) => <p className="break-all font-mono text-[10px] leading-5 text-[#9caf9f]" key={file}>{file}</p>) : <p className="text-xs leading-6 text-[#607765]">No committed export files detected.</p>}</div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-[#3b482d] bg-[#15170e] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#b49358]">Equivalent local commands</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <code className="rounded-lg bg-[#070c08] px-3 py-2 text-[10px] text-[#b8cbbd]">node scripts/render-latex.mjs {book.registry.slug}</code>
                    <code className="rounded-lg bg-[#070c08] px-3 py-2 text-[10px] text-[#b8cbbd]">node scripts/proof-report.mjs {book.registry.slug}</code>
                    <code className="rounded-lg bg-[#070c08] px-3 py-2 text-[10px] text-[#b8cbbd]">node scripts/publication-gate-v2.mjs {book.registry.slug}</code>
                    <code className="rounded-lg bg-[#070c08] px-3 py-2 text-[10px] text-[#b8cbbd]">bash scripts/booksmith-publish-managed-v1.sh {book.registry.slug}</code>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap justify-end gap-2">
                  {snapshot.hasFigureStudio ? <Link className="rounded-xl border border-[#46604d] px-4 py-2 text-xs font-bold text-[#c7d8ca] hover:bg-[#13271a]" href={`/studio/figures?book=${book.registry.slug}`}>Figures</Link> : null}
                  <Link className="rounded-xl border border-[#46604d] px-4 py-2 text-xs font-bold text-[#c7d8ca] hover:bg-[#13271a]" href={`/studio/books/${book.registry.slug}`}>Book cockpit</Link>
                </div>
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}
