import citations from "../../../../library/citation-registry.json";
import concepts from "../../../../library/concept-registry.json";
import references from "../../../../library/reference-registry.json";
import thinkers from "../../../../library/thinker-registry.json";
import { LibraryExplorer } from "@/app/studio/components/library-explorer";
import { RuntimeMemoryGraph } from "@/app/studio/components/runtime-memory-graph";
import { SourceImporter } from "@/app/studio/components/source-importer";
import { loadFederatedLibrary } from "@/lib/library/load-library";

export default async function LibraryPage() {
  const library = await loadFederatedLibrary();
  const bookOptions = library.books.map((book) => ({ slug: book.registry.slug, title: (book.config ?? book.registry).title }));

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1600px]">
        <header className="rounded-[2rem] border border-[#2e4b37] bg-[#0a1a11] p-6 sm:p-8 lg:p-10">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#d4a85f]">Federated Library</p>
          <h1 className="mt-4 max-w-5xl text-4xl font-black tracking-[-0.03em] sm:text-6xl">The memory around the manuscript.</h1>
          <p className="mt-5 max-w-4xl text-base leading-8 text-[#9eb2a2]">
            Search the real Booksmith registries across books, concepts, intellectual genealogy, references, and connected source records. With the local Runtime connected, this is also the research intake surface: originals are preserved, provenance is recorded, readable text is extracted where local tools support it, and SQLite memory is rebuilt from the canonical library.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.13em] text-[#9eb2a2]">
            <span className="rounded-full border border-[#31523b] bg-[#102219] px-3 py-1.5">{library.books.length} books</span>
            <span className="rounded-full border border-[#31523b] bg-[#102219] px-3 py-1.5">{concepts.concepts.length} concepts</span>
            <span className="rounded-full border border-[#31523b] bg-[#102219] px-3 py-1.5">{thinkers.thinkers.length} thinkers</span>
            <span className="rounded-full border border-[#31523b] bg-[#102219] px-3 py-1.5">{references.references.length} references</span>
            <span className="rounded-full border border-[#31523b] bg-[#102219] px-3 py-1.5">{citations.citationSets.length} citation domains</span>
            <span className="rounded-full border border-[#31523b] bg-[#102219] px-3 py-1.5">{library.sources.sources.length} source records</span>
          </div>
        </header>

        <div className="mt-6"><SourceImporter books={bookOptions} /></div>
        <div className="mt-6"><RuntimeMemoryGraph books={bookOptions} /></div>

        <div className="mt-6">
          <LibraryExplorer
            data={{
              books: library.registry.books,
              concepts: concepts.concepts,
              thinkers: thinkers.thinkers,
              references: references.references,
              sources: library.sources.sources,
            }}
          />
        </div>
      </section>
    </main>
  );
}
