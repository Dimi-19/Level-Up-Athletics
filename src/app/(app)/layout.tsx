import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { signOut } from "./actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-bold text-white">
              Level Up <span className="text-emerald-400">Athletics</span>
            </Link>
            <nav className="hidden gap-4 text-sm text-zinc-400 sm:flex">
              <Link href="/dashboard" className="hover:text-white">
                Dashboard
              </Link>
              <Link href="/teams" className="hover:text-white">
                Teams
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-zinc-400 sm:inline">
              {profile?.full_name}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
        <nav className="flex gap-4 border-t border-zinc-900 px-4 py-2 text-sm text-zinc-400 sm:hidden">
          <Link href="/dashboard" className="hover:text-white">
            Dashboard
          </Link>
          <Link href="/teams" className="hover:text-white">
            Teams
          </Link>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
