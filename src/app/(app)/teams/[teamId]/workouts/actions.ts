"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createWorkout(teamId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("workouts").insert({
    team_id: teamId,
    title,
    description: description || null,
    created_by: user.id,
  });

  revalidatePath(`/teams/${teamId}/workouts`);
}

export async function logWorkout(teamId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const workoutId = String(formData.get("workoutId") ?? "") || null;
  const performedAt = String(formData.get("performedAt") ?? "");
  const durationRaw = String(formData.get("duration") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!title) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("workout_logs").insert({
    team_id: teamId,
    user_id: user.id,
    workout_id: workoutId,
    title,
    performed_at: performedAt ? new Date(performedAt).toISOString() : new Date().toISOString(),
    duration_minutes: durationRaw ? Number(durationRaw) : null,
    notes: notes || null,
  });

  revalidatePath(`/teams/${teamId}/workouts`);
  revalidatePath("/dashboard");
}

export async function deleteWorkoutLog(teamId: string, logId: string) {
  const supabase = await createClient();
  await supabase.from("workout_logs").delete().eq("id", logId);
  revalidatePath(`/teams/${teamId}/workouts`);
  revalidatePath("/dashboard");
}
