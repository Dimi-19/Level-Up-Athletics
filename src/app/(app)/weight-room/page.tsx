import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { startFreeformSession, repeatLastWorkout } from "./session/actions";

export default async function WeightRoomPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase, user } = await requireUser();
  const params = await searchParams;

  const [{ data: templates }, { data: hasCompletedSession }] = await Promise.all([
    supabase
      .from("workout_templates")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("workout_sessions")
      .select("id")
      .eq("user_id", user.id)
      .not("ended_at", "is", null)
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <div className="space-y-8">
      {params.error && (
        <p className="rounded-md border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-300">
          {params.error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <form action={startFreeformSession}>
          <button
            type="submit"
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
          >
            Start freeform session
          </button>
        </form>
        {hasCompletedSession && (
          <form action={repeatLastWorkout}>
            <button
              type="submit"
              className="rounded-md border border-zinc-600 px-4 py-2 text-sm font-semibold text-white hover:border-zinc-400"
            >
              Repeat last workout
            </button>
          </form>
        )}
        <Link
          href="/weight-room/templates/new"
          className="rounded-md border border-zinc-600 px-4 py-2 text-sm font-semibold text-white hover:border-zinc-400"
        >
          New template
        </Link>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Templates</h2>
          <Link href="/weight-room/templates" className="text-sm text-emerald-400 hover:text-emerald-300">
            View all
          </Link>
        </div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {(templates ?? []).slice(0, 6).map((template) => (
            <li key={template.id}>
              <Link
                href={`/weight-room/templates/${template.id}`}
                className="block rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-200 hover:border-zinc-600"
              >
                {template.name}
              </Link>
            </li>
          ))}
          {(templates ?? []).length === 0 && <p className="text-sm text-zinc-500">No templates yet.</p>}
        </ul>
      </section>
    </div>
  );
}
