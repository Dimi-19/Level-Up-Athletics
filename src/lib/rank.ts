import type { SetType } from "@/lib/supabase/types";

export interface Tier {
  name: string;
  threshold: number;
  color: string;
}

const TIER_NAMES = [
  "Wood III",
  "Wood II",
  "Wood I",
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
  "Champion",
  "Titan",
  "Olympian",
];

const TIER_COLORS = [
  "#92400e",
  "#92400e",
  "#92400e",
  "#b45309",
  "#9ca3af",
  "#eab308",
  "#67e8f9",
  "#60a5fa",
  "#ef4444",
  "#1e3a8a",
  "#2dd4bf",
];

// First-pass heuristic: cumulative training volume (weight x reps, unit-agnostic)
// mapped onto the Wood -> Olympian tier ladder. Thresholds are a starting point,
// not derived from any external benchmark. Each scope (single exercise, a whole
// muscle group, or the overall total) uses the same ladder scaled by how much
// volume naturally accumulates there.
const BASE_THRESHOLDS = [0, 1_500, 4_000, 9_000, 18_000, 35_000, 65_000, 120_000, 220_000, 400_000, 700_000];

function buildTiers(scale: number): Tier[] {
  return BASE_THRESHOLDS.map((threshold, i) => ({
    name: TIER_NAMES[i],
    threshold: Math.round(threshold * scale),
    color: TIER_COLORS[i],
  }));
}

export const EXERCISE_TIERS = buildTiers(0.15);
export const MUSCLE_GROUP_TIERS = buildTiers(1);
export const OVERALL_TIERS = buildTiers(8);

export function tierForScore(score: number, tiers: Tier[] = MUSCLE_GROUP_TIERS): Tier {
  let current = tiers[0];
  for (const tier of tiers) {
    if (score >= tier.threshold) current = tier;
  }
  return current;
}

export function nextTier(current: Tier, tiers: Tier[] = MUSCLE_GROUP_TIERS): Tier | null {
  const index = tiers.findIndex((t) => t.name === current.name);
  return index >= 0 && index < tiers.length - 1 ? tiers[index + 1] : null;
}

export function computeVolumeScore(
  sets: { weight: number | null; reps: number | null; set_type: SetType }[],
): number {
  return sets
    .filter((s) => s.set_type !== "warmup")
    .reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0);
}
