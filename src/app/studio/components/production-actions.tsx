"use client";

import { useState } from "react";

import { runtimeHealth, runtimeStartJob } from "@/lib/runtime/runtime-client";

const jobs = [
  ["proof", "Build proof"],
  ["visual-proof", "Visual proof"],
  ["figures", "Prepare figures"],
  ["publication-gate", "Publication gate"],
  ["publishing-packet", "Build packet"],
] as const;

export function ProductionActions({ bookSlug }: { bookSlug: string }) {
  const [state, setState] = useState("Runtime actions available when connected.");
  const [busy, setBusy] = useState<string | null>(null);

  async function run(kind: string) {
    setBusy(kind);
    try {
      await runtimeHealth();
      const job = await runtimeStartJob(kind, bookSlug);
      setState(`${kind} started · job ${job.id.slice(0, 8)}. Track it in Runtime Center.`);
    } catch (error) {
      setState(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-5 rounded-2xl border border-[#2f5239] bg-[#0c1d13] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#d4a85f]">Runtime production</p>
          <p className="mt-1 text-xs leading-6 text-[#91a997]">Launch the real allowlisted Booksmith engines from this book. Jobs execute only in the local/private Runtime.</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {jobs.map(([kind, label]) => (
          <button className="rounded-xl border border-[#46604d] px-3 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#c7d8ca] transition hover:bg-[#13271a] disabled:opacity-40" disabled={busy !== null} key={kind} onClick={() => void run(kind)} type="button">
            {busy === kind ? "Starting…" : label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[10px] leading-5 text-[#718978]">{state}</p>
    </div>
  );
}
