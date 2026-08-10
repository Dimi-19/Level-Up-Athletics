"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateMacroTargets } from "@/lib/nutrition";
import type { BiologicalSex, PrimaryGoal } from "@/lib/supabase/types";

async function currentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, userId: user.id };
}

export async function completeOnboarding(formData: FormData) {
  const { supabase, userId } = await currentUserId();

  const sport = String(formData.get("sport") ?? "").trim();
  const position = String(formData.get("position") ?? "").trim();
  const favoritePlayer = String(formData.get("favoritePlayer") ?? "").trim();
  const favoriteTeam = String(formData.get("favoriteTeam") ?? "").trim();
  const dietaryRestriction = String(formData.get("dietaryRestriction") ?? "").trim();
  const biologicalSex = (String(formData.get("biologicalSex") ?? "") || null) as BiologicalSex | null;
  const primaryGoal = String(formData.get("primaryGoal") ?? "maintain") as PrimaryGoal;

  const age = Number(formData.get("age"));
  const heightCm = Number(formData.get("heightCm"));
  const weightKg = Number(formData.get("weightKg"));
  const workoutsPerWeek = Number(formData.get("workoutsPerWeek"));

  const hasBodyStats =
    Number.isFinite(age) && age > 0 && Number.isFinite(heightCm) && heightCm > 0 && Number.isFinite(weightKg) && weightKg > 0;

  const macros = hasBodyStats
    ? calculateMacroTargets({
        sex: biologicalSex,
        age,
        heightCm,
        weightKg,
        goal: primaryGoal,
        workoutsPerWeek: Number.isFinite(workoutsPerWeek) ? workoutsPerWeek : 3,
      })
    : null;

  await supabase
    .from("profiles")
    .update({
      sport: sport || null,
      position: position || null,
      favorite_player: favoritePlayer || null,
      favorite_team: favoriteTeam || null,
      dietary_restriction: dietaryRestriction || null,
      biological_sex: biologicalSex,
      primary_goal: primaryGoal,
      age: hasBodyStats ? age : null,
      height_cm: hasBodyStats ? heightCm : null,
      weight_kg: hasBodyStats ? weightKg : null,
      workouts_per_week: Number.isFinite(workoutsPerWeek) ? workoutsPerWeek : null,
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
