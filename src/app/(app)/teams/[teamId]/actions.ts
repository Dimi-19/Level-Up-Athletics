"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { TeamRole } from "@/lib/supabase/types";

export async function updateMemberRole(teamId: string, memberId: string, role: TeamRole) {
  const supabase = await createClient();
  const { error } = await supabase.from("team_members").update({ role }).eq("id", memberId);
  if (error) redirect(`/teams/${teamId}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/teams/${teamId}`);
}

export async function removeMember(teamId: string, memberId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("team_members").delete().eq("id", memberId);
  if (error) redirect(`/teams/${teamId}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/teams/${teamId}`);
}
