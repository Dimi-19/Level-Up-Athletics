import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { dailyIndex } from "@/lib/quoteOfDay";

type Client = SupabaseClient<Database>;
type Quote = Database["public"]["Tables"]["motivation_content"]["Row"];

export async function getTodaysQuote(supabase: Client, favoritePlayer: string | null | undefined): Promise<Quote | null> {
  const { data: quotes } = await supabase.from("motivation_content").select("*").eq("content_type", "quote");
  if (!quotes || quotes.length === 0) return null;

  const dateKey = new Date().toISOString().slice(0, 10);

  if (favoritePlayer) {
    const needle = favoritePlayer.trim().toLowerCase();
    const matches = quotes.filter((q) => q.tags.some((tag) => tag.toLowerCase() === needle));
    if (matches.length > 0) {
      return matches[dailyIndex(dateKey, matches.length)];
    }
  }

  return quotes[dailyIndex(dateKey, quotes.length)];
}
