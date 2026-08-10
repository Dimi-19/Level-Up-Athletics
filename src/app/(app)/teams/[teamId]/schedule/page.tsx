import { requireUser } from "@/lib/auth";
import { getTeamMembership } from "@/lib/queries";
import { createEvent, deleteEvent, setRsvp } from "./actions";
import type { RsvpStatus } from "@/lib/supabase/types";

const RSVP_OPTIONS: { status: RsvpStatus; label: string }[] = [
  { status: "yes", label: "Going" },
  { status: "maybe", label: "Maybe" },
  { status: "no", label: "Can't go" },
];

function partitionByTime<T extends { starts_at: string }>(events: T[]) {
  const nowMs = Date.now();
  const upcoming = events.filter((e) => new Date(e.starts_at).getTime() >= nowMs);
  const past = events.filter((e) => new Date(e.starts_at).getTime() < nowMs).reverse();
  return { upcoming, past };
}

function formatEventTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const { supabase, user } = await requireUser();

  const membership = await getTeamMembership(supabase, teamId, user.id);
  const isLeader = membership?.role === "coach" || membership?.role === "captain";

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("team_id", teamId)
    .order("starts_at", { ascending: true });

  const eventList = events ?? [];
  const eventIds = eventList.map((e) => e.id);

  const { data: rsvps } = eventIds.length
    ? await supabase.from("event_rsvps").select("*").in("event_id", eventIds)
    : { data: [] };

  const rsvpsByEvent = new Map<string, typeof rsvps>();
  for (const rsvp of rsvps ?? []) {
    const list = rsvpsByEvent.get(rsvp.event_id) ?? [];
    list.push(rsvp);
    rsvpsByEvent.set(rsvp.event_id, list);
  }

  const { upcoming, past } = partitionByTime(eventList);

  const boundCreateEvent = createEvent.bind(null, teamId);

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="font-semibold text-white">Schedule an event</h2>
        <form action={boundCreateEvent} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-zinc-300">Title</label>
            <input
              name="title"
              required
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300">Type</label>
            <select
              name="type"
              defaultValue="practice"
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
            >
              <option value="practice">Practice</option>
              <option value="game">Game</option>
              <option value="meeting">Meeting</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300">Starts at</label>
            <input
              type="datetime-local"
              name="startsAt"
              required
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300">Location</label>
            <input
              name="location"
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300">Notes</label>
            <input
              name="notes"
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-md bg-emerald-500 px-4 py-2 font-semibold text-black hover:bg-emerald-400"
            >
              Add event
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="font-semibold text-white">Upcoming</h2>
        {upcoming.length === 0 && (
          <p className="mt-3 text-sm text-zinc-500">No upcoming events.</p>
        )}
        <ul className="mt-3 space-y-3">
          {upcoming.map((event) => {
            const eventRsvps = rsvpsByEvent.get(event.id) ?? [];
            const myRsvp = eventRsvps.find((r) => r.user_id === user.id);
            const counts = {
              yes: eventRsvps.filter((r) => r.status === "yes").length,
              maybe: eventRsvps.filter((r) => r.status === "maybe").length,
              no: eventRsvps.filter((r) => r.status === "no").length,
            };
            const canDelete = isLeader || event.created_by === user.id;

            return (
              <li key={event.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white">{event.title}</h3>
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs uppercase text-zinc-400">
                        {event.type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">
                      {formatEventTime(event.starts_at)}
                      {event.location ? ` · ${event.location}` : ""}
                    </p>
                    {event.notes && <p className="mt-1 text-sm text-zinc-500">{event.notes}</p>}
                  </div>
                  {canDelete && (
                    <form
                      action={async () => {
                        "use server";
                        await deleteEvent(teamId, event.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:border-red-700 hover:text-red-400"
                      >
                        Delete
                      </button>
                    </form>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {RSVP_OPTIONS.map((option) => (
                    <form
                      key={option.status}
                      action={async () => {
                        "use server";
                        await setRsvp(teamId, event.id, option.status);
                      }}
                    >
                      <button
                        type="submit"
                        className={`rounded-md border px-3 py-1 text-sm transition ${
                          myRsvp?.status === option.status
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                            : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
                        }`}
                      >
                        {option.label}
                      </button>
                    </form>
                  ))}
                  <span className="text-xs text-zinc-500">
                    {counts.yes} going · {counts.maybe} maybe · {counts.no} out
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="font-semibold text-white">Past</h2>
          <ul className="mt-3 space-y-2">
            {past.map((event) => (
              <li
                key={event.id}
                className="rounded-md border border-zinc-800 px-4 py-2 text-sm text-zinc-400"
              >
                {event.title} — {formatEventTime(event.starts_at)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
