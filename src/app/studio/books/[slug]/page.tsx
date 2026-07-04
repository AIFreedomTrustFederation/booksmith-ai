import Link from "next/link";
import { notFound } from "next/navigation";

import { loadFederatedLibrary, type BookshelfBook } from "@/lib/library/load-library";

function StatusPill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-[#eef7ea] px-3 py-1 text-xs font-black text-[#3f674b]">{children}</span>;
}

function WorkflowCard({ title, status, body }: { title: string; status: string; body: string }) {
  return (
    <article className="rounded-2xl border border-[#dfe8da] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-black">{title}</h2>
        <StatusPill>{status}</StatusPill>
      </div>
      <p className="mt-3 text-sm leading-6 text-[#607064]">{body}</p>
    </article>
  );
}

function FolderPanel({ book }: { book: BookshelfBook }) {
  return (
    <section className="rounded-2xl border border-[#dfe8da] bg-white p-5 shadow-sm">
      <h2 className="font-black">Repository spine</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-5">
        {Object.entries(book.folders).map(([name, exists]) => (
          <div className="rounded-xl bg-[#f8fbf5] p-3 text-sm" key={name}>
            <p className="font-bold capitalize">{name}</p>
            <p className="mt-1 text-[#607064]">{exists ? "present" : "not started"}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function StudioBookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const library = await loadFederatedLibrary();
  const book = library.books.find((candidate) => candidate.registry.slug === slug);

  if (!book) notFound();

  const display = book.config ?? book.registry;

  return (
    <main className="min-h-screen bg-[#f4f8f1] p-6 text-[#17201a]">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#48725b]">
              Book cockpit
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight">{display.title}</h1>
            {book.config?.subtitle ? <p className="mt-2 text-lg text-[#607064]">{book.config.subtitle}</p> : null}
            <p className="mt-4 max-w-3xl text-sm leading-6 text-[#607064]">{display.purpose}</p>
          </div>
          <Link
            className="rounded-full border border-[#d8e1d1] bg-white px-4 py-2 text-center text-sm font-bold text-[#173322] shadow-sm transition hover:bg-[#eef7ea]"
            href="/studio"
          >
            Back to Studio
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <StatusPill>{display.status}</StatusPill>
          <StatusPill>{display.series}</StatusPill>
          <StatusPill>{book.config ? book.configPath : "config missing"}</StatusPill>
          <StatusPill>{book.connectedSources.length} sources</StatusPill>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-5">
            <FolderPanel book={book} />

            <div className="grid gap-4 md:grid-cols-2">
              <WorkflowCard
                title="Chapter Studio"
                status="planned"
                body="Next step: read manuscript files, expose chapter sections, and save edits through a server-only write path with provenance."
              />
              <WorkflowCard
                title="AI Task Actions"
                status="planned"
                body="Drafting, rewriting, editing, continuity, citations, story-bible, and marketing actions should call runAiTask only from server workflows."
              />
              <WorkflowCard
                title="Publishing Packet"
                status={book.config?.publishingTargets?.length ? "detected" : "planned"}
                body={book.config?.publishingTargets?.length ? book.config.publishingTargets.join(" · ") : "No publishing targets declared yet."}
              />
              <WorkflowCard
                title="Figure Studio"
                status={book.folders.assets ? "detected" : "planned"}
                body="Figure, cover, diagram, and launch image work should remain approval-driven with prompt, model, rights, and output provenance."
              />
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-[#dfe8da] bg-white p-5 shadow-sm">
              <h2 className="font-black">Config integrity</h2>
              {book.issues.length ? (
                <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-[#67543c]">
                  {book.issues.map((issue) => <li key={issue}>{issue}</li>)}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-[#607064]">Registry and book config match.</p>
              )}
            </section>

            <section className="rounded-2xl border border-[#dfe8da] bg-white p-5 shadow-sm">
              <h2 className="font-black">Canonical terms</h2>
              <p className="mt-4 text-sm leading-6 text-[#607064]">
                {book.config?.canonicalTerms?.length ? book.config.canonicalTerms.join(" · ") : "No canonical terms declared yet."}
              </p>
            </section>

            <section className="rounded-2xl border border-[#dfe8da] bg-white p-5 shadow-sm">
              <h2 className="font-black">Connected sources</h2>
              <div className="mt-4 space-y-3">
                {book.connectedSources.length ? book.connectedSources.map((source) => (
                  <div className="rounded-xl bg-[#f8fbf5] p-3 text-sm" key={source.sourceId}>
                    <p className="font-bold">{source.sourceId}</p>
                    <p className="mt-1 text-[#607064]">{source.sourceType} · {source.status}</p>
                    <p className="mt-1 break-words text-xs text-[#607064]">{source.location}</p>
                  </div>
                )) : <p className="text-sm text-[#607064]">No source records connected to this book yet.</p>}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
