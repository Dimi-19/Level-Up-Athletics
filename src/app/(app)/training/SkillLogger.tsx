"use client";

import { useMemo, useState } from "react";
import type { SkillCategory } from "@/lib/supabase/types";
import { logSkill } from "./actions";

export interface SkillOption {
  id: string;
  sport: string;
  name: string;
  category: SkillCategory;
  unit_label: string;
}

const CATEGORY_HELP: Record<SkillCategory, string> = {
  reps: "Count",
  timed: "Seconds (lower is better)",
  rating: "Self-rating, 1-10",
  binary: "1 = pass, 0 = fail",
  notes: "No number — just notes",
};

export function SkillLogger({ skills, defaultSport }: { skills: SkillOption[]; defaultSport: string | null }) {
  const sports = useMemo(() => Array.from(new Set(skills.map((s) => s.sport))).sort(), [skills]);
  const initialSport =
    (defaultSport && sports.find((s) => s.toLowerCase() === defaultSport.toLowerCase())) || sports[0] || "General";

  const [sport, setSport] = useState(initialSport);
  const sportSkills = useMemo(() => skills.filter((s) => s.sport === sport), [skills, sport]);
  const [skillId, setSkillId] = useState(sportSkills[0]?.id ?? "");

  const selected = skills.find((s) => s.id === skillId) ?? sportSkills[0];

  function handleSportChange(next: string) {
    setSport(next);
    const firstInSport = skills.find((s) => s.sport === next);
    setSkillId(firstInSport?.id ?? "");
  }

  return (
    <form action={logSkill} className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <h2 className="font-semibold text-white">Log a skill</h2>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col">
          <label className="text-xs text-zinc-500">Sport</label>
          <select
            value={sport}
            onChange={(e) => handleSportChange(e.target.value)}
            className="rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
          >
            {sports.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-zinc-500">Skill</label>
          <select
            name="skillId"
            value={skillId}
            onChange={(e) => setSkillId(e.target.value)}
            className="min-w-[220px] rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
          >
            {sportSkills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-zinc-500">Date</label>
          <input
            type="date"
            name="loggedDate"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
          />
        </div>

        {selected?.category === "reps" && (
          <div className="flex flex-col">
            <label className="text-xs text-zinc-500">Value ({selected.unit_label || "count"})</label>
            <input
              type="number"
              name="value"
              step="0.1"
              className="w-28 rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
            />
          </div>
        )}

        {selected?.category === "timed" && (
          <div className="flex flex-col">
            <label className="text-xs text-zinc-500">Time (seconds)</label>
            <input
              type="number"
              name="value"
              step="0.01"
              className="w-28 rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
            />
          </div>
        )}

        {selected?.category === "rating" && (
          <div className="flex flex-col">
            <label className="text-xs text-zinc-500">Rating (1-10)</label>
            <select
              name="value"
              className="rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        )}

        {selected?.category === "binary" && (
          <div className="flex flex-col">
            <label className="text-xs text-zinc-500">Result</label>
            <select
              name="value"
              className="rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
            >
              <option value="1">Pass</option>
              <option value="0">Fail</option>
            </select>
          </div>
        )}

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
          Log
        </button>
      </div>
      {selected && <p className="text-xs text-zinc-600">{CATEGORY_HELP[selected.category]}</p>}
    </form>
  );
}
