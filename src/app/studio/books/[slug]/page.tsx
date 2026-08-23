import Link from "next/link";
import { notFound } from "next/navigation";

import { loadFederatedLibrary } from "@/lib/library/load-library";
import { getBookCapabilitySnapshot, listBookFiles } from "@/lib/studio/studio-capabilities";

export async function generateStaticParams() {
  const library = await loadFederatedLibrary();
  return library.books.map((book) => ({ slug: book.registry.slug }));
}

function Pill({ children, ready = true }: { children: React.ReactNode; ready?: boolean }) {
  return <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.11em] ${ready ? "border-[#41664d] bg-[#173522] text-[#bfe2c7]" : "border-[#34493b] bg-[#101e15] text-[#718978]"}`}>{children}</span>;
}

function WorkflowCard({ title, eyebrow, body, href, enabled = true }: { title: string; eyebrow: string; body: string; href?: string; enabled?: boolean }) {
  const content = (
    <>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#d4a85f]">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-black">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-[#91a997]">{body}</p>
      <p className="mt-5 text-xs font-black uppercase tracking-[0.12em] text-[#718978]">{enabled ? "Open surface →" : "No active surface yet"}</p>
    </>
  );

  if (href && enabled) {
    return <Link className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5 transition hover:border-[#6d5a37] hover:bg-[#15180f]" href={href}>{content}</Link>;
  }
  return <div className="rounded-3xl border border-[#22372a] bg-[#09150e] p-5 opacity-65">{content}</div>;
}

export default async function StudioBookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const library = await loadFederatedLibrary();
  const book = library.books.find((candidate) => candidate.registry.slug === slug);
  if (!book) notFound();

  const display = book.config ?? book.registry;
  const snapshot = getBookCapabilitySnapshot(book);
  const manuscriptFiles = listBookFiles(slug, "manuscript").slice(0, 8);
  const sourceFiles = listBookFiles(slug, "sources").slice(0, 8);
  const relatedBooks = book.config?.relatedBooks ?? [];

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1600px]">
        <header className="rounded-[2rem] border border-[#2e4b37] bg-[#0a1a11] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-5xl">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#d4a85f]">Book Cockpit · {display.series}</p>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.03em] sm:text-6xl">{display.title}</h1>
              {book.config?.subtitle ? <p className="mt-2 text-xl text-[#b8cbbd]">{book.config.subtitle}</p> : null}
              <p className="mt-5 max-w-4xl text-base leading-8 text-[#91a997]">{display.purpose}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Pill>{display.status}</Pill>
                <Pill ready={Boolean(book.config)}>{book.config ? "config aligned" : "config missing"}</Pill>
                <Pill ready={snapshot.hasProvenance}>provenance</Pill>
                <Pill ready={snapshot.hasClaimLedger}>claim ledger</Pill>
                <Pill ready={snapshot.hasLatexProject}>LaTeX</Pill>
                <Pill ready={snapshot.hasPublishingMetadata}>publishing metadata</Pill>
              </div>
            </div>
            <div className="rounded-3xl border border-[#685632] bg-[#1e190f] p-5 text-center">
              <p className="text-4xl font-black text-[#e2b96d]">{snapshot.capabilityScore}%</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.13em] text-[#9d8353]">production surface</p>
              <p className="mt-3 text-xs leading-6 text-[#8f805f]">Calculated from real manuscript, source, provenance, figures, LaTeX, proof, publishing, and export state.</p>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <WorkflowCard
            body={snapshot.hasLivingManuscript ? "Enter the complete author cockpit: Book Tree, canonical manuscript, local drafts, Booksmith Intelligence, proposals, claims, Forge, and Book Memory." : "This book does not yet have the chapter plan, claim ledger, provenance log, and figure index required by the current Living Manuscript data contract."}
            enabled={snapshot.hasLivingManuscript}
            eyebrow="Authoring"
            href={snapshot.hasLivingManuscript ? `/studio/books/${slug}/living-manuscript` : undefined}
            title="Living Manuscript"
          />
          <WorkflowCard
            body={`${snapshot.sourceFiles} source files and ${book.connectedSources.length} explicit connected-source records are visible to Booksmith. Search shared concepts, thinkers, references, and sources in the federated library.`}
            eyebrow="Research"
            href="/studio/library"
            title="Library & Sources"
          />
          <WorkflowCard
            body={snapshot.hasFigureStudio ? `${snapshot.figureFiles} figure/asset files are present with a Booksmith Figure Studio index.` : `${snapshot.figureFiles} visual files are present, but no Figure Studio index is active for this book.`}
            enabled={snapshot.hasFigureStudio}
            eyebrow="Visuals"
            href={snapshot.hasFigureStudio ? `/studio/figures?book=${slug}` : undefined}
            title="Figure Studio"
          />
          <WorkflowCard
            body={`${snapshot.latexFiles} LaTeX files, ${snapshot.proofArtifacts + snapshot.reportArtifacts} proof/report artifacts, ${snapshot.publishingFiles} publishing files, and ${snapshot.exportFiles} committed exports are detected.`}
            eyebrow="Production"
            href="/studio/production"
            title="Proof & Publish"
          />
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-5">
            <section className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#718978]">Repository manuscript</p>
                  <h2 className="mt-2 text-xl font-black">Canonical writing files</h2>
                </div>
                <Pill ready={snapshot.manuscriptFiles > 0}>{snapshot.manuscriptFiles} files</Pill>
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {manuscriptFiles.length ? manuscriptFiles.map((file) => <div className="rounded-xl border border-[#213b2b] bg-[#08160e] p-3 font-mono text-[10px] leading-5 text-[#9caf9f]" key={file}>{file}</div>) : <p className="text-sm leading-7 text-[#718978]">No manuscript files are committed for this book yet.</p>}
              </div>
            </section>

            <section className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#718978]">Evidence & provenance</p>
                  <h2 className="mt-2 text-xl font-black">Source spine</h2>
                </div>
                <Pill ready={snapshot.sourceFiles > 0}>{snapshot.sourceFiles} files</Pill>
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {sourceFiles.length ? sourceFiles.map((file) => <div className="rounded-xl border border-[#213b2b] bg-[#08160e] p-3 font-mono text-[10px] leading-5 text-[#9caf9f]" key={file}>{file}</div>) : <p className="text-sm leading-7 text-[#718978]">No source files are committed for this book yet.</p>}
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5">
              <h2 className="font-black">Canonical terms</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {book.config?.canonicalTerms?.length ? book.config.canonicalTerms.map((term) => <Pill key={term}>{term}</Pill>) : <p className="text-sm text-[#718978]">No canonical terms declared.</p>}
              </div>
            </section>

            <section className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5">
              <h2 className="font-black">Publishing targets</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {book.config?.publishingTargets?.length ? book.config.publishingTargets.map((target) => <Pill key={target}>{target}</Pill>) : <p className="text-sm text-[#718978]">No publishing targets declared.</p>}
              </div>
            </section>

            <section className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5">
              <h2 className="font-black">Related books</h2>
              <div className="mt-4 space-y-2">
                {relatedBooks.length ? relatedBooks.map((related) => {
                  const target = library.books.find((candidate) => candidate.registry.slug === related);
                  return target ? <Link className="block rounded-xl border border-[#213b2b] bg-[#08160e] p-3 text-sm font-bold text-[#b8cbbd] transition hover:border-[#5b6846]" href={`/studio/books/${related}`} key={related}>{target.registry.title}</Link> : null;
                }) : <p className="text-sm text-[#718978]">No related books declared.</p>}
              </div>
            </section>

            <section className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5">
              <h2 className="font-black">Integrity</h2>
              {book.issues.length ? <ul className="mt-4 space-y-2 text-sm text-[#d0bd92]">{book.issues.map((issue) => <li key={issue}>• {issue}</li>)}</ul> : <p className="mt-3 text-sm leading-7 text-[#91a997]">Registry and book configuration agree. Product surfaces are reporting repository state rather than fabricated progress.</p>}
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}
