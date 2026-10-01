import { requireUser } from "@/lib/auth";
import { BADGES } from "@/lib/badges";
import { evaluateBadges } from "@/lib/badgeEngine";

export default async function BadgesPage() {
  const { supabase, user } = await requireUser();
  const earned = await evaluateBadges(supabase, user.id);

  const earnedBadges = BADGES.filter((b) => earned.has(b.id));
  const lockedBadges = BADGES.filter((b) => !earned.has(b.id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Badges</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Recognition for behavior and milestones — {earnedBadges.length} of {BADGES.length} earned.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {earnedBadges.map((badge) => (
          <div key={badge.id} className="rounded-lg border border-emerald-700 bg-emerald-950/30 p-4">
            <p className="font-semibold text-emerald-400">{badge.name}</p>
            <p className="mt-1 text-sm text-zinc-300">{badge.description}</p>
            <span className="mt-2 inline-block rounded bg-zinc-800 px-2 py-0.5 text-xs uppercase text-zinc-400">
              {badge.category}
            </span>
          </div>
        ))}
        {lockedBadges.map((badge) => (
          <div key={badge.id} className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950 p-4 opacity-50">
            <p className="font-semibold text-zinc-400">{badge.name}</p>
            <p className="mt-1 text-sm text-zinc-500">{badge.description}</p>
            <span className="mt-2 inline-block rounded bg-zinc-900 px-2 py-0.5 text-xs uppercase text-zinc-600">
              {badge.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
