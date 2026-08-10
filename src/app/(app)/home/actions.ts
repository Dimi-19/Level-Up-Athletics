"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ReadinessLevel } from "@/lib/supabase/types";

export async function addGoal(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("goals").insert({ user_id: user.id, title });
  revalidatePath("/home");
}

export async function toggleGoal(goalId: string, isCompleted: boolean) {
  const supabase = await createClient();
  await supabase
    .from("goals")
    .update({ is_completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null })
    .eq("id", goalId);
  revalidatePath("/home");
}

export async function deleteGoal(goalId: string) {
  const supabase = await createClient();
  await supabase.from("goals").delete().eq("id", goalId);
  revalidatePath("/home");
}

export async function saveJournalEntry(formData: FormData) {
  const entryDate = String(formData.get("entryDate") ?? "");
  const readiness = String(formData.get("readiness") ?? "") || null;
  const content = String(formData.get("content") ?? "").trim();
  const goodHabits = String(formData.get("goodHabits") ?? "").trim();
  const badHabits = String(formData.get("badHabits") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("journal_entries").upsert(
    {
      user_id: user.id,
      entry_date: entryDate,
      readiness: readiness as ReadinessLevel | null,
      content: content || null,
      good_habits: goodHabits || null,
      bad_habits: badHabits || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,entry_date" },
  );

  revalidatePath("/home");
}
