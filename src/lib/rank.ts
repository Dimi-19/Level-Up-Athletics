import type { SetType } from "@/lib/supabase/types";

export interface Tier {
  name: string;
  threshold: number;
  color: string;
}

// First-pass heuristic: cumulative training volume (weight x reps, unit-agnostic)
// mapped onto the Wood -> Olympian tier ladder. Thresholds are a starting point,
// not derived from any external benchmark.
export const TIERS: Tier[] = [
  { name: "Wood III", threshold: 0, color: "#92400e" },
  { name: "Wood II", threshold: 1_500, color: "#92400e" },
  { name: "Wood I", threshold: 4_000, color: "#92400e" },
  { name: "Bronze", threshold: 9_000, color: "#b45309" },
  { name: "Silver", threshold: 18_000, color: "#9ca3af" },
  { name: "Gold", threshold: 35_000, color: "#eab308" },
  { name: "Platinum", threshold: 65_000, color: "#67e8f9" },
  { name: "Diamond", threshold: 120_000, color: "#60a5fa" },
  { name: "Champion", threshold: 220_000, color: "#ef4444" },
  { name: "Titan", threshold: 400_000, color: "#1e3a8a" },
  { name: "Olympian", threshold: 700_000, color: "#2dd4bf" },
];

export function tierForScore(score: number): Tier {
  let current = TIERS[0];
  for (const tier of TIERS) {
    if (score >= tier.threshold) current = tier;
  }
  return current;
}

export function nextTier(current: Tier): Tier | null {
  const index = TIERS.findIndex((t) => t.name === current.name);
  return index >= 0 && index < TIERS.length - 1 ? TIERS[index + 1] : null;
}

export function computeVolumeScore(
  sets: { weight: number | null; reps: number | null; set_type: SetType }[],
): number {
  return sets
    .filter((s) => s.set_type !== "warmup")
    .reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0);
}
