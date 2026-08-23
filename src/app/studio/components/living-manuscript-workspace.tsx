"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

import type {
  LivingChapter,
  LivingClaim,
  LivingManuscriptData,
} from "@/lib/studio/living-manuscript";

type WorkspaceView = "write" | "claims" | "forge" | "memory";
type EditorView = "write" | "preview";

const workspaceLabels: Record<WorkspaceView, string> = {
  write: "Write",
  claims: "Claim Ledger",
  forge: "Chapter Forge",
  memory: "Book Memory",
};

const draftEvent = "booksmith-local-draft";

function wordCount(value: string) {
  const normalized = value.trim();
  return normalized ? normalized.split(/\s+/).length : 0;
}

function useLocalDraft(storageKey: string, canonical: string) {
  const subscribe = useCallback((notify: () => void) => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey) notify();
    };
    const onLocalDraft = (event: Event) => {
      if ((event as CustomEvent<string>).detail === storageKey) notify();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(draftEvent, onLocalDraft);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(draftEvent, onLocalDraft);
    };
  }, [storageKey]);

  const getSnapshot = useCallback(
    () => window.localStorage.getItem(storageKey) ?? canonical,
    [canonical, storageKey],
  );
  const getServerSnapshot = useCallback(() => canonical, [canonical]);
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback((next: string) => {
    window.localStorage.setItem(storageKey, next);
    window.dispatchEvent(new CustomEvent<string>(draftEvent, { detail: storageKey }));
  }, [storageKey]);

  const reset = useCallback(() => {
    window.localStorage.removeItem(storageKey);
    window.dispatchEvent(new CustomEvent<string>(draftEvent, { detail: storageKey }));
  }, [storageKey]);

  return { value, setValue, reset };
}

