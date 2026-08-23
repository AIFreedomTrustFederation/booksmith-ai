import Link from "next/link";

import citations from "../../../library/citation-registry.json";
import concepts from "../../../library/concept-registry.json";
import references from "../../../library/reference-registry.json";
import thinkers from "../../../library/thinker-registry.json";
import { loadFederatedLibrary, type BookshelfBook } from "@/lib/library/load-library";
import { getLibraryCapabilitySnapshots, type BookCapabilitySnapshot } from "@/lib/studio/studio-capabilities";

function Pill({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "amber" | "slate" }) {
  const tones = {
    green: "border-[#41664d] bg-[#173522] text-[#bfe2c7]",
    amber: "border-[#755f34] bg-[#302818] text-[#f0c979]",
    slate: "border-[#34493b] bg-[#101e15] text-[#9eb2a2]",
  };
  return <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${tones[tone]}`}>{children}</span>;
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-[#294735] bg-[#0b1a11] p-4">
      <p className="text-2xl font-black text-[#f1dfb7]">{value.toLocaleString()}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#718978]">{label}</p>
    </div>
  );
}

function CapabilityDots({ snapshot }: { snapshot: BookCapabilitySnapshot }) {
  const items = [
    ["Manuscript", snapshot.manuscriptFiles > 0],
    ["Sources", snapshot.sourceFiles > 0],
    ["Claims", snapshot.hasClaimLedger],
    ["Figures", snapshot.hasFigureStudio || snapshot.figureFiles > 0],
    ["LaTeX", snapshot.hasLatexProject],
    ["Publish", snapshot.hasPublishingMetadata || snapshot.publishingFiles > 0],
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
      {items.map(([label, ready]) => (
        <div className={`rounded-lg border px-2 py-2 text-center ${ready ? "border-[#31523b] bg-[#102219]" : "border-[#1f3025] bg-[#08130c] opacity-45"}`} key={label}>
          <span className={`mx-auto block h-1.5 w-1.5 rounded-full ${ready ? "bg-[#a5c49f]" : "bg-[#45584b]"}`} />
          <span className="mt-1 block text-[8px] font-black uppercase tracking-[0.08em] text-[#718978]">{label}</span>
        </div>
      ))}
    </div>
  );
}

function BookCard({ book, snapshot }: { book: BookshelfBook; snapshot: BookCapabilitySnapshot }) {
  const display = book.config ?? book.registry;
  const active = display.status === "active" || display.status === "drafting";

  return (
    <article className="group rounded-3xl border border-[#294735] bg-[#0b1a11] p-5 transition hover:-translate-y-0.5 hover:border-[#5b6846] hover:bg-[#0e2116]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.17em] text-[#718978]">{display.series}</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-[#eef4ee]">{display.title}</h2>
          {book.config?.subtitle ? <p className="mt-1 text-sm text-[#9caf9f]">{book.config.subtitle}</p> : null}
        </div>
        <Pill tone={active ? "green" : "slate"}>{display.status}</Pill>
      </div>

      <p className="mt-4 line-clamp-4 text-sm leading-7 text-[#91a997]">{display.purpose}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Pill tone={book.config ? "green" : "amber"}>{book.config ? "configured" : "config missing"}</Pill>
        <Pill tone={book.connectedSources.length ? "green" : "slate"}>{book.connectedSources.length} connected sources</Pill>
        <Pill tone={snapshot.capabilityScore >= 50 ? "green" : "slate"}>{snapshot.capabilityScore}% production surface</Pill>
      </div>

      <div className="mt-5">
        <CapabilityDots snapshot={snapshot} />
      </div>

      {book.issues.length ? (
        <div className="mt-4 rounded-xl border border-[#755f34] bg-[#211c12] p-3 text-xs leading-6 text-[#d0bd92]">
          <strong>Needs attention:</strong> {book.issues.join(" · ")}
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#213b2b] pt-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#607765]">
          {snapshot.manuscriptFiles} manuscript · {snapshot.sourceFiles} source · {snapshot.figureFiles} visual files
        </span>
        <Link className="rounded-xl border border-[#47624e] px-4 py-2 text-xs font-black text-[#dce8de] transition hover:bg-[#1b3524]" href={`/studio/books/${book.registry.slug}`}>
          Open book
        </Link>
      </div>
    </article>
  );
}

export default async function StudioPage() {
  const library = await loadFederatedLibrary();
  const indexed = getLibraryCapabilitySnapshots(library.books);
  const configuredBooks = library.books.filter((book) => book.config).length;
  const activeBooks = library.books.filter((book) => ["active", "drafting"].includes((book.config ?? book.registry).status)).length;
  const sourceConnectedBooks = new Set(library.sources.sources.map((source) => source.bookSlug)).size;
  const productionBooks = indexed.filter(({ snapshot }) => snapshot.capabilityScore >= 50).length;
  const energence = indexed.find(({ book }) => book.registry.slug === "energence");
  const fhqcm = indexed.find(({ book }) => book.registry.slug === "fhqcm");

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1650px]">
        <header className="relative overflow-hidden rounded-[2rem] border border-[#2e4b37] bg-[#0a1a11] p-6 shadow-[0_35px_120px_rgba(0,0,0,0.28)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-[#7f683d]/30" />
          <div className="pointer-events-none absolute -right-4 -top-8 h-48 w-48 rounded-full border border-[#55715c]/30" />
          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_440px] xl:items-end">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.34em] text-[#d4a85f]">The Living Manuscript</p>
              <h1 className="mt-4 max-w-5xl text-4xl font-black tracking-[-0.04em] text-[#f2f0e8] sm:text-6xl lg:text-7xl">
                Write the book. Let intelligence carry the structure around it.
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-[#9eb2a2]">
                Booksmith is the author-first workspace for manuscripts, canon, claims, sources, figures, proof, provenance, and publication. Human work remains authoritative; machine intelligence enters as inspectable proposal and governed production support.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                {energence?.snapshot.hasLivingManuscript ? (
                  <Link className="rounded-xl bg-[#d4a85f] px-5 py-3 text-sm font-black text-[#172015] transition hover:bg-[#e8bd74]" href="/studio/books/energence/living-manuscript">
                    Enter the Living Manuscript
                  </Link>
                ) : null}
                <Link className="rounded-xl border border-[#46604d] px-5 py-3 text-sm font-black text-[#d8e7da] transition hover:bg-[#13271a]" href="/studio/library">
                  Explore the Library
                </Link>
                <Link className="rounded-xl border border-[#46604d] px-5 py-3 text-sm font-black text-[#d8e7da] transition hover:bg-[#13271a]" href="/studio/production">
                  Open Production
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-[#334f3b] bg-[#07130d]/80 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.23em] text-[#718978]">Federated knowledge state</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Metric label="Registered books" value={library.books.length} />
                <Metric label="Configured books" value={configuredBooks} />
                <Metric label="Concepts" value={concepts.concepts.length} />
                <Metric label="Thinkers" value={thinkers.thinkers.length} />
                <Metric label="References" value={references.references.length} />
                <Metric label="Citation sets" value={citations.citationSets.length} />
              </div>
              <p className="mt-4 text-xs leading-6 text-[#718978]">Registry version {library.registry.version} · {library.sources.sources.length} explicit source records · {sourceConnectedBooks} books with connected source records.</p>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5 transition hover:border-[#6d5a37] hover:bg-[#17170e]" href="/studio/books/energence/living-manuscript">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d4a85f]">Authoring</p>
            <h2 className="mt-2 text-xl font-black">Living Manuscript</h2>
            <p className="mt-3 text-sm leading-7 text-[#8fa494]">Book Tree, canonical text, local working drafts, proposal staging, Claim Ledger, Chapter Forge, and semantic memory.</p>
          </Link>
          <Link className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5 transition hover:border-[#6d5a37] hover:bg-[#17170e]" href="/studio/library">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d4a85f]">Research</p>
            <h2 className="mt-2 text-xl font-black">Federated Library</h2>
            <p className="mt-3 text-sm leading-7 text-[#8fa494]">Books, concepts, thinkers, references, citation domains, and explicit connected source records in one searchable surface.</p>
          </Link>
          <Link className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5 transition hover:border-[#6d5a37] hover:bg-[#17170e]" href="/studio/production">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d4a85f]">Production</p>
            <h2 className="mt-2 text-xl font-black">Proof & Publish</h2>
            <p className="mt-3 text-sm leading-7 text-[#8fa494]">Surface the real LaTeX, proof, bibliography, publishing metadata, export, and publication-engine state of each book.</p>
          </Link>
          <Link className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5 transition hover:border-[#6d5a37] hover:bg-[#17170e]" href="/studio/figures">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d4a85f]">Visuals</p>
            <h2 className="mt-2 text-xl font-black">Figure Studio</h2>
            <p className="mt-3 text-sm leading-7 text-[#8fa494]">Review real figure specifications, art direction, asset state, approval readiness, and print provenance.</p>
          </Link>
        </section>

        <section className="mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#718978]">The bookshelf</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">Every book remains sovereign. The library remembers the relationships.</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Pill>{activeBooks} active/drafting</Pill>
              <Pill tone="slate">{productionBooks} production-rich</Pill>
              {fhqcm ? <Pill tone="amber">FHQCM {fhqcm.snapshot.capabilityScore}% surface</Pill> : null}
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {indexed.map(({ book, snapshot }) => <BookCard book={book} key={book.registry.slug} snapshot={snapshot} />)}
          </div>
        </section>
      </section>
    </main>
  );
}
