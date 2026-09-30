import { requireUser } from "@/lib/auth";
import { BodyTracking } from "../BodyTracking";

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase, user, profile } = await requireUser();
  const params = await searchParams;

  return (
    <div className="space-y-4">
      {params.error && (
        <p className="rounded-md border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-300">
          {params.error}
        </p>
      )}
      <BodyTracking supabase={supabase} userId={user.id} unitsWeight={profile?.units_weight ?? "lb"} />
    </div>
  );
}
