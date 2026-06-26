import Link from "next/link";
import { getFigureRecord } from "@/lib/studio/booksmith-studio-data";

export default function FigureDetailPage({ params }: { params: { figureId: string } }) {
  const slug = "fhqcm";
  const { card, art, spec, asset } = getFigureRecord(slug, params.figureId);

  if (!card) {
    return (
      <main className="min-h-screen bg-zinc-950 p-8 text-zinc-100">
        <p>Figure not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-8 text-zinc-100">
      <section className="mx-auto max-w-7xl">
        <Link href="/studio/figures" className="text-sm text-amber-400">← Back to Figure Studio</Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-400">{card.id}</p>
            <h1 className="mt-2 text-4xl font-bold">{card.title}</h1>
            <p className="mt-3 text-zinc-400">{card.caption}</p>

            <Panel title="Manuscript Context">
              <p className="whitespace-pre-wrap leading-7 text-zinc-300">
                {spec?.placementContext?.surroundingText ?? card.surroundingTextPreview}
              </p>
            </Panel>

            <Panel title="Art Direction">
              <div className="space-y-3 text-sm leading-6 text-zinc-300">
                <p><b>Type:</b> {art?.figureType ?? card.figureType}</p>
                <p><b>Composition:</b> {art?.composition?.layout}</p>
                <p><b>Camera:</b> {art?.composition?.camera}</p>
                <p><b>Color Logic:</b> {art?.composition?.colorLogic}</p>
                <p><b>Label Policy:</b> {art?.composition?.labelPolicy}</p>
              </div>
            </Panel>

            <Panel title="Provider-Agnostic Prompt">
              <pre className="whitespace-pre-wrap rounded-xl bg-black/40 p-4 text-sm leading-6 text-zinc-300">
                {art?.prompts?.providerAgnostic ?? spec?.promptCompiler?.finalPrompt ?? "No prompt yet."}
              </pre>
            </Panel>
          </div>

          <aside className="space-y-6">
            <Panel title="Asset Status">
              <div className="space-y-2 text-sm text-zinc-300">
                <p><b>Status:</b> {asset?.status ?? card.status}</p>
                <p><b>Approved:</b> {asset?.approvedForPrint ? "yes" : "no"}</p>
                <p><b>Asset:</b> {asset?.asset ?? "none"}</p>
                <p><b>Checksum:</b> {asset?.checksumSha256 ?? "none"}</p>
              </div>
            </Panel>

            <Panel title="Required Objects">
              <List items={art?.knowledge?.requiredObjects ?? []} />
            </Panel>

            <Panel title="Forbidden Objects">
              <List items={art?.knowledge?.forbiddenObjects ?? []} />
            </Panel>

            <Panel title="QA Checklist">
              <List items={art?.qaChecklist ?? []} />
            </Panel>

            <Panel title="Plain-Language Revision">
              <p className="text-sm leading-6 text-zinc-400">
                Next UI step: a text box here will let the author say things like
                “make this clearer, less mystical, more like a scientific diagram,” then BookSmith will rewrite that into a better prompt before generation.
              </p>
            </Panel>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
      <h2 className="mb-4 text-lg font-semibold text-amber-300">{title}</h2>
      {children}
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm text-zinc-300">
      {items.length ? items.map((item) => <li key={item}>• {item}</li>) : <li>None.</li>}
    </ul>
  );
}
