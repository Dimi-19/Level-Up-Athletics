"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SkillCategory } from "@/lib/supabase/types";

const PATH = "/training";

function fail(error: { message: string }): never {
  redirect(`${PATH}?error=${encodeURIComponent(error.message)}`);
}

export async function addSkill(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sport = String(formData.get("sport") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "") as SkillCategory;
  const unitLabel = String(formData.get("unitLabel") ?? "").trim();

  if (!sport || !name) fail({ message: "Sport and skill name are required." });

  const { error } = await supabase.from("skills").insert({
    sport,
    name,
    category,
    unit_label: unitLabel,
    created_by: user.id,
  });

  if (error) fail(error);
  revalidatePath(PATH);
}

export async function deleteSkill(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("skills").delete().eq("id", id);
  if (error) fail(error);
  revalidatePath(PATH);
}

export async function logSkill(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const skillId = String(formData.get("skillId") ?? "");
  const loggedDate = String(formData.get("loggedDate") ?? "") || new Date().toISOString().slice(0, 10);
  const valueRaw = String(formData.get("value") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!skillId) fail({ message: "Pick a skill to log." });

  const value = valueRaw ? Number(valueRaw) : null;

  const { error } = await supabase.from("skill_logs").insert({
    user_id: user.id,
    skill_id: skillId,
    logged_date: loggedDate,
    value,
    notes,
  });

  if (error) fail(error);
  revalidatePath(PATH);
}

export async function deleteSkillLog(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("skill_logs").delete().eq("id", id);
  if (error) fail(error);
  revalidatePath(PATH);
}
