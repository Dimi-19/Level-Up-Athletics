"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { StagedItem } from "../ExerciseSelector";
import type { SetType } from "@/lib/supabase/types";

async function currentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, userId: user.id };
}

export async function startSessionFromTemplate(templateId: string) {
  const { supabase, userId } = await currentUserId();

  const { data: session, error } = await supabase
    .from("workout_sessions")
    .insert({ user_id: userId, template_id: templateId })
    .select("id")
    .single();
  if (error || !session) return;

  const { data: templateExercises } = await supabase
    .from("template_exercises")
    .select("exercise_id, position, superset_group")
    .eq("template_id", templateId)
    .order("position", { ascending: true });

  if (templateExercises && templateExercises.length > 0) {
    await supabase.from("session_exercises").insert(
      templateExercises.map((te) => ({
        session_id: session.id,
        exercise_id: te.exercise_id,
        position: te.position,
        superset_group: te.superset_group,
      })),
    );
  }

  redirect(`/weight-room/session/${session.id}`);
}

export async function startFreeformSession() {
  const { supabase, userId } = await currentUserId();

  const { data: session, error } = await supabase
    .from("workout_sessions")
    .insert({ user_id: userId })
    .select("id")
    .single();
  if (error || !session) return;

  redirect(`/weight-room/session/${session.id}`);
}

export async function repeatLastWorkout() {
  const { supabase, userId } = await currentUserId();

  const { data: lastSession } = await supabase
    .from("workout_sessions")
    .select("id, template_id")
    .eq("user_id", userId)
    .not("ended_at", "is", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lastSession) {
    redirect("/weight-room");
  }

  const { data: session, error } = await supabase
    .from("workout_sessions")
    .insert({ user_id: userId, template_id: lastSession.template_id })
    .select("id")
    .single();
  if (error || !session) redirect("/weight-room");

  const { data: lastExercises } = await supabase
    .from("session_exercises")
    .select("exercise_id, position, superset_group")
    .eq("session_id", lastSession.id)
    .order("position", { ascending: true });

  if (lastExercises && lastExercises.length > 0) {
    await supabase.from("session_exercises").insert(
      lastExercises.map((se) => ({
        session_id: session.id,
        exercise_id: se.exercise_id,
        position: se.position,
        superset_group: se.superset_group,
      })),
    );
  }

  redirect(`/weight-room/session/${session.id}`);
}

export async function addExercisesToSession(sessionId: string, items: StagedItem[]) {
  const { supabase } = await currentUserId();
  if (items.length === 0) return;

  const { data: existing } = await supabase
    .from("session_exercises")
    .select("position")
    .eq("session_id", sessionId)
    .order("position", { ascending: false })
    .limit(1);

  const startPosition = (existing?.[0]?.position ?? -1) + 1;

  await supabase.from("session_exercises").insert(
    items.map((item, index) => ({
      session_id: sessionId,
      exercise_id: item.exerciseId,
      position: startPosition + index,
      superset_group: item.supersetGroup,
    })),
  );

  revalidatePath(`/weight-room/session/${sessionId}`);
}

export async function addSet(sessionId: string, sessionExerciseId: string, setNumber: number) {
  const { supabase } = await currentUserId();
  await supabase.from("session_sets").insert({
    session_exercise_id: sessionExerciseId,
    set_number: setNumber,
  });
  revalidatePath(`/weight-room/session/${sessionId}`);
}

export async function confirmSet(sessionId: string, setId: string, weight: number | null, reps: number | null) {
  const { supabase } = await currentUserId();
  await supabase
    .from("session_sets")
    .update({ weight, reps, is_confirmed: true })
    .eq("id", setId);
  revalidatePath(`/weight-room/session/${sessionId}`);
}

export async function cycleSetType(sessionId: string, setId: string, setType: SetType) {
  const { supabase } = await currentUserId();
  await supabase.from("session_sets").update({ set_type: setType }).eq("id", setId);
  revalidatePath(`/weight-room/session/${sessionId}`);
}

export async function deleteSet(sessionId: string, setId: string) {
  const { supabase } = await currentUserId();
  await supabase.from("session_sets").delete().eq("id", setId);
  revalidatePath(`/weight-room/session/${sessionId}`);
}

export async function endSession(sessionId: string) {
  const { supabase } = await currentUserId();
  await supabase.from("workout_sessions").update({ ended_at: new Date().toISOString() }).eq("id", sessionId);
  revalidatePath("/weight-room");
  redirect("/weight-room");
}
