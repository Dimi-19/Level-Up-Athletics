import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";

export default async function TeamLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const { supabase } = await requireUser();

  const { data: team } = await supabase.from("teams").select("*").eq("id", teamId).single();
  if (!team) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/teams" className="text-sm text-zinc-400 hover:text-white">
          ← All teams
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-white">{team.name}</h1>
          <span className="rounded-md border border-zinc-700 px-3 py-1 text-sm text-zinc-300">
            Invite code: <span className="font-mono font-semibold text-emerald-400">{team.invite_code}</span>
          </span>
        </div>
        {team.sport && <p className="mt-1 text-sm text-zinc-400">{team.sport}</p>}
      </div>

      <nav className="flex gap-4 border-b border-zinc-800 text-sm">
        <Link href={`/teams/${teamId}`} className="px-1 pb-3 text-zinc-300 hover:text-white">
          Roster
        </Link>
        <Link
          href={`/teams/${teamId}/schedule`}
          className="px-1 pb-3 text-zinc-300 hover:text-white"
        >
          Schedule
        </Link>
        <Link
          href={`/teams/${teamId}/workouts`}
          className="px-1 pb-3 text-zinc-300 hover:text-white"
        >
          Workouts
        </Link>
      </nav>

      {children}
    </div>
  );
}
