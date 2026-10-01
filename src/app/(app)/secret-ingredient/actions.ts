"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildPassportSnapshot, generateSlug } from "@/lib/passport";

const PATH = "/secret-ingredient";

function fail(error: { message: string }): never {
  redirect(`${PATH}?error=${encodeURIComponent(error.message)}`);
}

export async function generateOrRefreshPassport() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("athlete_passports")
    .select("slug")
    .eq("user_id", user.id)
    .maybeSingle();

  const snapshot = await buildPassportSnapshot(supabase, user.id);
  const slug = existing?.slug ?? generateSlug();

  const { error } = await supabase.from("athlete_passports").upsert(
    {
      user_id: user.id,
      slug,
      snapshot,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) fail(error);
  revalidatePath(PATH);
}

export async function setPassportVisibility(isPublic: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("athlete_passports").update({ is_public: isPublic }).eq("user_id", user.id);
  if (error) fail(error);
  revalidatePath(PATH);
}
