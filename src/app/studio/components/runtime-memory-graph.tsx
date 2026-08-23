"use client";

import { useMemo, useState } from "react";

import { runtimeGraph, runtimeHealth } from "@/lib/runtime/runtime-client";

type BookOption = { slug: string; title: string };
type GraphData = Awaited<ReturnType<typeof runtimeGraph>>;

export function RuntimeMemoryGraph({ books }: { books: BookOption[] }) {
  const [bookSlug, setBookSlug] = useState(books[0]?.slug ?? "");
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [state, setState] = useState("Connect the Runtime and load a book graph.");

  async function load() {
    try {
      await runtimeHealth();
      setState("Loading semantic relationships…");
      const value = await runtimeGraph(bookSlug || undefined);
      setGraph(value);
      setState(`${value.entities.length} entities · ${value.edges.length} relationships.`);
    } catch (error) {
      setGraph(null);
      setState(error instanceof Error ? error.message : String(error));
    }
  }

  const visible = useMemo(() => {
    if (!graph) return { nodes: [] as GraphData["entities"], edges: [] as GraphData["edges"] };
    const center = `book:${bookSlug}`;
    const directlyConnected = new Set<string>([center]);
    for (const edge of graph.edges) {
      if (edge.source === center) directlyConnected.add(edge.target);
      if (edge.target === center) directlyConnected.add(edge.source);
    }
    const nodes = graph.entities.filter((entity) => directlyConnected.has(entity.id)).slice(0, 36);
    const ids = new Set(nodes.map((node) => node.id));
    return { nodes, edges: graph.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target)).slice(0, 80) };
  }, [bookSlug, graph]);

  const width = 900;
  const height = 520;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 205;
  const positions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    const center = `book:${bookSlug}`;
    map.set(center, { x: centerX, y: centerY });
    const others = visible.nodes.filter((node) => node.id !== center);
    others.forEach((node, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(others.length, 1) - Math.PI / 2;
      const ring = radius + (index % 2) * 55;
      map.set(node.id, { x: centerX + Math.cos(angle) * ring, y: centerY + Math.sin(angle) * ring });
    });
    return map;
  }, [bookSlug, visible.nodes]);

  return (
    <section className="rounded-3xl border border-[#294735] bg-[#0b1a11] p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4a85f]">Book Memory Graph</p><h2 className="mt-2 text-2xl font-black">See the relationships behind retrieval.</h2><p className="mt-2 max-w-3xl text-xs leading-6 text-[#91a997]">This graph is projected from the disposable SQLite index: book ↔ documents ↔ concepts ↔ references ↔ thinkers. It is never a second source of truth.</p></div>
        <div className="flex gap-2"><select className="rounded-xl border border-[#314d39] bg-[#07120c] px-3 py-2 text-xs" onChange={(event) => setBookSlug(event.target.value)} value={bookSlug}>{books.map((book) => <option key={book.slug} value={book.slug}>{book.title}</option>)}</select><button className="rounded-xl bg-[#d4a85f] px-4 py-2 text-xs font-black text-[#172015]" onClick={() => void load()} type="button">Load graph</button></div>
      </div>
      <p className="mt-3 text-[10px] text-[#718978]">{state}</p>

      {visible.nodes.length ? <div className="mt-5 overflow-x-auto rounded-2xl border border-[#213b2b] bg-[#07120c] p-2"><svg aria-label={`Semantic memory graph for ${bookSlug}`} className="min-w-[760px]" role="img" viewBox={`0 0 ${width} ${height}`}>
        {visible.edges.map((edge, index) => {
          const from = positions.get(edge.source);
          const to = positions.get(edge.target);
          if (!from || !to) return null;
          return <g key={`${edge.source}-${edge.target}-${edge.relation}-${index}`}><line stroke="#496250" strokeOpacity="0.65" strokeWidth="1.4" x1={from.x} x2={to.x} y1={from.y} y2={to.y} /><text fill="#789080" fontSize="8" textAnchor="middle" x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 4}>{edge.relation}</text></g>;
        })}
        {visible.nodes.map((node) => {
          const point = positions.get(node.id);
          if (!point) return null;
          const center = node.id === `book:${bookSlug}`;
          return <g key={node.id} transform={`translate(${point.x} ${point.y})`}><circle fill={center ? "#d4a85f" : node.kind === "concept" ? "#2d2034" : node.kind === "reference" ? "#302716" : "#173522"} r={center ? 42 : 28} stroke={center ? "#f1dfb7" : "#55715c"} strokeWidth={center ? 3 : 1.5} /><text fill={center ? "#172015" : "#eef7ea"} fontSize={center ? 10 : 8} fontWeight="700" textAnchor="middle"><tspan x="0" y="-2">{node.label.slice(0, 22)}</tspan>{node.label.length > 22 ? <tspan x="0" y="9">{node.label.slice(22, 42)}</tspan> : null}</text><title>{node.kind}: {node.label}{node.domain ? ` · ${node.domain}` : ""}</title></g>;
        })}
      </svg></div> : <div className="mt-5 rounded-2xl border border-dashed border-[#294735] bg-[#07120c] p-10 text-center text-sm text-[#718978]">Load a Runtime-backed graph to see the current book’s semantic neighborhood.</div>}
    </section>
  );
}
