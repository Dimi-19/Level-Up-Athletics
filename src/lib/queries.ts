import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, TeamRole } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

export type MyTeam = Database["public"]["Tables"]["teams"]["Row"] & {
  role: TeamRole;
};

export async function getMyTeams(supabase: Client, userId: string): Promise<MyTeam[]> {
  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id, role")
    .eq("user_id", userId);

  if (!memberships || memberships.length === 0) return [];

  const teamIds = memberships.map((m) => m.team_id);
  const { data: teams } = await supabase.from("teams").select("*").in("id", teamIds);
  if (!teams) return [];

  const roleByTeamId = new Map(memberships.map((m) => [m.team_id, m.role]));
  return teams
    .map((team) => ({ ...team, role: roleByTeamId.get(team.id) ?? ("athlete" as TeamRole) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getTeamMembership(supabase: Client, teamId: string, userId: string) {
  const { data } = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}
