import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { longestStreak } from "@/lib/streak";

type Client = SupabaseClient<Database>;

function isoWeekKey(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  const day = (date.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(date);
  monday.setDate(date.getDate() - day);
  return monday.toISOString().slice(0, 10);
}

export async function evaluateBadges(supabase: Client, userId: string): Promise<Set<string>> {
  const earned = new Set<string>();

  const [{ data: sessions }, { data: goals }, { data: journalEntries }, { data: teamLogs }] = await Promise.all([
    supabase.from("workout_sessions").select("id, started_at").eq("user_id", userId),
    supabase.from("goals").select("completed_at, is_completed").eq("user_id", userId),
    supabase.from("journal_entries").select("entry_date").eq("user_id", userId),
    supabase.from("workout_logs").select("performed_at").eq("user_id", userId),
  ]);

  const sessionDates = (sessions ?? []).map((s) => s.started_at.slice(0, 10));
  const goalDates = (goals ?? [])
    .filter((g) => g.is_completed && g.completed_at)
    .map((g) => g.completed_at!.slice(0, 10));
  const journalDates = (journalEntries ?? []).map((j) => j.entry_date);
  const teamLogDates = (teamLogs ?? []).map((l) => l.performed_at.slice(0, 10));

  const allActivityDates = Array.from(new Set([...sessionDates, ...goalDates, ...journalDates, ...teamLogDates]));

  // First Session
  if (sessionDates.length > 0 || teamLogDates.length > 0) {
    earned.add("first-session");
  }

  // Consistency streaks
  const longest = longestStreak(allActivityDates);
  if (longest >= 7) earned.add("streak-7");
  if (longest >= 30) earned.add("streak-30");

  // Goal Getter
  const completedGoals = (goals ?? []).filter((g) => g.is_completed).length;
  if (completedGoals >= 5) earned.add("goal-getter");

  // Full Athlete: 2+ pillars active in the same ISO week
  const weightRoomWeeks = new Set(sessionDates.map(isoWeekKey));
  const teamWeeks = new Set(teamLogDates.map(isoWeekKey));
  const personalWeeks = new Set([...goalDates, ...journalDates].map(isoWeekKey));
  const allWeeks = new Set([...weightRoomWeeks, ...teamWeeks, ...personalWeeks]);
  for (const week of allWeeks) {
    const pillarsActive = [weightRoomWeeks.has(week), teamWeeks.has(week), personalWeeks.has(week)].filter(
      Boolean,
    ).length;
    if (pillarsActive >= 2) {
      earned.add("full-athlete");
      break;
    }
  }

  // Comeback: most recent activity came after a 7+ day gap, and happened recently
  const sortedDates = [...allActivityDates].sort();
  if (sortedDates.length >= 2) {
    const mostRecent = new Date(sortedDates[sortedDates.length - 1]);
    const previous = new Date(sortedDates[sortedDates.length - 2]);
    const gapDays = Math.round((mostRecent.getTime() - previous.getTime()) / 86_400_000);
    const daysSinceMostRecent = Math.round((Date.now() - mostRecent.getTime()) / 86_400_000);
    if (gapDays >= 7 && daysSinceMostRecent <= 3) {
      earned.add("comeback");
    }
  }

  // Recent PR: a confirmed set hit an exercise's all-time max weight within the last 7 days
  const { data: sessionExercises } = await supabase
    .from("session_exercises")
    .select("id, exercise_id, session_id")
    .in(
      "session_id",
      (sessions ?? []).map((s) => s.id),
    );

  if (sessionExercises && sessionExercises.length > 0) {
    const { data: sets } = await supabase
      .from("session_sets")
      .select("session_exercise_id, weight, created_at")
      .eq("is_confirmed", true)
      .in(
        "session_exercise_id",
        sessionExercises.map((se) => se.id),
      )
      .order("created_at", { ascending: true });

    const exerciseIdBySessionExerciseId = new Map(sessionExercises.map((se) => [se.id, se.exercise_id]));
    const bestByExercise = new Map<string, number>();
    const recentBestSets: { exerciseId: string; weight: number; createdAt: string }[] = [];

    for (const set of sets ?? []) {
      if (set.weight == null) continue;
      const exerciseId = exerciseIdBySessionExerciseId.get(set.session_exercise_id);
      if (!exerciseId) continue;
      const currentBest = bestByExercise.get(exerciseId) ?? 0;
      if (set.weight > currentBest) {
        bestByExercise.set(exerciseId, set.weight);
        recentBestSets.push({ exerciseId, weight: set.weight, createdAt: set.created_at });
      }
    }

    const sevenDaysAgo = Date.now() - 7 * 86_400_000;
    const hasRecentPr = recentBestSets.some(
      (entry) =>
        entry.weight === bestByExercise.get(entry.exerciseId) &&
        new Date(entry.createdAt).getTime() >= sevenDaysAgo,
    );
    if (hasRecentPr) earned.add("recent-pr");
  }

  return earned;
}
