import Link from "next/link";
import { requireUser } from "@/lib/auth";
import type { ScheduledSessionType } from "@/lib/supabase/types";
import { addScheduledSession, deleteScheduledSession, toggleScheduledSession } from "./actions";

const SESSION_TYPES: { value: ScheduledSessionType; label: string; href: string | null }[] = [
  { value: "weight_room", label: "Weight Room", href: "/weight-room" },
  { value: "run", label: "Run", href: "/running" },
  { value: "skill", label: "Skill", href: "/training" },
  { value: "game", label: "Game", href: null },
  { value: "film_study", label: "Film Study", href: "/film-study" },
  { value: "rest", label: "Rest", href: null },
];

const TYPE_META = new Map(SESSION_TYPES.map((t) => [t.value, t]));

function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function startOfWeek(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  return shiftDate(date, -day);
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; week?: string }>;
}) {
  const { supabase, user } = await requireUser();
  const params = await searchParams;

  const today = new Date().toISOString().slice(0, 10);
  const weekStart =
    params.week && /^\d{4}-\d{2}-\d{2}$/.test(params.week) ? startOfWeek(params.week) : startOfWeek(today);
  const weekDays = Array.from({ length: 7 }, (_, i) => shiftDate(weekStart, i));
  const weekEnd = weekDays[6];

  const { data: sessionsData } = await supabase
    .from("scheduled_sessions")
    .select("*")
    .eq("user_id", user.id)
    .gte("scheduled_date", weekStart)
    .lte("scheduled_date", weekEnd)
    .order("scheduled_date", { ascending: true })
    .order("created_at", { ascending: true });

  const sessions = sessionsData ?? [];
  const sessionsByDay = new Map<string, typeof sessions>();
  for (const session of sessions) {
    const list = sessionsByDay.get(session.scheduled_date) ?? [];
    list.push(session);
    sessionsByDay.set(session.scheduled_date, list);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Schedule</h1>
          <p className="mt-1 text-sm text-zinc-400">Plan your week — tap a session to go log it.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/schedule?week=${shiftDate(weekStart, -7)}`}
            className="rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            ← Prev week
          </Link>
          <Link
            href={`/schedule?week=${today}`}
            className="rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            This week
          </Link>
          <Link
            href={`/schedule?week=${shiftDate(weekStart, 7)}`}
            className="rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            Next week →
          </Link>
        </div>
      </div>

      {params.error && (
        <p className="rounded-md border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-300">{params.error}</p>
      )}

      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h2 className="font-semibold text-white">Add a scheduled session</h2>
        <form action={addScheduledSession} className="mt-3 flex flex-wrap items-end gap-3">
          <div className="flex flex-col">
            <label className="text-xs text-zinc-500">Date</label>
            <input
              type="date"
              name="scheduledDate"
              defaultValue={today}
              className="rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-zinc-500">Type</label>
            <select
              name="sessionType"
              className="rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
            >
              {SESSION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-zinc-500">Title</label>
            <input
              type="text"
              name="title"
              placeholder="optional"
              className="w-40 rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
            />
          </div>
          <div className="flex flex-1 min-w-[160px] flex-col">
            <label className="text-xs text-zinc-500">Notes</label>
            <input
              type="text"
              name="notes"
              placeholder="optional"
              className="rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-black hover:bg-emerald-500"
          >
            Add
          </button>
        </form>
      </div>

      <div className="grid gap-3 lg:grid-cols-7">
        {weekDays.map((day) => {
          const daySessions = sessionsByDay.get(day) ?? [];
          const isToday = day === today;
          return (
            <div
              key={day}
              className={`rounded-lg border p-3 ${isToday ? "border-emerald-700 bg-emerald-950/20" : "border-zinc-800 bg-zinc-950"}`}
            >
              <p className="text-xs font-semibold uppercase text-zinc-400">
                {new Date(`${day}T00:00:00`).toLocaleDateString(undefined, { weekday: "short" })}
              </p>
              <p className="text-sm text-zinc-500">
                {new Date(`${day}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </p>

              <div className="mt-2 space-y-2">
                {daySessions.length === 0 ? (
                  <p className="text-xs text-zinc-700">Nothing scheduled</p>
                ) : (
                  daySessions.map((session) => {
                    const meta = TYPE_META.get(session.session_type);
                    const body = (
                      <div
                        className={`rounded-md border px-2 py-1.5 ${
                          session.is_completed
                            ? "border-zinc-900 bg-black opacity-60"
                            : "border-zinc-800 bg-black"
                        }`}
                      >
                        <p className={`text-xs font-medium ${session.is_completed ? "text-zinc-500 line-through" : "text-white"}`}>
                          {meta?.label ?? session.session_type}
                        </p>
                        {session.title && <p className="text-xs text-zinc-500">{session.title}</p>}
                      </div>
                    );
                    return (
                      <div key={session.id} className="group relative">
                        {meta?.href ? <Link href={meta.href}>{body}</Link> : body}
                        <div className="mt-1 flex items-center gap-2">
                          <form action={toggleScheduledSession.bind(null, session.id, !session.is_completed)}>
                            <button type="submit" className="text-[10px] text-zinc-600 hover:text-emerald-400">
                              {session.is_completed ? "Undo" : "Mark done"}
                            </button>
                          </form>
                          <form action={deleteScheduledSession.bind(null, session.id)}>
                            <button type="submit" className="text-[10px] text-zinc-600 hover:text-red-400">
                              Remove
                            </button>
                          </form>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
