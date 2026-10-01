import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, PassportSnapshot } from "@/lib/supabase/types";
import { computeVolumeScore, tierForScore, OVERALL_TIERS } from "@/lib/rank";
import { tierForLogCount } from "@/lib/trainingRank";
import { getConfirmedSetsByExercise } from "@/lib/weightRoomStats";
import { BADGES } from "@/lib/badges";
import { evaluateBadges } from "@/lib/badgeEngine";
import { longestStreak } from "@/lib/streak";

type Client = SupabaseClient<Database>;

const STANDARD_DISTANCES_KM = [
  { label: "1 mi", km: 1.60934, tolerancePct: 0.03 },
  { label: "5K", km: 5, tolerancePct: 0.05 },
  { label: "10K", km: 10, tolerancePct: 0.05 },
  { label: "Half Marathon", km: 21.0975, tolerancePct: 0.03 },
  { label: "Marathon", km: 42.195, tolerancePct: 0.02 },
];

export async function buildPassportSnapshot(supabase: Client, userId: string): Promise<PassportSnapshot> {
  const [
    { data: profile },
    setsByExercise,
    { data: runs },
    { data: skills },
    { data: skillLogs },
    { data: sessions },
    earnedBadgeIds,
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, sport, position").eq("id", userId).single(),
    getConfirmedSetsByExercise(supabase),
    supabase.from("runs").select("*").eq("user_id", userId),
    supabase.from("skills").select("*"),
    supabase.from("skill_logs").select("skill_id, logged_date").eq("user_id", userId),
    supabase.from("workout_sessions").select("started_at").eq("user_id", userId),
    evaluateBadges(supabase, userId),
  ]);

  let overallScore = 0;
  const bestWeightByExercise = new Map<string, { weight: number; reps: number }>();
  const exerciseIds = Array.from(setsByExercise.keys());
  const { data: exercises } = exerciseIds.length
    ? await supabase.from("exercises").select("id, name").in("id", exerciseIds)
    : { data: [] };
  const exerciseNameById = new Map((exercises ?? []).map((e) => [e.id, e.name]));

  for (const [exerciseId, sets] of setsByExercise) {
    overallScore += computeVolumeScore(sets);
    for (const set of sets) {
      if (set.weight == null || set.reps == null || set.set_type === "warmup") continue;
      const current = bestWeightByExercise.get(exerciseId);
      if (!current || set.weight > current.weight) {
        bestWeightByExercise.set(exerciseId, { weight: set.weight, reps: set.reps });
      }
    }
  }

  const overallTier = tierForScore(overallScore, OVERALL_TIERS);

  const topLifts = Array.from(bestWeightByExercise.entries())
    .map(([exerciseId, best]) => ({
      exerciseName: exerciseNameById.get(exerciseId) ?? "Unknown exercise",
      weightKg: best.weight,
      reps: best.reps,
    }))
    .sort((a, b) => b.weightKg - a.weightKg)
    .slice(0, 5);

  const runningPrs = STANDARD_DISTANCES_KM.map((std) => {
    const matches = (runs ?? []).filter((r) => Math.abs(r.distance_km - std.km) / std.km <= std.tolerancePct);
    if (matches.length === 0) return null;
    const best = matches.reduce((fastest, r) =>
      r.duration_seconds / r.distance_km < fastest.duration_seconds / fastest.distance_km ? r : fastest,
    );
    return { label: std.label, durationSeconds: best.duration_seconds };
  }).filter((pr): pr is NonNullable<typeof pr> => pr !== null);

  const skillById = new Map((skills ?? []).map((s) => [s.id, s]));
  const logCountBySkill = new Map<string, number>();
  for (const log of skillLogs ?? []) {
    logCountBySkill.set(log.skill_id, (logCountBySkill.get(log.skill_id) ?? 0) + 1);
  }
  const skillRanks = Array.from(logCountBySkill.entries())
    .map(([skillId, count]) => {
      const skill = skillById.get(skillId);
      if (!skill) return null;
      const tier = tierForLogCount(count);
      return { sport: skill.sport, name: skill.name, tierName: tier.name, tierColor: tier.color, count };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const badges = BADGES.filter((b) => earnedBadgeIds.has(b.id)).map((b) => ({ name: b.name, category: b.category }));

  const activityDates = [
    ...(skillLogs ?? []).map((l) => l.logged_date),
    ...(runs ?? []).map((r) => r.run_date),
    ...(sessions ?? []).map((s) => s.started_at.slice(0, 10)),
  ];

  return {
    fullName: profile?.full_name ?? "Athlete",
    sport: profile?.sport ?? null,
    position: profile?.position ?? null,
    generatedAt: new Date().toISOString(),
    weightRoom: overallScore > 0 ? { tierName: overallTier.name, tierColor: overallTier.color } : null,
    topLifts,
    runningPrs,
    skillRanks,
    badges,
    longestStreakDays: longestStreak(activityDates),
  };
}

export function generateSlug(): string {
  return Array.from({ length: 10 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join(
    "",
  );
}
