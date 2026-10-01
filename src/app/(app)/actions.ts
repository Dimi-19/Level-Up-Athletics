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

  if (!name) redirect("/community?error=" + encodeURIComponent("Team name is required."));

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
    redirect(`/community?error=${encodeURIComponent(error?.message ?? "Could not create team")}`);
  }

  revalidatePath("/community");
  redirect(`/teams/${team.id}`);
}

export async function joinTeam(formData: FormData) {
  const inviteCode = String(formData.get("inviteCode") ?? "").trim();
  if (!inviteCode) redirect("/community?error=" + encodeURIComponent("Invite code is required."));

  const supabase = await createClient();
  const { data: teamId, error } = await supabase.rpc("join_team_by_code", {
    p_invite_code: inviteCode,
  });

  if (error || !teamId) {
    redirect(`/community?error=${encodeURIComponent(error?.message ?? "Invalid invite code")}`);
  }

  revalidatePath("/community");
  redirect(`/teams/${teamId}`);
}
