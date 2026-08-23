"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";

import type { LivingChapter, LivingManuscriptData } from "@/lib/studio/living-manuscript";
import {
  type ManuscriptDiff,
  type RuntimeHealth,
  type RuntimeManuscript,
  runtimeAiStream,
  runtimeDiff,
  runtimeHealth,
  runtimeManuscript,
  runtimeSave,
  runtimeSearch,
} from "@/lib/runtime/runtime-client";

type Mode = "write" | "claims" | "memory" | "forge";
type ProposalMode = "replace" | "append";

const localDraftEvent = "booksmith-local-draft";

function countWords(value: string) {
  const text = value.trim();
  return text ? text.split(/\s+/).length : 0;
}

function useLocalDraft(key: string, canonical: string) {
  const subscribe = useCallback((notify: () => void) => {
    const onStorage = (event: StorageEvent) => { if (event.key === key) notify(); };
    const onLocal = (event: Event) => { if ((event as CustomEvent<string>).detail === key) notify(); };
    window.addEventListener("storage", onStorage);
    window.addEventListener(localDraftEvent, onLocal);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(localDraftEvent, onLocal);
    };
  }, [key]);
  const getSnapshot = useCallback(() => window.localStorage.getItem(key) ?? canonical, [canonical, key]);
  const getServerSnapshot = useCallback(() => canonical, [canonical]);
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setValue = useCallback((next: string) => {
    window.localStorage.setItem(key, next);
    window.dispatchEvent(new CustomEvent<string>(localDraftEvent, { detail: key }));
  }, [key]);
  const reset = useCallback(() => {
    window.localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent<string>(localDraftEvent, { detail: key }));
  }, [key]);
  return { value, setValue, reset };
}

function fallbackCanonical(data: LivingManuscriptData, chapter: LivingChapter): RuntimeManuscript {
  return {
    bookSlug: data.slug,
    chapterSlug: chapter.slug,
    path: chapter.manuscriptPath,
    exists: chapter.manuscriptReady,
    text: chapter.manuscriptText,
    hash: "static-snapshot",
    words: chapter.manuscriptWords,
  };
}

function cleanSnippet(value: string) {
  return value.replace(/<\/?mark>/g, "");
}

function forgeContext(data: LivingManuscriptData, chapter: LivingChapter, draft: string) {
  const claims = data.claims.filter((claim) => claim.chapterSlugs.includes(chapter.slug));
  return [
    `BOOKSMITH AUTHOR CONTEXT — ${data.title}`,
    `Chapter ${chapter.number}: ${chapter.title}`,
    `Part ${chapter.part} · ${chapter.status}`,
    `Editorial target: ${chapter.targetWords.toLocaleString()} words`,
    `Primary texts: ${chapter.primaryTexts}`,
    `Author canon: ${data.authorCanon}`,
    "",
    "Required movement:",
    ...chapter.requiredSections.map((section) => `- ${section}`),
    "",
    "Claims in scope:",
    ...(claims.length ? claims.map((claim) => `- ${claim.title} [${claim.type}; ${claim.status}; ${claim.support}] — ${claim.summary}`) : ["- none"]),
    "",
    "CURRENT WORKING DRAFT:",
    draft || "[empty]",
    "",
    "Integrity rules:",
    "- Treat author-approved canon as authoritative.",
    "- Return proposals separately from canon.",
    "- Distinguish evidence, hypothesis, interpretation, exegesis, and constructive theology.",
    "- Never invent citations, verification, approval, or manuscript progress.",
  ].join("\n");
}

