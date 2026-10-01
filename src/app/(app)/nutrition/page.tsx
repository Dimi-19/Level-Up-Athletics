import Link from "next/link";
import { requireUser } from "@/lib/auth";
import type { MealType } from "@/lib/supabase/types";
import { addFood, deleteFood, deleteMealLog, logQuickAdd, logSavedFood } from "./actions";

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snacks" },
];

function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDateLabel(date: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = shiftDate(today, -1);
  const tomorrow = shiftDate(today, 1);
  if (date === today) return "Today";
  if (date === yesterday) return "Yesterday";
  if (date === tomorrow) return "Tomorrow";
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default async function NutritionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; date?: string }>;
}) {
  const { supabase, user, profile } = await requireUser();
  const params = await searchParams;
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : new Date().toISOString().slice(0, 10);

  const [{ data: logs }, { data: foods }] = await Promise.all([
    supabase
      .from("meal_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("logged_date", date)
      .order("created_at", { ascending: true }),
    supabase.from("foods").select("*").eq("user_id", user.id).order("name", { ascending: true }),
  ]);

  const mealLogs = logs ?? [];
  const myFoods = foods ?? [];

  const totals = mealLogs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + log.protein_g,
      carbs: acc.carbs + log.carbs_g,
      fat: acc.fat + log.fat_g,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const targets = {
    calories: profile?.nutrition_calories ?? null,
    protein: profile?.nutrition_protein_g ?? null,
    carbs: profile?.nutrition_carbs_g ?? null,
    fat: profile?.nutrition_fat_g ?? null,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Nutrition</h1>
          <p className="mt-1 text-sm text-zinc-400">Log meals against your daily targets.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/nutrition?date=${shiftDate(date, -1)}`}
            className="rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            ←
          </Link>
          <span className="min-w-[120px] text-center text-sm font-medium text-white">{formatDateLabel(date)}</span>
          <Link
            href={`/nutrition?date=${shiftDate(date, 1)}`}
            className="rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            →
          </Link>
        </div>
      </div>

      {params.error && (
        <p className="rounded-md border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-300">{params.error}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-4">
        <TotalCard label="Calories" value={totals.calories} target={targets.calories} unit="" />
        <TotalCard label="Protein" value={totals.protein} target={targets.protein} unit="g" />
        <TotalCard label="Carbs" value={totals.carbs} target={targets.carbs} unit="g" />
        <TotalCard label="Fat" value={totals.fat} target={targets.fat} unit="g" />
      </div>

      {!targets.calories && (
        <p className="text-sm text-zinc-500">
          No macro targets set yet.{" "}
          <Link href="/settings" className="text-emerald-400 hover:underline">
            Set them in Settings
          </Link>{" "}
          to see progress bars.
        </p>
      )}

      <div className="space-y-6">
        {MEAL_TYPES.map((meal) => {
          const entries = mealLogs.filter((log) => log.meal_type === meal.value);
          const mealTotal = entries.reduce((sum, e) => sum + e.calories, 0);
          return (
            <div key={meal.value} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white">{meal.label}</h2>
                <span className="text-sm text-zinc-500">{mealTotal} cal</span>
              </div>

              <div className="mt-3 space-y-2">
                {entries.length === 0 ? (
                  <p className="text-sm text-zinc-600">No items logged.</p>
                ) : (
                  entries.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between rounded-md border border-zinc-900 bg-black px-3 py-2"
                    >
                      <div>
                        <p className="text-sm text-white">{log.name}</p>
                        <p className="text-xs text-zinc-500">
                          {log.calories} cal · {log.protein_g}p / {log.carbs_g}c / {log.fat_g}f
                          {log.servings !== 1 ? ` · ${log.servings}x` : ""}
                        </p>
                      </div>
                      <form action={deleteMealLog.bind(null, log.id)}>
                        <button type="submit" className="text-xs text-zinc-600 hover:text-red-400">
                          Remove
                        </button>
                      </form>
                    </div>
                  ))
                )}
              </div>

              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-emerald-400 hover:underline">+ Log food</summary>
                <div className="mt-3 space-y-4">
                  {myFoods.length > 0 && (
                    <form action={logSavedFood} className="flex flex-wrap items-end gap-2">
                      <input type="hidden" name="loggedDate" value={date} />
                      <input type="hidden" name="mealType" value={meal.value} />
                      <div className="flex flex-col">
                        <label className="text-xs text-zinc-500">Saved food</label>
                        <select
                          name="foodId"
                          required
                          className="rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
                        >
                          {myFoods.map((food) => (
                            <option key={food.id} value={food.id}>
                              {food.name} ({food.calories} cal / {food.serving_label})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-zinc-500">Servings</label>
                        <input
                          type="number"
                          name="servings"
                          step="0.25"
                          min="0.25"
                          defaultValue={1}
                          className="w-20 rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
                        />
                      </div>
                      <button
                        type="submit"
                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-black hover:bg-emerald-500"
                      >
                        Add
                      </button>
                    </form>
                  )}

                  <form action={logQuickAdd} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="loggedDate" value={date} />
                    <input type="hidden" name="mealType" value={meal.value} />
                    <div className="flex flex-col">
                      <label className="text-xs text-zinc-500">Quick add name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="e.g. Protein bar"
                        className="rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs text-zinc-500">Cal</label>
                      <input
                        type="number"
                        name="calories"
                        min="0"
                        className="w-16 rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs text-zinc-500">P</label>
                      <input
                        type="number"
                        name="proteinG"
                        min="0"
                        className="w-14 rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs text-zinc-500">C</label>
                      <input
                        type="number"
                        name="carbsG"
                        min="0"
                        className="w-14 rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs text-zinc-500">F</label>
                      <input
                        type="number"
                        name="fatG"
                        min="0"
                        className="w-14 rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-white hover:bg-zinc-900"
                    >
                      Add
                    </button>
                  </form>
                </div>
              </details>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h2 className="font-semibold text-white">My foods</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Build your own library so logging is one tap. Weight trend lives on the{" "}
          <Link href="/weight-room/progress" className="text-emerald-400 hover:underline">
            Progress tab
          </Link>
          .
        </p>

        <div className="mt-3 space-y-2">
          {myFoods.length === 0 ? (
            <p className="text-sm text-zinc-600">No foods saved yet.</p>
          ) : (
            myFoods.map((food) => (
              <div
                key={food.id}
                className="flex items-center justify-between rounded-md border border-zinc-900 bg-black px-3 py-2"
              >
                <div>
                  <p className="text-sm text-white">{food.name}</p>
                  <p className="text-xs text-zinc-500">
                    {food.calories} cal · {food.protein_g}p / {food.carbs_g}c / {food.fat_g}f per {food.serving_label}
                  </p>
                </div>
                <form action={deleteFood.bind(null, food.id)}>
                  <button type="submit" className="text-xs text-zinc-600 hover:text-red-400">
                    Delete
                  </button>
                </form>
              </div>
            ))
          )}
        </div>

        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-emerald-400 hover:underline">+ Add a food</summary>
          <form action={addFood} className="mt-3 flex flex-wrap items-end gap-2">
            <div className="flex flex-col">
              <label className="text-xs text-zinc-500">Name</label>
              <input
                type="text"
                name="name"
                required
                className="rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-zinc-500">Serving label</label>
              <input
                type="text"
                name="servingLabel"
                placeholder="1 cup"
                className="w-28 rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-zinc-500">Cal</label>
              <input
                type="number"
                name="calories"
                min="0"
                className="w-16 rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-zinc-500">P</label>
              <input
                type="number"
                name="proteinG"
                min="0"
                className="w-14 rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-zinc-500">C</label>
              <input
                type="number"
                name="carbsG"
                min="0"
                className="w-14 rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-zinc-500">F</label>
              <input
                type="number"
                name="fatG"
                min="0"
                className="w-14 rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-black hover:bg-emerald-500"
            >
              Save food
            </button>
          </form>
        </details>
      </div>
    </div>
  );
}

function TotalCard({ label, value, target, unit }: { label: string; value: number; target: number | null; unit: string }) {
  const pct = target ? Math.min(100, Math.round((value / target) * 100)) : null;
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-xs uppercase text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-white">
        {value}
        {unit}
        {target ? <span className="text-sm font-normal text-zinc-500"> / {target}{unit}</span> : null}
      </p>
      {pct != null && (
        <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-900">
          <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
