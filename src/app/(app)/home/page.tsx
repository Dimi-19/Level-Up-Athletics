import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getMyTeams } from "@/lib/queries";
import { addGoal, toggleGoal, deleteGoal, saveJournalEntry } from "./actions";

const READINESS_LEVELS = ["low", "medium", "high"] as const;

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString(), dateKey: start.toISOString().slice(0, 10) };
}

export default async function HomePage() {
  const { supabase, user, profile } = await requireUser();
  const { start, end, dateKey } = todayRange();

  const teams = await getMyTeams(supabase, user.id);
  const teamIds = teams.map((t) => t.id);

  const [{ data: todaysEvents }, { data: goals }, { data: journalEntry }] = await Promise.all([
    teamIds.length
      ? supabase
          .from("events")
          .select("*")
          .in("team_id", teamIds)
          .gte("starts_at", start)
          .lte("starts_at", end)
          .order("starts_at", { ascending: true })
      : Promise.resolve({ data: [] }),
    supabase.from("goals").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
    supabase.from("journal_entries").select("*").eq("user_id", user.id).eq("entry_date", dateKey).maybeSingle(),
  ]);

  const hasNutritionTargets = profile?.nutrition_calories != null;
  const openGoals = (goals ?? []).filter((g) => !g.is_completed);
  const doneGoals = (goals ?? []).filter((g) => g.is_completed);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {profile?.full_name}</h1>
        <p className="mt-1 text-sm text-zinc-400">Here&apos;s what&apos;s in front of you today.</p>
      </div>

      <section>
        <h2 className="font-semibold text-white">Today</h2>
        {(todaysEvents ?? []).length > 0 ? (
          <ul className="mt-3 space-y-2">
            {(todaysEvents ?? []).map((event) => (
              <li key={event.id}>
                <Link
                  href={`/teams/${event.team_id}/schedule`}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-600"
                >
                  <div>
                    <p className="font-medium text-white">{event.title}</p>
                    <p className="text-sm text-zinc-400">{formatTime(event.starts_at)}</p>
                  </div>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs uppercase text-zinc-400">
                    {event.type}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 rounded-lg border border-dashed border-zinc-700 p-4 text-sm text-zinc-500">
            Nothing scheduled today.
          </p>
        )}
      </section>

      <section>
        <h2 className="font-semibold text-white">Quick actions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { label: "Repeat last workout", href: "/weight-room" },
            { label: "Log without template", href: "/weight-room" },
            { label: "Start sport-specific session", href: "/training" },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-500 hover:text-white"
            >
              {action.label} <span className="text-zinc-600">· soon</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Weight Room", href: "/weight-room" },
          { label: "Sport-Specific", href: "/training" },
          { label: "Nutrition consistency", href: "/nutrition" },
        ].map((rank) => (
          <Link
            key={rank.label}
            href={rank.href}
            className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-600"
          >
            <p className="text-sm text-zinc-400">{rank.label}</p>
            <p className="mt-1 text-lg font-semibold text-zinc-600">—</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/motivation"
          className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-600"
        >
          <p className="text-sm text-zinc-400">Motivation</p>
          <p className="mt-1 text-sm text-zinc-500">
            &quot;Hard work beats talent when talent doesn&apos;t work hard.&quot;
          </p>
        </Link>
        <Link href="/badges" className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-600">
          <p className="text-sm text-zinc-400">Most recent badge</p>
          <p className="mt-1 text-sm text-zinc-500">No badges yet</p>
        </Link>
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="font-semibold text-white">Macros today</h2>
        {hasNutritionTargets ? (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Calories", value: profile?.nutrition_calories, unit: "kcal" },
              { label: "Protein", value: profile?.nutrition_protein_g, unit: "g" },
              { label: "Carbs", value: profile?.nutrition_carbs_g, unit: "g" },
              { label: "Fat", value: profile?.nutrition_fat_g, unit: "g" },
            ].map((macro) => (
              <div key={macro.label} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-zinc-800">
                  <span className="text-xs text-zinc-500">0</span>
                </div>
                <p className="mt-2 text-xs text-zinc-400">
                  {macro.label} <span className="text-zinc-600">/ {macro.value}{macro.unit}</span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-zinc-500">
            No nutrition targets set yet.{" "}
            <Link href="/settings" className="text-emerald-400 hover:text-emerald-300">
              Set them in Settings →
            </Link>
          </p>
        )}
        <p className="mt-3 text-xs text-zinc-600">
          Meal logging isn&apos;t built yet — this will show what you&apos;ve actually eaten once Nutrition
          ships.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="font-semibold text-white">Goals</h2>
          <form action={addGoal} className="mt-4 flex gap-2">
            <input
              name="title"
              required
              placeholder="Add a goal..."
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="shrink-0 rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
            >
              Add
            </button>
          </form>

          <ul className="mt-4 space-y-2">
            {openGoals.map((goal) => (
              <li key={goal.id} className="flex items-center justify-between gap-2 rounded-md border border-zinc-800 px-3 py-2">
                <form action={toggleGoal.bind(null, goal.id, true)} className="flex min-w-0 flex-1 items-center gap-2">
                  <button type="submit" className="h-4 w-4 shrink-0 rounded-full border border-zinc-600" aria-label="Mark complete" />
                  <span className="truncate text-sm text-zinc-200">{goal.title}</span>
                </form>
                <form action={deleteGoal.bind(null, goal.id)}>
                  <button type="submit" className="text-xs text-zinc-500 hover:text-red-400">
                    Remove
                  </button>
                </form>
              </li>
            ))}
            {openGoals.length === 0 && <p className="text-sm text-zinc-500">No open goals — add one above.</p>}
          </ul>

          {doneGoals.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-xs text-zinc-500">
                {doneGoals.length} completed
              </summary>
              <ul className="mt-2 space-y-2">
                {doneGoals.map((goal) => (
                  <li key={goal.id} className="flex items-center justify-between gap-2 rounded-md border border-zinc-900 px-3 py-2">
                    <form action={toggleGoal.bind(null, goal.id, false)} className="flex min-w-0 flex-1 items-center gap-2">
                      <button type="submit" className="h-4 w-4 shrink-0 rounded-full bg-emerald-500" aria-label="Mark incomplete" />
                      <span className="truncate text-sm text-zinc-500 line-through">{goal.title}</span>
                    </form>
                    <form action={deleteGoal.bind(null, goal.id)}>
                      <button type="submit" className="text-xs text-zinc-500 hover:text-red-400">
                        Remove
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="font-semibold text-white">Today&apos;s journal</h2>
          <form action={saveJournalEntry} className="mt-4 space-y-3">
            <input type="hidden" name="entryDate" value={dateKey} />

            <div>
              <label className="block text-sm font-medium text-zinc-300">Readiness</label>
              <div className="mt-1 flex gap-2">
                {READINESS_LEVELS.map((level) => (
                  <label key={level} className="cursor-pointer">
                    <input
                      type="radio"
                      name="readiness"
                      value={level}
                      defaultChecked={journalEntry?.readiness === level}
                      className="peer sr-only"
                    />
                    <span className="block rounded-md border border-zinc-700 px-3 py-1.5 text-sm capitalize text-zinc-300 peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10 peer-checked:text-emerald-400">
                      {level}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300">How are you feeling?</label>
              <textarea
                name="content"
                defaultValue={journalEntry?.content ?? ""}
                rows={2}
                className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-300">Good habits</label>
                <textarea
                  name="goodHabits"
                  defaultValue={journalEntry?.good_habits ?? ""}
                  rows={2}
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300">Bad habits</label>
                <textarea
                  name="badHabits"
                  defaultValue={journalEntry?.bad_habits ?? ""}
                  rows={2}
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="rounded-md border border-zinc-600 px-4 py-2 text-sm font-semibold text-white hover:border-zinc-400"
            >
              Save today&apos;s entry
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
