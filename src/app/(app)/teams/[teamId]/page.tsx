import { requireUser } from "@/lib/auth";
import { updateMemberRole, removeMember } from "./actions";
import { RoleSelect } from "./RoleSelect";

export default async function TeamRosterPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const { supabase, user } = await requireUser();

  const { data: members } = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: true });

  const memberList = members ?? [];
  const userIds = memberList.map((m) => m.user_id);
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("*").in("id", userIds)
    : { data: [] };

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
  const myMembership = memberList.find((m) => m.user_id === user.id);
  const isLeader = myMembership?.role === "coach" || myMembership?.role === "captain";

  return (
    <div>
      <h2 className="font-semibold text-white">Roster ({memberList.length})</h2>
      <ul className="mt-4 divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-950">
        {memberList.map((member) => (
          <li key={member.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-medium text-white">
                {nameById.get(member.user_id) ?? "Unknown"}
                {member.user_id === user.id && (
                  <span className="ml-2 text-xs text-zinc-500">(you)</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isLeader ? (
                <RoleSelect
                  memberId={member.id}
                  currentRole={member.role}
                  onChangeRole={updateMemberRole.bind(null, teamId)}
                />
              ) : (
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs uppercase text-zinc-400">
                  {member.role}
                </span>
              )}
              {isLeader && member.user_id !== user.id && (
                <form
                  action={async () => {
                    "use server";
                    await removeMember(teamId, member.id);
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:border-red-700 hover:text-red-400"
                  >
                    Remove
                  </button>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