function Badge({
  children,
  tone = "green",
}: {
  children: React.ReactNode;
  tone?: "green" | "amber" | "violet" | "slate";
}) {
  const tones = {
    green: "border-[#3e674a] bg-[#173522] text-[#bfe2c7]",
    amber: "border-[#765d31] bg-[#302716] text-[#f1c977]",
    violet: "border-[#684d76] bg-[#2d2034] text-[#d9b9e7]",
    slate: "border-[#34493b] bg-[#101e15] text-[#9eb2a2]",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.13em] ${tones[tone]}`}>
      {children}
    </span>
  );
}

function supportTone(support: string): "green" | "amber" | "violet" {
  if (support === "author-source") return "green";
  if (support === "verification-required") return "amber";
  return "violet";
}

function chapterClaims(data: LivingManuscriptData, chapter: LivingChapter) {
  return data.claims.filter((claim) => claim.chapterSlugs.includes(chapter.slug));
}

function buildForgePacket(data: LivingManuscriptData, chapter: LivingChapter) {
  const claims = chapterClaims(data, chapter);

  return [
    `BOOKSMITH AUTHOR CONTEXT — ${data.title}`,
    `Chapter ${chapter.number}: ${chapter.title}`,
    `Part ${chapter.part} · Status: ${chapter.status}`,
    `Canonical manuscript: ${chapter.manuscriptReady ? chapter.manuscriptPath : "not yet created"}`,
    `Writing queue: ${chapter.queuePath} (${chapter.queueReady ? "present" : "missing"})`,
    `Editorial target: ${chapter.targetWords.toLocaleString()} words`,
    `Primary texts: ${chapter.primaryTexts}`,
    `Canon rule: ${data.authorCanon}`,
    "",
    "Required movement:",
    ...chapter.requiredSections.map((section) => `- ${section}`),
    "",
    "Claims in scope:",
    ...(claims.length
      ? claims.map((claim) => `- ${claim.title} [${claim.type}; ${claim.status}; ${claim.support}] — ${claim.summary}`)
      : ["- No ledger claims assigned to this chapter."]),
    "",
    "Integrity rules:",
    "- Treat canonical manuscript text as authoritative human work.",
    "- Return proposed language separately; do not silently overwrite canon.",
    "- Distinguish established evidence, active research, philosophical inference, exegesis, and constructive theology.",
    "- Do not invent citations, source verification, author approval, or manuscript progress.",
  ].join("\n");
}

function MarkdownPreview({ value }: { value: string }) {
  if (!value.trim()) {
    return (
      <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-dashed border-[#35513e] bg-[#0a1710] p-8 text-center text-sm leading-7 text-[#7f9987]">
        No canonical manuscript exists for this chapter yet. Begin writing in the editor; Booksmith will keep it as a browser-local working draft until a governed save path is connected.
      </div>
    );
  }

  return (
    <article className="min-h-[520px] rounded-2xl border border-[#294735] bg-[#f7f4ea] px-6 py-8 text-[#1d271f] shadow-inner sm:px-10">
      {value.split("\n").map((line, index) => {
        const key = `${index}-${line.slice(0, 18)}`;
        if (line.startsWith("### ")) return <h3 className="mb-3 mt-7 text-xl font-black" key={key}>{line.slice(4)}</h3>;
        if (line.startsWith("## ")) return <h2 className="mb-3 mt-8 text-2xl font-black" key={key}>{line.slice(3)}</h2>;
        if (line.startsWith("# ")) return <h1 className="mb-5 mt-2 text-3xl font-black tracking-tight" key={key}>{line.slice(2)}</h1>;
        if (line.startsWith("- ")) return <p className="mb-2 pl-4 text-[15px] leading-8" key={key}>• {line.slice(2)}</p>;
        if (!line.trim()) return <div className="h-4" key={key} />;
        return <p className="mb-4 text-[16px] leading-8" key={key}>{line}</p>;
      })}
    </article>
  );
}

function BookTree({
  data,
  selected,
  onSelect,
}: {
  data: LivingManuscriptData;
  selected: LivingChapter;
  onSelect: (chapter: LivingChapter) => void;
}) {
  return (
    <aside className="rounded-3xl border border-[#284333] bg-[#09170f] p-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-hidden">
      <div className="border-b border-[#213b2b] px-2 pb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#d4a85f]">Book Tree</p>
        <p className="mt-2 text-sm leading-6 text-[#8fa494]">Navigate the real chapter plan. Canonical manuscript state is shown per chapter.</p>
      </div>
      <div className="mt-4 space-y-5 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:pr-1">
        {data.parts.map((part) => (
          <section key={part.number}>
            <div className="px-2">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#718978]">Part {part.number}</p>
              <h3 className="mt-1 text-sm font-black text-[#d8e7da]">{part.title}</h3>
            </div>
            <div className="mt-2 space-y-1">
              {data.chapters.filter((chapter) => chapter.part === part.number).map((chapter) => {
                const active = chapter.slug === selected.slug;
                return (
                  <button
                    className={`group flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition ${active ? "border-[#b68d4d] bg-[#2b2416] text-[#f4dfaf]" : "border-transparent text-[#a9bcad] hover:border-[#294735] hover:bg-[#102219]"}`}
                    key={chapter.slug}
                    onClick={() => onSelect(chapter)}
                    type="button"
                  >
                    <span className={`mt-0.5 text-[11px] font-black ${active ? "text-[#e0b86d]" : "text-[#5f7867]"}`}>{String(chapter.number).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold leading-5">{chapter.title}</span>
                      <span className="mt-1 flex flex-wrap gap-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#66806d]">{chapter.manuscriptReady ? `${chapter.manuscriptWords} words` : "not drafted"}</span>
                        {chapter.queueReady ? <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#9d7a44]">queue</span> : null}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}

function IntelligencePanel({
  data,
  selected,
  draft,
  proposal,
  setProposal,
  onApplyProposal,
}: {
  data: LivingManuscriptData;
  selected: LivingChapter;
  draft: string;
  proposal: string;
  setProposal: (value: string) => void;
  onApplyProposal: () => void;
}) {
  const claims = chapterClaims(data, selected);
  const [request, setRequest] = useState("");
  const [copied, setCopied] = useState(false);

  const providerPacket = useMemo(() => {
    const context = buildForgePacket(data, selected);
    return [
      context,
      "",
      "CURRENT WORKING DRAFT (local, not canonical):",
      draft || "[empty local working draft]",
      "",
      "AUTHOR REQUEST:",
      request.trim() || "[no request entered]",
      "",
      "Return a PROPOSAL only. Preserve the author's established voice and do not claim the repository manuscript was changed.",
    ].join("\n");
  }, [data, draft, request, selected]);

  async function copyProviderPacket() {
    await navigator.clipboard.writeText(providerPacket);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
      <section className="rounded-3xl border border-[#3a563f] bg-[#0b1b12] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#d4a85f]">Booksmith Intelligence</p>
            <h3 className="mt-2 text-lg font-black">Chapter-aware context</h3>
          </div>
          <Badge tone="amber">proposal only</Badge>
        </div>
        <p className="mt-3 text-xs leading-6 text-[#8fa494]">The provider boundary is explicit. Booksmith prepares the chapter, canon, claims, sources, and local draft as context without pretending a model is already connected.</p>
        <label className="mt-5 block text-[10px] font-black uppercase tracking-[0.17em] text-[#77907e]" htmlFor="booksmith-request">Ask Booksmith</label>
        <textarea
          className="mt-2 min-h-28 w-full resize-y rounded-2xl border border-[#314d39] bg-[#07120c] p-3 text-sm leading-6 text-[#e5eee6] outline-none transition placeholder:text-[#536b5a] focus:border-[#b68d4d]"
          id="booksmith-request"
          onChange={(event) => setRequest(event.target.value)}
          placeholder="Example: Strengthen the transition into the scientific account without changing the theological claim."
          value={request}
        />
        <button className="mt-3 w-full rounded-xl bg-[#d4a85f] px-4 py-3 text-sm font-black text-[#172015] transition hover:bg-[#e9bf77]" onClick={copyProviderPacket} type="button">
          {copied ? "Context packet copied" : "Copy provider context"}
        </button>
        <p className="mt-2 text-[10px] leading-5 text-[#66806d]">Ready for a governed local/open provider adapter. No network call is made from this UI.</p>
      </section>

      <section className="rounded-3xl border border-[#473c28] bg-[#18150e] p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-black">Proposal staging</h3>
          <Badge tone="violet">unapproved</Badge>
        </div>
        <p className="mt-2 text-xs leading-6 text-[#aa9b7f]">Paste or receive proposed language here. Applying it changes only the browser-local working draft—not repository canon.</p>
        <textarea
          className="mt-3 min-h-36 w-full resize-y rounded-2xl border border-[#55492f] bg-[#0d0b08] p-3 text-sm leading-6 text-[#efe6d4] outline-none placeholder:text-[#665b48] focus:border-[#b68d4d]"
          onChange={(event) => setProposal(event.target.value)}
          placeholder="AI or editorial proposal appears here before author acceptance."
          value={proposal}
        />
        <button
          className="mt-3 w-full rounded-xl border border-[#7b6135] px-4 py-2.5 text-xs font-black uppercase tracking-[0.13em] text-[#e5bf78] transition hover:bg-[#2c2415] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!proposal.trim()}
          onClick={onApplyProposal}
          type="button"
        >
          Apply proposal to local draft
        </button>
      </section>

      <section className="rounded-3xl border border-[#284333] bg-[#09170f] p-5">
        <h3 className="text-sm font-black">Claims in scope</h3>
        <div className="mt-3 space-y-2">
          {claims.length ? claims.map((claim) => (
            <div className="rounded-xl border border-[#213b2b] bg-[#0d2015] p-3" key={claim.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold leading-5">{claim.title}</p>
                <Badge tone={supportTone(claim.support)}>{claim.status}</Badge>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-[#7f9987]">{claim.type} · {claim.support}</p>
            </div>
          )) : <p className="text-xs leading-6 text-[#718978]">No ledger claims are assigned to this chapter.</p>}
        </div>
      </section>
    </aside>
  );
}

function EditorWorkspace({
  data,
  selected,
  setSelected,
}: {
  data: LivingManuscriptData;
  selected: LivingChapter;
  setSelected: (chapter: LivingChapter) => void;
}) {
  const storageKey = `booksmith:${data.slug}:draft:${selected.slug}`;
  const localDraft = useLocalDraft(storageKey, selected.manuscriptText);
  const [editorView, setEditorView] = useState<EditorView>("write");
  const [proposals, setProposals] = useState<Record<string, string>>({});
  const [savedPulse, setSavedPulse] = useState(false);

  const draft = localDraft.value;
  const proposal = proposals[selected.slug] ?? "";
  const localWords = wordCount(draft);
  const dirty = draft !== selected.manuscriptText;

  function updateProposal(value: string) {
    setProposals((current) => ({ ...current, [selected.slug]: value }));
  }

  function updateDraft(value: string) {
    localDraft.setValue(value);
    setSavedPulse(true);
    window.setTimeout(() => setSavedPulse(false), 900);
  }

  function restoreCanonical() {
    localDraft.reset();
    updateProposal("");
  }

  function applyProposal() {
    if (!proposal.trim()) return;
    updateDraft(proposal);
    updateProposal("");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_330px] xl:grid-cols-[280px_minmax(0,1fr)_360px]">
      <BookTree data={data} onSelect={setSelected} selected={selected} />

      <section className="min-w-0 rounded-3xl border border-[#334f3b] bg-[#0b1a11] shadow-[0_26px_80px_rgba(0,0,0,0.22)]">
        <header className="border-b border-[#284333] px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.21em] text-[#d4a85f]">Chapter {selected.number} · Part {selected.part}</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-[#f3f0e8]">{selected.title}</h2>
              <p className="mt-2 break-all font-mono text-[10px] text-[#66806d]">{selected.manuscriptPath}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={selected.manuscriptReady ? "green" : "slate"}>{selected.manuscriptReady ? "canonical source" : "no manuscript yet"}</Badge>
              <Badge tone={dirty ? "amber" : "green"}>{dirty ? "local changes" : "synced to canon"}</Badge>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-[#213b2b] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#8fa494]">
              <span><strong className="text-[#d8e7da]">{localWords.toLocaleString()}</strong> working words</span>
              <span><strong className="text-[#d8e7da]">{selected.manuscriptWords.toLocaleString()}</strong> canonical</span>
              <span><strong className="text-[#d8e7da]">{selected.targetWords.toLocaleString()}</strong> target</span>
              {savedPulse ? <span className="font-bold text-[#caa35d]">saved locally</span> : null}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-xl border border-[#314d39] bg-[#07120c] p-1">
                {(["write", "preview"] as EditorView[]).map((view) => (
                  <button className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${editorView === view ? "bg-[#24432e] text-white" : "text-[#7f9987] hover:text-white"}`} key={view} onClick={() => setEditorView(view)} type="button">
                    {view === "write" ? "Write" : "Preview"}
                  </button>
                ))}
              </div>
              <button
                className="rounded-xl border border-[#4c3f29] px-3 py-2 text-[10px] font-black uppercase tracking-[0.11em] text-[#bda36e] transition hover:bg-[#1d190f] disabled:opacity-30"
                disabled={!dirty}
                onClick={restoreCanonical}
                type="button"
              >
                Restore canon
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          {editorView === "write" ? (
            <textarea
              aria-label={`Working draft for chapter ${selected.number}: ${selected.title}`}
              className="min-h-[68vh] w-full resize-y rounded-2xl border border-[#294735] bg-[#f8f5eb] px-5 py-6 font-serif text-[17px] leading-8 text-[#1d271f] shadow-inner outline-none transition placeholder:text-[#8f958f] focus:border-[#b68d4d] sm:px-8"
              onChange={(event) => updateDraft(event.target.value)}
              placeholder={selected.manuscriptReady ? "Canonical manuscript loaded." : "Begin this chapter. Your work is saved only in this browser until a governed repository save path is connected."}
              spellCheck
              value={draft}
            />
          ) : <MarkdownPreview value={draft} />}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#294735] bg-[#0a1710] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#789080]">Primary texts</p>
              <p className="mt-2 text-xs leading-6 text-[#b6c8b9]">{selected.primaryTexts}</p>
            </div>
            <div className="rounded-2xl border border-[#294735] bg-[#0a1710] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#789080]">Author sovereignty</p>
              <p className="mt-2 text-xs leading-6 text-[#b6c8b9]">{data.authorCanon}</p>
            </div>
          </div>
        </div>
      </section>

      <IntelligencePanel data={data} draft={draft} onApplyProposal={applyProposal} proposal={proposal} selected={selected} setProposal={updateProposal} />
    </div>
  );
}

