import { requireUser } from "@/lib/auth";
import { PassportView } from "@/components/PassportView";
import { generateOrRefreshPassport, setPassportVisibility } from "./actions";

export default async function SecretIngredientPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase, user } = await requireUser();
  const params = await searchParams;

  const { data: passport } = await supabase
    .from("athlete_passports")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const shareUrl = passport ? `/passport/${passport.slug}` : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">The Secret Ingredient</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Your Verified Athlete Passport — a shareable, read-only summary of your real logged activity.
        </p>
      </div>

      {params.error && (
        <p className="rounded-md border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-300">{params.error}</p>
      )}

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <form action={generateOrRefreshPassport}>
          <button
            type="submit"
            className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-black hover:bg-emerald-500"
          >
            {passport ? "Refresh passport" : "Generate my passport"}
          </button>
        </form>

        {passport && (
          <form action={setPassportVisibility.bind(null, !passport.is_public)}>
            <button
              type="submit"
              className="rounded-md border border-zinc-700 px-4 py-1.5 text-sm text-white hover:bg-zinc-900"
            >
              {passport.is_public ? "Make private" : "Make public"}
            </button>
          </form>
        )}

        {passport?.is_public && shareUrl && (
          <span className="text-sm text-zinc-400">
            Share link: <code className="text-emerald-400">{shareUrl}</code>
          </span>
        )}
      </div>

      {passport ? (
        <PassportView snapshot={passport.snapshot} />
      ) : (
        <p className="text-sm text-zinc-600">
          Generate your passport to see a snapshot of your weight room rank, PRs, skills, and badges — then make it
          public to get a shareable link.
        </p>
      )}

      <p className="text-xs text-zinc-600">
        Ghost Rep replays, Season Story recaps, and weakness-matching are planned as research &amp; development —
        not available yet.
      </p>
    </div>
  );
}
