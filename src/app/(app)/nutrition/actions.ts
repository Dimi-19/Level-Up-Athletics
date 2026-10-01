"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { MealType } from "@/lib/supabase/types";

const PATH = "/nutrition";

function fail(error: { message: string }): never {
  redirect(`${PATH}?error=${encodeURIComponent(error.message)}`);
}

export async function addFood(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) fail({ message: "Food name is required." });

  const servingLabel = String(formData.get("servingLabel") ?? "").trim() || "serving";
  const calories = Number(formData.get("calories") ?? 0) || 0;
  const proteinG = Number(formData.get("proteinG") ?? 0) || 0;
  const carbsG = Number(formData.get("carbsG") ?? 0) || 0;
  const fatG = Number(formData.get("fatG") ?? 0) || 0;

  const { error } = await supabase.from("foods").insert({
    user_id: user.id,
    name,
    serving_label: servingLabel,
    calories,
    protein_g: proteinG,
    carbs_g: carbsG,
    fat_g: fatG,
  });

  if (error) fail(error);
  revalidatePath(PATH);
}

export async function deleteFood(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("foods").delete().eq("id", id);
  if (error) fail(error);
  revalidatePath(PATH);
}

export async function logSavedFood(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const foodId = String(formData.get("foodId") ?? "");
  const loggedDate = String(formData.get("loggedDate") ?? "") || new Date().toISOString().slice(0, 10);
  const mealType = String(formData.get("mealType") ?? "") as MealType;
  const servings = Number(formData.get("servings") ?? 1) || 1;

  if (!foodId) fail({ message: "Pick a food to log." });

  const { data: food, error: foodError } = await supabase
    .from("foods")
    .select("name, calories, protein_g, carbs_g, fat_g")
    .eq("id", foodId)
    .single();

  if (foodError || !food) fail(foodError ?? { message: "Food not found." });

  const { error } = await supabase.from("meal_logs").insert({
    user_id: user.id,
    food_id: foodId,
    logged_date: loggedDate,
    meal_type: mealType,
    name: food.name,
    servings,
    calories: Math.round(food.calories * servings),
    protein_g: Math.round(food.protein_g * servings),
    carbs_g: Math.round(food.carbs_g * servings),
    fat_g: Math.round(food.fat_g * servings),
  });

  if (error) fail(error);
  revalidatePath(PATH);
}

export async function logQuickAdd(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) fail({ message: "Food name is required." });

  const loggedDate = String(formData.get("loggedDate") ?? "") || new Date().toISOString().slice(0, 10);
  const mealType = String(formData.get("mealType") ?? "") as MealType;
  const calories = Number(formData.get("calories") ?? 0) || 0;
  const proteinG = Number(formData.get("proteinG") ?? 0) || 0;
  const carbsG = Number(formData.get("carbsG") ?? 0) || 0;
  const fatG = Number(formData.get("fatG") ?? 0) || 0;

  const { error } = await supabase.from("meal_logs").insert({
    user_id: user.id,
    food_id: null,
    logged_date: loggedDate,
    meal_type: mealType,
    name,
    servings: 1,
    calories,
    protein_g: proteinG,
    carbs_g: carbsG,
    fat_g: fatG,
  });

  if (error) fail(error);
  revalidatePath(PATH);
}

export async function deleteMealLog(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("meal_logs").delete().eq("id", id);
  if (error) fail(error);
  revalidatePath(PATH);
}
