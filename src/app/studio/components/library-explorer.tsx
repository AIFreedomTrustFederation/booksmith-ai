"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type BookItem = { slug: string; title: string; series: string; status: string; purpose: string };
type ConceptItem = { id: string; label: string; domain: string; relatedBooks: string[]; referenceKeys: string[] };
type ThinkerItem = { id: string; name: string; domain: string; importance: string; concepts: string[]; relatedBooks: string[] };
type ReferenceItem = { key: string; domain: string; importance: string; books: string[] };
type SourceItem = { sourceId: string; bookSlug: string; sourceType: string; location: string; rightsStatus: string; status: string; notes?: string };

type LibraryExplorerData = {
  books: BookItem[];
  concepts: ConceptItem[];
  thinkers: ThinkerItem[];
  references: ReferenceItem[];
  sources: SourceItem[];
};

type Tab = keyof LibraryExplorerData;

const labels: Record<Tab, string> = {
  books: "Books",
  concepts: "Concepts",
  thinkers: "Thinkers",
  references: "References",
  sources: "Sources",
};

function matches(parts: Array<string | undefined>, query: string) {
  return parts.filter(Boolean).join(" ").toLowerCase().includes(query.toLowerCase());
}

export function LibraryExplorer({ data }: { data: LibraryExplorerData }) {
  const [tab, setTab] = useState<Tab>("books");
  const [query, setQuery] = useState("");
  const q = query.trim();

  const results = useMemo(() => {
    if (tab === "books") return data.books.filter((item) => !q || matches([item.title, item.series, item.status, item.purpose], q));
    if (tab === "concepts") return data.concepts.filter((item) => !q || matches([item.label, item.domain, ...item.relatedBooks, ...item.referenceKeys], q));
    if (tab === "thinkers") return data.thinkers.filter((item) => !q || matches([item.name, item.domain, item.importance, ...item.concepts, ...item.relatedBooks], q));
    if (tab === "references") return data.references.filter((item) => !q || matches([item.key, item.domain, item.importance, ...item.books], q));
    return data.sources.filter((item) => !q || matches([item.sourceId, item.bookSlug, item.sourceType, item.location, item.rightsStatus, item.status, item.notes], q));
  }, [data, q, tab]);

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-3xl border border-[#294735] bg-[#0b1a11] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto">
          {(Object.keys(labels) as Tab[]).map((key) => (
            <button className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-black transition ${tab === key ? "bg-[#d4a85f] text-[#172015]" : "text-[#91a997] hover:bg-[#13271a] hover:text-white"}`} key={key} onClick={() => setTab(key)} type="button">
              {labels[key]} <span className="opacity-60">{data[key].length}</span>
            </button>
          ))}
        </div>
        <input
          className="min-w-0 rounded-xl border border-[#314d39] bg-[#07120c] px-4 py-2.5 text-sm text-[#e5eee6] outline-none placeholder:text-[#536b5a] focus:border-[#b68d4d] sm:w-80"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search the federated library…"
          value={query}
        />
      </div>

      <p className="mt-4 text-xs text-[#718978]">{results.length} matching {labels[tab].toLowerCase()}</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {tab === "books" ? (results as BookItem[]).map((item) => (
          <Link className="rounded-2xl border border-[#294735] bg-[#0b1a11] p-5 transition hover:border-[#6d5a37] hover:bg-[#15180f]" href={`/studio/books/${item.slug}`} key={item.slug}>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#718978]">{item.series} · {item.status}</p>
            <h3 className="mt-2 text-xl font-black">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[#91a997]">{item.purpose}</p>
          </Link>
        )) : null}

        {tab === "concepts" ? (results as ConceptItem[]).map((item) => (
          <article className="rounded-2xl border border-[#294735] bg-[#0b1a11] p-5" key={item.id}>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#718978]">{item.domain}</p>
            <h3 className="mt-2 text-xl font-black">{item.label}</h3>
            <p className="mt-3 text-xs leading-6 text-[#91a997]">Books: {item.relatedBooks.join(" · ")}</p>
            <p className="mt-2 break-words text-[11px] leading-6 text-[#718978]">References: {item.referenceKeys.join(" · ")}</p>
          </article>
        )) : null}

        {tab === "thinkers" ? (results as ThinkerItem[]).map((item) => (
          <article className="rounded-2xl border border-[#294735] bg-[#0b1a11] p-5" key={item.id}>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#718978]">{item.domain} · {item.importance}</p>
            <h3 className="mt-2 text-xl font-black">{item.name}</h3>
            <p className="mt-3 text-sm leading-7 text-[#91a997]">{item.concepts.join(" · ")}</p>
            <p className="mt-2 text-[11px] leading-6 text-[#718978]">Related books: {item.relatedBooks.join(" · ")}</p>
          </article>
        )) : null}

        {tab === "references" ? (results as ReferenceItem[]).map((item) => (
          <article className="rounded-2xl border border-[#294735] bg-[#0b1a11] p-5" key={item.key}>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#718978]">{item.domain} · {item.importance}</p>
            <h3 className="mt-2 break-all font-mono text-base font-black text-[#e5d3a7]">{item.key}</h3>
            <p className="mt-3 text-xs leading-6 text-[#91a997]">Books: {item.books.join(" · ")}</p>
          </article>
        )) : null}

        {tab === "sources" ? (results as SourceItem[]).map((item) => (
          <article className="rounded-2xl border border-[#294735] bg-[#0b1a11] p-5" key={item.sourceId}>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#718978]">{item.bookSlug} · {item.sourceType} · {item.status}</p>
            <h3 className="mt-2 text-lg font-black">{item.sourceId}</h3>
            <p className="mt-3 break-all font-mono text-xs leading-6 text-[#9caf9f]">{item.location}</p>
            <p className="mt-2 text-xs leading-6 text-[#718978]">Rights: {item.rightsStatus}{item.notes ? ` · ${item.notes}` : ""}</p>
          </article>
        )) : null}
      </div>

      {!results.length ? <div className="mt-6 rounded-2xl border border-dashed border-[#35513e] bg-[#09170f] p-8 text-center text-sm text-[#718978]">No indexed records match this search.</div> : null}
    </div>
  );
}
