import Link from "next/link";
import { notFound } from "next/navigation";

import { LivingManuscriptWorkspace } from "@/app/studio/components/living-manuscript-workspace";
import { getLivingManuscript } from "@/lib/studio/living-manuscript";

export function generateStaticParams() {
  return [{ slug: "energence" }];
}

export default async function LivingManuscriptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const manuscript = getLivingManuscript(slug);
  if (!manuscript) notFound();

  return (
    <main className="min-h-screen bg-[#07130d] px-4 py-6 text-[#eef7ea] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <div className="flex flex-col gap-5 border-b border-[#294735] pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.34em] text-[#d8a85f]">Living Manuscript Studio</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{manuscript.title}</h1>
            <p className="mt-2 text-lg text-[#b8cbbd]">{manuscript.subtitle}</p>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-[#91a997]">{manuscript.purpose}</p>
          </div>
          <Link className="rounded-full border border-[#43614b] px-4 py-2 text-sm font-bold text-[#d8e7da] hover:bg-[#13271a]" href={`/studio/books/${slug}`}>
            Back to book cockpit
          </Link>
        </div>

        <LivingManuscriptWorkspace data={manuscript} />
      </section>
    </main>
  );
}
