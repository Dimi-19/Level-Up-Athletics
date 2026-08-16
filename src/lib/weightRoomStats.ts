import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, SetType } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;
type ScoredSet = { weight: number | null; reps: number | null; set_type: SetType };

export async function getConfirmedSetsByExercise(
  client: Client,
  exerciseIds?: string[],
): Promise<Map<string, ScoredSet[]>> {
  let sessionExerciseQuery = client.from("session_exercises").select("id, exercise_id");
  if (exerciseIds && exerciseIds.length > 0) {
    sessionExerciseQuery = sessionExerciseQuery.in("exercise_id", exerciseIds);
  }
  const { data: sessionExercises } = await sessionExerciseQuery;

  const result = new Map<string, ScoredSet[]>();
  if (!sessionExercises || sessionExercises.length === 0) return result;

  const exerciseIdBySessionExerciseId = new Map(sessionExercises.map((se) => [se.id, se.exercise_id]));
  const sessionExerciseIds = sessionExercises.map((se) => se.id);

  const { data: sets } = await client
    .from("session_sets")
    .select("session_exercise_id, weight, reps, set_type")
    .in("session_exercise_id", sessionExerciseIds)
    .eq("is_confirmed", true);

  for (const set of sets ?? []) {
    const exerciseId = exerciseIdBySessionExerciseId.get(set.session_exercise_id);
    if (!exerciseId) continue;
    const list = result.get(exerciseId) ?? [];
    list.push({ weight: set.weight, reps: set.reps, set_type: set.set_type });
    result.set(exerciseId, list);
  }

  return result;
}
