import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { ActiveSession, type ExerciseWithSets } from "./ActiveSession";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const { supabase } = await requireUser();

  const { data: session } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();
  if (!session) notFound();

  const [{ data: sessionExercises }, { data: allExercises }] = await Promise.all([
    supabase
      .from("session_exercises")
      .select("*")
      .eq("session_id", sessionId)
      .order("position", { ascending: true }),
    supabase.from("exercises").select("*").order("name"),
  ]);

  const exercises = sessionExercises ?? [];
  const exerciseById = new Map((allExercises ?? []).map((e) => [e.id, e]));

  const { data: allSets } = exercises.length
    ? await supabase
        .from("session_sets")
        .select("*")
        .in(
          "session_exercise_id",
          exercises.map((se) => se.id),
        )
        .order("set_number", { ascending: true })
    : { data: [] };

  const setsBySessionExercise = new Map<string, typeof allSets>();
  for (const set of allSets ?? []) {
    const list = setsBySessionExercise.get(set.session_exercise_id) ?? [];
    list.push(set);
    setsBySessionExercise.set(set.session_exercise_id, list);
  }

  // "Previous": the last confirmed set logged for this exercise in a different, earlier session.
  const exerciseIds = Array.from(new Set(exercises.map((se) => se.exercise_id)));
  const previousByExercise = new Map<string, { weight: number | null; reps: number | null }>();

  if (exerciseIds.length > 0) {
    const { data: otherSessionExercises } = await supabase
      .from("session_exercises")
      .select("id, session_id, exercise_id")
      .in("exercise_id", exerciseIds)
      .neq("session_id", sessionId);

    if (otherSessionExercises && otherSessionExercises.length > 0) {
      const otherSessionIds = Array.from(new Set(otherSessionExercises.map((se) => se.session_id)));
      const { data: otherSessions } = await supabase
        .from("workout_sessions")
        .select("id, started_at")
        .in("id", otherSessionIds);

      const startedAtBySessionId = new Map((otherSessions ?? []).map((s) => [s.id, s.started_at]));

      const mostRecentPerExercise = new Map<string, { sessionExerciseId: string; startedAt: string }>();
      for (const se of otherSessionExercises) {
        const startedAt = startedAtBySessionId.get(se.session_id);
        if (!startedAt) continue;
        const current = mostRecentPerExercise.get(se.exercise_id);
        if (!current || startedAt > current.startedAt) {
          mostRecentPerExercise.set(se.exercise_id, { sessionExerciseId: se.id, startedAt });
        }
      }

      const targetSessionExerciseIds = Array.from(mostRecentPerExercise.values()).map((v) => v.sessionExerciseId);
      if (targetSessionExerciseIds.length > 0) {
        const { data: previousSets } = await supabase
          .from("session_sets")
          .select("session_exercise_id, weight, reps, set_number")
          .in("session_exercise_id", targetSessionExerciseIds)
          .eq("is_confirmed", true)
          .order("set_number", { ascending: false });

        const bySessionExerciseId = new Map<string, { weight: number | null; reps: number | null }>();
        for (const set of previousSets ?? []) {
          if (!bySessionExerciseId.has(set.session_exercise_id)) {
            bySessionExerciseId.set(set.session_exercise_id, { weight: set.weight, reps: set.reps });
          }
        }

        for (const [exerciseId, { sessionExerciseId }] of mostRecentPerExercise) {
          const previous = bySessionExerciseId.get(sessionExerciseId);
          if (previous) previousByExercise.set(exerciseId, previous);
        }
      }
    }
  }

  const exercisesWithSets: ExerciseWithSets[] = exercises.map((se) => ({
    sessionExerciseId: se.id,
    exerciseId: se.exercise_id,
    name: exerciseById.get(se.exercise_id)?.name ?? "Unknown exercise",
    supersetGroup: se.superset_group,
    previous: previousByExercise.get(se.exercise_id) ?? null,
    sets: (setsBySessionExercise.get(se.id) ?? []).map((s) => ({
      id: s.id,
      setNumber: s.set_number,
      weight: s.weight,
      reps: s.reps,
      setType: s.set_type,
      isConfirmed: s.is_confirmed,
    })),
  }));

  return (
    <ActiveSession
      sessionId={sessionId}
      startedAt={session.started_at}
      initialExercises={exercisesWithSets}
      allExercises={allExercises ?? []}
    />
  );
}
