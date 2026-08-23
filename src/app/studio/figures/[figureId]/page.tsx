import Link from "next/link";
import { notFound } from "next/navigation";

import { loadFederatedLibrary } from "@/lib/library/load-library";
import { getFigureRecord, getFigureStudioIndex } from "@/lib/studio/booksmith-studio-data";

function routeKey(slug: string, figureId: string) {
  return `${slug}--${figureId}`;
}

function parseRouteKey(value: string) {
  const separator = value.indexOf("--");
  if (separator < 1) return null;
  return { slug: value.slice(0, separator), figureId: value.slice(separator + 2) };
}

export async function generateStaticParams() {
  const library = await loadFederatedLibrary();
  return library.books.flatMap((book) =>
    getFigureStudioIndex(book.registry.slug).cards.map((card) => ({ figureId: routeKey(book.registry.slug, card.id) })),
  );
}

export default async function FigureDetailPage({ params }: { params: Promise<{ figureId: string }> }) {
  const { figureId: encoded } = await params;
  const parsed = parseRouteKey(encoded);
  if (!parsed) notFound();

  const library = await loadFederatedLibrary();
  const book = library.books.find((candidate) => candidate.registry.slug === parsed.slug);
  if (!book) notFound();

  const { card, art, spec, asset } = getFigureRecord(parsed.slug, parsed.figureId);
  if (!card) notFound();

  const display = book.config ?? book.registry;

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link className="text-xs font-bold text-[#b8cbbd] hover:text-white" href="/studio/figures">← Figure Studio</Link>
          <Link className="text-xs font-bold text-[#b8cbbd] hover:text-white" href={`/studio/books/${parsed.slug}`}>{display.title} →</Link>
        </div>

        <header className="mt-5 rounded-[2rem] border border-[#2e4b37] bg-[#0a1a11] p-6 sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#d4a85f]">{display.title} · {card.id}</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.03em] sm:text-5xl">{card.title}</h1>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#9eb2a2]">{card.caption}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Status label={asset?.status ?? card.status} ready={Boolean(asset?.asset)} />
            <Status label={asset?.approvedForPrint ? "approved for print" : "approval pending"} ready={Boolean(asset?.approvedForPrint)} />
            <Status label={card.figureType} ready />
          </div>
        </header>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
          <div className="space-y-5">
            <Panel title="Manuscript context" eyebrow="Placement">
              <p className="whitespace-pre-wrap text-sm leading-8 text-[#b8cbbd]">{spec?.placementContext?.surroundingText ?? card.surroundingTextPreview}</p>
            </Panel>

            <Panel title="Art direction" eyebrow="Visual contract">
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <Row label="Type" value={art?.figureType ?? card.figureType} />
                <Row label="Composition" value={art?.composition?.layout} />
                <Row label="Camera" value={art?.composition?.camera} />
                <Row label="Color logic" value={art?.composition?.colorLogic} />
                <Row label="Label policy" value={art?.composition?.labelPolicy} />
              </dl>
            </Panel>

            <Panel title="Provider-agnostic prompt" eyebrow="Generation proposal">
              <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-2xl border border-[#213b2b] bg-[#07120c] p-4 text-xs leading-7 text-[#b8cbbd]">
                {art?.prompts?.providerAgnostic ?? spec?.promptCompiler?.finalPrompt ?? "No governed prompt is recorded yet."}
              </pre>
            </Panel>
          </div>

          <aside className="space-y-5">
            <Panel title="Asset state" eyebrow="Provenance">
              <dl className="space-y-4 text-sm">
                <Row label="Status" value={asset?.status ?? card.status} />
                <Row label="Approved" value={asset?.approvedForPrint ? "yes" : "no"} />
                <Row label="Asset" value={asset?.asset ?? "none connected"} />
                <Row label="Checksum" value={asset?.checksumSha256 ?? "none recorded"} />
              </dl>
            </Panel>
            <Panel title="Required objects" eyebrow="Knowledge"><List items={art?.knowledge?.requiredObjects ?? []} /></Panel>
            <Panel title="Forbidden objects" eyebrow="Guardrails"><List items={art?.knowledge?.forbiddenObjects ?? []} /></Panel>
            <Panel title="QA checklist" eyebrow="Verification"><List items={art?.qaChecklist ?? []} /></Panel>
            <Panel title="Revision boundary" eyebrow="Author control">
              <p className="text-sm leading-7 text-[#91a997]">The figure specification and prompt can be revised through Booksmith's figure pipeline, but print approval remains an explicit human decision. This web surface reports that state rather than auto-approving generated assets.</p>
            </Panel>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5 sm:p-6">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#718978]">{eyebrow}</p>
      <h2 className="mt-2 text-lg font-black">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return <div><dt className="text-[10px] font-black uppercase tracking-[0.12em] text-[#718978]">{label}</dt><dd className="mt-1 break-words text-sm leading-6 text-[#c5d4c7]">{value || "not specified"}</dd></div>;
}

function List({ items }: { items: string[] }) {
  return <ul className="space-y-2 text-sm leading-7 text-[#b8cbbd]">{items.length ? items.map((item) => <li key={item}>• {item}</li>) : <li className="text-[#718978]">None recorded.</li>}</ul>;
}

function Status({ label, ready }: { label: string; ready: boolean }) {
  return <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.11em] ${ready ? "border-[#41664d] bg-[#173522] text-[#bfe2c7]" : "border-[#755f34] bg-[#302818] text-[#f0c979]"}`}>{label}</span>;
}
