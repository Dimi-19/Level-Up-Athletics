"use client";

import { useTransition } from "react";
import type { TeamRole } from "@/lib/supabase/types";

const ROLES: TeamRole[] = ["coach", "captain", "athlete"];

export function RoleSelect({
  memberId,
  currentRole,
  onChangeRole,
}: {
  memberId: string;
  currentRole: TeamRole;
  onChangeRole: (memberId: string, role: TeamRole) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={currentRole}
      disabled={isPending}
      onChange={(e) =>
        startTransition(() => onChangeRole(memberId, e.target.value as TeamRole))
      }
      className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-white disabled:opacity-50"
    >
      {ROLES.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
  );
}
