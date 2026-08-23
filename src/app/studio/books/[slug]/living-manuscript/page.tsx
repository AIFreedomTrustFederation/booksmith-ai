import Link from "next/link";
import { notFound } from "next/navigation";

import { RuntimeManuscriptWorkspace } from "@/app/studio/components/runtime-manuscript-workspace";
import { loadFederatedLibrary } from "@/lib/library/load-library";
import { getLivingManuscript } from "@/lib/studio/living-manuscript";

export async function generateStaticParams() {
  const library = await loadFederatedLibrary();
  return library.books
    .filter((book) => Boolean(getLivingManuscript(book.registry.slug)))
    .map((book) => ({ slug: book.registry.slug }));
}

export default async function LivingManuscriptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const manuscript = getLivingManuscript(slug);
  if (!manuscript) notFound();

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1700px]">
        <header className="rounded-[2rem] border border-[#2e4b37] bg-[#0a1a11] p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4a85f]">Living Manuscript Studio · Runtime v1</p>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.03em] sm:text-5xl">{manuscript.title}</h1>
              <p className="mt-2 text-lg text-[#b8cbbd]">{manuscript.subtitle}</p>
              <p className="mt-4 max-w-4xl text-sm leading-7 text-[#91a997]">{manuscript.purpose}</p>
              <p className="mt-3 max-w-4xl text-xs leading-6 text-[#718978]">GitHub Pages remains read-only. When the local/private Booksmith Runtime is connected, this same workspace can review diffs, save canonical manuscript files, record provenance, optionally commit locally, query SQLite memory, and run governed AI proposals.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link className="rounded-xl border border-[#43614b] px-4 py-2.5 text-sm font-bold text-[#d8e7da] transition hover:bg-[#13271a]" href={`/studio/books/${slug}`}>Book cockpit</Link>
              <Link className="rounded-xl bg-[#d4a85f] px-4 py-2.5 text-sm font-black text-[#172015]" href="/studio/runtime">Runtime Center</Link>
            </div>
          </div>
        </header>

        <RuntimeManuscriptWorkspace data={manuscript} />
      </section>
    </main>
  );
}
