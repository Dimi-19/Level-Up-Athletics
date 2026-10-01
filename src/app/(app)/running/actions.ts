"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { miToKm } from "@/lib/units";

const PATH = "/running";

function fail(error: { message: string }): never {
  redirect(`${PATH}?error=${encodeURIComponent(error.message)}`);
}

export async function logRun(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("units_distance").eq("id", user.id).single();

  const runDate = String(formData.get("runDate") ?? "") || new Date().toISOString().slice(0, 10);
  const distanceInput = Number(formData.get("distance") ?? 0);
  const minutes = Number(formData.get("minutes") ?? 0) || 0;
  const seconds = Number(formData.get("seconds") ?? 0) || 0;
  const rpeRaw = String(formData.get("rpe") ?? "");
  const shoe = String(formData.get("shoe") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!distanceInput || distanceInput <= 0) fail({ message: "Distance is required." });
  const durationSeconds = minutes * 60 + seconds;
  if (durationSeconds <= 0) fail({ message: "Duration is required." });

  const distanceKm = profile?.units_distance === "mi" ? miToKm(distanceInput) : distanceInput;
  const rpe = rpeRaw ? Number(rpeRaw) : null;

  const { error } = await supabase.from("runs").insert({
    user_id: user.id,
    run_date: runDate,
    distance_km: distanceKm,
    duration_seconds: durationSeconds,
    rpe,
    shoe,
    notes,
  });

  if (error) fail(error);
  revalidatePath(PATH);
}

export async function deleteRun(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("runs").delete().eq("id", id);
  if (error) fail(error);
  revalidatePath(PATH);
}
