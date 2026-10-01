import { requireUser } from "@/lib/auth";
import { computeVolumeScore, tierForScore, OVERALL_TIERS } from "@/lib/rank";
import { getConfirmedSetsByExercise } from "@/lib/weightRoomStats";
import { BADGES } from "@/lib/badges";
import { evaluateBadges } from "@/lib/badgeEngine";
import { currentStreak, longestStreak } from "@/lib/streak";
import { kmToMi } from "@/lib/units";

export default async function StatsPage() {
  const { supabase, user, profile } = await requireUser();

  const [
    setsByExercise,
    { data: sessions },
    { data: runs },
    { data: skillLogs },
    { data: filmSessions },
    { data: filmClips },
    { data: mealLogs },
    { data: goals },
    { data: journalEntries },
    { data: teamLogs },
    earnedBadgeIds,
  ] = await Promise.all([
    getConfirmedSetsByExercise(supabase),
    supabase.from("workout_sessions").select("id, started_at").eq("user_id", user.id),
    supabase.from("runs").select("run_date, distance_km").eq("user_id", user.id),
    supabase.from("skill_logs").select("logged_date, skill_id").eq("user_id", user.id),
    supabase.from("film_sessions").select("id").eq("user_id", user.id),
    supabase.from("film_clips").select("id").eq("user_id", user.id),
    supabase.from("meal_logs").select("logged_date").eq("user_id", user.id),
    supabase.from("goals").select("is_completed").eq("user_id", user.id),
    supabase.from("journal_entries").select("entry_date").eq("user_id", user.id),
    supabase.from("workout_logs").select("performed_at").eq("user_id", user.id),
    evaluateBadges(supabase, user.id),
  ]);

  let overallScore = 0;
  for (const sets of setsByExercise.values()) {
    overallScore += computeVolumeScore(sets);
  }
  const overallTier = tierForScore(overallScore, OVERALL_TIERS);

  const sessionDates = (sessions ?? []).map((s) => s.started_at.slice(0, 10));
  const runDates = (runs ?? []).map((r) => r.run_date);
  const skillDates = (skillLogs ?? []).map((l) => l.logged_date);
  const mealDates = (mealLogs ?? []).map((m) => m.logged_date);
  const journalDates = (journalEntries ?? []).map((j) => j.entry_date);
  const teamDates = (teamLogs ?? []).map((l) => l.performed_at.slice(0, 10));

  const allActivityDates = Array.from(
    new Set([...sessionDates, ...runDates, ...skillDates, ...mealDates, ...journalDates, ...teamDates]),
  );

  const unit = profile?.units_distance === "mi" ? "mi" : "km";
  const totalDistanceKm = (runs ?? []).reduce((sum, r) => sum + r.distance_km, 0);
  const totalDistance = unit === "mi" ? kmToMi(totalDistanceKm) : totalDistanceKm;

  const distinctSkills = new Set((skillLogs ?? []).map((l) => l.skill_id)).size;
  const completedGoals = (goals ?? []).filter((g) => g.is_completed).length;
  const daysActive = allActivityDates.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Stats</h1>
        <p className="mt-1 text-sm text-zinc-400">Every number the app tracks about you, rolled up in one place.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Days active" value={daysActive} />
        <StatCard label="Current streak" value={`${currentStreak(allActivityDates)} days`} />
        <StatCard label="Longest streak" value={`${longestStreak(allActivityDates)} days`} />
        <StatCard label="Goals hit" value={completedGoals} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PillarCard title="Weight Room">
          <Stat label="Overall rank">
            <span style={{ color: overallTier.color }}>{overallTier.name}</span>
          </Stat>
          <Stat label="Sessions logged" value={(sessions ?? []).length} />
        </PillarCard>

        <PillarCard title="Running">
          <Stat label="Runs logged" value={(runs ?? []).length} />
          <Stat label="Total distance" value={`${Math.round(totalDistance)} ${unit}`} />
        </PillarCard>

        <PillarCard title="Training">
          <Stat label="Sessions logged" value={(skillLogs ?? []).length} />
          <Stat label="Distinct skills" value={distinctSkills} />
        </PillarCard>

        <PillarCard title="Nutrition">
          <Stat label="Days logged" value={new Set(mealDates).size} />
        </PillarCard>

        <PillarCard title="Film Study">
          <Stat label="Sessions" value={(filmSessions ?? []).length} />
          <Stat label="Clips tagged" value={(filmClips ?? []).length} />
        </PillarCard>

        <PillarCard title="Badges">
          <Stat label="Earned" value={`${earnedBadgeIds.size} / ${BADGES.length}`} />
        </PillarCard>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-xs uppercase text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function PillarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <h2 className="font-semibold text-white">{title}</h2>
      <div className="mt-2 space-y-1">{children}</div>
    </div>
  );
}

function Stat({ label, value, children }: { label: string; value?: string | number; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium text-white">{children ?? value}</span>
    </div>
  );
}
