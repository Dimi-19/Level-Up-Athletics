import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { muscleGroupForSlug } from "@/lib/muscleGroups";
import { computeVolumeScore, tierForScore, EXERCISE_TIERS } from "@/lib/rank";
import { getConfirmedSetsByExercise } from "@/lib/weightRoomStats";

export default async function MuscleGroupPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const muscleGroup = muscleGroupForSlug(slug);
  if (!muscleGroup) notFound();

  const { supabase } = await requireUser();

  const { data: exercises } = await supabase
    .from("exercises")
    .select("*")
    .eq("muscle_group", muscleGroup)
    .order("name");

  const exerciseIds = (exercises ?? []).map((e) => e.id);
  const setsByExercise = await getConfirmedSetsByExercise(supabase, exerciseIds);

  const ranked = (exercises ?? []).map((exercise) => {
    const sets = setsByExercise.get(exercise.id) ?? [];
    const score = computeVolumeScore(sets);
    const tier = tierForScore(score, EXERCISE_TIERS);
    return { exercise, score, tier, hasLogged: sets.length > 0 };
  });

  ranked.sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/weight-room" className="text-sm text-zinc-400 hover:text-white">
          ← Weight Room
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white">{muscleGroup}</h1>
        <p className="mt-1 text-sm text-zinc-400">Your rank for every {muscleGroup} exercise in the library.</p>
      </div>

      <ul className="space-y-1.5">
        {ranked.map(({ exercise, tier, hasLogged }) => (
          <li
            key={exercise.id}
            className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-3"
          >
            <div>
              <p className="text-sm text-zinc-200">{exercise.name}</p>
              <p className="text-xs text-zinc-500">{exercise.equipment}</p>
            </div>
            {hasLogged ? (
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tier.color }} />
                <span className="text-sm font-medium text-white">{tier.name}</span>
              </div>
            ) : (
              <span className="text-xs text-zinc-600">Not logged yet</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
