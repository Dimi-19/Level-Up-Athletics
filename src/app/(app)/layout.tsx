import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { signOut } from "./actions";
import { Sidebar } from "./Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden items-center justify-end gap-3 border-b border-zinc-800 bg-zinc-950 px-6 py-3 sm:flex">
          <span className="text-sm text-zinc-400">{profile?.full_name}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              Log out
            </button>
          </form>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
