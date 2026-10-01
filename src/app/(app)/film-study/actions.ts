"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toEmbedUrl } from "@/lib/videoEmbed";

const PATH = "/film-study";

function fail(error: { message: string }): never {
  redirect(`${PATH}?error=${encodeURIComponent(error.message)}`);
}

export async function addFilmSession(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const opponent = String(formData.get("opponent") ?? "").trim() || null;
  const sessionDate = String(formData.get("sessionDate") ?? "") || new Date().toISOString().slice(0, 10);

  if (!title) fail({ message: "Title is required." });
  if (!videoUrl || !toEmbedUrl(videoUrl)) {
    fail({ message: "Paste a valid YouTube or Vimeo link." });
  }

  const { error } = await supabase.from("film_sessions").insert({
    user_id: user.id,
    title,
    video_url: videoUrl,
    opponent,
    session_date: sessionDate,
  });

  if (error) fail(error);
  revalidatePath(PATH);
}

export async function deleteFilmSession(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("film_sessions").delete().eq("id", id);
  if (error) fail(error);
  revalidatePath(PATH);
}

export async function addClip(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const filmSessionId = String(formData.get("filmSessionId") ?? "");
  const minutes = Number(formData.get("minutes") ?? 0) || 0;
  const seconds = Number(formData.get("seconds") ?? 0) || 0;
  const note = String(formData.get("note") ?? "").trim();
  const tag = String(formData.get("tag") ?? "").trim() || null;

  if (!filmSessionId) fail({ message: "Missing film session." });
  if (!note) fail({ message: "Clip note is required." });

  const { error } = await supabase.from("film_clips").insert({
    film_session_id: filmSessionId,
    user_id: user.id,
    timestamp_seconds: minutes * 60 + seconds,
    note,
    tag,
  });

  if (error) fail(error);
  revalidatePath(PATH);
}

export async function deleteClip(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("film_clips").delete().eq("id", id);
  if (error) fail(error);
  revalidatePath(PATH);
}
