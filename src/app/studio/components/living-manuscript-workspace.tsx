"use client";

import { useMemo, useState } from "react";

import type { LivingChapter, LivingManuscriptData } from "@/lib/studio/living-manuscript";

type View = "tree" | "ledger" | "forge";

const viewLabels: Record<View, string> = {
  tree: "Book Tree",
  ledger: "Claim Ledger",
  forge: "Chapter Forge",
};

function Badge({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "amber" | "violet" }) {
  const tones = {
    green: "border-[#41664d] bg-[#183522] text-[#bfe2c7]",
    amber: "border-[#755f34] bg-[#302818] text-[#f0c979]",
    violet: "border-[#654c72] bg-[#2d2034] text-[#d9b9e7]",
  };
  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${tones[tone]}`}>{children}</span>;
}

function supportTone(support: string): "green" | "amber" | "violet" {
  if (support === "author-source") return "green";
  if (support === "verification-required") return "amber";
  return "violet";
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-[#294735] bg-[#0c1c12] p-4">
      <p className="text-3xl font-black text-[#f2e4bf]">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[#829b88]">{label}</p>
    </div>
  );
}

function ChapterDetail({ chapter, data }: { chapter: LivingChapter; data: LivingManuscriptData }) {
  const claims = data.claims.filter((claim) => claim.chapterSlugs.includes(chapter.slug));
  return (
    <aside className="rounded-3xl border border-[#3d5c46] bg-[#0c1c12] p-6 lg:sticky lg:top-6 lg:self-start">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d8a85f]">Chapter {chapter.number}</p>
      <h3 className="mt-2 text-2xl font-black">{chapter.title}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge>{chapter.status}</Badge>
        <Badge tone={chapter.queueReady ? "green" : "amber"}>{chapter.queueReady ? "queue ready" : "queue missing"}</Badge>
      </div>
      <dl className="mt-6 space-y-4 text-sm">
        <div><dt className="font-black text-[#88a391]">Primary texts</dt><dd className="mt-1 leading-6 text-[#d7e5d8]">{chapter.primaryTexts}</dd></div>
        <div><dt className="font-black text-[#88a391]">Editorial target</dt><dd className="mt-1 text-[#d7e5d8]">{chapter.targetWords.toLocaleString()} words</dd></div>
        <div><dt className="font-black text-[#88a391]">Writing queue</dt><dd className="mt-1 break-all font-mono text-xs text-[#b7c9ba]">{chapter.queuePath}</dd></div>
      </dl>
      <div className="mt-6 border-t border-[#294735] pt-5">
        <h4 className="text-xs font-black uppercase tracking-[0.16em] text-[#88a391]">Claims in scope</h4>
        <div className="mt-3 space-y-2">
          {claims.length ? claims.map((claim) => (
            <div className="rounded-xl bg-[#13271a] p-3" key={claim.id}>
              <p className="text-sm font-bold">{claim.title}</p>
              <p className="mt-1 text-xs text-[#91a997]">{claim.type} · {claim.status}</p>
            </div>
          )) : <p className="text-sm text-[#829b88]">No ledger claim is assigned to this chapter.</p>}
        </div>
      </div>
    </aside>
  );
}

function TreeView({ data, selected, setSelected }: { data: LivingManuscriptData; selected: LivingChapter; setSelected: (chapter: LivingChapter) => void }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div>
        <div className="mx-auto max-w-xl rounded-3xl border border-[#9a7841] bg-[#2d2516] p-6 text-center shadow-[0_0_40px_rgba(216,168,95,0.08)]">
          <p className="text-xs font-black uppercase tracking-[0.26em] text-[#d8a85f]">Living root</p>
          <h2 className="mt-2 text-2xl font-black">{data.title}</h2>
          <p className="mt-2 text-sm leading-6 text-[#c8b98f]">{data.authorCanon}</p>
        </div>
        <div className="mx-auto h-8 w-px bg-[#55715c]" />
        <div className="space-y-5 border-l border-[#55715c] pl-4 sm:pl-7">
          {data.parts.map((part) => {
            const chapters = data.chapters.filter((chapter) => chapter.part === part.number);
            return (
              <section className="relative rounded-3xl border border-[#294735] bg-[#0c1c12] p-5" key={part.number}>
                <div className="absolute -left-4 top-8 h-px w-4 bg-[#55715c] sm:-left-7 sm:w-7" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d8a85f]">Part {part.number}</p>
                <h3 className="mt-1 text-xl font-black">{part.title}</h3>
                <p className="mt-2 text-sm text-[#829b88]">{part.theme}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {chapters.map((chapter) => (
                    <button
                      className={`rounded-2xl border p-3 text-left transition ${selected.slug === chapter.slug ? "border-[#d8a85f] bg-[#2d2516]" : "border-[#294735] bg-[#102219] hover:border-[#55715c]"}`}
                      key={chapter.slug}
                      onClick={() => setSelected(chapter)}
                      type="button"
                    >
                      <span className="text-[11px] font-black text-[#789080]">{String(chapter.number).padStart(2, "0")}</span>
                      <span className="mt-1 block text-sm font-bold leading-5">{chapter.title}</span>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
      <ChapterDetail chapter={selected} data={data} />
    </div>
  );
}

function LedgerView({ data }: { data: LivingManuscriptData }) {
  const [filter, setFilter] = useState("all");
  const types = Array.from(new Set(data.claims.map((claim) => claim.type)));
  const visible = filter === "all" ? data.claims : data.claims.filter((claim) => claim.type === filter);
  return (
    <div>
      <div className="rounded-2xl border border-[#755f34] bg-[#211c12] p-4 text-sm leading-6 text-[#d5c49d]">
        Ledger labels record editorial authority and review needs. They do not convert theological interpretation into scientific fact.
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {["all", ...types].map((type) => (
          <button className={`rounded-full border px-3 py-2 text-xs font-bold ${filter === type ? "border-[#d8a85f] bg-[#2d2516] text-[#f2d59d]" : "border-[#365440] text-[#9db1a1] hover:bg-[#13271a]"}`} key={type} onClick={() => setFilter(type)} type="button">
            {type === "all" ? "All claims" : type}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {visible.map((claim) => (
          <article className="rounded-3xl border border-[#294735] bg-[#0c1c12] p-5" key={claim.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#789080]">{claim.type}</p><h3 className="mt-2 text-xl font-black">{claim.title}</h3></div>
              <Badge tone={supportTone(claim.support)}>{claim.status}</Badge>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#b6c8b9]">{claim.summary}</p>
            <div className="mt-5 grid gap-4 border-t border-[#294735] pt-4 sm:grid-cols-2">
              <div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#789080]">Support</p><p className="mt-2 text-sm text-[#d5e1d7]">{claim.support}</p></div>
              <div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#789080]">Chapters</p><p className="mt-2 text-sm text-[#d5e1d7]">{claim.chapterSlugs.map((slug) => data.chapters.find((chapter) => chapter.slug === slug)?.number).filter(Boolean).join(" · ")}</p></div>
            </div>
            <div className="mt-4"><p className="text-xs font-black uppercase tracking-[0.14em] text-[#789080]">Source</p>{claim.sourceRefs.map((ref) => <p className="mt-2 break-all font-mono text-xs text-[#9db1a1]" key={ref}>{ref}</p>)}</div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ForgeView({ data, selected, setSelected }: { data: LivingManuscriptData; selected: LivingChapter; setSelected: (chapter: LivingChapter) => void }) {
  const [copied, setCopied] = useState(false);
  const claims = data.claims.filter((claim) => claim.chapterSlugs.includes(selected.slug));
  const packet = useMemo(() => [
    `CHAPTER FORGE BRIEF — ${data.title}`,
    `Chapter ${selected.number}: ${selected.title}`,
    `Part ${selected.part} · Status: ${selected.status} · Editorial target: ${selected.targetWords} words`,
    `Primary texts: ${selected.primaryTexts}`,
    `Canon rule: ${data.authorCanon}`,
    "",
    "Required sections:", ...selected.requiredSections.map((section) => `- ${section}`),
    "",
    "Claims in scope:", ...(claims.length ? claims.map((claim) => `- ${claim.title} [${claim.type}; ${claim.status}; ${claim.support}]`) : ["- None assigned in the ledger"]),
    "",
    `Queue: ${selected.queuePath} (${selected.queueReady ? "present" : "missing"})`,
    "Do not invent evidence, citations, approval, or manuscript progress. Keep scientific evidence distinct from interpretation.",
  ].join("\n"), [claims, data.authorCanon, data.title, selected]);

  async function copyPacket() {
    await navigator.clipboard.writeText(packet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="rounded-3xl border border-[#294735] bg-[#0c1c12] p-4 lg:self-start">
        <p className="px-2 text-xs font-black uppercase tracking-[0.18em] text-[#789080]">Choose a chapter</p>
        <div className="mt-3 max-h-[650px] space-y-1 overflow-y-auto pr-1">
          {data.chapters.map((chapter) => <button className={`w-full rounded-xl px-3 py-2 text-left text-sm ${selected.slug === chapter.slug ? "bg-[#2d2516] font-black text-[#f0cc86]" : "text-[#b8cbbd] hover:bg-[#13271a]"}`} key={chapter.slug} onClick={() => setSelected(chapter)} type="button">{chapter.number}. {chapter.title}</button>)}
        </div>
      </aside>
      <section className="rounded-3xl border border-[#3d5c46] bg-[#0c1c12] p-5 sm:p-7">
        <div className="flex flex-col gap-4 border-b border-[#294735] pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#d8a85f]">Deterministic drafting packet</p><h2 className="mt-2 text-2xl font-black">{selected.number}. {selected.title}</h2></div>
          <button className="rounded-full bg-[#d8a85f] px-4 py-2 text-sm font-black text-[#172015] hover:bg-[#edc47f]" onClick={copyPacket} type="button">{copied ? "Copied" : "Copy brief"}</button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#13271a] p-4"><p className="text-xs font-black uppercase text-[#789080]">Status</p><p className="mt-2 font-bold">{selected.status}</p></div>
          <div className="rounded-2xl bg-[#13271a] p-4"><p className="text-xs font-black uppercase text-[#789080]">Target</p><p className="mt-2 font-bold">{selected.targetWords.toLocaleString()} words</p></div>
          <div className="rounded-2xl bg-[#13271a] p-4"><p className="text-xs font-black uppercase text-[#789080]">Queue</p><p className="mt-2 font-bold">{selected.queueReady ? "Present" : "Missing"}</p></div>
        </div>
        <div className="mt-7 grid gap-7 xl:grid-cols-2">
          <div><h3 className="font-black">Required sections</h3><ol className="mt-3 space-y-2">{selected.requiredSections.map((section, index) => <li className="flex gap-3 rounded-xl bg-[#102219] p-3 text-sm" key={section}><span className="font-black text-[#d8a85f]">{index + 1}</span><span>{section}</span></li>)}</ol></div>
          <div><h3 className="font-black">Claims to handle</h3><div className="mt-3 space-y-2">{claims.length ? claims.map((claim) => <div className="rounded-xl bg-[#102219] p-3" key={claim.id}><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-bold">{claim.title}</p><Badge tone={supportTone(claim.support)}>{claim.status}</Badge></div><p className="mt-2 text-xs leading-5 text-[#91a997]">{claim.summary}</p></div>) : <p className="rounded-xl bg-[#102219] p-3 text-sm text-[#91a997]">No ledger claim is assigned to this chapter.</p>}</div></div>
        </div>
        <div className="mt-7 rounded-2xl border border-[#755f34] bg-[#211c12] p-4"><p className="text-xs font-black uppercase tracking-[0.15em] text-[#d8a85f]">Canon guardrail</p><p className="mt-2 text-sm leading-6 text-[#d5c49d]">{data.authorCanon}</p></div>
        <details className="mt-6 rounded-2xl border border-[#294735] p-4"><summary className="cursor-pointer font-black">Preview copyable brief</summary><pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-[#a8bbaa]">{packet}</pre></details>
      </section>
    </div>
  );
}

export function LivingManuscriptWorkspace({ data }: { data: LivingManuscriptData }) {
  const [view, setView] = useState<View>("tree");
  const [selected, setSelected] = useState(data.chapters[0]);
  return (
    <div className="py-7">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric value={data.parts.length} label="Book parts" /><Metric value={data.chapters.length} label="Planned chapters" /><Metric value={data.claims.length} label="Tracked claims" /><Metric value={data.figures.length} label="Figure briefs" />
      </section>
      <nav aria-label="Living manuscript views" className="my-7 flex gap-2 overflow-x-auto rounded-2xl border border-[#294735] bg-[#0c1c12] p-2">
        {(Object.keys(viewLabels) as View[]).map((key) => <button aria-pressed={view === key} className={`min-w-max flex-1 rounded-xl px-4 py-3 text-sm font-black transition ${view === key ? "bg-[#d8a85f] text-[#172015]" : "text-[#9db1a1] hover:bg-[#13271a]"}`} key={key} onClick={() => setView(key)} type="button">{viewLabels[key]}</button>)}
      </nav>
      {view === "tree" ? <TreeView data={data} selected={selected} setSelected={setSelected} /> : null}
      {view === "ledger" ? <LedgerView data={data} /> : null}
      {view === "forge" ? <ForgeView data={data} selected={selected} setSelected={setSelected} /> : null}
    </div>
  );
}
