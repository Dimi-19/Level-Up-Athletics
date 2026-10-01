import { requireUser } from "@/lib/auth";
import { kmToMi } from "@/lib/units";
import { LineChart, type LineChartPoint } from "../weight-room/LineChart";
import { deleteRun, logRun } from "./actions";

const STANDARD_DISTANCES_KM = [
  { label: "1 mi", km: 1.60934, tolerancePct: 0.03 },
  { label: "5K", km: 5, tolerancePct: 0.05 },
  { label: "10K", km: 10, tolerancePct: 0.05 },
  { label: "Half Marathon", km: 21.0975, tolerancePct: 0.03 },
  { label: "Marathon", km: 42.195, tolerancePct: 0.02 },
];

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatPace(secondsPerUnit: number): string {
  const m = Math.floor(secondsPerUnit / 60);
  const s = Math.round(secondsPerUnit % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default async function RunningPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase, user, profile } = await requireUser();
  const params = await searchParams;
  const unit = profile?.units_distance === "mi" ? "mi" : "km";

  const { data: runsData } = await supabase
    .from("runs")
    .select("*")
    .eq("user_id", user.id)
    .order("run_date", { ascending: false })
    .order("created_at", { ascending: false });

  const runs = runsData ?? [];

  const toDisplayDistance = (km: number) => (unit === "mi" ? kmToMi(km) : km);
  const paceSecondsPerUnit = (durationSeconds: number, distanceKm: number) =>
    durationSeconds / toDisplayDistance(distanceKm);

  const chronological = [...runs].reverse();
  const paceSeries: LineChartPoint[] = chronological.map((r) => ({
    date: r.run_date,
    value: Math.round(paceSecondsPerUnit(r.duration_seconds, r.distance_km)),
  }));
  const distanceSeries: LineChartPoint[] = chronological.map((r) => ({
    date: r.run_date,
    value: Math.round(toDisplayDistance(r.distance_km) * 100) / 100,
  }));

  const personalRecords = STANDARD_DISTANCES_KM.map((std) => {
    const matches = runs.filter((r) => Math.abs(r.distance_km - std.km) / std.km <= std.tolerancePct);
    if (matches.length === 0) return { ...std, best: null as (typeof runs)[number] | null };
    const best = matches.reduce((fastest, r) =>
      r.duration_seconds / r.distance_km < fastest.duration_seconds / fastest.distance_km ? r : fastest,
    );
    return { ...std, best };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Running</h1>
        <p className="mt-1 text-sm text-zinc-400">Log runs manually and track pace and distance over time.</p>
      </div>

      {params.error && (
        <p className="rounded-md border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-300">{params.error}</p>
      )}

      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h2 className="font-semibold text-white">Log a run</h2>
        <form action={logRun} className="mt-3 flex flex-wrap items-end gap-3">
          <div className="flex flex-col">
            <label className="text-xs text-zinc-500">Date</label>
            <input
              type="date"
              name="runDate"
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-zinc-500">Distance ({unit})</label>
            <input
              type="number"
              name="distance"
              step="0.01"
              min="0"
              required
              className="w-24 rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-zinc-500">Minutes</label>
            <input
              type="number"
              name="minutes"
              min="0"
              className="w-20 rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-zinc-500">Seconds</label>
            <input
              type="number"
              name="seconds"
              min="0"
              max="59"
              className="w-20 rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-zinc-500">RPE (1-10)</label>
            <input
              type="number"
              name="rpe"
              min="1"
              max="10"
              className="w-20 rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-zinc-500">Shoe</label>
            <input
              type="text"
              name="shoe"
              placeholder="optional"
              className="w-32 rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
            />
          </div>
          <div className="flex flex-1 min-w-[160px] flex-col">
            <label className="text-xs text-zinc-500">Notes</label>
            <input
              type="text"
              name="notes"
              placeholder="optional"
              className="rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-black hover:bg-emerald-500"
          >
            Log run
          </button>
        </form>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <h2 className="font-semibold text-white">Pace trend</h2>
          <p className="mb-2 text-xs text-zinc-500">min/{unit}, lower is faster</p>
          <LineChart data={paceSeries} unit="" color="#10b981" />
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <h2 className="font-semibold text-white">Distance trend</h2>
          <p className="mb-2 text-xs text-zinc-500">{unit} per run</p>
          <LineChart data={distanceSeries} unit={unit} color="#38bdf8" />
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h2 className="font-semibold text-white">Personal records</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {personalRecords.map((pr) => (
            <div key={pr.label} className="rounded-md border border-zinc-900 bg-black p-3">
              <p className="text-xs uppercase text-zinc-500">{pr.label}</p>
              {pr.best ? (
                <>
                  <p className="mt-1 text-lg font-bold text-white">{formatDuration(pr.best.duration_seconds)}</p>
                  <p className="text-xs text-zinc-500">
                    {formatPace(paceSecondsPerUnit(pr.best.duration_seconds, pr.best.distance_km))}/{unit} pace
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-zinc-600">No run yet</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h2 className="font-semibold text-white">History</h2>
        <div className="mt-3 space-y-2">
          {runs.length === 0 ? (
            <p className="text-sm text-zinc-600">No runs logged yet.</p>
          ) : (
            runs.map((run) => (
              <div
                key={run.id}
                className="flex items-center justify-between rounded-md border border-zinc-900 bg-black px-3 py-2"
              >
                <div>
                  <p className="text-sm text-white">
                    {toDisplayDistance(run.distance_km).toFixed(2)} {unit} in {formatDuration(run.duration_seconds)}{" "}
                    <span className="text-zinc-500">
                      ({formatPace(paceSecondsPerUnit(run.duration_seconds, run.distance_km))}/{unit})
                    </span>
                  </p>
                  <p className="text-xs text-zinc-500">
                    {new Date(`${run.run_date}T00:00:00`).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {run.rpe ? ` · RPE ${run.rpe}` : ""}
                    {run.shoe ? ` · ${run.shoe}` : ""}
                    {run.notes ? ` · ${run.notes}` : ""}
                  </p>
                </div>
                <form action={deleteRun.bind(null, run.id)}>
                  <button type="submit" className="text-xs text-zinc-600 hover:text-red-400">
                    Remove
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
