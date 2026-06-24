import registry from "../../../library/book-registry.json";
import sources from "../../../library/source-registry.json";
import citations from "../../../library/citation-registry.json";
import concepts from "../../../library/concept-registry.json";

export default function StudioPage() {
  return (
    <main className="min-h-screen bg-[#f4f8f1] p-6 text-[#17201a]">
      <section className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#48725b]">
          Booksmith AI Studio
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">{registry.title}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-[#607064]">
          {registry.description}
        </p>

        <div className="mt-6 flex flex-wrap gap-2 text-sm font-semibold">
          <span className="rounded-full bg-[#eef7ea] px-3 py-1 text-[#3f674b]">
            {registry.books.length} books
          </span>
          <span className="rounded-full bg-[#eef7ea] px-3 py-1 text-[#3f674b]">
            {sources.sources.length} sources
          </span>
          <span className="rounded-full bg-[#eef7ea] px-3 py-1 text-[#3f674b]">
            {citations.citationSets.length} citation sets
          </span>
          <span className="rounded-full bg-[#f5f0e6] px-3 py-1 text-[#67543c]">
            {concepts.concepts.length} concepts
          </span>
          <span className="rounded-full bg-[#f5f0e6] px-3 py-1 text-[#67543c]">
            v{registry.version}
          </span>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="grid gap-4 md:grid-cols-2">
            {registry.books.map((book) => (
              <article className="rounded-lg border border-[#dfe8da] bg-white p-4" key={book.slug}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{book.title}</h2>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#607064]">
                      {book.series}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#eef7ea] px-2.5 py-1 text-xs font-semibold text-[#3f674b]">
                    {book.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#526358]">{book.purpose}</p>
              </article>
            ))}
          </section>

          <aside className="space-y-5">
            <section className="rounded-lg border border-[#dfe8da] bg-white p-4">
              <h2 className="font-semibold">Connected sources</h2>
              <div className="mt-4 space-y-3">
                {sources.sources.map((source) => (
                  <div className="rounded-md bg-[#f8fbf5] p-3 text-sm" key={source.sourceId}>
                    <p className="font-semibold">{source.sourceId}</p>
                    <p className="mt-1 text-[#607064]">{source.bookSlug} · {source.sourceType}</p>
                    <p className="mt-1 break-words text-xs text-[#607064]">{source.location}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-[#dfe8da] bg-white p-4">
              <h2 className="font-semibold">Citation sets</h2>
              <div className="mt-4 space-y-2">
                {citations.citationSets.map((set) => (
                  <div className="rounded-md bg-[#f8fbf5] px-3 py-2 text-sm" key={set.id}>
                    <span className="font-semibold">{set.id}</span>
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
