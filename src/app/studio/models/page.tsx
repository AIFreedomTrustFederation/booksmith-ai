"use client";

import { useCallback, useEffect, useState } from "react";

import {
  type RuntimeProviderConfig,
  runtimeProviderHealth,
  runtimeProviders,
  runtimeSaveProviders,
} from "@/lib/runtime/runtime-client";

type EditableProvider = RuntimeProviderConfig & { health?: { ok: boolean; message: string; models?: string[] } };

function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: "green" | "amber" | "red" | "slate" }) {
  const styles = {
    green: "border-[#3e674a] bg-[#173522] text-[#bfe2c7]",
    amber: "border-[#765d31] bg-[#302716] text-[#f1c977]",
    red: "border-[#743f3f] bg-[#351919] text-[#efb0b0]",
    slate: "border-[#34493b] bg-[#101e15] text-[#9eb2a2]",
  };
  return <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${styles[tone]}`}>{children}</span>;
}

export default function ModelStudioPage() {
  const [providers, setProviders] = useState<EditableProvider[]>([]);
  const [state, setState] = useState("Connect Booksmith Runtime to configure local models.");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await runtimeProviders();
      setProviders(result.providers);
      setState("Provider settings loaded from private Runtime state.");
    } catch (error) {
      setState(error instanceof Error ? error.message : String(error));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function updateProvider(id: string, update: Partial<EditableProvider>) {
    setProviders((current) => current.map((provider) => provider.id === id ? { ...provider, ...update } : provider));
  }

  async function save() {
    setBusy(true);
    try {
      const result = await runtimeSaveProviders(providers.map((provider) => ({
        id: provider.id,
        enabled: provider.enabled,
        baseUrl: provider.baseUrl,
        defaultModel: provider.defaultModel ?? undefined,
      })));
      setProviders(result.providers);
      setState("Provider configuration saved to .booksmith/providers.json. Nothing was committed to Git.");
    } catch (error) {
      setState(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function test(provider: EditableProvider) {
    setBusy(true);
    try {
      if (!provider.enabled) throw new Error("Enable and save this provider before testing it.");
      const result = await runtimeProviderHealth(provider.id);
      if (Array.isArray(result)) throw new Error("Unexpected provider-health response.");
      updateProvider(provider.id, { health: { ok: result.ok, message: result.message, models: result.models } });
      setState(result.ok ? `${provider.label} is reachable.` : `${provider.label}: ${result.message}`);
    } catch (error) {
      setState(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1400px]">
        <header className="rounded-[2rem] border border-[#2e4b37] bg-[#0a1a11] p-6 sm:p-8 lg:p-10">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#d4a85f]">Model Studio</p>
          <h1 className="mt-4 max-w-5xl text-4xl font-black tracking-[-0.03em] sm:text-6xl">Intelligence you control.</h1>
          <p className="mt-5 max-w-4xl text-base leading-8 text-[#9eb2a2]">Enable a user-managed Ollama, llama.cpp, or vLLM endpoint, choose the model Booksmith should use, and test it without putting provider configuration into the repository. These providers serve proposals; they never receive authority to write canon directly.</p>
          <div className="mt-5 flex flex-wrap gap-2"><Badge tone="green">local-first</Badge><Badge>OpenAI-compatible boundary</Badge><Badge>private Runtime settings</Badge></div>
        </header>

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          {providers.length ? providers.map((provider) => (
            <article className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5 sm:p-6" key={provider.id}>
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#718978]">{provider.kind}</p><h2 className="mt-2 text-xl font-black">{provider.label}</h2></div>
                <Badge tone={provider.enabled ? "green" : "slate"}>{provider.enabled ? "enabled" : "disabled"}</Badge>
              </div>
              <p className="mt-3 min-h-12 text-xs leading-6 text-[#91a997]">{provider.notes}</p>

              <label className="mt-5 flex items-center gap-3 rounded-xl border border-[#2d4936] bg-[#07120c] p-3 text-sm font-bold text-[#c8d7ca]"><input checked={provider.enabled} onChange={(event) => updateProvider(provider.id, { enabled: event.target.checked })} type="checkbox" />Enable provider</label>

              <label className="mt-4 block text-[10px] font-black uppercase tracking-[0.14em] text-[#718978]">Base URL<input className="mt-2 block w-full rounded-xl border border-[#314d39] bg-[#07120c] px-3 py-2.5 text-sm normal-case tracking-normal text-[#e5eee6] outline-none focus:border-[#b68d4d]" onChange={(event) => updateProvider(provider.id, { baseUrl: event.target.value })} value={provider.baseUrl} /></label>
              <label className="mt-4 block text-[10px] font-black uppercase tracking-[0.14em] text-[#718978]">Default model<input className="mt-2 block w-full rounded-xl border border-[#314d39] bg-[#07120c] px-3 py-2.5 text-sm normal-case tracking-normal text-[#e5eee6] outline-none focus:border-[#b68d4d]" onChange={(event) => updateProvider(provider.id, { defaultModel: event.target.value })} placeholder="model name" value={provider.defaultModel ?? ""} /></label>

              {provider.health ? <div className={`mt-4 rounded-xl border p-3 text-xs leading-6 ${provider.health.ok ? "border-[#3e674a] bg-[#13271a] text-[#bfe2c7]" : "border-[#743f3f] bg-[#251313] text-[#efb0b0]"}`}><p className="font-bold">{provider.health.message}</p>{provider.health.models?.length ? <p className="mt-1 break-words text-[10px]">Models: {provider.health.models.slice(0, 12).join(" · ")}</p> : null}</div> : null}

              <button className="mt-4 w-full rounded-xl border border-[#46604d] px-4 py-2.5 text-xs font-black text-[#c7d8ca] hover:bg-[#13271a] disabled:opacity-40" disabled={busy} onClick={() => void test(provider)} type="button">Test provider</button>
            </article>
          )) : <div className="rounded-3xl border border-dashed border-[#294735] bg-[#07120c] p-10 text-center text-sm text-[#718978] xl:col-span-3">No provider configuration is visible because the Runtime is not connected.</div>}
        </div>

        <section className="mt-6 rounded-3xl border border-[#5d4a2d] bg-[#17140d] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#d4a85f]">Private configuration</p><p className="mt-2 max-w-3xl text-xs leading-6 text-[#a89a80]">Saving writes only `.booksmith/providers.json`, which is ignored by Git. Booksmith currently targets user-managed local/self-hosted OpenAI-compatible providers and does not pretend hosted API-key support exists where the provider adapter has not implemented it.</p></div><button className="rounded-xl bg-[#d4a85f] px-5 py-3 text-sm font-black text-[#172015] disabled:opacity-40" disabled={busy || !providers.length} onClick={() => void save()} type="button">{busy ? "Working…" : "Save Provider Settings"}</button></div>
          <p className="mt-4 text-xs leading-6 text-[#9e9278]">{state}</p>
        </section>
      </section>
    </main>
  );
}
