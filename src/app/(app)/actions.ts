"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createTeam(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const sport = String(formData.get("sport") ?? "").trim();

  if (!name) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: team, error } = await supabase
    .from("teams")
    .insert({ name, sport: sport || null, created_by: user.id })
    .select("id")
    .single();

  if (error || !team) {
    redirect(`/teams?error=${encodeURIComponent(error?.message ?? "Could not create team")}`);
  }

  revalidatePath("/teams");
  redirect(`/teams/${team.id}`);
}

export async function joinTeam(formData: FormData) {
  const inviteCode = String(formData.get("inviteCode") ?? "").trim();
  if (!inviteCode) return;

  const supabase = await createClient();
  const { data: teamId, error } = await supabase.rpc("join_team_by_code", {
    p_invite_code: inviteCode,
  });

  if (error || !teamId) {
    redirect(`/teams?error=${encodeURIComponent(error?.message ?? "Invalid invite code")}`);
  }

  revalidatePath("/teams");
  redirect(`/teams/${teamId}`);
}
