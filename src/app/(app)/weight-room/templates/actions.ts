"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { StagedItem } from "../ExerciseSelector";
import { generateTemplateExercises, type SplitType } from "@/lib/templateGenerator";

async function currentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, userId: user.id };
}

export async function createTemplate(name: string, items: StagedItem[]) {
  const { supabase, userId } = await currentUserId();
  if (!name.trim() || items.length === 0) return;

  const { data: template, error } = await supabase
    .from("workout_templates")
    .insert({ user_id: userId, name: name.trim() })
    .select("id")
    .single();

  if (error || !template) return;

  await supabase.from("template_exercises").insert(
    items.map((item, index) => ({
      template_id: template.id,
      exercise_id: item.exerciseId,
      position: index,
      superset_group: item.supersetGroup,
    })),
  );

  revalidatePath("/weight-room");
  redirect(`/weight-room/templates/${template.id}`);
}

export async function generateTemplate({
  split,
  exerciseCount,
  equipment,
}: {
  split: SplitType;
  exerciseCount: number;
  equipment: string[];
}) {
  const { supabase, userId } = await currentUserId();

  const { data: exercises } = await supabase.from("exercises").select("*");
  const picked = generateTemplateExercises({
    exercises: exercises ?? [],
    split,
    exerciseCount,
    equipment,
  });

  if (picked.length === 0) {
    redirect(
      `/weight-room/templates/new?error=${encodeURIComponent(
        "Couldn't find matching exercises — try different equipment or a different split",
      )}`,
    );
  }

  const { data: template, error } = await supabase
    .from("workout_templates")
    .insert({ user_id: userId, name: `${split} — ${picked.length} exercises` })
    .select("id")
    .single();

  if (error || !template) {
    redirect(`/weight-room/templates/new?error=${encodeURIComponent(error?.message ?? "Could not create template")}`);
  }

  await supabase.from("template_exercises").insert(
    picked.map((exercise, index) => ({
      template_id: template.id,
      exercise_id: exercise.id,
      position: index,
    })),
  );

  revalidatePath("/weight-room");
  redirect(`/weight-room/templates/${template.id}`);
}

export async function addTemplateExercises(templateId: string, items: StagedItem[]) {
  const { supabase } = await currentUserId();
  if (items.length === 0) return;

  const { data: existing } = await supabase
    .from("template_exercises")
    .select("position")
    .eq("template_id", templateId)
    .order("position", { ascending: false })
    .limit(1);

  const startPosition = (existing?.[0]?.position ?? -1) + 1;

  await supabase.from("template_exercises").insert(
    items.map((item, index) => ({
      template_id: templateId,
      exercise_id: item.exerciseId,
      position: startPosition + index,
      superset_group: item.supersetGroup,
    })),
  );

  revalidatePath(`/weight-room/templates/${templateId}`);
}

export async function removeTemplateExercise(templateId: string, templateExerciseId: string) {
  const { supabase } = await currentUserId();
  await supabase.from("template_exercises").delete().eq("id", templateExerciseId);
  revalidatePath(`/weight-room/templates/${templateId}`);
}

export async function renameTemplate(templateId: string, formData: FormData) {
  const { supabase } = await currentUserId();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await supabase.from("workout_templates").update({ name }).eq("id", templateId);
  revalidatePath(`/weight-room/templates/${templateId}`);
  revalidatePath("/weight-room");
}

export async function deleteTemplate(templateId: string) {
  const { supabase } = await currentUserId();
  await supabase.from("workout_templates").delete().eq("id", templateId);
  revalidatePath("/weight-room");
  redirect("/weight-room");
}
