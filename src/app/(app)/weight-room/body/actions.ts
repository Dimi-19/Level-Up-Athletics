"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { lbToKg } from "@/lib/units";

export async function logBodyMetric(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("units_weight")
    .eq("id", user.id)
    .single();

  const recordedAt = String(formData.get("recordedAt") ?? "") || new Date().toISOString().slice(0, 10);
  const weightRaw = String(formData.get("weight") ?? "");
  const bodyFatRaw = String(formData.get("bodyFatPct") ?? "");

  const weightInput = weightRaw ? Number(weightRaw) : null;
  const weightKg = weightInput != null ? (profile?.units_weight === "lb" ? lbToKg(weightInput) : weightInput) : null;
  const bodyFatPct = bodyFatRaw ? Number(bodyFatRaw) : null;

  if (weightKg == null && bodyFatPct == null) return;

  const { error } = await supabase.from("body_metrics").upsert(
    {
      user_id: user.id,
      recorded_at: recordedAt,
      weight_kg: weightKg,
      body_fat_pct: bodyFatPct,
    },
    { onConflict: "user_id,recorded_at" },
  );

  if (error) redirect(`/weight-room/progress?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/weight-room/progress");
}

export async function deleteBodyMetric(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("body_metrics").delete().eq("id", id);
  if (error) redirect(`/weight-room/progress?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/weight-room/progress");
}
