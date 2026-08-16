"use client";

import { useState, useTransition } from "react";
import { SPLIT_OPTIONS, type SplitType } from "@/lib/templateGenerator";
import { generateTemplate } from "../actions";

const EQUIPMENT_OPTIONS = ["Barbell", "Dumbbell", "Machines", "Cable", "Kettlebell", "Bands", "Bodyweight only"];

export function AiTemplateBuilder({ initialEquipment }: { initialEquipment: string[] }) {
  const [split, setSplit] = useState<SplitType>("Full Body");
  const [exerciseCount, setExerciseCount] = useState(6);
  const [equipment, setEquipment] = useState<string[]>(initialEquipment);
  const [isPending, startTransition] = useTransition();

  function toggleEquipment(item: string) {
    setEquipment((prev) => (prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]));
  }

  function submit() {
    startTransition(() => {
      generateTemplate({ split, exerciseCount, equipment });
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-zinc-300">What are you training?</p>
        <div className="mt-2 space-y-2">
          {SPLIT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 ${
                split === opt.value ? "border-emerald-500 bg-emerald-500/10" : "border-zinc-700 hover:border-zinc-500"
              }`}
            >
              <input
                type="radio"
                name="split"
                className="mt-1"
                checked={split === opt.value}
                onChange={() => setSplit(opt.value)}
              />
              <span>
                <span className="block text-sm font-medium text-white">{opt.value}</span>
                <span className="block text-xs text-zinc-500">{opt.description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300">
          Number of exercises: <span className="text-white">{exerciseCount}</span>
        </label>
        <input
          type="range"
          min={3}
          max={10}
          value={exerciseCount}
          onChange={(e) => setExerciseCount(Number(e.target.value))}
          className="mt-2 w-full accent-emerald-500"
        />
      </div>

      <div>
        <p className="text-sm font-medium text-zinc-300">Equipment available</p>
        <p className="text-xs text-zinc-500">Leave all unchecked to include everything.</p>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {EQUIPMENT_OPTIONS.map((item) => (
            <label key={item} className="flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" checked={equipment.includes(item)} onChange={() => toggleEquipment(item)} />
              {item}
            </label>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={isPending}
        className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
      >
        {isPending ? "Building..." : "Build my template"}
      </button>
    </div>
  );
}
