import { tierForScore, type Tier } from "@/lib/rank";

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

// Skill rank is consistency-based (how many times you've logged a drill), since
// skills have no shared unit to compare across sports the way weight-room volume does.
const LOG_COUNT_THRESHOLDS = [0, 3, 8, 15, 25, 40, 60, 90, 130, 180, 250];

export const SKILL_TIERS: Tier[] = LOG_COUNT_THRESHOLDS.map((threshold, i) => ({
  name: TIER_NAMES[i],
  threshold,
  color: TIER_COLORS[i],
}));

export function tierForLogCount(count: number): Tier {
  return tierForScore(count, SKILL_TIERS);
}
