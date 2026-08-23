import Link from "next/link";

const navItems = [
  { href: "/studio", label: "Studio" },
  { href: "/studio/drafts", label: "Drafts" },
  { href: "/studio/library", label: "Library" },
  { href: "/studio/production", label: "Production" },
  { href: "/studio/figures", label: "Figures" },
  { href: "/studio/models", label: "Models" },
  { href: "/studio/runtime", label: "Runtime" },
  { href: "/studio/system", label: "System" },
];

export default function StudioLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-[#06110b] text-[#eef7ea]">
      <header className="sticky top-0 z-50 border-b border-[#20382a] bg-[#06110b]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1700px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link className="group flex min-w-0 items-center gap-3" href="/studio">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#6d5a37] bg-[#1c190f] font-serif text-lg font-black text-[#deb970]">B</span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-black uppercase tracking-[0.24em] text-[#d4a85f]">Booksmith AI</span>
              <span className="block truncate text-[10px] font-semibold tracking-[0.05em] text-[#718978]">Author-first manuscript studio</span>
            </span>
          </Link>

          <nav aria-label="Booksmith Studio" className="hidden items-center gap-1 rounded-xl border border-[#20382a] bg-[#09170f] p-1 xl:flex">
            {navItems.map((item) => (
              <Link className="rounded-lg px-3 py-2 text-xs font-bold text-[#91a997] transition hover:bg-[#13271a] hover:text-white" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link className="rounded-xl border border-[#314d39] px-3 py-2 text-xs font-bold text-[#b8cbbd] transition hover:bg-[#102219] hover:text-white" href="/">
              Portal
            </Link>
          </div>
        </div>
        <nav aria-label="Booksmith Studio mobile" className="flex gap-1 overflow-x-auto border-t border-[#172a1f] px-4 py-2 xl:hidden">
          {navItems.map((item) => (
            <Link className="whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold text-[#91a997] transition hover:bg-[#13271a] hover:text-white" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
