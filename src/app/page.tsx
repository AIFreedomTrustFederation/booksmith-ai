const projects = [
  {
    title: "The Glass Orchard",
    type: "Speculative novel",
    status: "Draft 2",
    progress: "68%",
  },
  {
    title: "Signals for Founders",
    type: "Business nonfiction",
    status: "Outline",
    progress: "24%",
  },
  {
    title: "Moonlit Bakery",
    type: "Romantasy novella",
    status: "Launch",
    progress: "91%",
  },
];

const aiModes = ["Draft", "Rewrite", "Plot", "Edit", "Market"];

const creativeControls = [
  "Lyrical but direct prose",
  "No deus ex machina endings",
  "Keep Mira's POV intimate",
  "Audience: adult crossover",
];

const pipeline = [
  { label: "Manuscript", detail: "64,200 of 85,000 words", done: true },
  { label: "Editorial pass", detail: "Pacing review in progress", done: true },
  { label: "Book package", detail: "Cover brief and metadata queued", done: false },
  { label: "Launch kit", detail: "Ads, email, and retailer copy", done: false },
];

const launchAssets = [
  ["Back cover blurb", "Ready to review", "Retail"],
  ["TikTok hook pack", "12 concepts", "Social"],
  ["Reader magnet email", "Drafting", "Email"],
  ["Amazon keywords", "42 candidates", "Metadata"],
];

const localStack = ["Ollama", "llama.cpp", "vLLM", "Qdrant"];

const latexTools = ["latexmk", "XeLaTeX", "LuaLaTeX", "Tectonic"];

