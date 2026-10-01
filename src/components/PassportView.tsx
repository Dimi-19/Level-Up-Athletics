import type { PassportSnapshot } from "@/lib/supabase/types";

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function PassportView({ snapshot }: { snapshot: PassportSnapshot }) {
  return (
    <div className="space-y-6 rounded-lg border border-zinc-800 bg-zinc-950 p-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-emerald-400">Verified Athlete Passport</p>
        <h2 className="mt-1 text-2xl font-bold text-white">{snapshot.fullName}</h2>
        <p className="text-sm text-zinc-400">
          {[snapshot.sport, snapshot.position].filter(Boolean).join(" · ") || "Sport not set"}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-zinc-900 bg-black p-3">
          <p className="text-xs uppercase text-zinc-500">Weight Room</p>
          {snapshot.weightRoom ? (
            <p className="mt-1 text-lg font-bold" style={{ color: snapshot.weightRoom.tierColor }}>
              {snapshot.weightRoom.tierName}
            </p>
          ) : (
            <p className="mt-1 text-sm text-zinc-600">No data yet</p>
          )}
        </div>
        <div className="rounded-md border border-zinc-900 bg-black p-3">
          <p className="text-xs uppercase text-zinc-500">Longest Streak</p>
          <p className="mt-1 text-lg font-bold text-white">{snapshot.longestStreakDays} days</p>
        </div>
        <div className="rounded-md border border-zinc-900 bg-black p-3">
          <p className="text-xs uppercase text-zinc-500">Badges Earned</p>
          <p className="mt-1 text-lg font-bold text-white">{snapshot.badges.length}</p>
        </div>
      </div>

      {snapshot.topLifts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white">Top lifts</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {snapshot.topLifts.map((lift) => (
              <div key={lift.exerciseName} className="rounded-md border border-zinc-900 bg-black px-3 py-2">
                <p className="text-sm text-white">{lift.exerciseName}</p>
                <p className="text-xs text-zinc-500">
                  {Math.round(lift.weightKg)} kg x {lift.reps}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {snapshot.runningPrs.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white">Running PRs</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {snapshot.runningPrs.map((pr) => (
              <div key={pr.label} className="rounded-md border border-zinc-900 bg-black px-3 py-2">
                <p className="text-xs uppercase text-zinc-500">{pr.label}</p>
                <p className="text-sm font-semibold text-white">{formatDuration(pr.durationSeconds)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {snapshot.skillRanks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white">Skill ranks</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {snapshot.skillRanks.map((skill) => (
              <div key={`${skill.sport}-${skill.name}`} className="rounded-md border border-zinc-900 bg-black px-3 py-2">
                <p className="text-sm text-white">{skill.name}</p>
                <p className="text-xs text-zinc-500">{skill.sport}</p>
                <p className="mt-1 text-sm font-semibold" style={{ color: skill.tierColor }}>
                  {skill.tierName}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {snapshot.badges.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white">Badges</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {snapshot.badges.map((badge) => (
              <span
                key={badge.name}
                className="rounded-full border border-emerald-800 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-300"
              >
                {badge.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-zinc-600">
        Generated {new Date(snapshot.generatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
      </p>
    </div>
  );
}
