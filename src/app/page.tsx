import Link from "next/link";

import concepts from "../../library/concept-registry.json";
import thinkers from "../../library/thinker-registry.json";
import { loadFederatedLibrary } from "@/lib/library/load-library";
import { getLibraryCapabilitySnapshots } from "@/lib/studio/studio-capabilities";

export default async function Home() {
  const library = await loadFederatedLibrary();
  const indexed = getLibraryCapabilitySnapshots(library.books);
  const activeBooks = library.books.filter((book) => ["active", "drafting"].includes((book.config ?? book.registry).status)).length;
  const livingBooks = indexed.filter(({ snapshot }) => snapshot.hasLivingManuscript).length;
  const productionBooks = indexed.filter(({ snapshot }) => snapshot.capabilityScore >= 50).length;

  return (
    <main className="min-h-screen overflow-hidden bg-[#06110b] text-[#eef7ea]">
      <section className="relative isolate min-h-[92vh] border-b border-[#213b2b]">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_15%,rgba(62,105,77,0.34),transparent_32%),radial-gradient(circle_at_78%_10%,rgba(180,141,77,0.18),transparent_30%),linear-gradient(145deg,#06110b_0%,#0b1d13_52%,#07120c_100%)]" />
        <div className="absolute left-[12%] top-[15%] -z-10 h-72 w-72 rounded-full border border-[#65724e]/20" />
        <div className="absolute left-[18%] top-[21%] -z-10 h-48 w-48 rounded-full border border-[#ad8849]/20" />

        <header className="mx-auto flex max-w-[1650px] items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#6d5a37] bg-[#1c190f] font-serif text-xl font-black text-[#deb970]">B</span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.26em] text-[#d4a85f]">Booksmith AI</p>
              <p className="text-[10px] font-semibold text-[#718978]">AI Freedom Trust Publishing</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link className="hidden rounded-xl border border-[#314d39] px-4 py-2 text-xs font-bold text-[#b8cbbd] transition hover:bg-[#102219] hover:text-white sm:block" href="/studio/library">Library</Link>
            <Link className="rounded-xl bg-[#d4a85f] px-4 py-2 text-xs font-black text-[#172015] transition hover:bg-[#e9bf77]" href="/studio">Enter Studio</Link>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1650px] gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_500px] lg:items-center lg:pb-28 lg:pt-24">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.36em] text-[#d4a85f]">The author writes the book.</p>
            <h1 className="mt-5 max-w-5xl text-5xl font-black tracking-[-0.055em] text-[#f4f1e9] sm:text-7xl lg:text-[5.5rem] lg:leading-[0.96]">
              Intelligence should remember everything around the words without taking the words away from you.
            </h1>
            <p className="mt-7 max-w-3xl text-base leading-8 text-[#9eb2a2] sm:text-lg sm:leading-9">
              Booksmith is a sovereign manuscript and publishing studio where chapters remain connected to canon, claims, sources, figures, references, provenance, proof, and publication state. AI enters as an inspectable proposal—not a hidden author.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="rounded-xl bg-[#d4a85f] px-6 py-3.5 text-sm font-black text-[#172015] shadow-[0_10px_40px_rgba(212,168,95,0.12)] transition hover:bg-[#e9bf77]" href="/studio/books/energence/living-manuscript">
                Open Living Manuscript
              </Link>
              <Link className="rounded-xl border border-[#46604d] bg-[#09170f]/70 px-6 py-3.5 text-sm font-black text-[#d8e7da] transition hover:bg-[#13271a]" href="/studio">
                Explore Booksmith
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#334f3b] bg-[#09170f]/85 p-5 shadow-[0_35px_100px_rgba(0,0,0,0.28)] sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#718978]">Live federation state</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric value={library.books.length} label="registered books" />
              <Metric value={activeBooks} label="active / drafting" />
              <Metric value={livingBooks} label="living manuscripts" />
              <Metric value={productionBooks} label="production-rich" />
              <Metric value={concepts.concepts.length} label="shared concepts" />
              <Metric value={thinkers.thinkers.length} label="indexed thinkers" />
            </div>
            <div className="mt-4 rounded-2xl border border-[#4d432b] bg-[#17150d] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#b49358]">Author sovereignty</p>
              <p className="mt-2 text-sm leading-7 text-[#b7aa8b]">Repository manuscript is canon. Browser work remains local draft state. Generated language remains proposal until the author deliberately accepts and later persists it through a governed save path.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1650px] px-5 py-16 sm:px-8 lg:py-24">
        <div className="max-w-4xl">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4a85f]">One continuous workspace</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-6xl">The manuscript is the center. Everything else knows where it belongs.</h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <PortalCard eyebrow="Write" title="Living Manuscript" body="Navigate the Book Tree, write against canonical source, keep browser-local working drafts, preview Markdown, stage proposals, and carry chapter-aware context into Booksmith Intelligence." href="/studio/books/energence/living-manuscript" />
          <PortalCard eyebrow="Remember" title="Federated Library" body="Search books, concepts, intellectual genealogy, reference keys, and explicit source records without collapsing independent books into one undifferentiated context window." href="/studio/library" />
          <PortalCard eyebrow="Visualize" title="Figure Studio" body="Keep illustration intent connected to manuscript context, art direction, prompts, asset status, checksums, QA, and explicit print approval." href="/studio/figures" />
          <PortalCard eyebrow="Finish" title="Proof & Publish" body="See the real LaTeX, bibliography, proof/report, publishing metadata, checklist, and export state that feeds Booksmith's existing local-first production engines." href="/studio/production" />
        </div>
      </section>

      <section className="border-y border-[#213b2b] bg-[#08160e]">
        <div className="mx-auto grid max-w-[1650px] gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:py-20">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4a85f]">The Booksmith covenant</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em]">Human canon stays human.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Principle title="Canon" body="User-authored or explicitly approved text remains authoritative source, not disposable prompt history." />
            <Principle title="Proposal" body="AI can draft, revise, analyze, and assemble context, but generated language stays visibly unapproved until accepted." />
            <Principle title="Provenance" body="Sources, claims, figures, revisions, model choices, and publication state remain inspectable around the work." />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1650px] px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4a85f]">Begin inside the work</p>
            <h2 className="mt-4 max-w-4xl text-4xl font-black tracking-[-0.04em] sm:text-6xl">Not another blank chat box. A place where a book can remember itself.</h2>
          </div>
          <div className="flex flex-col gap-3">
            <Link className="rounded-xl bg-[#d4a85f] px-6 py-4 text-center text-sm font-black text-[#172015] transition hover:bg-[#e9bf77]" href="/studio">Enter Booksmith Studio</Link>
            <Link className="rounded-xl border border-[#46604d] px-6 py-4 text-center text-sm font-black text-[#d8e7da] transition hover:bg-[#13271a]" href="/studio/system">Inspect local system readiness</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#213b2b] px-5 py-7 text-center text-xs leading-6 text-[#607765] sm:px-8">
        Booksmith AI · Author-first manuscript intelligence and publishing infrastructure · AI Freedom Trust Federation
      </footer>
    </main>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return <div className="rounded-2xl border border-[#294735] bg-[#07120c] p-4"><p className="text-3xl font-black text-[#f1dfb7]">{value}</p><p className="mt-1 text-[9px] font-black uppercase tracking-[0.13em] text-[#718978]">{label}</p></div>;
}

function PortalCard({ eyebrow, title, body, href }: { eyebrow: string; title: string; body: string; href: string }) {
  return <Link className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-6 transition hover:-translate-y-1 hover:border-[#6d5a37] hover:bg-[#15180f]" href={href}><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d4a85f]">{eyebrow}</p><h3 className="mt-2 text-2xl font-black">{title}</h3><p className="mt-4 text-sm leading-7 text-[#91a997]">{body}</p><p className="mt-6 text-xs font-black uppercase tracking-[0.12em] text-[#b8cbbd]">Open →</p></Link>;
}

function Principle({ title, body }: { title: string; body: string }) {
  return <div className="rounded-2xl border border-[#294735] bg-[#0b1a11] p-5"><h3 className="text-lg font-black text-[#f1dfb7]">{title}</h3><p className="mt-2 text-sm leading-7 text-[#91a997]">{body}</p></div>;
}
