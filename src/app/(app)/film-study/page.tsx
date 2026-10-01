import { requireUser } from "@/lib/auth";
import { toEmbedUrl, withTimestamp } from "@/lib/videoEmbed";
import { addClip, addFilmSession, deleteClip, deleteFilmSession } from "./actions";

function formatTimestamp(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default async function FilmStudyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase, user } = await requireUser();
  const params = await searchParams;

  const [{ data: sessionsData }, { data: clipsData }] = await Promise.all([
    supabase
      .from("film_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("session_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("film_clips")
      .select("*")
      .eq("user_id", user.id)
      .order("timestamp_seconds", { ascending: true }),
  ]);

  const sessions = sessionsData ?? [];
  const clips = clipsData ?? [];
  const clipsBySession = new Map<string, typeof clips>();
  for (const clip of clips) {
    const list = clipsBySession.get(clip.film_session_id) ?? [];
    list.push(clip);
    clipsBySession.set(clip.film_session_id, list);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Film Study</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Link game or practice film, mark timestamped notes, and build a tagged library.
        </p>
      </div>

      {params.error && (
        <p className="rounded-md border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-300">{params.error}</p>
      )}

      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h2 className="font-semibold text-white">Add a film session</h2>
        <form action={addFilmSession} className="mt-3 flex flex-wrap items-end gap-3">
          <div className="flex flex-1 min-w-[180px] flex-col">
            <label className="text-xs text-zinc-500">Title</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. vs. Lincoln HS"
              className="rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
            />
          </div>
          <div className="flex flex-1 min-w-[220px] flex-col">
            <label className="text-xs text-zinc-500">YouTube or Vimeo link</label>
            <input
              type="url"
              name="videoUrl"
              required
              placeholder="https://youtube.com/watch?v=..."
              className="rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-zinc-500">Opponent</label>
            <input
              type="text"
              name="opponent"
              placeholder="optional"
              className="w-40 rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-zinc-500">Date</label>
            <input
              type="date"
              name="sessionDate"
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-black hover:bg-emerald-500"
          >
            Add session
          </button>
        </form>
      </div>

      {sessions.length === 0 ? (
        <p className="text-sm text-zinc-600">No film sessions yet — add one above to get started.</p>
      ) : (
        <div className="space-y-6">
          {sessions.map((session) => {
            const embedUrl = toEmbedUrl(session.video_url);
            const sessionClips = clipsBySession.get(session.id) ?? [];
            return (
              <div key={session.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{session.title}</h3>
                    <p className="text-xs text-zinc-500">
                      {session.opponent ? `${session.opponent} · ` : ""}
                      {new Date(`${session.session_date}T00:00:00`).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <form action={deleteFilmSession.bind(null, session.id)}>
                    <button type="submit" className="text-xs text-zinc-600 hover:text-red-400">
                      Delete session
                    </button>
                  </form>
                </div>

                <div className="mt-3 grid gap-4 lg:grid-cols-2">
                  <div className="aspect-video w-full overflow-hidden rounded-md border border-zinc-900 bg-black">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <p className="flex h-full items-center justify-center text-sm text-zinc-600">
                        Couldn&apos;t embed this link.{" "}
                        <a href={session.video_url} target="_blank" rel="noreferrer" className="text-emerald-400 underline">
                          Open original
                        </a>
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-white">Clips</h4>
                    <div className="mt-2 space-y-2">
                      {sessionClips.length === 0 ? (
                        <p className="text-sm text-zinc-600">No clips yet.</p>
                      ) : (
                        sessionClips.map((clip) => (
                          <div
                            key={clip.id}
                            className="flex items-start justify-between rounded-md border border-zinc-900 bg-black px-3 py-2"
                          >
                            <div>
                              {embedUrl ? (
                                <a
                                  href={withTimestamp(embedUrl, clip.timestamp_seconds)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sm font-medium text-emerald-400 hover:underline"
                                >
                                  {formatTimestamp(clip.timestamp_seconds)}
                                </a>
                              ) : (
                                <span className="text-sm font-medium text-zinc-400">
                                  {formatTimestamp(clip.timestamp_seconds)}
                                </span>
                              )}
                              <p className="text-sm text-zinc-300">{clip.note}</p>
                              {clip.tag && (
                                <span className="mt-1 inline-block rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                                  {clip.tag}
                                </span>
                              )}
                            </div>
                            <form action={deleteClip.bind(null, clip.id)}>
                              <button type="submit" className="text-xs text-zinc-600 hover:text-red-400">
                                Remove
                              </button>
                            </form>
                          </div>
                        ))
                      )}
                    </div>

                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-emerald-400 hover:underline">
                        + Add a clip
                      </summary>
                      <form action={addClip} className="mt-2 flex flex-wrap items-end gap-2">
                        <input type="hidden" name="filmSessionId" value={session.id} />
                        <div className="flex flex-col">
                          <label className="text-xs text-zinc-500">Min</label>
                          <input
                            type="number"
                            name="minutes"
                            min="0"
                            className="w-16 rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs text-zinc-500">Sec</label>
                          <input
                            type="number"
                            name="seconds"
                            min="0"
                            max="59"
                            className="w-16 rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
                          />
                        </div>
                        <div className="flex flex-1 min-w-[140px] flex-col">
                          <label className="text-xs text-zinc-500">Note</label>
                          <input
                            type="text"
                            name="note"
                            required
                            className="rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs text-zinc-500">Tag</label>
                          <input
                            type="text"
                            name="tag"
                            placeholder="optional"
                            className="w-28 rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
                          />
                        </div>
                        <button
                          type="submit"
                          className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-white hover:bg-zinc-900"
                        >
                          Add
                        </button>
                      </form>
                    </details>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
