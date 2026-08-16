import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { startFreeformSession, repeatLastWorkout } from "./session/actions";
import { computeVolumeScore, tierForScore, nextTier, MUSCLE_GROUP_TIERS, OVERALL_TIERS } from "@/lib/rank";
import { MUSCLE_GROUPS, slugForMuscleGroup } from "@/lib/muscleGroups";
import { getConfirmedSetsByExercise } from "@/lib/weightRoomStats";
import type { MuscleGroup } from "@/lib/supabase/types";

export default async function WeightRoomPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase, user } = await requireUser();
  const params = await searchParams;

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

  const setsByExercise = await getConfirmedSetsByExercise(supabase);
  const usedExerciseIds = Array.from(setsByExercise.keys());

  const { data: exercisesUsed } = usedExerciseIds.length
    ? await supabase.from("exercises").select("id, muscle_group").in("id", usedExerciseIds)
    : { data: [] };
  const muscleGroupByExerciseId = new Map((exercisesUsed ?? []).map((e) => [e.id, e.muscle_group]));

  const scoreByMuscleGroup = new Map<MuscleGroup, number>();
  let overallScore = 0;
  for (const [exerciseId, sets] of setsByExercise) {
    const muscleGroup = muscleGroupByExerciseId.get(exerciseId);
    if (!muscleGroup) continue;
    const score = computeVolumeScore(sets);
    scoreByMuscleGroup.set(muscleGroup, (scoreByMuscleGroup.get(muscleGroup) ?? 0) + score);
    overallScore += score;
  }

  const overallTier = tierForScore(overallScore, OVERALL_TIERS);
  const overallNext = nextTier(overallTier, OVERALL_TIERS);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Weight Room</h1>
        <p className="mt-1 text-sm text-zinc-400">Templates, live logging, and per-muscle-group rank.</p>
      </div>

      {params.error && (
        <p className="rounded-md border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-300">
          {params.error}
        </p>
      )}

      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
        <p className="text-sm text-zinc-400">Overall rank</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="h-4 w-4 rounded-full" style={{ backgroundColor: overallTier.color }} />
          <span className="text-2xl font-bold text-white">{overallTier.name}</span>
        </div>
        {overallNext && (
          <p className="mt-1 text-xs text-zinc-500">
            {Math.round(overallScore).toLocaleString()} / {overallNext.threshold.toLocaleString()} to{" "}
            {overallNext.name}
          </p>
        )}
      </section>

      <section>
        <h2 className="font-semibold text-white">Muscle groups</h2>
        <p className="mt-1 text-xs text-zinc-500">Tap one to see your rank for each exercise in that group.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MUSCLE_GROUPS.map((group) => {
            const score = scoreByMuscleGroup.get(group) ?? 0;
            const tier = tierForScore(score, MUSCLE_GROUP_TIERS);
            return (
              <Link
                key={group}
                href={`/weight-room/muscle/${slugForMuscleGroup(group)}`}
                className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-600"
              >
                <p className="text-sm text-zinc-400">{group}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tier.color }} />
                  <span className="font-semibold text-white">{tier.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

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
          {(templates ?? []).length === 0 && <p className="text-sm text-zinc-500">No templates yet.</p>}
        </ul>
      </section>
    </div>
  );
}
