import { requireUser } from "@/lib/auth";
import { longestStreak } from "@/lib/streak";
import { updateProfile } from "./actions";

export default async function ProfilePage() {
  const { supabase, user, profile } = await requireUser();

  const { data: logs } = await supabase
    .from("workout_logs")
    .select("performed_at")
    .eq("user_id", user.id);

  const totalSessions = logs?.length ?? 0;
  const streak = longestStreak((logs ?? []).map((l) => l.performed_at));
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : "—";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="mt-1 text-sm text-zinc-400">Who you are, on and off the record.</p>
      </div>

      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="font-semibold text-white">Identity</h2>
        <form action={updateProfile} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-300">Name</label>
            <input
              name="fullName"
              defaultValue={profile?.full_name ?? ""}
              required
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300">Sport</label>
            <input
              name="sport"
              defaultValue={profile?.sport ?? ""}
              placeholder="Basketball"
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300">Position</label>
            <input
              name="position"
              defaultValue={profile?.position ?? ""}
              placeholder="Guard"
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300">Shoe rotation</label>
            <input
              name="shoeRotation"
              defaultValue={(profile?.shoe_rotation ?? []).join(", ")}
              placeholder="Kobe 6 Protro, AE 2"
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
            <p className="mt-1 text-xs text-zinc-500">Comma-separated</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300">Favorite player</label>
            <input
              name="favoritePlayer"
              defaultValue={profile?.favorite_player ?? ""}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300">Favorite team</label>
            <input
              name="favoriteTeam"
              defaultValue={profile?.favorite_team ?? ""}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
            >
              Save profile
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm text-zinc-400">Sessions logged</p>
          <p className="mt-1 text-2xl font-bold text-white">{totalSessions}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm text-zinc-400">Longest streak</p>
          <p className="mt-1 text-2xl font-bold text-white">{streak} {streak === 1 ? "day" : "days"}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm text-zinc-400">Member since</p>
          <p className="mt-1 text-2xl font-bold text-white">{joinDate}</p>
        </div>
      </section>

      <section className="rounded-lg border border-dashed border-zinc-700 p-5">
        <h2 className="font-medium text-zinc-300">Rank overview</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Will show your Weight Room, Sport-Specific, and Nutrition rank tracks once those modules are logging
          data.
        </p>
      </section>

      <section className="rounded-lg border border-dashed border-zinc-700 p-5">
        <h2 className="font-medium text-zinc-300">Badge case</h2>
        <p className="mt-1 text-sm text-zinc-500">No badges earned yet.</p>
      </section>

      <section className="rounded-lg border border-dashed border-zinc-700 p-5">
        <h2 className="font-medium text-zinc-300">Personal records</h2>
        <p className="mt-1 text-sm text-zinc-500">No PRs logged yet.</p>
      </section>
    </div>
  );
}
