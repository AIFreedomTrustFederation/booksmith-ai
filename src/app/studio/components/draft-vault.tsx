"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

type DraftRecord = {
  key: string;
  bookSlug: string;
  chapterSlug: string;
  text: string;
  words: number;
};

const prefix = "booksmith:";
const draftEvent = "booksmith-local-draft";

function countWords(value: string) {
  const normalized = value.trim();
  return normalized ? normalized.split(/\s+/).length : 0;
}

function scanDrafts() {
  const records: DraftRecord[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith(prefix) || !key.includes(":draft:")) continue;
    const match = key.match(/^booksmith:([^:]+):draft:(.+)$/);
    if (!match) continue;
    const text = window.localStorage.getItem(key) ?? "";
    records.push({
      key,
      bookSlug: match[1],
      chapterSlug: match[2],
      text,
      words: countWords(text),
    });
  }

  return records.sort((a, b) => a.key.localeCompare(b.key));
}

function snapshotDrafts() {
  return JSON.stringify(scanDrafts());
}

function download(filename: string, content: string, type = "text/markdown;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function DraftVault() {
  const subscribe = useCallback((notify: () => void) => {
    const onStorage = (event: StorageEvent) => {
      if (event.key?.startsWith(prefix)) notify();
    };
    const onDraft = () => notify();
    window.addEventListener("storage", onStorage);
    window.addEventListener(draftEvent, onDraft);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(draftEvent, onDraft);
    };
  }, []);

  const snapshot = useSyncExternalStore(subscribe, snapshotDrafts, () => "[]");
  const drafts = useMemo(() => JSON.parse(snapshot) as DraftRecord[], [snapshot]);
  const [query, setQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const q = query.trim().toLowerCase();
  const visible = drafts.filter((draft) => !q || `${draft.bookSlug} ${draft.chapterSlug} ${draft.text}`.toLowerCase().includes(q));
  const totalWords = drafts.reduce((sum, draft) => sum + draft.words, 0);

  function announce(key: string) {
    window.dispatchEvent(new CustomEvent<string>(draftEvent, { detail: key }));
  }

  async function copyDraft(draft: DraftRecord) {
    await navigator.clipboard.writeText(draft.text);
    setCopiedKey(draft.key);
    window.setTimeout(() => setCopiedKey(null), 1400);
  }

  function clearDraft(draft: DraftRecord) {
    window.localStorage.removeItem(draft.key);
    announce(draft.key);
  }

  function exportAll() {
    download(
      "booksmith-local-drafts.json",
      JSON.stringify(
        {
          schema: "booksmith.local-draft-vault.v1",
          exportedAt: new Date().toISOString(),
          drafts: drafts.map(({ key, bookSlug, chapterSlug, text, words }) => ({ key, bookSlug, chapterSlug, words, text })),
        },
        null,
        2,
      ),
      "application/json;charset=utf-8",
    );
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Local drafts" value={drafts.length} />
        <Metric label="Working words" value={totalWords} />
        <Metric label="Books represented" value={new Set(drafts.map((draft) => draft.bookSlug)).size} />
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-3xl border border-[#294735] bg-[#0b1a11] p-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          className="min-w-0 rounded-xl border border-[#314d39] bg-[#07120c] px-4 py-2.5 text-sm text-[#e5eee6] outline-none placeholder:text-[#536b5a] focus:border-[#b68d4d] sm:w-96"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search local drafts…"
          value={query}
        />
        <button
          className="rounded-xl border border-[#6f5b35] px-4 py-2.5 text-xs font-black text-[#e3bc72] transition hover:bg-[#1d190f] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!drafts.length}
          onClick={exportAll}
          type="button"
        >
          Export draft vault
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {visible.map((draft) => (
          <article className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5" key={draft.key}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#d4a85f]">{draft.bookSlug}</p>
                <h2 className="mt-2 text-lg font-black">{draft.chapterSlug}</h2>
                <p className="mt-1 text-xs text-[#718978]">{draft.words.toLocaleString()} working words · browser-local only</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="rounded-xl border border-[#46604d] px-3 py-2 text-xs font-bold text-[#c7d8ca] hover:bg-[#13271a]" onClick={() => copyDraft(draft)} type="button">{copiedKey === draft.key ? "Copied" : "Copy"}</button>
                <button className="rounded-xl border border-[#46604d] px-3 py-2 text-xs font-bold text-[#c7d8ca] hover:bg-[#13271a]" onClick={() => download(`${draft.bookSlug}-${draft.chapterSlug}.md`, draft.text)} type="button">Export .md</button>
                <button className="rounded-xl border border-[#70443c] px-3 py-2 text-xs font-bold text-[#d7a39a] hover:bg-[#281613]" onClick={() => clearDraft(draft)} type="button">Discard local draft</button>
              </div>
            </div>
            <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl border border-[#213b2b] bg-[#07120c] p-4 font-sans text-xs leading-6 text-[#9caf9f]">{draft.text || "[empty local draft]"}</pre>
          </article>
        ))}
      </div>

      {!visible.length ? (
        <div className="mt-5 rounded-3xl border border-dashed border-[#35513e] bg-[#09170f] p-10 text-center text-sm leading-7 text-[#718978]">
          {drafts.length ? "No local drafts match this search." : "No browser-local Booksmith drafts exist on this device yet. Writing in the Living Manuscript will create them automatically when the text diverges from repository canon."}
        </div>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-[#294735] bg-[#0b1a11] p-4"><p className="text-2xl font-black text-[#f1dfb7]">{value.toLocaleString()}</p><p className="mt-1 text-[10px] font-black uppercase tracking-[0.13em] text-[#718978]">{label}</p></div>;
}
