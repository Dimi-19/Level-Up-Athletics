import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getMyTeams } from "@/lib/queries";
import { createTeam, joinTeam } from "../actions";

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase, user } = await requireUser();
  const teams = await getMyTeams(supabase, user.id);
  const params = await searchParams;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Teams</h1>
        <p className="mt-1 text-sm text-zinc-400">Manage the teams you belong to.</p>
      </div>

      {params.error && (
        <p className="rounded-md border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-300">
          {params.error}
        </p>
      )}

      {teams.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {teams.map((team) => (
            <li key={team.id}>
              <Link
                href={`/teams/${team.id}`}
                className="block rounded-lg border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-600"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{team.name}</span>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs uppercase text-zinc-400">
                    {team.role}
                  </span>
                </div>
                {team.sport && <p className="mt-1 text-sm text-zinc-400">{team.sport}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="font-semibold text-white">Create a team</h2>
          <p className="mt-1 text-sm text-zinc-400">
            You&apos;ll become the team&apos;s coach and get an invite code to share.
          </p>
          <form action={createTeam} className="mt-4 space-y-3">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-300">
                Team name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="sport" className="block text-sm font-medium text-zinc-300">
                Sport (optional)
              </label>
              <input
                id="sport"
                name="sport"
                type="text"
                className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-emerald-500 px-3 py-2 font-semibold text-black transition hover:bg-emerald-400"
            >
              Create team
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="font-semibold text-white">Join a team</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Ask your coach or captain for the team&apos;s invite code.
          </p>
          <form action={joinTeam} className="mt-4 space-y-3">
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-medium text-zinc-300">
                Invite code
              </label>
              <input
                id="inviteCode"
                name="inviteCode"
                type="text"
                required
                placeholder="ABC123"
                className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 uppercase text-white outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md border border-zinc-600 px-3 py-2 font-semibold text-white transition hover:border-zinc-400"
            >
              Join team
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
