import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, WeightUnit } from "@/lib/supabase/types";
import { kgToLb } from "@/lib/units";
import { LineChart } from "./LineChart";
import { logBodyMetric, deleteBodyMetric } from "./body/actions";

export async function BodyTracking({
  supabase,
  userId,
  unitsWeight,
}: {
  supabase: SupabaseClient<Database>;
  userId: string;
  unitsWeight: WeightUnit;
}) {
  const { data: entries } = await supabase
    .from("body_metrics")
    .select("*")
    .eq("user_id", userId)
    .order("recorded_at", { ascending: true });

  const rows = entries ?? [];

  const weightPoints = rows
    .filter((r) => r.weight_kg != null)
    .map((r) => ({
      date: r.recorded_at,
      value: unitsWeight === "lb" ? kgToLb(r.weight_kg!) : r.weight_kg!,
    }));

  const bodyFatPoints = rows
    .filter((r) => r.body_fat_pct != null)
    .map((r) => ({ date: r.recorded_at, value: r.body_fat_pct! }));

  const todayKey = new Date().toISOString().slice(0, 10);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-semibold text-white">Body tracking</h2>
        <p className="mt-1 text-xs text-zinc-500">One entry per day — logging again today updates it.</p>
      </div>

      <form action={logBodyMetric} className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300">Date</label>
          <input
            type="date"
            name="recordedAt"
            defaultValue={todayKey}
            max={todayKey}
            className="mt-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300">Weight ({unitsWeight})</label>
          <input
            type="number"
            step="0.1"
            name="weight"
            className="mt-1 w-24 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300">Body fat (%)</label>
          <input
            type="number"
            step="0.1"
            name="bodyFatPct"
            className="mt-1 w-24 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
        >
          Log
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm text-zinc-400">Weight ({unitsWeight})</p>
          <div className="mt-2">
            <LineChart data={weightPoints} unit={unitsWeight} color="#10b981" />
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm text-zinc-400">Body fat (%)</p>
          <div className="mt-2">
            <LineChart data={bodyFatPoints} unit="%" color="#60a5fa" />
          </div>
        </div>
      </div>

      {rows.length > 0 && (
        <details className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <summary className="cursor-pointer text-sm text-zinc-400">View as table ({rows.length} entries)</summary>
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-zinc-500">
                <th className="pb-1">Date</th>
                <th className="pb-1">Weight ({unitsWeight})</th>
                <th className="pb-1">Body fat</th>
                <th className="pb-1"></th>
              </tr>
            </thead>
            <tbody>
              {[...rows].reverse().map((row) => (
                <tr key={row.id} className="border-t border-zinc-900">
                  <td className="py-1.5 text-zinc-300">{row.recorded_at}</td>
                  <td className="py-1.5 text-zinc-300">
                    {row.weight_kg != null
                      ? Math.round((unitsWeight === "lb" ? kgToLb(row.weight_kg) : row.weight_kg) * 10) / 10
                      : "-"}
                  </td>
                  <td className="py-1.5 text-zinc-300">{row.body_fat_pct != null ? `${row.body_fat_pct}%` : "-"}</td>
                  <td className="py-1.5 text-right">
                    <form action={deleteBodyMetric.bind(null, row.id)}>
                      <button type="submit" className="text-xs text-zinc-500 hover:text-red-400">
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </section>
  );
}
