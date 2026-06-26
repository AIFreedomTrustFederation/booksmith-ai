import { getSystemHealth } from "@/lib/system/system-health";

export default function SystemHealthPage() {
  const health = getSystemHealth();

  if (!health) {
    return (
      <main className="min-h-screen bg-zinc-950 p-8 text-zinc-100">
        <h1 className="text-3xl font-bold">System Health</h1>
        <p className="mt-4 text-zinc-400">No system health report found. Run <code>npm run system:health</code>.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-8 text-zinc-100">
      <section className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-400">BookSmith Studio</p>
        <h1 className="mt-2 text-4xl font-bold">System Health</h1>
        <p className="mt-3 text-zinc-400">
          Environment-aware diagnostics for local-first publishing, Termux, Next.js, LaTeX, and AI providers.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Stat label="Platform" value={health.platform.platform} />
          <Stat label="Arch" value={health.platform.arch} />
          <Stat label="Termux" value={health.platform.isTermux ? "Yes" : "No"} />
          <Stat label="Dev Mode" value={health.next.webpackRequired ? "Webpack" : "Default"} />
        </div>

        <Panel title="Next.js">
          <Rows rows={[
            ["Next", health.next.localVersion || "missing"],
            ["React", health.next.reactVersion || "missing"],
            ["Turbopack Supported", health.next.turbopackSupported ? "yes" : "no"],
            ["Recommended Command", health.next.recommendedDevCommand],
          ]} />
        </Panel>

        <Panel title="Publishing Tools">
          <ToolGrid tools={health.publishingTools} />
        </Panel>

        <Panel title="AI Providers">
          <ToolGrid tools={health.aiProviders} />
        </Panel>

        <Panel title="Recommendations">
          <ul className="space-y-2 text-zinc-300">
            {health.recommendations.length
              ? health.recommendations.map((item: string) => <li key={item}>• {item}</li>)
              : <li>No major recommendations.</li>}
          </ul>
        </Panel>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-xl font-bold text-amber-300">{value}</p>
    </div>
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

function Rows({ rows }: { rows: [string, string][] }) {
  return (
    <div className="divide-y divide-zinc-800">
      {rows.map(([key, value]) => (
        <div key={key} className="flex justify-between gap-4 py-3 text-sm">
          <span className="text-zinc-400">{key}</span>
          <span className="text-right text-zinc-100">{value}</span>
        </div>
      ))}
    </div>
  );
}

function ToolGrid({ tools }: { tools: Record<string, any> }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {Object.entries(tools).map(([key, value]) => {
        const installed = Boolean((value as any)?.installed);
        return (
          <div key={key} className="rounded-xl border border-zinc-800 bg-black/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{key}</p>
              <span className={`rounded-full px-2 py-1 text-xs ${installed ? "bg-emerald-900 text-emerald-200" : "bg-red-950 text-red-200"}`}>
                {installed ? "PASS" : "MISSING"}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs text-zinc-400">{(value as any)?.version || (value as any)?.error || ""}</p>
          </div>
        );
      })}
    </div>
  );
}
