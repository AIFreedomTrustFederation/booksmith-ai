import registry from "../../../library/book-registry.json";

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
          <span className="rounded-full bg-[#f5f0e6] px-3 py-1 text-[#67543c]">
            v{registry.version}
          </span>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
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
        </div>
      </section>
    </main>
  );
}
