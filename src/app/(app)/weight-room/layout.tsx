import Link from "next/link";

const TABS = [
  { href: "/weight-room", label: "Overview" },
  { href: "/weight-room/muscles", label: "Muscles" },
  { href: "/weight-room/progress", label: "Progress" },
];

export default function WeightRoomLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Weight Room</h1>
        <p className="mt-1 text-sm text-zinc-400">Templates, live logging, muscle rank, and body tracking.</p>
      </div>
      <nav className="flex gap-4 border-b border-zinc-800 text-sm">
        {TABS.map((tab) => (
          <Link key={tab.href} href={tab.href} className="px-1 pb-3 text-zinc-300 hover:text-white">
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
