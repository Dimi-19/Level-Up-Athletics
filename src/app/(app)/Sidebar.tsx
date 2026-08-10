"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_ITEMS } from "@/lib/nav";
import { signOut } from "./actions";

function NavLink({
  href,
  label,
  active,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`rounded-md px-3 py-2 text-sm transition ${
        active
          ? "bg-emerald-500/10 font-medium text-emerald-400"
          : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <>
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-3 sm:hidden">
        <Link href="/home" className="font-bold text-white">
          Level Up <span className="text-emerald-400">Athletics</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300"
        >
          Menu
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-b border-zinc-800 bg-zinc-950 px-2 py-2 sm:hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={isActive(item.href)}
              onClick={() => setOpen(false)}
            />
          ))}
          <form action={signOut} className="px-3 pt-2">
            <button type="submit" className="text-sm text-zinc-400 hover:text-white">
              Log out
            </button>
          </form>
        </nav>
      )}

      <aside className="hidden w-56 shrink-0 border-r border-zinc-800 bg-zinc-950 sm:flex sm:flex-col">
        <div className="px-4 py-4">
          <Link href="/home" className="font-bold text-white">
            Level Up <span className="text-emerald-400">Athletics</span>
          </Link>
        </div>
        <nav className="flex flex-col gap-1 px-2">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} active={isActive(item.href)} />
          ))}
        </nav>
      </aside>
    </>
  );
}
