"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateMacroTargets } from "@/lib/nutrition";
import type { BiologicalSex, ExperienceLevel, PrimaryGoal } from "@/lib/supabase/types";

export interface OnboardingData {
  sport: string;
  position: string;
  favoritePlayer: string;
  favoriteTeam: string;
  experienceLevel: ExperienceLevel | null;
  equipmentAccess: string[];
  workoutsPerWeek: number | null;
  primaryGoal: PrimaryGoal;
  age: number | null;
  biologicalSex: BiologicalSex | null;
  heightCm: number | null;
  weightKg: number | null;
  dietaryRestriction: string;
}

async function currentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, userId: user.id };
}

export async function completeOnboarding(data: OnboardingData) {
  const { supabase, userId } = await currentUserId();

  const hasBodyStats =
    !!data.age && data.age > 0 && !!data.heightCm && data.heightCm > 0 && !!data.weightKg && data.weightKg > 0;

  const macros = hasBodyStats
    ? calculateMacroTargets({
        sex: data.biologicalSex,
        age: data.age!,
        heightCm: data.heightCm!,
        weightKg: data.weightKg!,
        goal: data.primaryGoal,
        workoutsPerWeek: data.workoutsPerWeek ?? 3,
      })
    : null;

  await supabase
    .from("profiles")
    .update({
      sport: data.sport || null,
      position: data.position || null,
      favorite_player: data.favoritePlayer || null,
      favorite_team: data.favoriteTeam || null,
      experience_level: data.experienceLevel,
      equipment_access: data.equipmentAccess,
      dietary_restriction: data.dietaryRestriction || null,
      biological_sex: data.biologicalSex,
      primary_goal: data.primaryGoal,
      age: hasBodyStats ? data.age : null,
      height_cm: hasBodyStats ? data.heightCm : null,
      weight_kg: hasBodyStats ? data.weightKg : null,
      workouts_per_week: data.workoutsPerWeek,
      nutrition_calories: macros?.calories ?? null,
      nutrition_protein_g: macros?.protein ?? null,
      nutrition_carbs_g: macros?.carbs ?? null,
      nutrition_fat_g: macros?.fat ?? null,
      onboarding_completed: true,
    })
    .eq("id", userId);

  redirect("/home");
}

export async function skipOnboarding() {
  const { supabase, userId } = await currentUserId();
  await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", userId);
  redirect("/home");
}
