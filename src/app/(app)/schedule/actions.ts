"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ScheduledSessionType } from "@/lib/supabase/types";

const PATH = "/schedule";

function fail(error: { message: string }): never {
  redirect(`${PATH}?error=${encodeURIComponent(error.message)}`);
}

export async function addScheduledSession(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const scheduledDate = String(formData.get("scheduledDate") ?? "");
  const sessionType = String(formData.get("sessionType") ?? "") as ScheduledSessionType;
  const title = String(formData.get("title") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!scheduledDate) fail({ message: "Date is required." });

  const { error } = await supabase.from("scheduled_sessions").insert({
    user_id: user.id,
    scheduled_date: scheduledDate,
    session_type: sessionType,
    title,
    notes,
  });

  if (error) fail(error);
  revalidatePath(PATH);
}

export async function toggleScheduledSession(id: string, isCompleted: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("scheduled_sessions").update({ is_completed: isCompleted }).eq("id", id);
  if (error) fail(error);
  revalidatePath(PATH);
}

export async function deleteScheduledSession(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("scheduled_sessions").delete().eq("id", id);
  if (error) fail(error);
  revalidatePath(PATH);
}
