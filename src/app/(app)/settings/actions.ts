"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { DistanceUnit, ProfileVisibility, TimeFormat, WeightUnit } from "@/lib/supabase/types";

async function currentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, userId: user.id };
}

export async function updateUnits(formData: FormData) {
  const { supabase, userId } = await currentUserId();

  await supabase
    .from("profiles")
    .update({
      units_weight: String(formData.get("unitsWeight")) as WeightUnit,
      units_distance: String(formData.get("unitsDistance")) as DistanceUnit,
      time_format: String(formData.get("timeFormat")) as TimeFormat,
    })
    .eq("id", userId);

  revalidatePath("/settings");
}

export async function updateNotifications(formData: FormData) {
  const { supabase, userId } = await currentUserId();

  await supabase
    .from("profiles")
    .update({
      notif_session_reminders: formData.get("sessionReminders") === "on",
      notif_badge_alerts: formData.get("badgeAlerts") === "on",
      notif_missed_session: formData.get("missedSession") === "on",
    })
    .eq("id", userId);

  revalidatePath("/settings");
}

export async function updateIntegrations(formData: FormData) {
  const { supabase, userId } = await currentUserId();

  await supabase
    .from("profiles")
    .update({
      whoop_sync_enabled: formData.get("whoopSync") === "on",
      whoop_burn_override: formData.get("whoopBurnOverride") === "on",
    })
    .eq("id", userId);

  revalidatePath("/settings");
}

export async function updateNutritionTargets(formData: FormData) {
  const { supabase, userId } = await currentUserId();

  const toIntOrNull = (value: FormDataEntryValue | null) => {
    const n = Number(value);
    return value && !Number.isNaN(n) ? n : null;
  };

  await supabase
    .from("profiles")
    .update({
      dietary_restriction: String(formData.get("dietaryRestriction") ?? "") || null,
      nutrition_calories: toIntOrNull(formData.get("calories")),
      nutrition_protein_g: toIntOrNull(formData.get("protein")),
      nutrition_carbs_g: toIntOrNull(formData.get("carbs")),
      nutrition_fat_g: toIntOrNull(formData.get("fat")),
      nutrition_notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .eq("id", userId);

  revalidatePath("/settings");
  revalidatePath("/home");
}

export async function updateVisibility(formData: FormData) {
  const { supabase, userId } = await currentUserId();

  await supabase
    .from("profiles")
    .update({ profile_visibility: String(formData.get("visibility")) as ProfileVisibility })
    .eq("id", userId);

  revalidatePath("/settings");
}

export async function changePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 6) {
    redirect("/settings?error=Password must be at least 6 characters");
  }
  if (password !== confirmPassword) {
    redirect("/settings?error=Passwords don't match");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/settings?notice=Password updated");
}
