import { requireUser } from "@/lib/auth";
import { getTodaysQuote } from "@/lib/motivation";

export default async function MotivationPage() {
  const { supabase, profile } = await requireUser();

  const [todaysQuote, { data: quotes }, { data: videos }, { data: podcasts }] = await Promise.all([
    getTodaysQuote(supabase, profile?.favorite_player),
    supabase.from("motivation_content").select("*").eq("content_type", "quote").order("author"),
    supabase.from("motivation_content").select("*").eq("content_type", "video").order("created_at"),
    supabase.from("motivation_content").select("*").eq("content_type", "podcast").order("created_at"),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Motivation</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Something short before you train — not another feed to scroll.
        </p>
      </div>

      {todaysQuote && (
        <section className="rounded-lg border border-emerald-800 bg-emerald-950/40 p-6">
          <p className="text-lg italic text-zinc-100">&ldquo;{todaysQuote.body}&rdquo;</p>
          {todaysQuote.author && <p className="mt-2 text-sm text-emerald-400">— {todaysQuote.author}</p>}
        </section>
      )}

      <section>
        <h2 className="font-semibold text-white">Quotes</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {(quotes ?? []).map((quote) => (
            <li key={quote.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm italic text-zinc-200">&ldquo;{quote.body}&rdquo;</p>
              {quote.author && <p className="mt-2 text-xs text-zinc-500">— {quote.author}</p>}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-semibold text-white">Videos</h2>
        {(videos ?? []).length > 0 ? (
          <ul className="mt-3 space-y-2">
            {(videos ?? []).map((video) => (
              <li key={video.id}>
                <a
                  href={video.url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm text-emerald-400 hover:border-zinc-600"
                >
                  {video.body ?? video.url}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">No videos added yet.</p>
        )}
      </section>

      <section>
        <h2 className="font-semibold text-white">Podcasts</h2>
        {(podcasts ?? []).length > 0 ? (
          <ul className="mt-3 space-y-2">
            {(podcasts ?? []).map((podcast) => (
              <li key={podcast.id}>
                <a
                  href={podcast.url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm text-emerald-400 hover:border-zinc-600"
                >
                  {podcast.body ?? podcast.url}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">No podcasts added yet.</p>
        )}
      </section>
    </div>
  );
}