function ClaimsView({ data }: { data: LivingManuscriptData }) {
  const [filter, setFilter] = useState("all");
  const types = Array.from(new Set(data.claims.map((claim) => claim.type)));
  const visible = filter === "all" ? data.claims : data.claims.filter((claim) => claim.type === filter);

  return (
    <section>
      <div className="rounded-2xl border border-[#765d31] bg-[#201b10] p-4 text-sm leading-7 text-[#d3c39e]">
        Claim Ledger preserves epistemic boundaries across the manuscript. Author canon, constructive theology, philosophical inference, and evidence requiring verification remain visibly distinct.
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {["all", ...types].map((type) => (
          <button className={`rounded-full border px-3 py-2 text-xs font-bold transition ${filter === type ? "border-[#d4a85f] bg-[#2c2415] text-[#f0d39a]" : "border-[#365440] text-[#91a997] hover:bg-[#102219]"}`} key={type} onClick={() => setFilter(type)} type="button">
            {type === "all" ? "All claims" : type}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {visible.map((claim: LivingClaim) => (
          <article className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5" key={claim.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#718978]">{claim.type}</p>
                <h3 className="mt-2 text-xl font-black">{claim.title}</h3>
              </div>
              <Badge tone={supportTone(claim.support)}>{claim.status}</Badge>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#b6c8b9]">{claim.summary}</p>
            <div className="mt-5 grid gap-4 border-t border-[#294735] pt-4 sm:grid-cols-2">
              <div><p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#718978]">Support</p><p className="mt-2 text-sm text-[#d5e1d7]">{claim.support}</p></div>
              <div><p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#718978]">Chapters</p><p className="mt-2 text-sm text-[#d5e1d7]">{claim.chapterSlugs.map((slug) => data.chapters.find((chapter) => chapter.slug === slug)?.number).filter(Boolean).join(" · ")}</p></div>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#718978]">Sources</p>
              {claim.sourceRefs.map((ref) => <p className="mt-2 break-all font-mono text-xs text-[#91a997]" key={ref}>{ref}</p>)}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ForgeView({ data, selected, setSelected }: { data: LivingManuscriptData; selected: LivingChapter; setSelected: (chapter: LivingChapter) => void }) {
  const [copied, setCopied] = useState(false);
  const claims = chapterClaims(data, selected);
  const packet = useMemo(() => buildForgePacket(data, selected), [data, selected]);

  async function copyPacket() {
    await navigator.clipboard.writeText(packet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-4 lg:sticky lg:top-4 lg:self-start">
        <p className="px-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#718978]">Choose chapter</p>
        <div className="mt-3 max-h-[72vh] space-y-1 overflow-y-auto pr-1">
          {data.chapters.map((chapter) => (
            <button className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${selected.slug === chapter.slug ? "bg-[#2c2415] font-black text-[#f0cc86]" : "text-[#b8cbbd] hover:bg-[#102219]"}`} key={chapter.slug} onClick={() => setSelected(chapter)} type="button">
              {chapter.number}. {chapter.title}
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-3xl border border-[#3a563f] bg-[#0b1a11] p-5 sm:p-7">
        <div className="flex flex-col gap-4 border-b border-[#294735] pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4a85f]">Deterministic author context</p>
            <h2 className="mt-2 text-2xl font-black">{selected.number}. {selected.title}</h2>
            <p className="mt-2 text-xs text-[#7f9987]">The Forge prepares context; it never silently promotes generated language into canon.</p>
          </div>
          <button className="rounded-xl bg-[#d4a85f] px-4 py-2.5 text-sm font-black text-[#172015] hover:bg-[#e9bf77]" onClick={copyPacket} type="button">{copied ? "Copied" : "Copy context"}</button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Metric label="Canonical words" value={selected.manuscriptWords} />
          <Metric label="Target words" value={selected.targetWords} />
          <Metric label="Claims" value={claims.length} />
          <Metric label="Required moves" value={selected.requiredSections.length} />
        </div>

        <div className="mt-7 grid gap-6 xl:grid-cols-2">
          <div>
            <h3 className="font-black">Required chapter movement</h3>
            <ol className="mt-3 space-y-2">
              {selected.requiredSections.map((section, index) => (
                <li className="flex gap-3 rounded-xl border border-[#213b2b] bg-[#0d2015] p-3 text-sm" key={section}><span className="font-black text-[#d4a85f]">{index + 1}</span><span>{section}</span></li>
              ))}
            </ol>
          </div>
          <div>
            <h3 className="font-black">Claims to handle</h3>
            <div className="mt-3 space-y-2">
              {claims.length ? claims.map((claim) => (
                <div className="rounded-xl border border-[#213b2b] bg-[#0d2015] p-3" key={claim.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-bold">{claim.title}</p><Badge tone={supportTone(claim.support)}>{claim.status}</Badge></div>
                  <p className="mt-2 text-xs leading-5 text-[#91a997]">{claim.summary}</p>
                </div>
              )) : <p className="rounded-xl bg-[#0d2015] p-3 text-sm text-[#91a997]">No ledger claim is assigned to this chapter.</p>}
            </div>
          </div>
        </div>

        <pre className="mt-7 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-2xl border border-[#294735] bg-[#07120c] p-4 text-xs leading-6 text-[#aabdae]">{packet}</pre>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#294735] bg-[#0a1710] p-4">
      <p className="text-2xl font-black text-[#f1dfb7]">{value.toLocaleString()}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.13em] text-[#718978]">{label}</p>
    </div>
  );
}

function MemoryView({ data }: { data: LivingManuscriptData }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5 sm:p-7">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#d4a85f]">Semantic memory</p>
        <h2 className="mt-2 text-2xl font-black">Concepts already connected to {data.title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#8fa494]">These relationships come from the real federation concept registry. This is the data foundation for the future interactive Book Memory Graph.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {data.relatedConcepts.length ? data.relatedConcepts.map((concept) => (
            <article className="rounded-2xl border border-[#294735] bg-[#0a1710] p-5" key={concept.id}>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#718978]">{concept.domain}</p>
              <h3 className="mt-2 text-lg font-black">{concept.label}</h3>
              <p className="mt-3 text-xs leading-6 text-[#8fa494]">{concept.referenceKeys.length} connected reference {concept.referenceKeys.length === 1 ? "key" : "keys"}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{concept.referenceKeys.map((key) => <Badge key={key} tone="slate">{key}</Badge>)}</div>
            </article>
          )) : <p className="text-sm text-[#8fa494]">No shared concepts are connected to this book yet.</p>}
        </div>
      </section>

      <aside className="space-y-5">
        <section className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5">
          <h3 className="font-black">Canonical terms</h3>
          <div className="mt-4 flex flex-wrap gap-2">{data.canonicalTerms.map((term) => <Badge key={term}>{term}</Badge>)}</div>
        </section>
        <section className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5">
          <h3 className="font-black">Provenance</h3>
          <p className="mt-2 text-xs leading-6 text-[#8fa494]">{data.provenance.entries.length} recorded provenance entries are available to the Living Manuscript.</p>
          <div className="mt-4 space-y-2">
            {data.provenance.entries.slice(0, 6).map((entry) => (
              <div className="rounded-xl border border-[#213b2b] bg-[#0a1710] p-3" key={entry.id}>
                <p className="text-xs font-bold">{entry.id}</p>
                <p className="mt-1 text-[11px] text-[#718978]">{entry.type} · {entry.status} · {entry.author}</p>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

export function LivingManuscriptWorkspace({ data }: { data: LivingManuscriptData }) {
  const [view, setView] = useState<WorkspaceView>("write");
  const [selected, setSelected] = useState<LivingChapter>(data.chapters[0]);

  if (!selected) {
    return <p className="mt-8 rounded-2xl border border-[#294735] bg-[#0b1a11] p-6 text-sm text-[#8fa494]">No chapters are defined for this book.</p>;
  }

  const canonicalChapters = data.chapters.filter((chapter) => chapter.manuscriptReady).length;
  const canonicalWords = data.chapters.reduce((sum, chapter) => sum + chapter.manuscriptWords, 0);

  return (
    <div className="mt-7">
      <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Planned chapters" value={data.chapters.length} />
        <Metric label="Canonical chapters" value={canonicalChapters} />
        <Metric label="Canonical words" value={canonicalWords} />
        <Metric label="Ledger claims" value={data.claims.length} />
      </section>

      <nav aria-label="Living Manuscript modes" className="mb-5 flex gap-2 overflow-x-auto rounded-2xl border border-[#294735] bg-[#09170f] p-2">
        {(Object.keys(workspaceLabels) as WorkspaceView[]).map((key) => (
          <button className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-black transition ${view === key ? "bg-[#d4a85f] text-[#172015]" : "text-[#91a997] hover:bg-[#102219] hover:text-white"}`} key={key} onClick={() => setView(key)} type="button">
            {workspaceLabels[key]}
          </button>
        ))}
      </nav>

      {view === "write" ? <EditorWorkspace data={data} selected={selected} setSelected={setSelected} /> : null}
      {view === "claims" ? <ClaimsView data={data} /> : null}
      {view === "forge" ? <ForgeView data={data} selected={selected} setSelected={setSelected} /> : null}
      {view === "memory" ? <MemoryView data={data} /> : null}
    </div>
  );
}
