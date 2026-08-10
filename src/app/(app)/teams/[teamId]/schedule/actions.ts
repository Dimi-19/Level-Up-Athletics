"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { EventType, RsvpStatus } from "@/lib/supabase/types";

export async function createEvent(teamId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "practice") as EventType;
  const location = String(formData.get("location") ?? "").trim();
  const startsAt = String(formData.get("startsAt") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!title || !startsAt) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("events").insert({
    team_id: teamId,
    title,
    type,
    location: location || null,
    starts_at: new Date(startsAt).toISOString(),
    notes: notes || null,
    created_by: user.id,
  });

  revalidatePath(`/teams/${teamId}/schedule`);
  revalidatePath("/home");
}

export async function deleteEvent(teamId: string, eventId: string) {
  const supabase = await createClient();
  await supabase.from("events").delete().eq("id", eventId);
  revalidatePath(`/teams/${teamId}/schedule`);
  revalidatePath("/home");
}

export async function setRsvp(teamId: string, eventId: string, status: RsvpStatus) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("event_rsvps")
    .upsert({ event_id: eventId, user_id: user.id, status }, { onConflict: "event_id,user_id" });

  revalidatePath(`/teams/${teamId}/schedule`);
}
