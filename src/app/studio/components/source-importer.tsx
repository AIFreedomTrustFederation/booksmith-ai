"use client";

import { useState } from "react";

import { runtimeHealth, runtimeImportSource } from "@/lib/runtime/runtime-client";

type BookOption = { slug: string; title: string };
type IntakeMode = "file" | "url" | "note";

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Could not read source file."));
    reader.onload = () => {
      const value = String(reader.result ?? "");
      resolve(value.includes(",") ? value.slice(value.indexOf(",") + 1) : value);
    };
    reader.readAsDataURL(file);
  });
}

export function SourceImporter({ books }: { books: BookOption[] }) {
  const [mode, setMode] = useState<IntakeMode>("file");
  const [bookSlug, setBookSlug] = useState(books[0]?.slug ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [noteName, setNoteName] = useState("research-note.md");
  const [rightsStatus, setRightsStatus] = useState("review-required");
  const [notes, setNotes] = useState("");
  const [state, setState] = useState("Connect the local/private Runtime to import sources.");
  const [busy, setBusy] = useState(false);

  async function ingest() {
    setBusy(true);
    try {
      const health = await runtimeHealth();
      const max = health.importMaxBytes ?? 25 * 1024 * 1024;
      if (mode === "file" && !file) throw new Error("Choose a source file first.");
      if (mode === "file" && file && file.size > max) throw new Error(`Source file exceeds the Runtime limit of ${Math.round(max / 1024 / 1024)} MiB.`);
      if (mode === "url" && !url.trim()) throw new Error("Enter an HTTPS source URL first.");
      if (mode === "note" && !note.trim()) throw new Error("Enter source notes first.");

      setState("Importing source and rebuilding Book Memory…");
      const result = await runtimeImportSource({
        bookSlug,
        rightsStatus,
        notes,
        ...(mode === "file" && file ? { fileName: file.name, contentBase64: await fileToBase64(file) } : {}),
        ...(mode === "url" ? { url: url.trim() } : {}),
        ...(mode === "note" ? { fileName: noteName.trim() || "research-note.md", text: note } : {}),
      });
      setState(`${result.record.sourceId} imported · ${result.metadata.extractionMethod}${result.metadata.extracted ? " · indexed" : " · original preserved; extraction tool required"}.`);
      setFile(null);
      setUrl("");
      setNote("");
      setNotes("");
    } catch (error) {
      setState(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl border border-[#5d4a2d] bg-[#17140d] p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4a85f]">Research Intake</p>
          <h2 className="mt-2 text-2xl font-black">Bring a source into the living library.</h2>
          <p className="mt-2 max-w-3xl text-xs leading-6 text-[#a89a80]">Booksmith preserves the original, extracts readable text when local tooling supports it, records rights/provenance, updates the source registry, and rebuilds SQLite memory. PDF uses <code>pdftotext</code>; DOCX/EPUB use <code>pandoc</code> when installed.</p>
        </div>
        <div className="flex rounded-xl border border-[#493c28] bg-[#0d0b08] p-1">
          {(["file", "url", "note"] as IntakeMode[]).map((item) => <button className={`rounded-lg px-3 py-2 text-xs font-black ${mode === item ? "bg-[#d4a85f] text-[#172015]" : "text-[#a89a80]"}`} key={item} onClick={() => setMode(item)} type="button">{item === "file" ? "File" : item === "url" ? "Web URL" : "Notes"}</button>)}
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <label className="text-[10px] font-black uppercase tracking-[0.13em] text-[#8d7b5d]">Book<select className="mt-2 block w-full rounded-xl border border-[#55492f] bg-[#0d0b08] p-3 text-sm normal-case tracking-normal text-[#efe6d4]" onChange={(event) => setBookSlug(event.target.value)} value={bookSlug}>{books.map((book) => <option key={book.slug} value={book.slug}>{book.title}</option>)}</select></label>
        <label className="text-[10px] font-black uppercase tracking-[0.13em] text-[#8d7b5d]">Rights status<select className="mt-2 block w-full rounded-xl border border-[#55492f] bg-[#0d0b08] p-3 text-sm normal-case tracking-normal text-[#efe6d4]" onChange={(event) => setRightsStatus(event.target.value)} value={rightsStatus}><option value="owned">Owned</option><option value="licensed">Licensed</option><option value="public-domain">Public domain</option><option value="fair-use-review">Fair-use review</option><option value="review-required">Review required</option></select></label>
        <label className="text-[10px] font-black uppercase tracking-[0.13em] text-[#8d7b5d]">Intake note<input className="mt-2 block w-full rounded-xl border border-[#55492f] bg-[#0d0b08] p-3 text-sm normal-case tracking-normal text-[#efe6d4]" onChange={(event) => setNotes(event.target.value)} placeholder="Why this source belongs in the book" value={notes} /></label>
      </div>

      {mode === "file" ? <label className="mt-4 block rounded-2xl border border-dashed border-[#685632] bg-[#0d0b08] p-5 text-sm text-[#c6b797]">Choose PDF, DOCX, EPUB, Markdown, text, LaTeX, BibTeX, RIS, CSL/JSON, or HTML.<input accept=".pdf,.docx,.epub,.md,.mdx,.txt,.tex,.bib,.ris,.json,.csl,.html,.htm" className="mt-3 block w-full text-xs" onChange={(event) => setFile(event.target.files?.[0] ?? null)} type="file" />{file ? <span className="mt-2 block text-xs text-[#e4c987]">{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MiB</span> : null}</label> : null}
      {mode === "url" ? <div className="mt-4"><input className="w-full rounded-xl border border-[#55492f] bg-[#0d0b08] p-3 text-sm text-[#efe6d4] outline-none focus:border-[#b68d4d]" onChange={(event) => setUrl(event.target.value)} placeholder="https://example.org/research/article" type="url" value={url} /><p className="mt-2 text-[10px] leading-5 text-[#776b57]">For safety, direct web intake accepts HTTPS only and rejects private/local network targets and unsafe redirects.</p></div> : null}
      {mode === "note" ? <div className="mt-4 grid gap-3"><input className="rounded-xl border border-[#55492f] bg-[#0d0b08] p-3 text-sm text-[#efe6d4]" onChange={(event) => setNoteName(event.target.value)} placeholder="research-note.md" value={noteName} /><textarea className="min-h-48 rounded-2xl border border-[#55492f] bg-[#0d0b08] p-4 text-sm leading-7 text-[#efe6d4] outline-none focus:border-[#b68d4d]" onChange={(event) => setNote(event.target.value)} placeholder="Paste interview notes, transcript excerpts, observations, source summaries, or author research here…" value={note} /></div> : null}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-6 text-[#9e9278]">{state}</p><button className="rounded-xl bg-[#d4a85f] px-5 py-3 text-sm font-black text-[#172015] disabled:opacity-40" disabled={busy || !bookSlug} onClick={() => void ingest()} type="button">{busy ? "Importing…" : "Import & Index Source"}</button></div>
    </section>
  );
}
