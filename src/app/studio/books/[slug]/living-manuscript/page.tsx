import Link from "next/link";
import { notFound } from "next/navigation";

import { LivingManuscriptWorkspace } from "@/app/studio/components/living-manuscript-workspace";
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
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4a85f]">Living Manuscript Studio</p>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.03em] sm:text-5xl">{manuscript.title}</h1>
              <p className="mt-2 text-lg text-[#b8cbbd]">{manuscript.subtitle}</p>
              <p className="mt-4 max-w-4xl text-sm leading-7 text-[#91a997]">{manuscript.purpose}</p>
              <p className="mt-3 max-w-4xl text-xs leading-6 text-[#718978]">Canonical repository text remains authoritative. Browser drafts are local working state; AI and editorial language remains proposal until an intentional author-governed act accepts it.</p>
            </div>
            <Link className="rounded-xl border border-[#43614b] px-4 py-2.5 text-sm font-bold text-[#d8e7da] transition hover:bg-[#13271a]" href={`/studio/books/${slug}`}>
              Book cockpit
            </Link>
          </div>
        </header>

        <LivingManuscriptWorkspace data={manuscript} />
      </section>
    </main>
  );
}
