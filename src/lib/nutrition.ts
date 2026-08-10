import type { BiologicalSex, PrimaryGoal } from "@/lib/supabase/types";

function activityMultiplier(workoutsPerWeek: number): number {
  if (workoutsPerWeek >= 6) return 1.725;
  if (workoutsPerWeek >= 4) return 1.55;
  if (workoutsPerWeek >= 2) return 1.375;
  return 1.2;
}

function goalAdjustment(goal: PrimaryGoal): number {
  if (goal === "cut") return -500;
  if (goal === "bulk") return 300;
  return 0;
}

export function calculateMacroTargets(input: {
  sex: BiologicalSex | null;
  age: number;
  heightCm: number;
  weightKg: number;
  goal: PrimaryGoal;
  workoutsPerWeek: number;
}) {
  const { sex, age, heightCm, weightKg, goal, workoutsPerWeek } = input;

  // Mifflin-St Jeor; averages the male/female offset when sex isn't provided.
  const sexOffset = sex === "male" ? 5 : sex === "female" ? -161 : -78;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + sexOffset;
  const tdee = bmr * activityMultiplier(workoutsPerWeek);
  const calories = Math.round(tdee + goalAdjustment(goal));

  const protein = Math.round(1.8 * weightKg);
  const fat = Math.round((0.25 * calories) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));

  return { calories, protein, carbs, fat };
}
