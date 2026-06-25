import Link from "next/link";

import citations from "../../../library/citation-registry.json";
import concepts from "../../../library/concept-registry.json";
import { loadFederatedLibrary, type BookshelfBook } from "@/lib/library/load-library";

function folderLabel(value: boolean) {
  return value ? "present" : "not started";
}

function BookCard({ book }: { book: BookshelfBook }) {
  const display = book.config ?? book.registry;
  const folderEntries = Object.entries(book.folders);
  const hasIssue = book.issues.length > 0;

  return (
    <article className="rounded-2xl border border-[#dfe8da] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-tight">{display.title}</h2>
          {book.config?.subtitle ? (
            <p className="mt-1 text-sm leading-6 text-[#607064]">{book.config.subtitle}</p>
          ) : null}
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#607064]">
            {display.series}
          </p>
        </div>
        <span className="rounded-full bg-[#eef7ea] px-2.5 py-1 text-xs font-bold text-[#3f674b]">
          {display.status}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-[#526358]">{display.purpose}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-full bg-[#f5f0e6] px-2.5 py-1 text-[#67543c]">
          {book.config ? book.configPath : "config missing"}
        </span>
        <span className="rounded-full bg-[#eef7ea] px-2.5 py-1 text-[#3f674b]">
          {book.connectedSources.length} connected sources
        </span>
        {book.config?.provenanceRequired ? (
          <span className="rounded-full bg-[#eef7ea] px-2.5 py-1 text-[#3f674b]">
            provenance required
          </span>
        ) : null}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
        {folderEntries.map(([folder, exists]) => (
          <div className="rounded-xl bg-[#f8fbf5] p-2" key={folder}>
            <dt className="font-bold capitalize text-[#17201a]">{folder}</dt>
            <dd className="mt-1 text-[#607064]">{folderLabel(exists)}</dd>
          </div>
        ))}
      </dl>

      {book.config?.canonicalTerms?.length ? (
        <div className="mt-4">
          <h3 className="text-xs font-black uppercase tracking-[0.16em] text-[#48725b]">
            Canonical terms
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#607064]">
            {book.config.canonicalTerms.join(" · ")}
          </p>
        </div>
      ) : null}

      {book.config?.publishingTargets?.length ? (
        <div className="mt-4">
          <h3 className="text-xs font-black uppercase tracking-[0.16em] text-[#48725b]">
            Publishing targets
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#607064]">
            {book.config.publishingTargets.join(" · ")}
          </p>
        </div>
      ) : null}

      {hasIssue ? (
        <div className="mt-4 rounded-xl border border-[#ead4b8] bg-[#fff8ee] p-3 text-sm text-[#67543c]">
          <p className="font-bold">Needs attention</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            {book.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

export default async function StudioPage() {
  const library = await loadFederatedLibrary();
  const configuredBooks = library.books.filter((book) => book.config).length;
  const sourceConnectedBooks = new Set(library.sources.sources.map((source) => source.bookSlug)).size;

  return (
    <main className="min-h-screen bg-[#f4f8f1] p-6 text-[#17201a]">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#48725b]">
              Booksmith AI Studio
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight">{library.registry.title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-[#607064]">
              {library.registry.description}
            </p>
          </div>
          <Link
            className="rounded-full border border-[#d8e1d1] bg-white px-4 py-2 text-center text-sm font-bold text-[#173322] shadow-sm transition hover:bg-[#eef7ea]"
            href="/"
          >
            Back home
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 text-sm font-semibold">
          <span className="rounded-full bg-[#eef7ea] px-3 py-1 text-[#3f674b]">
            {library.books.length} registered books
          </span>
          <span className="rounded-full bg-[#eef7ea] px-3 py-1 text-[#3f674b]">
            {configuredBooks} configs loaded
          </span>
          <span className="rounded-full bg-[#eef7ea] px-3 py-1 text-[#3f674b]">
            {sourceConnectedBooks} books with sources
          </span>
          <span className="rounded-full bg-[#eef7ea] px-3 py-1 text-[#3f674b]">
            {library.sources.sources.length} source records
          </span>
          <span className="rounded-full bg-[#eef7ea] px-3 py-1 text-[#3f674b]">
            {citations.citationSets.length} citation sets
          </span>
          <span className="rounded-full bg-[#f5f0e6] px-3 py-1 text-[#67543c]">
            {concepts.concepts.length} concepts
          </span>
          <span className="rounded-full bg-[#f5f0e6] px-3 py-1 text-[#67543c]">
            v{library.registry.version}
          </span>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section aria-label="Registry-powered bookshelf" className="grid gap-4 md:grid-cols-2">
            {library.books.length ? (
              library.books.map((book) => <BookCard book={book} key={book.registry.slug} />)
            ) : (
              <div className="rounded-2xl border border-[#dfe8da] bg-white p-6 text-sm leading-6 text-[#607064]">
                No books are registered yet. Add real entries to library/book-registry.json and books/&lt;slug&gt;/book.config.json.
              </div>
            )}
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-[#dfe8da] bg-white p-5 shadow-sm">
              <h2 className="font-black">Bookshelf source of truth</h2>
              <p className="mt-3 text-sm leading-6 text-[#607064]">
                This screen is assembled from library/book-registry.json, each registered book.config.json, repository folders, and source-registry records. Missing files are shown as honest empty states instead of fake projects.
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <p><span className="font-bold">Series:</span> {library.series.join(" · ")}</p>
                <p><span className="font-bold">Statuses:</span> {library.statuses.join(" · ")}</p>
              </div>
            </section>

            <section className="rounded-2xl border border-[#dfe8da] bg-white p-5 shadow-sm">
              <h2 className="font-black">Connected sources</h2>
              <div className="mt-4 space-y-3">
                {library.sources.sources.length ? (
                  library.sources.sources.map((source) => (
                    <div className="rounded-xl bg-[#f8fbf5] p-3 text-sm" key={source.sourceId}>
                      <p className="font-bold">{source.sourceId}</p>
                      <p className="mt-1 text-[#607064]">{source.bookSlug} · {source.sourceType} · {source.status}</p>
                      <p className="mt-1 break-words text-xs text-[#607064]">{source.location}</p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl bg-[#f8fbf5] p-3 text-sm text-[#607064]">
                    No source records are connected yet.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-[#dfe8da] bg-white p-5 shadow-sm">
              <h2 className="font-black">Citation sets</h2>
              <div className="mt-4 space-y-2">
                {citations.citationSets.map((set) => (
                  <div className="rounded-xl bg-[#f8fbf5] px-3 py-2 text-sm" key={set.id}>
                    <span className="font-bold">{set.id}</span>
                    <span className="text-[#607064]"> · {set.domain}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
