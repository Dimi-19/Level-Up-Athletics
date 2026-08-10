import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getMyTeams } from "@/lib/queries";

function formatEventTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function DashboardPage() {
  const { supabase, user, profile } = await requireUser();
  const teams = await getMyTeams(supabase, user.id);
  const teamIds = teams.map((t) => t.id);
  const teamNameById = new Map(teams.map((t) => [t.id, t.name]));

  const [{ data: events }, { data: logs }] = await Promise.all([
    teamIds.length
      ? supabase
          .from("events")
          .select("*")
          .in("team_id", teamIds)
          .gte("starts_at", new Date().toISOString())
          .order("starts_at", { ascending: true })
          .limit(5)
      : Promise.resolve({ data: [] }),
    supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("performed_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome, {profile?.full_name}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Here&apos;s what&apos;s happening across your teams.
        </p>
      </div>

      {teams.length === 0 && (
        <div className="rounded-lg border border-dashed border-zinc-700 p-6 text-center">
          <p className="text-zinc-300">You&apos;re not on a team yet.</p>
          <Link
            href="/teams"
            className="mt-3 inline-block rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
          >
            Create or join a team
          </Link>
        </div>
      )}

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="font-semibold text-white">Upcoming events</h2>
          {events && events.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {events.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/teams/${event.team_id}/schedule`}
                    className="block rounded-md border border-zinc-800 p-3 hover:border-zinc-600"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">{event.title}</span>
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs uppercase text-zinc-400">
                        {event.type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">
                      {formatEventTime(event.starts_at)} · {teamNameById.get(event.team_id)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">No upcoming events scheduled.</p>
          )}
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="font-semibold text-white">Recent workouts</h2>
          {logs && logs.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {logs.map((log) => (
                <li key={log.id} className="rounded-md border border-zinc-800 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{log.title}</span>
                    {log.duration_minutes && (
                      <span className="text-xs text-zinc-400">{log.duration_minutes} min</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">
                    {new Date(log.performed_at).toLocaleDateString()} ·{" "}
                    {teamNameById.get(log.team_id)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">No workouts logged yet.</p>
          )}
        </div>
      </section>

      {teams.length > 0 && (
        <section>
          <h2 className="font-semibold text-white">Your teams</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
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
        </section>
      )}
    </div>
  );
}
