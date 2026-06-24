import Link from "next/link";

import registry from "../../library/book-registry.json";

const pillars = [
  {
    title: "Author sovereignty",
    body: "Human authors keep creative control, approval authority, manuscripts, exports, and final publishing decisions.",
  },
  {
    title: "Local-first AI",
    body: "Core workflows are designed for self-hosted, inspectable, open-source, and open-weight AI paths without required paid APIs.",
  },
  {
    title: "Federated library",
    body: "Books remain sovereign projects while sharing canon, glossary terms, citations, cross-references, and provenance.",
  },
];

const workflow = [
  "Create or import a real manuscript or source packet",
  "Connect the book to shared canon, references, and concepts",
  "Revise chapters with continuity and provenance checks",
  "Typeset proofs with local LaTeX and open fonts",
  "Export the publishing packet for AI Freedom Trust Publishing",
  "Launch with metadata, blurbs, campaign assets, and approval records",
];

export default function Home() {
  const bookCount = registry.books.length;
  const seriesCount = new Set(registry.books.map((book) => book.series)).size;

  return (
    <main className="min-h-screen overflow-hidden bg-[#101811] text-[#f8fbf4]">
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(139,190,122,0.35),transparent_32%),radial-gradient(circle_at_82%_20%,rgba(233,214,154,0.22),transparent_30%),linear-gradient(135deg,#101811_0%,#173322_44%,#f4f8f1_220%)]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-black/35 to-transparent" />

        <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <Link className="group flex items-center gap-3" href="/">
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-white/10 text-lg font-black shadow-2xl backdrop-blur">
              B
            </span>
            <span>
              <span className="block text-sm font-semibold uppercase tracking-[0.28em] text-[#bde8bd]">
                Booksmith AI
              </span>
              <span className="block text-xs text-[#dbe9d7]">
                Federated publishing studio
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-[#dbe9d7] md:flex">
            <a className="transition hover:text-white" href="#platform">
              Platform
            </a>
            <a className="transition hover:text-white" href="#workflow">
              Workflow
            </a>
            <a className="transition hover:text-white" href="#library">
              Library
            </a>
          </nav>
          <Link
            className="rounded-full border border-white/15 bg-white px-4 py-2 text-sm font-bold text-[#173322] shadow-xl transition hover:bg-[#e8f5e2]"
            href="/studio"
          >
            Open Studio
          </Link>
        </header>

        <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-14 lg:grid-cols-[minmax(0,1fr)_480px] lg:px-8 lg:pb-28 lg:pt-20">
          <div>
            <p className="inline-flex rounded-full border border-[#bde8bd]/30 bg-white/10 px-4 py-2 text-sm font-semibold text-[#d7f5d4] shadow-2xl backdrop-blur">
              {registry.title} · {bookCount} seed books · {seriesCount} series
            </p>
            <h1 className="mt-8 max-w-5xl text-5xl font-black tracking-[-0.04em] text-white sm:text-7xl lg:text-8xl">
              Forge books without surrendering the soul of the manuscript.
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-[#dbe9d7] sm:text-xl">
              Booksmith AI is the creative foundry and library operating system for
              AI Freedom Trust Publishing: a local-first studio where real books,
              manuals, doctrines, theories, source lineages, citations, and publishing
              packets share one inspectable source of truth.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                className="rounded-full bg-[#d9f4cc] px-6 py-3 text-center text-sm font-black text-[#132018] shadow-2xl transition hover:bg-white"
                href="/studio"
              >
                Enter the federated studio
              </Link>
              <a
                className="rounded-full border border-white/20 px-6 py-3 text-center text-sm font-bold text-white transition hover:border-white/50 hover:bg-white/10"
                href="https://github.com/AIFreedomTrustFederation/booksmith-ai"
              >
                View the repository
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur">
            <div className="rounded-[1.5rem] border border-[#d8e1d1] bg-[#f7fbf4] p-5 text-[#17201a]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#48725b]">
                    Live registry
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight">
                    Federated library online
                  </h2>
                </div>
                <span className="rounded-full bg-[#173322] px-3 py-1 text-xs font-bold text-white">
                  Main
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {registry.books.slice(0, 6).map((book) => (
                  <div
                    className="rounded-2xl border border-[#dfe8da] bg-white px-4 py-3 shadow-sm"
                    key={book.slug}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{book.title}</span>
                      <span className="rounded-full bg-[#eef7ea] px-2.5 py-1 text-xs font-bold text-[#3f674b]">
                        {book.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#607064]">
                      {book.series}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-[#173322] p-5 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9cd4aa]">
                  Library equation
                </p>
                <p className="mt-3 text-2xl font-black leading-tight">
                  Sovereign Books + Shared Canon + Provenance + Cross-References.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f4f8f1] px-6 py-20 text-[#17201a] lg:px-8" id="platform">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-[#48725b]">
            Platform principles
          </p>
          <h2 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
            A beautiful front door for sovereign authorship.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {pillars.map((pillar) => (
              <article
                className="rounded-3xl border border-[#d8e1d1] bg-white p-6 shadow-sm"
                key={pillar.title}
              >
                <h3 className="text-xl font-black">{pillar.title}</h3>
                <p className="mt-4 leading-7 text-[#607064]">{pillar.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 text-[#17201a] lg:px-8" id="workflow">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[420px_minmax(0,1fr)]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-[#48725b]">
              Workflow
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight">
              From source packet to launch packet.
            </h2>
            <p className="mt-5 leading-8 text-[#607064]">
              Booksmith connects manuscript, story bible, editorial logic,
              citation canon, typesetting source, launch campaign, imprint metadata,
              and approval records into one traceable production system.
            </p>
          </div>
          <ol className="grid gap-4 md:grid-cols-2">
            {workflow.map((step, index) => (
              <li
                className="rounded-3xl border border-[#d8e1d1] bg-[#f8fbf5] p-5"
                key={step}
              >
                <span className="text-sm font-black text-[#48725b]">
                  0{index + 1}
                </span>
                <p className="mt-3 text-lg font-bold">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#17201a] px-6 py-20 text-white lg:px-8" id="library">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl lg:p-12">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-[#9cd4aa]">
            Federation ready
          </p>
          <h2 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
            Booksmith AI is now the authoring studio and the federated library map.
          </h2>
          <p className="mt-6 max-w-3xl leading-8 text-[#cfe7d4]">
            Every seed book can grow independently while remaining recursively linked
            through the shared canon, references, concepts, glossary, provenance,
            and publishing packet rules.
          </p>
        </div>
      </section>
    </main>
  );
}
