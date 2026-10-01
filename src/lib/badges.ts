export type BadgeCategory = "consistency" | "milestone" | "cross-module" | "comeback" | "pr";

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
}

export const BADGES: BadgeDef[] = [
  {
    id: "first-session",
    name: "First Session",
    description: "Logged your first training session.",
    category: "milestone",
  },
  {
    id: "streak-7",
    name: "7-Day Streak",
    description: "Logged something 7 days in a row.",
    category: "consistency",
  },
  {
    id: "streak-30",
    name: "30-Day Streak",
    description: "Logged something 30 days in a row.",
    category: "consistency",
  },
  {
    id: "goal-getter",
    name: "Goal Getter",
    description: "Completed 5 goals.",
    category: "milestone",
  },
  {
    id: "full-athlete",
    name: "Full Athlete",
    description: "Logged activity across two or more pillars in the same week.",
    category: "cross-module",
  },
  {
    id: "comeback",
    name: "Comeback",
    description: "Picked it back up after a week or more away — no shame in that.",
    category: "comeback",
  },
  {
    id: "recent-pr",
    name: "New PR",
    description: "Set a new personal best on an exercise in the last 7 days.",
    category: "pr",
  },
];
