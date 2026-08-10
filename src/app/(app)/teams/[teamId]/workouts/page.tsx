import { requireUser } from "@/lib/auth";
import { createWorkout, logWorkout, deleteWorkoutLog } from "./actions";

export default async function WorkoutsPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const { supabase, user } = await requireUser();

  const [{ data: workouts }, { data: myLogs }] = await Promise.all([
    supabase
      .from("workouts")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false }),
    supabase
      .from("workout_logs")
      .select("*")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .order("performed_at", { ascending: false }),
  ]);

  const boundCreateWorkout = createWorkout.bind(null, teamId);
  const boundLogWorkout = logWorkout.bind(null, teamId);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="font-semibold text-white">Team workouts</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Plans and drills shared with the whole team.
          </p>

          <form action={boundCreateWorkout} className="mt-4 space-y-3">
            <input
              name="title"
              required
              placeholder="Workout title"
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
            <textarea
              name="description"
              placeholder="Description (sets, reps, drills...)"
              rows={3}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
            >
              Add workout
            </button>
          </form>

          <ul className="mt-5 space-y-3">
            {(workouts ?? []).map((workout) => (
              <li key={workout.id} className="rounded-md border border-zinc-800 p-3">
                <p className="font-medium text-white">{workout.title}</p>
                {workout.description && (
                  <p className="mt-1 whitespace-pre-line text-sm text-zinc-400">
                    {workout.description}
                  </p>
                )}
              </li>
            ))}
            {(workouts ?? []).length === 0 && (
              <p className="text-sm text-zinc-500">No team workouts yet.</p>
            )}
          </ul>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="font-semibold text-white">Log a workout</h2>
          <p className="mt-1 text-sm text-zinc-400">Track what you did and when.</p>

          <form action={boundLogWorkout} className="mt-4 space-y-3">
            {(workouts ?? []).length > 0 && (
              <select
                name="workoutId"
                defaultValue=""
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              >
                <option value="">Not based on a team workout</option>
                {(workouts ?? []).map((workout) => (
                  <option key={workout.id} value={workout.id}>
                    {workout.title}
                  </option>
                ))}
              </select>
            )}
            <input
              name="title"
              required
              placeholder="What did you do?"
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="datetime-local"
                name="performedAt"
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                name="duration"
                min={0}
                placeholder="Minutes"
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
              />
            </div>
            <textarea
              name="notes"
              placeholder="Notes (how it felt, weights used...)"
              rows={2}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="rounded-md border border-zinc-600 px-4 py-2 text-sm font-semibold text-white hover:border-zinc-400"
            >
              Log workout
            </button>
          </form>
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-white">Your training log</h2>
        <ul className="mt-3 space-y-2">
          {(myLogs ?? []).map((log) => (
            <li
              key={log.id}
              className="flex items-center justify-between gap-3 rounded-md border border-zinc-800 px-4 py-3"
            >
              <div>
                <p className="font-medium text-white">{log.title}</p>
                <p className="text-sm text-zinc-400">
                  {new Date(log.performed_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {log.duration_minutes ? ` · ${log.duration_minutes} min` : ""}
                </p>
                {log.notes && <p className="mt-1 text-sm text-zinc-500">{log.notes}</p>}
              </div>
              <form
                action={async () => {
                  "use server";
                  await deleteWorkoutLog(teamId, log.id);
                }}
              >
                <button
                  type="submit"
                  className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:border-red-700 hover:text-red-400"
                >
                  Delete
                </button>
              </form>
            </li>
          ))}
          {(myLogs ?? []).length === 0 && (
            <p className="text-sm text-zinc-500">No workouts logged for this team yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