function StatusBadge({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "amber" | "red" | "slate" | "violet" }) {
  const styles = {
    green: "border-[#3e674a] bg-[#173522] text-[#bfe2c7]",
    amber: "border-[#765d31] bg-[#302716] text-[#f1c977]",
    red: "border-[#743f3f] bg-[#351919] text-[#efb0b0]",
    slate: "border-[#34493b] bg-[#101e15] text-[#9eb2a2]",
    violet: "border-[#684d76] bg-[#2d2034] text-[#d9b9e7]",
  };
  return <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${styles[tone]}`}>{children}</span>;
}

export function RuntimeManuscriptWorkspace({ data }: { data: LivingManuscriptData }) {
  const [mode, setMode] = useState<Mode>("write");
  const [selected, setSelected] = useState<LivingChapter>(data.chapters[0]);
  const [health, setHealth] = useState<RuntimeHealth | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [canonical, setCanonical] = useState<RuntimeManuscript>(() => fallbackCanonical(data, data.chapters[0]));
  const [diff, setDiff] = useState<ManuscriptDiff | null>(null);
  const [saving, setSaving] = useState(false);
  const [commitOnSave, setCommitOnSave] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveResult, setSaveResult] = useState<string | null>(null);
  const storageKey = `booksmith:${data.slug}:draft:${selected.slug}`;
  const localDraft = useLocalDraft(storageKey, canonical.text);
  const draft = localDraft.value;

  const refreshHealth = useCallback(async () => {
    try {
      const next = await runtimeHealth();
      setHealth(next);
      setRuntimeError(null);
      return next;
    } catch (error) {
      setHealth(null);
      setRuntimeError(error instanceof Error ? error.message : String(error));
      return null;
    }
  }, []);

  const refreshCanonical = useCallback(async (chapter: LivingChapter) => {
    try {
      const next = await runtimeManuscript(data.slug, chapter.slug);
      setCanonical(next);
      setRuntimeError(null);
    } catch (error) {
      setCanonical(fallbackCanonical(data, chapter));
      setRuntimeError(error instanceof Error ? error.message : String(error));
    }
  }, [data]);

  useEffect(() => {
    void refreshHealth().then((connected) => {
      if (connected) void refreshCanonical(selected);
    });
  }, [refreshCanonical, refreshHealth, selected]);

  function chooseChapter(chapter: LivingChapter) {
    setSelected(chapter);
    setCanonical(fallbackCanonical(data, chapter));
    setDiff(null);
    setSaveResult(null);
  }

  const dirty = draft !== canonical.text;
  const claims = data.claims.filter((claim) => claim.chapterSlugs.includes(selected.slug));

  async function reviewChanges() {
    try {
      setDiff(await runtimeDiff(data.slug, selected.slug, draft));
      setRuntimeError(null);
    } catch (error) {
      setRuntimeError(error instanceof Error ? error.message : String(error));
    }
  }

  async function saveCanon() {
    if (!diff?.changed || !health) return;
    setSaving(true);
    setSaveResult(null);
    try {
      const result = await runtimeSave({
        bookSlug: data.slug,
        chapterSlug: selected.slug,
        draft,
        expectedHash: canonical.hash === "static-snapshot" ? "" : canonical.hash,
        commit: commitOnSave,
        message: saveMessage.trim() || undefined,
      });
      setCanonical(result.manuscript);
      localDraft.reset();
      setDiff(null);
      setSaveResult(result.git?.committed ? `Saved to canon and committed as ${result.git.sha?.slice(0, 10)}.` : "Saved to canonical manuscript with provenance recorded.");
      setRuntimeError(null);
    } catch (error) {
      const typed = error as Error & { status?: number; code?: string };
      setRuntimeError(typed.status === 409 ? "Canon changed since this draft was loaded. Reload the canonical chapter before saving." : typed.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6">
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#294735] bg-[#09170f] p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={health ? "green" : "amber"}>{health ? "Runtime connected" : "Static/local-draft mode"}</StatusBadge>
          {health?.sqlite.ready ? <StatusBadge>SQLite memory ready</StatusBadge> : <StatusBadge tone="slate">memory index offline</StatusBadge>}
          {health?.enabledProviders.length ? <StatusBadge tone="violet">AI {health.enabledProviders.length} provider{health.enabledProviders.length === 1 ? "" : "s"}</StatusBadge> : <StatusBadge tone="slate">AI provider not enabled</StatusBadge>}
          <span className="text-xs text-[#718978]">Canon saves, AI, search and production require the local/private Runtime.</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-xl border border-[#35513d] px-3 py-2 text-xs font-bold text-[#b7c9ba] hover:bg-[#102219]" onClick={() => void refreshHealth()} type="button">Reconnect</button>
          <Link className="rounded-xl bg-[#d4a85f] px-3 py-2 text-xs font-black text-[#172015]" href="/studio/runtime">Runtime Center</Link>
        </div>
      </div>

      {runtimeError ? <div className="mb-5 rounded-2xl border border-[#743f3f] bg-[#351919] p-4 text-sm text-[#efb0b0]">{runtimeError}</div> : null}
      {saveResult ? <div className="mb-5 rounded-2xl border border-[#3e674a] bg-[#173522] p-4 text-sm text-[#bfe2c7]">{saveResult}</div> : null}

      <div className="mb-5 flex gap-1 overflow-x-auto rounded-2xl border border-[#294735] bg-[#09170f] p-1.5">
        {(["write", "claims", "memory", "forge"] as Mode[]).map((item) => (
          <button className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-black transition ${mode === item ? "bg-[#d4a85f] text-[#172015]" : "text-[#91a997] hover:bg-[#102219] hover:text-white"}`} key={item} onClick={() => setMode(item)} type="button">
            {item === "write" ? "Write" : item === "claims" ? "Claim Ledger" : item === "memory" ? "Book Memory" : "Chapter Forge"}
          </button>
        ))}
      </div>

      {mode === "write" ? (
        <WriteMode
          canonical={canonical}
          claims={claims}
          commitOnSave={commitOnSave}
          data={data}
          diff={diff}
          draft={draft}
          health={health}
          onCommitChange={setCommitOnSave}
          onDraft={localDraft.setValue}
          onReview={() => void reviewChanges()}
          onSave={() => void saveCanon()}
          onSaveMessage={setSaveMessage}
          onSelect={chooseChapter}
          onRestore={() => { localDraft.reset(); setDiff(null); }}
          saveMessage={saveMessage}
          saving={saving}
          selected={selected}
        />
      ) : null}
      {mode === "claims" ? <ClaimsMode data={data} selected={selected} onSelect={chooseChapter} /> : null}
      {mode === "memory" ? <MemoryMode bookSlug={data.slug} connected={Boolean(health)} /> : null}
      {mode === "forge" ? <ForgeMode data={data} draft={draft} selected={selected} onSelect={chooseChapter} connected={Boolean(health)} /> : null}
    </div>
  );
}

