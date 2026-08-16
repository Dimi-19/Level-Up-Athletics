"use client";

import { useMemo, useState } from "react";
import type { Database } from "@/lib/supabase/types";
import { MUSCLE_GROUPS } from "@/lib/muscleGroups";

type Exercise = Database["public"]["Tables"]["exercises"]["Row"];

export type StagedItem = { exerciseId: string; supersetGroup: number | null };

export function ExerciseSelector({
  exercises,
  onStage,
  buttonLabel = "Add",
}: {
  exercises: Exercise[];
  onStage: (items: StagedItem[]) => void;
  buttonLabel?: string;
}) {
  const [muscleGroup, setMuscleGroup] = useState<string>("All");
  const [equipment, setEquipment] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const equipmentOptions = useMemo(() => {
    const set = new Set(exercises.map((e) => e.equipment));
    return Array.from(set).sort();
  }, [exercises]);

  const filtered = useMemo(() => {
    return exercises.filter((e) => {
      if (muscleGroup !== "All" && e.muscle_group !== muscleGroup) return false;
      if (equipment !== "All" && e.equipment !== equipment) return false;
      if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [exercises, muscleGroup, equipment, search]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function stage(asSuperset: boolean) {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const supersetGroup = asSuperset ? Date.now() : null;
    onStage(ids.map((exerciseId) => ({ exerciseId, supersetGroup })));
    setSelected(new Set());
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[10rem] flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-white outline-none focus:border-emerald-500"
        />
        <select
          value={muscleGroup}
          onChange={(e) => setMuscleGroup(e.target.value)}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-white"
        >
          <option value="All">All muscle groups</option>
          {MUSCLE_GROUPS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <select
          value={equipment}
          onChange={(e) => setEquipment(e.target.value)}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-white"
        >
          <option value="All">All equipment</option>
          {equipmentOptions.map((eq) => (
            <option key={eq} value={eq}>
              {eq}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 max-h-72 overflow-y-auto rounded-md border border-zinc-800">
        {filtered.map((exercise) => (
          <label
            key={exercise.id}
            className="flex cursor-pointer items-center justify-between gap-2 border-b border-zinc-900 px-3 py-2 text-sm last:border-b-0 hover:bg-zinc-900"
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selected.has(exercise.id)}
                onChange={() => toggle(exercise.id)}
              />
              <span className="text-zinc-200">{exercise.name}</span>
            </div>
            <span className="text-xs text-zinc-500">{exercise.equipment}</span>
          </label>
        ))}
        {filtered.length === 0 && (
          <p className="px-3 py-4 text-center text-sm text-zinc-500">No exercises match.</p>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-zinc-500">{selected.size} selected</span>
        <button
          type="button"
          disabled={selected.size === 0}
          onClick={() => stage(false)}
          className="rounded-md border border-zinc-600 px-3 py-1.5 text-sm text-white hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {buttonLabel} individually
        </button>
        <button
          type="button"
          disabled={selected.size < 2}
          onClick={() => stage(true)}
          className="rounded-md border border-zinc-600 px-3 py-1.5 text-sm text-white hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {buttonLabel} as superset
        </button>
      </div>
    </div>
  );
}
