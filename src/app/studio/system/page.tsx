import { getSystemHealth, type SystemToolStatus } from "@/lib/system/system-health";

export default function SystemHealthPage() {
  const health = getSystemHealth();

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <header className="rounded-[2rem] border border-[#2e4b37] bg-[#0a1a11] p-6 sm:p-8 lg:p-10">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#d4a85f]">System Health</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-[-0.03em] sm:text-6xl">The tools beneath the writing room.</h1>
          <p className="mt-5 max-w-4xl text-base leading-8 text-[#9eb2a2]">
            Booksmith is local-first by design. This surface exposes the recorded environment for Next.js, publishing tools, and AI providers so the portal never pretends a renderer or model is available when the local runtime has not verified it.
          </p>
        </header>

        {!health ? (
          <section className="mt-6 rounded-3xl border border-dashed border-[#3c563f] bg-[#09170f] p-8">
            <p className="text-lg font-black">No recorded system-health snapshot is committed.</p>
            <p className="mt-3 text-sm leading-7 text-[#91a997]">Run <code className="rounded bg-[#07120c] px-2 py-1 text-[#e3bc72]">npm run system:health</code> in the Booksmith runtime to generate the environment-aware report. The portal intentionally shows this honest empty state instead of assuming installed tools.</p>
          </section>
        ) : (
          <>
            <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Platform" value={health.platform.platform} />
              <Stat label="Architecture" value={health.platform.arch} />
              <Stat label="Termux" value={health.platform.isTermux ? "yes" : "no"} />
              <Stat label="Dev mode" value={health.next.webpackRequired ? "webpack" : "default"} />
            </section>

            <div className="mt-6 grid gap-5 xl:grid-cols-2">
              <Panel title="Next.js runtime" eyebrow="Application">
                <Rows rows={[
                  ["Next", health.next.localVersion || "missing"],
                  ["React", health.next.reactVersion || "missing"],
                  ["Turbopack supported", health.next.turbopackSupported ? "yes" : "no"],
                  ["Recommended command", health.next.recommendedDevCommand],
                ]} />
              </Panel>
              <Panel title="Publishing tools" eyebrow="Production">
                <ToolGrid tools={health.publishingTools} />
              </Panel>
              <Panel title="AI providers" eyebrow="Intelligence">
                <ToolGrid tools={health.aiProviders} />
              </Panel>
              <Panel title="Recommendations" eyebrow="Next action">
                <ul className="space-y-2 text-sm leading-7 text-[#b8cbbd]">
                  {health.recommendations.length ? health.recommendations.map((item) => <li key={item}>• {item}</li>) : <li className="text-[#718978]">No major recommendations recorded.</li>}
                </ul>
              </Panel>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-[#294735] bg-[#0b1a11] p-4"><p className="text-[10px] font-black uppercase tracking-[0.13em] text-[#718978]">{label}</p><p className="mt-2 text-xl font-black text-[#f1dfb7]">{value}</p></div>;
}

function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return <section className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5 sm:p-6"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#718978]">{eyebrow}</p><h2 className="mt-2 text-xl font-black">{title}</h2><div className="mt-4">{children}</div></section>;
}

function Rows({ rows }: { rows: [string, string][] }) {
  return <div className="divide-y divide-[#213b2b]">{rows.map(([key, value]) => <div className="flex justify-between gap-4 py-3 text-sm" key={key}><span className="text-[#718978]">{key}</span><span className="text-right text-[#d8e7da]">{value}</span></div>)}</div>;
}

function ToolGrid({ tools }: { tools: Record<string, SystemToolStatus> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Object.entries(tools).map(([key, value]) => {
        const installed = Boolean(value.installed);
        return (
          <div className="rounded-xl border border-[#213b2b] bg-[#08160e] p-4" key={key}>
            <div className="flex items-center justify-between gap-3"><p className="font-bold">{key}</p><span className={`rounded-full border px-2 py-1 text-[9px] font-black uppercase ${installed ? "border-[#41664d] bg-[#173522] text-[#bfe2c7]" : "border-[#70443c] bg-[#281613] text-[#d7a39a]"}`}>{installed ? "available" : "missing"}</span></div>
            <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#718978]">{value.version || value.error || "No version detail recorded."}</p>
          </div>
        );
      })}
    </div>
  );
}