const latexFeatures = [
  "Editable .tex source",
  "6x9 paperback proof",
  "Front/back matter builder",
  "Index, glossary, citations",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4f8f1] text-[#17201a]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-[#d8e1d1] bg-[#fbfdf9] px-5 py-5 lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#48725b]">
                Booksmith AI
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                Creative foundry
              </h1>
            </div>
            <button className="rounded-md bg-[#17201a] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#284032]">
              New
            </button>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#3f5045]">Bookshelf</h2>
              <span className="rounded-full bg-[#e4efe0] px-2.5 py-1 text-xs font-medium text-[#315640]">
                3 active
              </span>
            </div>
            <div className="mt-3 space-y-3">
              {projects.map((project) => (
                <button
                  className="w-full rounded-lg border border-[#d9e4d2] bg-white p-3 text-left shadow-sm transition hover:border-[#96b88c]"
                  key={project.title}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{project.title}</p>
                      <p className="mt-1 text-sm text-[#667368]">{project.type}</p>
                    </div>
                    <span className="rounded-full bg-[#eef7ea] px-2 py-1 text-xs font-medium text-[#48725b]">
                      {project.status}
                    </span>
                  </div>
                  <div className="mt-4 h-1.5 rounded-full bg-[#edf2e8]">
                    <div
                      className="h-full rounded-full bg-[#55a06d]"
                      style={{ width: project.progress }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-[#d9e4d2] bg-[#f6fbf3] p-4">
            <h2 className="font-semibold">Voice lock</h2>
            <p className="mt-2 text-sm leading-6 text-[#607064]">
              The AI is pinned to the author&apos;s rules, manuscript samples,
              audience promise, and revision boundaries before it suggests a
              single line.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <span className="rounded-md bg-white px-3 py-2 text-center font-medium">
                Style 94%
              </span>
              <span className="rounded-md bg-white px-3 py-2 text-center font-medium">
                Lore 88%
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-[#d9e4d2] bg-white p-4">
            <h2 className="font-semibold">Local-first AI</h2>
            <p className="mt-2 text-sm leading-6 text-[#607064]">
              No required paid AI APIs, no outside rate limits, and no manuscript
              upload requirement for core writing tools.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {localStack.map((item) => (
                <span
                  className="rounded-full bg-[#eef7ea] px-2.5 py-1 text-xs font-semibold text-[#3f674b]"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </aside>

        <section className="flex-1 overflow-hidden">
          <header className="border-b border-[#d8e1d1] bg-white px-5 py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm font-medium text-[#58705f]">
                  Current manuscript
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-semibold tracking-tight">
                    The Glass Orchard
                  </h2>
                  <span className="rounded-full border border-[#b6d0ae] bg-[#f4faf1] px-3 py-1 text-sm font-medium text-[#3f674b]">
                    Chapter 14 active
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="rounded-md border border-[#cbd8c5] bg-white px-4 py-2 text-sm font-semibold text-[#2d3b31] transition hover:border-[#88a982]">
                  Export EPUB
                </button>
                <button className="rounded-md border border-[#cbd8c5] bg-white px-4 py-2 text-sm font-semibold text-[#2d3b31] transition hover:border-[#88a982]">
                  Export LaTeX
                </button>
                <button className="rounded-md border border-[#cbd8c5] bg-white px-4 py-2 text-sm font-semibold text-[#2d3b31] transition hover:border-[#88a982]">
                  Share editor
                </button>
                <button className="rounded-md bg-[#2f6b4a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#24563a]">
                  Forge next scene
                </button>
              </div>
            </div>
          </header>

          <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <section className="rounded-lg border border-[#d8e1d1] bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Chapter Studio</h3>
                    <p className="mt-1 text-sm text-[#667368]">
                      Goal: reveal the orchard&apos;s origin without breaking
                      Mira&apos;s unreliable narration.
                    </p>
                  </div>
                  <div className="flex rounded-md border border-[#d6e2cf] bg-[#f6faf3] p-1">
                    {aiModes.map((mode, index) => (
                      <button
                        className={`rounded px-3 py-1.5 text-sm font-semibold transition ${
                          index === 0
                            ? "bg-white text-[#1f3326] shadow-sm"
                            : "text-[#607064] hover:text-[#1f3326]"
                        }`}
                        key={mode}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="rounded-lg border border-[#dbe5d5] bg-[#f8fbf5] p-4">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#57705f]">
                      Scene beats
                    </h4>
                    <ol className="mt-4 space-y-3 text-sm text-[#3f5045]">
                      <li className="rounded-md bg-white p-3 shadow-sm">
                        Mira finds the seed vault map.
                      </li>
                      <li className="rounded-md bg-white p-3 shadow-sm">
                        Eli admits the orchard records were altered.
                      </li>
                      <li className="rounded-md bg-white p-3 shadow-sm">
                        End on the glass fruit opening.
                      </li>
                    </ol>
                  </div>

                  <article className="rounded-lg border border-[#dbe5d5] bg-white p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e3eadf] pb-4">
                      <div>
                        <p className="text-sm font-medium text-[#607064]">
                          Draft canvas
                        </p>
                        <h4 className="mt-1 text-lg font-semibold">
                          The seed vault under the greenhouse
                        </h4>
                      </div>
                      <span className="rounded-full bg-[#eef7ea] px-3 py-1 text-sm font-medium text-[#3f674b]">
                        1,842 words
                      </span>
                    </div>
                    <div className="prose prose-sm mt-5 max-w-none text-[#2f3d34]">
                      <p>
                        Mira held the lantern low enough for the glass trees to
                        catch fire in its reflection. Every branch answered with
                        a small, impossible sunrise.
                      </p>
                      <p>
                        The map in her palm did not name the orchard. It named
                        the people who had been buried beneath it, one root at a
                        time.
                      </p>
                    </div>
                    <div className="mt-6 rounded-lg border border-[#cfe0c7] bg-[#f7fbf4] p-4">
                      <label
                        className="text-sm font-semibold text-[#405145]"
                        htmlFor="assistant-prompt"
                      >
                        Ask Booksmith
                      </label>
                      <div className="mt-3 flex flex-col gap-3 md:flex-row">
                        <input
                          className="min-h-11 flex-1 rounded-md border border-[#cbd8c5] bg-white px-3 text-sm outline-none transition placeholder:text-[#8a978d] focus:border-[#55a06d] focus:ring-2 focus:ring-[#d6ebd1]"
                          id="assistant-prompt"
                          placeholder="Make this scene tenser but keep the prose restrained."
                        />
                        <button className="rounded-md bg-[#17201a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#284032]">
                          Generate options
                        </button>
                      </div>
                    </div>
                  </article>
                </div>
              </section>

              <section className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-lg border border-[#d8e1d1] bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold">Story Bible</h3>
                    <span className="rounded-full bg-[#eef7ea] px-3 py-1 text-sm font-medium text-[#3f674b]">
                      127 facts
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm">
                    {creativeControls.map((control) => (
                      <div
                        className="rounded-md border border-[#dfe8da] bg-[#f9fcf7] px-3 py-2 text-[#3f5045]"
                        key={control}
                      >
                        {control}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-[#d8e1d1] bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-semibold">Continuity Watch</h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="rounded-md border border-[#e2d5b8] bg-[#fff9eb] p-3 text-[#66522a]">
                      Eli cannot read pre-collapse script until Chapter 18.
                    </div>
                    <div className="rounded-md border border-[#c7dff0] bg-[#eef8ff] p-3 text-[#31566d]">
                      Orchard temperature should stay below 41 degrees.
                    </div>
                    <div className="rounded-md border border-[#dbddd3] bg-[#f8faf4] p-3 text-[#536054]">
                      Mira&apos;s sister is mentioned but unnamed in this scene.
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-[#d8e1d1] bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#48725b]">
                      LaTeX Studio
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">
                      Beautiful books from editable source
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667368]">
                      Build print-ready proofs with local LaTeX tools, clean
                      generated source, typography profiles, citations, indexes,
                      and full author control over the final files.
                    </p>
                  </div>
                  <button className="rounded-md bg-[#17201a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#284032]">
                    Build proof PDF
                  </button>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {latexFeatures.map((feature) => (
                      <div
                        className="rounded-md border border-[#dfe8da] bg-[#f9fcf7] px-3 py-2 text-sm font-medium text-[#3f5045]"
                        key={feature}
                      >
                        {feature}
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-[#dfe8da] bg-[#f4faf1] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-[#405145]">
                        Active profile
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#3f674b]">
                        Print
                      </span>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-[#526358]">
                      <p>Engine: XeLaTeX</p>
                      <p>Trim: 6 x 9 in</p>
                      <p>Template: Literary novel</p>
                      <p>Output: PDF + source folder</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-[#d8e1d1] bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Launch Assets</h3>
                    <p className="mt-1 text-sm text-[#667368]">
                      Marketing copy stays tied to the same story source of
                      truth as the manuscript.
                    </p>
                  </div>
                  <button className="rounded-md border border-[#cbd8c5] px-4 py-2 text-sm font-semibold transition hover:border-[#88a982]">
                    Build campaign
                  </button>
                </div>
                <div className="mt-4 overflow-hidden rounded-lg border border-[#dfe8da]">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-[#f4faf1] text-[#516458]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Asset</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Channel</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e4eadf]">
                      {launchAssets.map(([asset, status, channel]) => (
                        <tr key={asset}>
                          <td className="px-4 py-3 font-medium">{asset}</td>
                          <td className="px-4 py-3 text-[#607064]">{status}</td>
                          <td className="px-4 py-3 text-[#607064]">{channel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <aside className="space-y-5">
              <section className="rounded-lg border border-[#d8e1d1] bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold">Publishing Pipeline</h3>
                <div className="mt-5 space-y-4">
                  {pipeline.map((item) => (
                    <div className="flex gap-3" key={item.label}>
                      <div
                        className={`mt-1 h-3 w-3 rounded-full ${
                          item.done ? "bg-[#55a06d]" : "bg-[#c9d4c3]"
                        }`}
                      />
                      <div>
                        <p className="font-semibold">{item.label}</p>
                        <p className="mt-1 text-sm text-[#667368]">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-[#d8e1d1] bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold">LaTeX Toolchain</h3>
                <p className="mt-2 text-sm leading-6 text-[#667368]">
                  Booksmith should detect local open-source typesetting tools and
                  explain build errors without hiding the `.tex` source.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {latexTools.map((tool) => (
                    <span
                      className="rounded-full bg-[#eef7ea] px-2.5 py-1 text-xs font-semibold text-[#3f674b]"
                      key={tool}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-[#d8e1d1] bg-[#173322] p-5 text-white shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9cd4aa]">
                  AI command
                </p>
                <h3 className="mt-3 text-2xl font-semibold">
                  Build the book package from the manuscript, not from guesswork.
                </h3>
                <p className="mt-4 text-sm leading-6 text-[#cfe7d4]">
                  Booksmith can run against local open models to produce title
                  options, blurbs, metadata, ad angles, press copy, and launch
                  emails from the book&apos;s locked creative source.
                </p>
                <button className="mt-5 rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#173322] transition hover:bg-[#e8f5e2]">
                  Generate package
                </button>
              </section>

              <section className="rounded-lg border border-[#d8e1d1] bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold">Today&apos;s Focus</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <label className="flex items-center gap-3 rounded-md bg-[#f8fbf5] p-3">
                    <input className="h-4 w-4 accent-[#2f6b4a]" type="checkbox" defaultChecked />
                    Finish Chapter 14 tension pass
                  </label>
                  <label className="flex items-center gap-3 rounded-md bg-[#f8fbf5] p-3">
                    <input className="h-4 w-4 accent-[#2f6b4a]" type="checkbox" />
                    Approve cover direction brief
                  </label>
                  <label className="flex items-center gap-3 rounded-md bg-[#f8fbf5] p-3">
                    <input className="h-4 w-4 accent-[#2f6b4a]" type="checkbox" />
                    Export beta reader packet
                  </label>
                </div>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
