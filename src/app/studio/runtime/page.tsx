"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getRuntimeConfig,
  type RuntimeConfig,
  type RuntimeHealth,
  type RuntimeJob,
  runtimeGitStatus,
  runtimeHealth,
  runtimeJobs,
  runtimeProvenance,
  runtimeRebuildIndex,
  runtimeStartJob,
  saveRuntimeConfig,
} from "@/lib/runtime/runtime-client";

type GitState = { available: boolean; branch: string | null; status: string[] };

function Badge({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "amber" | "red" | "slate" }) {
  const styles = {
    green: "border-[#3e674a] bg-[#173522] text-[#bfe2c7]",
    amber: "border-[#765d31] bg-[#302716] text-[#f1c977]",
    red: "border-[#743f3f] bg-[#351919] text-[#efb0b0]",
    slate: "border-[#34493b] bg-[#101e15] text-[#9eb2a2]",
  };
  return <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${styles[tone]}`}>{children}</span>;
}

export default function RuntimeCenterPage() {
  const [config, setConfig] = useState<RuntimeConfig>({ baseUrl: "http://127.0.0.1:8787", token: "" });
  const [health, setHealth] = useState<RuntimeHealth | null>(null);
  const [jobs, setJobs] = useState<RuntimeJob[]>([]);
  const [git, setGit] = useState<GitState | null>(null);
  const [provenance, setProvenance] = useState<{ manuscript: unknown[]; ai: unknown[] } | null>(null);
  const [state, setState] = useState("Not connected.");
  const [bookSlug, setBookSlug] = useState("energence");
  const [jobKind, setJobKind] = useState("library-validate");
  const [publishConfirm, setPublishConfirm] = useState("");
  const [lastIndex, setLastIndex] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [nextHealth, nextJobs, nextGit, nextProvenance] = await Promise.all([
        runtimeHealth(),
        runtimeJobs(30),
        runtimeGitStatus(),
        runtimeProvenance(40),
      ]);
      setHealth(nextHealth);
      setJobs(nextJobs);
      setGit(nextGit);
      setProvenance(nextProvenance);
      setState("Runtime connected.");
    } catch (error) {
      setHealth(null);
      setState(error instanceof Error ? error.message : String(error));
    }
  }, []);

  useEffect(() => {
    setConfig(getRuntimeConfig());
    void refresh();
    const timer = window.setInterval(() => { void refresh(); }, 5000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const activeJobs = useMemo(() => jobs.filter((job) => job.status === "queued" || job.status === "running").length, [jobs]);

  function persistConfig() {
    saveRuntimeConfig(config);
    setState("Runtime connection settings saved in this browser.");
    void refresh();
  }

  async function rebuildIndex() {
    setState("Rebuilding SQLite memory index…");
    try {
      const result = await runtimeRebuildIndex();
      setLastIndex(`${result.documentCount} documents · ${result.entityCount} entities · ${result.edgeCount} edges`);
      setState("SQLite memory index rebuilt.");
      await refresh();
    } catch (error) {
      setState(error instanceof Error ? error.message : String(error));
    }
  }

  async function runJob() {
    setState(`Starting ${jobKind}…`);
    try {
      const confirmation = jobKind === "publish" ? publishConfirm : undefined;
      await runtimeStartJob(jobKind, bookSlug.trim() || undefined, confirmation);
      setState(`${jobKind} started.`);
      await refresh();
    } catch (error) {
      setState(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1600px]">
        <header className="rounded-[2rem] border border-[#2e4b37] bg-[#0a1a11] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#d4a85f]">Booksmith Runtime v1</p>
              <h1 className="mt-4 max-w-5xl text-4xl font-black tracking-[-0.03em] sm:text-6xl">The governed engine behind the manuscript.</h1>
              <p className="mt-5 max-w-4xl text-base leading-8 text-[#9eb2a2]">This is the private/local execution layer for canonical saves, provenance, Git, SQLite memory, local AI providers, figures, proofing and publication jobs. GitHub Pages never receives these powers.</p>
            </div>
            <div className="flex flex-wrap gap-2"><Badge tone={health ? "green" : "amber"}>{health ? "connected" : "offline"}</Badge>{health?.sqlite.ready ? <Badge>SQLite ready</Badge> : <Badge tone="slate">SQLite not ready</Badge>}<Badge tone={activeJobs ? "amber" : "slate"}>{activeJobs} active jobs</Badge></div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <section className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5">
              <h2 className="text-lg font-black">Runtime connection</h2>
              <label className="mt-4 block text-[10px] font-black uppercase tracking-[0.14em] text-[#718978]">Runtime URL</label>
              <input className="mt-2 w-full rounded-xl border border-[#314d39] bg-[#07120c] px-3 py-2.5 text-sm outline-none focus:border-[#b68d4d]" onChange={(event) => setConfig((current) => ({ ...current, baseUrl: event.target.value }))} value={config.baseUrl} />
              <label className="mt-4 block text-[10px] font-black uppercase tracking-[0.14em] text-[#718978]">Runtime token</label>
              <input className="mt-2 w-full rounded-xl border border-[#314d39] bg-[#07120c] px-3 py-2.5 text-sm outline-none focus:border-[#b68d4d]" onChange={(event) => setConfig((current) => ({ ...current, token: event.target.value }))} placeholder="Required only for protected/LAN runtime" type="password" value={config.token} />
              <div className="mt-4 flex gap-2"><button className="flex-1 rounded-xl bg-[#d4a85f] px-4 py-2.5 text-xs font-black text-[#172015]" onClick={persistConfig} type="button">Save & connect</button><button className="rounded-xl border border-[#35513d] px-4 py-2.5 text-xs font-bold" onClick={() => void refresh()} type="button">Refresh</button></div>
              <p className={`mt-4 text-xs leading-6 ${health ? "text-[#9eb2a2]" : "text-[#d7a68d]"}`}>{state}</p>
            </section>

            <section className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5">
              <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-black">Memory index</h2>{health?.sqlite.ready ? <Badge>ready</Badge> : <Badge tone="slate">offline</Badge>}</div>
              <p className="mt-3 text-xs leading-6 text-[#91a997]">Rebuilds the local SQLite/FTS5 index from canonical book files and federation registries. The database is disposable; the files remain source of truth.</p>
              {health?.sqlite.metadata ? <div className="mt-4 rounded-xl bg-[#07120c] p-3 font-mono text-[10px] leading-5 text-[#8fa494]">rebuilt: {health.sqlite.metadata.rebuilt_at ?? "unknown"}<br />documents: {health.sqlite.metadata.document_count ?? "unknown"}</div> : null}
              {lastIndex ? <p className="mt-3 text-xs text-[#b8cbbd]">{lastIndex}</p> : null}
              <button className="mt-4 w-full rounded-xl border border-[#6e5934] px-4 py-2.5 text-xs font-black text-[#dfba70] disabled:opacity-40" disabled={!health} onClick={() => void rebuildIndex()} type="button">Rebuild Book Memory</button>
            </section>

            <section className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5">
              <h2 className="text-lg font-black">Git workspace</h2>
              {git ? <div className="mt-3 text-xs leading-6 text-[#91a997]"><p>Branch: <b className="text-white">{git.branch ?? "none"}</b></p><p>Working changes: <b className="text-white">{git.status.length}</b></p>{git.status.slice(0, 8).map((line) => <p className="mt-1 break-all font-mono text-[10px]" key={line}>{line}</p>)}</div> : <p className="mt-3 text-xs text-[#718978]">Git status unavailable.</p>}
            </section>
          </aside>

          <section className="space-y-6">
            <section className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d4a85f]">Governed job engine</p><h2 className="mt-2 text-2xl font-black">Run the existing production machinery.</h2><p className="mt-2 max-w-3xl text-xs leading-6 text-[#91a997]">Only allowlisted Booksmith commands can run. Publishing requires an additional explicit confirmation string.</p></div></div>
              <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]"><select className="rounded-xl border border-[#314d39] bg-[#07120c] px-3 py-2.5 text-sm" onChange={(event) => setJobKind(event.target.value)} value={jobKind}>{(health?.jobs ?? [{ kind: "library-validate", consequential: false }, { kind: "system-health", consequential: false }, { kind: "proof", consequential: false }, { kind: "visual-proof", consequential: false }, { kind: "figures", consequential: false }, { kind: "publication-gate", consequential: false }, { kind: "publishing-packet", consequential: false }, { kind: "publish", consequential: true }]).map((job) => <option key={job.kind} value={job.kind}>{job.kind}{job.consequential ? " · confirmation required" : ""}</option>)}</select><input className="rounded-xl border border-[#314d39] bg-[#07120c] px-3 py-2.5 text-sm" onChange={(event) => setBookSlug(event.target.value)} placeholder="book slug" value={bookSlug} /><button className="rounded-xl bg-[#d4a85f] px-5 py-2.5 text-sm font-black text-[#172015] disabled:opacity-40" disabled={!health} onClick={() => void runJob()} type="button">Run</button></div>
              {jobKind === "publish" ? <div className="mt-3 rounded-xl border border-[#743f3f] bg-[#251313] p-4"><p className="text-xs leading-6 text-[#dfb0b0]">Publication can create consequential release artifacts. Type <b>publish</b> to authorize this one job.</p><input className="mt-2 w-full rounded-lg border border-[#743f3f] bg-[#100909] px-3 py-2 text-sm" onChange={(event) => setPublishConfirm(event.target.value)} placeholder="publish" value={publishConfirm} /></div> : null}
            </section>

            <section className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">Recent jobs</h2><Badge tone={activeJobs ? "amber" : "slate"}>{activeJobs} active</Badge></div>
              <div className="mt-4 space-y-3">{jobs.length ? jobs.map((job) => <article className="rounded-2xl border border-[#213b2b] bg-[#07120c] p-4" key={job.id}><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black">{job.kind}</p><p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#607765]">{job.bookSlug ?? "repository"} · {job.createdAt}</p></div><Badge tone={job.status === "succeeded" ? "green" : job.status === "failed" ? "red" : "amber"}>{job.status}</Badge></div>{job.log ? <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-black/30 p-3 font-mono text-[10px] leading-5 text-[#9eb2a2]">{job.log}</pre> : null}</article>) : <p className="text-sm text-[#718978]">No runtime jobs recorded yet.</p>}</div>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5"><h2 className="text-lg font-black">AI providers</h2><div className="mt-4 space-y-2">{health?.providers.map((provider) => <div className="rounded-xl border border-[#213b2b] bg-[#07120c] p-3" key={provider.id}><div className="flex items-center justify-between gap-2"><p className="text-sm font-bold">{provider.label}</p><Badge tone={provider.enabled ? "green" : "slate"}>{provider.enabled ? "enabled" : "disabled"}</Badge></div><p className="mt-1 text-[10px] text-[#718978]">{provider.kind} · {provider.defaultModel ?? "model not selected"}</p></div>) ?? <p className="text-xs text-[#718978]">Connect the Runtime to inspect providers.</p>}</div></article>
              <article className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5"><h2 className="text-lg font-black">Provenance ledger</h2><p className="mt-3 text-xs leading-6 text-[#91a997]">Author-approved saves and AI tasks are recorded separately so proposal history never masquerades as canon.</p><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-[#07120c] p-4"><p className="text-2xl font-black text-[#f1dfb7]">{provenance?.manuscript.length ?? 0}</p><p className="text-[10px] uppercase text-[#718978]">manuscript events</p></div><div className="rounded-xl bg-[#07120c] p-4"><p className="text-2xl font-black text-[#f1dfb7]">{provenance?.ai.length ?? 0}</p><p className="text-[10px] uppercase text-[#718978]">AI tasks</p></div></div></article>
            </section>
          </section>
        </div>
      </section>
    </main>
  );
}
