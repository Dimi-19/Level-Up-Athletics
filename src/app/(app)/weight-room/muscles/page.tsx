import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { computeVolumeScore, tierForScore, nextTier, MUSCLE_GROUP_TIERS, OVERALL_TIERS } from "@/lib/rank";
import { MUSCLE_GROUPS, slugForMuscleGroup } from "@/lib/muscleGroups";
import { getConfirmedSetsByExercise } from "@/lib/weightRoomStats";
import type { MuscleGroup } from "@/lib/supabase/types";

export default async function MusclesPage() {
  const { supabase } = await requireUser();

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
    <div className="space-y-6">
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
        <p className="text-xs text-zinc-500">Tap a muscle group to see your rank for each exercise in it.</p>
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
    </div>
  );
}