function ChapterTree({ data, selected, onSelect }: { data: LivingManuscriptData; selected: LivingChapter; onSelect: (chapter: LivingChapter) => void }) {
  return (
    <aside className="rounded-3xl border border-[#294735] bg-[#09170f] p-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
      <p className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#d4a85f]">Book Tree</p>
      <div className="mt-4 space-y-5">
        {data.parts.map((part) => (
          <section key={part.number}>
            <div className="px-2"><p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#607765]">Part {part.number}</p><h3 className="mt-1 text-xs font-black text-[#b8cbbd]">{part.title}</h3></div>
            <div className="mt-2 space-y-1">
              {data.chapters.filter((chapter) => chapter.part === part.number).map((chapter) => (
                <button className={`w-full rounded-xl border px-3 py-2.5 text-left ${chapter.slug === selected.slug ? "border-[#b68d4d] bg-[#2b2416] text-[#f4dfaf]" : "border-transparent text-[#9eb2a2] hover:border-[#294735] hover:bg-[#102219]"}`} key={chapter.slug} onClick={() => onSelect(chapter)} type="button">
                  <span className="text-[9px] font-black text-[#66806d]">{String(chapter.number).padStart(2, "0")}</span>
                  <span className="ml-2 text-xs font-bold">{chapter.title}</span>
                  <span className="mt-1 block pl-6 text-[9px] uppercase tracking-[0.09em] text-[#607765]">{chapter.manuscriptReady ? `${chapter.manuscriptWords} canonical words` : "not drafted"}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}

function WriteMode({ data, selected, canonical, draft, claims, health, diff, saving, commitOnSave, saveMessage, onSelect, onDraft, onRestore, onReview, onSave, onCommitChange, onSaveMessage }: {
  data: LivingManuscriptData; selected: LivingChapter; canonical: RuntimeManuscript; draft: string; claims: LivingManuscriptData["claims"]; health: RuntimeHealth | null; diff: ManuscriptDiff | null; saving: boolean; commitOnSave: boolean; saveMessage: string;
  onSelect: (chapter: LivingChapter) => void; onDraft: (value: string) => void; onRestore: () => void; onReview: () => void; onSave: () => void; onCommitChange: (value: boolean) => void; onSaveMessage: (value: string) => void;
}) {
  const [request, setRequest] = useState("");
  const [role, setRole] = useState("rewriting");
  const [proposal, setProposal] = useState("");
  const [proposalMode, setProposalMode] = useState<ProposalMode>("replace");
  const [aiState, setAiState] = useState("idle");
  const context = useMemo(() => forgeContext(data, selected, draft), [data, draft, selected]);
  const dirty = draft !== canonical.text;

  async function askBooksmith() {
    if (!request.trim() || !health) return;
    setAiState("working");
    setProposal("");
    try {
      await runtimeAiStream({ role, instruction: request, context, bookSlug: data.slug, sourcePath: canonical.path }, (event) => {
        if (event.type === "proposal") {
          const result = event.data as { content?: string };
          setProposal(result.content ?? "");
        }
        if (event.type === "done") setAiState("done");
        if (event.type === "error") {
          const value = event.data as { message?: string };
          setAiState(value.message ?? "AI task failed");
        }
      });
    } catch (error) {
      setAiState(error instanceof Error ? error.message : String(error));
    }
  }

  function applyProposal() {
    if (!proposal.trim()) return;
    onDraft(proposalMode === "append" && draft.trim() ? `${draft.trimEnd()}\n\n${proposal.trim()}\n` : proposal);
    setProposal("");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[270px_minmax(0,1fr)_350px]">
      <ChapterTree data={data} onSelect={onSelect} selected={selected} />

      <section className="min-w-0 rounded-3xl border border-[#334f3b] bg-[#0b1a11]">
        <header className="border-b border-[#294735] p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4a85f]">Chapter {selected.number} · Part {selected.part}</p><h2 className="mt-2 text-2xl font-black">{selected.title}</h2><p className="mt-2 break-all font-mono text-[10px] text-[#66806d]">{canonical.path}</p></div>
            <div className="flex flex-wrap gap-2"><StatusBadge tone={canonical.exists ? "green" : "slate"}>{canonical.exists ? "canon exists" : "new chapter"}</StatusBadge><StatusBadge tone={dirty ? "amber" : "green"}>{dirty ? "working changes" : "in sync"}</StatusBadge></div>
          </div>
          <div className="mt-4 flex flex-wrap gap-5 border-t border-[#213b2b] pt-4 text-xs text-[#8fa494]"><span><b className="text-white">{countWords(draft)}</b> working</span><span><b className="text-white">{canonical.words}</b> canon</span><span><b className="text-white">{selected.targetWords}</b> target</span><span><b className="text-white">{claims.length}</b> claims</span></div>
        </header>
        <div className="p-4 sm:p-6">
          <textarea aria-label={`Working manuscript for ${selected.title}`} className="min-h-[70vh] w-full resize-y rounded-2xl border border-[#294735] bg-[#f8f5eb] px-6 py-7 font-serif text-[17px] leading-8 text-[#1d271f] outline-none focus:border-[#b68d4d] sm:px-9" onChange={(event) => { onDraft(event.target.value); }} placeholder="Write the chapter here. Browser-local until you review the diff and explicitly save to canon." spellCheck value={draft} />

          <section className="mt-5 rounded-2xl border border-[#3b482d] bg-[#15170e] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#d4a85f]">Governed save</p><p className="mt-1 text-xs leading-6 text-[#9e9278]">Review the repository diff first. Saving is the explicit act that promotes this working draft into canonical manuscript.</p></div><button className="rounded-xl border border-[#6e5934] px-4 py-2 text-xs font-black text-[#dfba70] disabled:opacity-30" disabled={!dirty || !health} onClick={onReview} type="button">Review diff</button></div>
            {diff ? <div className="mt-4 rounded-xl border border-[#2c3d2e] bg-[#07120c] p-4"><div className="flex flex-wrap gap-4 text-xs"><span className="text-[#a6d6ae]">+{diff.stats.additions} lines</span><span className="text-[#dfa3a3]">-{diff.stats.deletions} lines</span><span className="text-[#91a997]">{diff.workingWords} working words</span></div><pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-black/30 p-3 font-mono text-[10px] leading-5 text-[#b8cbbd]">{diff.diff || "No textual diff."}</pre><div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]"><input className="rounded-xl border border-[#3a4a32] bg-[#0b130c] px-3 py-2 text-xs text-white outline-none" onChange={(event) => onSaveMessage(event.target.value)} placeholder="Optional Git commit message" value={saveMessage} /><label className="flex items-center gap-2 rounded-xl border border-[#3a4a32] px-3 py-2 text-xs text-[#b8cbbd]"><input checked={commitOnSave} onChange={(event) => onCommitChange(event.target.checked)} type="checkbox" /> Commit locally</label></div><div className="mt-3 flex flex-wrap gap-2"><button className="rounded-xl bg-[#d4a85f] px-4 py-2.5 text-xs font-black text-[#172015] disabled:opacity-40" disabled={!diff.changed || saving} onClick={onSave} type="button">{saving ? "Saving…" : "Accept into Canon"}</button><button className="rounded-xl border border-[#3b503e] px-4 py-2.5 text-xs font-bold text-[#a8bbaa]" onClick={onRestore} type="button">Restore Canon</button></div></div> : null}
          </section>
        </div>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <section className="rounded-3xl border border-[#3a563f] bg-[#0b1b12] p-5">
          <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4a85f]">Booksmith Intelligence</p><h3 className="mt-2 text-lg font-black">Ask the whole chapter</h3></div><StatusBadge tone="violet">proposal</StatusBadge></div>
          <select className="mt-4 w-full rounded-xl border border-[#314d39] bg-[#07120c] p-2.5 text-xs text-[#d8e7da]" onChange={(event) => setRole(event.target.value)} value={role}><option value="drafting">Drafting</option><option value="rewriting">Rewriting</option><option value="editing">Editing</option><option value="continuity">Continuity</option><option value="citations">Citations</option><option value="story-bible">Story Bible</option></select>
          <textarea className="mt-3 min-h-28 w-full resize-y rounded-2xl border border-[#314d39] bg-[#07120c] p-3 text-sm leading-6 text-[#e5eee6] outline-none focus:border-[#b68d4d]" onChange={(event) => setRequest(event.target.value)} placeholder="Strengthen this argument while preserving our established voice…" value={request} />
          <button className="mt-3 w-full rounded-xl bg-[#d4a85f] px-4 py-3 text-sm font-black text-[#172015] disabled:opacity-40" disabled={!health || !health.enabledProviders.length || !request.trim() || aiState === "working"} onClick={() => void askBooksmith()} type="button">{aiState === "working" ? "Booksmith is thinking…" : "Generate proposal"}</button>
          {aiState !== "idle" && aiState !== "working" && aiState !== "done" ? <p className="mt-2 text-xs leading-5 text-[#dfa3a3]">{aiState}</p> : null}
        </section>

        <section className="rounded-3xl border border-[#55492f] bg-[#18150e] p-5">
          <div className="flex items-center justify-between"><h3 className="text-sm font-black">Proposal staging</h3><StatusBadge tone="violet">unapproved</StatusBadge></div>
          <textarea className="mt-3 min-h-48 w-full resize-y rounded-xl border border-[#55492f] bg-[#0d0b08] p-3 text-sm leading-6 text-[#efe6d4] outline-none" onChange={(event) => setProposal(event.target.value)} placeholder="AI output remains separate until you choose how to apply it." value={proposal} />
          <div className="mt-3 flex gap-2"><button className={`flex-1 rounded-lg border px-2 py-2 text-[10px] font-black uppercase ${proposalMode === "replace" ? "border-[#d4a85f] text-[#e8c57f]" : "border-[#433924] text-[#8c8169]"}`} onClick={() => setProposalMode("replace")} type="button">Replace working draft</button><button className={`flex-1 rounded-lg border px-2 py-2 text-[10px] font-black uppercase ${proposalMode === "append" ? "border-[#d4a85f] text-[#e8c57f]" : "border-[#433924] text-[#8c8169]"}`} onClick={() => setProposalMode("append")} type="button">Append</button></div>
          <button className="mt-3 w-full rounded-xl border border-[#7b6135] px-4 py-2.5 text-xs font-black uppercase tracking-[0.1em] text-[#e5bf78] disabled:opacity-30" disabled={!proposal.trim()} onClick={applyProposal} type="button">Apply to working draft</button>
        </section>
      </aside>
    </div>
  );
}

function ClaimsMode({ data, selected, onSelect }: { data: LivingManuscriptData; selected: LivingChapter; onSelect: (chapter: LivingChapter) => void }) {
  return <div className="grid gap-4 lg:grid-cols-[270px_1fr]"><ChapterTree data={data} onSelect={onSelect} selected={selected} /><section className="grid gap-4 xl:grid-cols-2">{data.claims.map((claim) => <article className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5" key={claim.id}><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#718978]">{claim.type}</p><h3 className="mt-2 text-lg font-black">{claim.title}</h3></div><StatusBadge tone={claim.support === "verification-required" ? "amber" : claim.type === "author-canon" ? "green" : "violet"}>{claim.status}</StatusBadge></div><p className="mt-4 text-sm leading-7 text-[#b6c8b9]">{claim.summary}</p><p className="mt-4 text-xs text-[#718978]">Support: {claim.support}</p>{claim.sourceRefs.map((ref) => <p className="mt-2 break-all font-mono text-[10px] text-[#91a997]" key={ref}>{ref}</p>)}</article>)}</section></div>;
}

function MemoryMode({ bookSlug, connected }: { bookSlug: string; connected: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ id: string; bookSlug: string; kind: string; path: string; title: string; snippet: string }>>([]);
  const [state, setState] = useState("idle");
  async function search() {
    if (!query.trim() || !connected) return;
    setState("searching");
    try { setResults(await runtimeSearch(query, bookSlug, 50)); setState("done"); } catch (error) { setState(error instanceof Error ? error.message : String(error)); }
  }
  return <section className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5 sm:p-7"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4a85f]">SQLite + FTS5</p><h2 className="mt-2 text-2xl font-black">Search the memory around this book.</h2><div className="mt-5 flex gap-2"><input className="min-w-0 flex-1 rounded-xl border border-[#314d39] bg-[#07120c] px-4 py-3 text-sm outline-none focus:border-[#b68d4d]" onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void search(); }} placeholder="Eternal Now, evolution, coherence, Christic consciousness…" value={query} /><button className="rounded-xl bg-[#d4a85f] px-5 py-3 text-sm font-black text-[#172015] disabled:opacity-40" disabled={!connected || !query.trim()} onClick={() => void search()} type="button">Search</button></div>{state !== "idle" && state !== "done" && state !== "searching" ? <p className="mt-3 text-xs text-[#dfa3a3]">{state}</p> : null}<div className="mt-5 grid gap-3 xl:grid-cols-2">{results.map((result) => <article className="rounded-2xl border border-[#213b2b] bg-[#08160e] p-4" key={result.id}><div className="flex items-center justify-between gap-3"><p className="font-black">{result.title}</p><StatusBadge tone="slate">{result.kind}</StatusBadge></div><p className="mt-2 font-mono text-[10px] text-[#66806d]">{result.path}</p><p className="mt-3 text-xs leading-6 text-[#a9bcad]">{cleanSnippet(result.snippet)}</p></article>)}</div>{state === "done" && !results.length ? <p className="mt-6 text-sm text-[#718978]">No indexed passages matched that query.</p> : null}</section>;
}

function ForgeMode({ data, selected, draft, connected, onSelect }: { data: LivingManuscriptData; selected: LivingChapter; draft: string; connected: boolean; onSelect: (chapter: LivingChapter) => void }) {
  const [copied, setCopied] = useState(false);
  const context = useMemo(() => forgeContext(data, selected, draft), [data, draft, selected]);
  async function copy() { await navigator.clipboard.writeText(context); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }
  return <div className="grid gap-4 lg:grid-cols-[270px_1fr]"><ChapterTree data={data} onSelect={onSelect} selected={selected} /><section className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5 sm:p-7"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4a85f]">Chapter Forge</p><h2 className="mt-2 text-2xl font-black">{selected.number}. {selected.title}</h2><p className="mt-2 text-xs text-[#718978]">Deterministic context packet built from canon, claims, required movement and the current working draft.</p></div><button className="rounded-xl bg-[#d4a85f] px-4 py-2.5 text-xs font-black text-[#172015]" onClick={() => void copy()} type="button">{copied ? "Copied" : "Copy context"}</button></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-[#102219] p-4"><p className="text-[10px] uppercase text-[#718978]">Target</p><p className="mt-2 font-black">{selected.targetWords.toLocaleString()} words</p></div><div className="rounded-xl bg-[#102219] p-4"><p className="text-[10px] uppercase text-[#718978]">Moves</p><p className="mt-2 font-black">{selected.requiredSections.length}</p></div><div className="rounded-xl bg-[#102219] p-4"><p className="text-[10px] uppercase text-[#718978]">Runtime</p><p className="mt-2 font-black">{connected ? "Connected" : "Offline"}</p></div></div><pre className="mt-5 max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-2xl border border-[#213b2b] bg-[#07120c] p-5 font-mono text-[11px] leading-6 text-[#a9bcad]">{context}</pre></section></div>;
}
