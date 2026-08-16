"use client";

import { useState, useTransition } from "react";
import type { Database } from "@/lib/supabase/types";
import { ExerciseSelector, type StagedItem } from "../ExerciseSelector";
import { createTemplate } from "./actions";

type Exercise = Database["public"]["Tables"]["exercises"]["Row"];

export function TemplateBuilder({ exercises }: { exercises: Exercise[] }) {
  const [name, setName] = useState("");
  const [staged, setStaged] = useState<(StagedItem & { name: string })[]>([]);
  const [isPending, startTransition] = useTransition();

  const exerciseById = new Map(exercises.map((e) => [e.id, e]));

  function handleStage(items: StagedItem[]) {
    setStaged((prev) => [
      ...prev,
      ...items.map((item) => ({ ...item, name: exerciseById.get(item.exerciseId)?.name ?? "Unknown" })),
    ]);
  }

  function removeStaged(exerciseId: string) {
    setStaged((prev) => prev.filter((item) => item.exerciseId !== exerciseId));
  }

  function submit() {
    if (!name.trim() || staged.length === 0) return;
    startTransition(() => {
      createTemplate(
        name,
        staged.map(({ exerciseId, supersetGroup }) => ({ exerciseId, supersetGroup })),
      );
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-300">Template name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Upper body strength"
          className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
        />
      </div>

      {staged.length > 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <h2 className="text-sm font-medium text-zinc-300">Exercises in this template</h2>
          <ul className="mt-2 space-y-1">
            {staged.map((item, index) => (
              <li
                key={`${item.exerciseId}-${index}`}
                className="flex items-center justify-between rounded-md border border-zinc-800 px-3 py-1.5 text-sm"
              >
                <span className="text-zinc-200">
                  {item.name}
                  {item.supersetGroup && (
                    <span className="ml-2 rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs text-emerald-400">
                      superset
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => removeStaged(item.exerciseId)}
                  className="text-xs text-zinc-500 hover:text-red-400"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ExerciseSelector exercises={exercises} onStage={handleStage} buttonLabel="Add" />

      <button
        type="button"
        disabled={!name.trim() || staged.length === 0 || isPending}
        onClick={submit}
        className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending ? "Creating..." : "Create template"}
      </button>
    </div>
  );
}
