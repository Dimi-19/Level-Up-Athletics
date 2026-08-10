"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const sport = String(formData.get("sport") ?? "").trim();
  const position = String(formData.get("position") ?? "").trim();
  const favoritePlayer = String(formData.get("favoritePlayer") ?? "").trim();
  const favoriteTeam = String(formData.get("favoriteTeam") ?? "").trim();
  const shoeRotationRaw = String(formData.get("shoeRotation") ?? "");
  const shoeRotation = shoeRotationRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!fullName) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      sport: sport || null,
      position: position || null,
      favorite_player: favoritePlayer || null,
      favorite_team: favoriteTeam || null,
      shoe_rotation: shoeRotation,
    })
    .eq("id", user.id);

  revalidatePath("/profile");
}
