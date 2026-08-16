import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { startFreeformSession, repeatLastWorkout } from "./session/actions";
import { computeVolumeScore, tierForScore, nextTier } from "@/lib/rank";
import { MUSCLE_GROUPS } from "@/lib/muscleGroups";
import type { MuscleGroup, SetType } from "@/lib/supabase/types";

export default async function WeightRoomPage() {
  const { supabase, user } = await requireUser();

  const [{ data: templates }, { data: hasCompletedSession }] = await Promise.all([
    supabase
      .from("workout_templates")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("workout_sessions")
      .select("id")
      .eq("user_id", user.id)
      .not("ended_at", "is", null)
      .limit(1)
      .maybeSingle(),
  ]);

  const { data: mySessionExercises } = await supabase.from("session_exercises").select("id, exercise_id");
  const sessionExerciseIds = (mySessionExercises ?? []).map((se) => se.id);

  const { data: confirmedSets } = sessionExerciseIds.length
    ? await supabase
        .from("session_sets")
        .select("session_exercise_id, weight, reps, set_type")
        .in("session_exercise_id", sessionExerciseIds)
        .eq("is_confirmed", true)
    : { data: [] };

  const exerciseIdBySessionExerciseId = new Map(
    (mySessionExercises ?? []).map((se) => [se.id, se.exercise_id]),
  );
  const usedExerciseIds = Array.from(new Set((mySessionExercises ?? []).map((se) => se.exercise_id)));

  const { data: exercisesUsed } = usedExerciseIds.length
    ? await supabase.from("exercises").select("id, muscle_group").in("id", usedExerciseIds)
    : { data: [] };
  const muscleGroupByExerciseId = new Map((exercisesUsed ?? []).map((e) => [e.id, e.muscle_group]));

  const setsByMuscleGroup = new Map<MuscleGroup, { weight: number | null; reps: number | null; set_type: SetType }[]>();
  for (const set of confirmedSets ?? []) {
    const exerciseId = exerciseIdBySessionExerciseId.get(set.session_exercise_id);
    const muscleGroup = exerciseId ? muscleGroupByExerciseId.get(exerciseId) : undefined;
    if (!muscleGroup) continue;
    const list = setsByMuscleGroup.get(muscleGroup) ?? [];
    list.push(set);
    setsByMuscleGroup.set(muscleGroup, list);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Weight Room</h1>
        <p className="mt-1 text-sm text-zinc-400">Templates, live logging, and per-muscle-group rank.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <form action={startFreeformSession}>
          <button
            type="submit"
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
          >
            Start freeform session
          </button>
        </form>
        {hasCompletedSession && (
          <form action={repeatLastWorkout}>
            <button
              type="submit"
              className="rounded-md border border-zinc-600 px-4 py-2 text-sm font-semibold text-white hover:border-zinc-400"
            >
              Repeat last workout
            </button>
          </form>
        )}
        <Link
          href="/weight-room/templates/new"
          className="rounded-md border border-zinc-600 px-4 py-2 text-sm font-semibold text-white hover:border-zinc-400"
        >
          New template
        </Link>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Templates</h2>
          <Link href="/weight-room/templates" className="text-sm text-emerald-400 hover:text-emerald-300">
            View all
          </Link>
        </div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {(templates ?? []).slice(0, 6).map((template) => (
            <li key={template.id}>
              <Link
                href={`/weight-room/templates/${template.id}`}
                className="block rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-200 hover:border-zinc-600"
              >
                {template.name}
              </Link>
            </li>
          ))}
          {(templates ?? []).length === 0 && (
            <p className="text-sm text-zinc-500">No templates yet.</p>
          )}
        </ul>
      </section>

      <section>
        <h2 className="font-semibold text-white">Rank</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Based on total confirmed training volume (weight × reps) per muscle group. A first-pass heuristic —
          thresholds will be tuned over time.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MUSCLE_GROUPS.map((group) => {
            const score = computeVolumeScore(setsByMuscleGroup.get(group) ?? []);
            const tier = tierForScore(score);
            const next = nextTier(tier);
            return (
              <div key={group} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm text-zinc-400">{group}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: tier.color }}
                  />
                  <span className="font-semibold text-white">{tier.name}</span>
                </div>
                {next && (
                  <p className="mt-1 text-xs text-zinc-500">
                    {Math.round(score).toLocaleString()} / {next.threshold.toLocaleString()} to {next.name}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
