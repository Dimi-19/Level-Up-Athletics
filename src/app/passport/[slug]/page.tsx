import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PassportView } from "@/components/PassportView";

export default async function PublicPassportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: passport } = await supabase
    .from("athlete_passports")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (!passport) notFound();

  return (
    <div className="min-h-screen bg-black px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <PassportView snapshot={passport.snapshot} />
        <p className="mt-6 text-center text-xs text-zinc-600">Verified by Level Up Athletics</p>
      </div>
    </div>
  );
}
