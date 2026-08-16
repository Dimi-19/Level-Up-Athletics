"use client";

import { useEffect, useState, useTransition } from "react";
import type { Database, SetType } from "@/lib/supabase/types";
import { addSet, confirmSet, cycleSetType, deleteSet, endSession } from "../actions";
import { AddExercisesToSession } from "./AddExercisesToSession";

type Exercise = Database["public"]["Tables"]["exercises"]["Row"];

export type ExerciseWithSets = {
  sessionExerciseId: string;
  exerciseId: string;
  name: string;
  supersetGroup: number | null;
  previous: { weight: number | null; reps: number | null } | null;
  sets: {
    id: string;
    setNumber: number;
    weight: number | null;
    reps: number | null;
    setType: SetType;
    isConfirmed: boolean;
  }[];
};

const SET_TYPE_ORDER: SetType[] = ["normal", "warmup", "failure", "dropset"];
const SET_TYPE_LABEL: Record<SetType, string> = {
  normal: "",
  warmup: "W",
  failure: "F",
  dropset: "DP",
};
const SET_TYPE_CLASSES: Record<SetType, { badge: string; row: string }> = {
  normal: { badge: "bg-zinc-800 text-zinc-300", row: "" },
  warmup: { badge: "bg-orange-500/20 text-orange-400", row: "bg-orange-500/5" },
  failure: { badge: "bg-red-500/20 text-red-400", row: "bg-red-500/5" },
  dropset: { badge: "bg-blue-500/20 text-blue-400", row: "bg-blue-500/5" },
};

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

const REST_DURATION_MS = 90_000;

export function ActiveSession({
  sessionId,
  startedAt,
  initialExercises,
  allExercises,
}: {
  sessionId: string;
  startedAt: string;
  initialExercises: ExerciseWithSets[];
  allExercises: Exercise[];
}) {
  const [now, setNow] = useState(0);
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null);
  const [draftValues, setDraftValues] = useState<Record<string, { weight: string; reps: string }>>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    const timeout = setTimeout(() => setNow(Date.now()), 0);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const elapsedMs = now - new Date(startedAt).getTime();
  const restRemainingMs = restEndsAt ? restEndsAt - now : 0;

  function getDraft(setId: string) {
    return draftValues[setId] ?? { weight: "", reps: "" };
  }

  function updateDraft(setId: string, field: "weight" | "reps", value: string) {
    setDraftValues((prev) => ({ ...prev, [setId]: { ...getDraft(setId), [field]: value } }));
  }

  function handleAddSet(sessionExerciseId: string, sets: ExerciseWithSets["sets"]) {
    const nextSetNumber = sets.length > 0 ? Math.max(...sets.map((s) => s.setNumber)) + 1 : 1;
    startTransition(() => {
      addSet(sessionId, sessionExerciseId, nextSetNumber);
    });
  }

  function handleConfirm(setId: string) {
    const draft = getDraft(setId);
    const weight = draft.weight ? Number(draft.weight) : null;
    const reps = draft.reps ? Number(draft.reps) : null;
    startTransition(() => {
      confirmSet(sessionId, setId, weight, reps);
    });
    setRestEndsAt(Date.now() + REST_DURATION_MS);
  }

  function handleCycleType(setId: string, current: SetType) {
    const currentIndex = SET_TYPE_ORDER.indexOf(current);
    const next = SET_TYPE_ORDER[(currentIndex + 1) % SET_TYPE_ORDER.length];
    startTransition(() => {
      cycleSetType(sessionId, setId, next);
    });
  }

  function handleDeleteSet(setId: string) {
    startTransition(() => {
      deleteSet(sessionId, setId);
    });
  }

  function handleEndSession() {
    startTransition(() => {
      endSession(sessionId);
    });
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="sticky top-0 z-10 -mx-4 flex items-center justify-between border-b border-zinc-800 bg-black/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <div>
          <p className="text-xs text-zinc-500">Session time</p>
          <p className="font-mono text-lg font-semibold text-white">{formatDuration(elapsedMs)}</p>
        </div>
        {restRemainingMs > 0 && (
          <div className="rounded-md border border-emerald-700 bg-emerald-950 px-3 py-1.5 text-sm text-emerald-300">
            Rest: {formatDuration(restRemainingMs)}
          </div>
        )}
        <button
          type="button"
          onClick={handleEndSession}
          disabled={isPending}
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
        >
          End session
        </button>
      </div>

      {initialExercises.map((exercise) => (
        <div key={exercise.sessionExerciseId} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <h2 className="font-semibold text-white">
            {exercise.name}
            {exercise.supersetGroup && (
              <span className="ml-2 rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs font-normal text-emerald-400">
                superset
              </span>
            )}
          </h2>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-zinc-500">
                  <th className="w-10 pb-1">Set</th>
                  <th className="pb-1">Weight</th>
                  <th className="pb-1">Reps</th>
                  <th className="pb-1">Previous</th>
                  <th className="w-8 pb-1"></th>
                </tr>
              </thead>
              <tbody>
                {exercise.sets.map((set) => {
                  const classes = SET_TYPE_CLASSES[set.setType];
                  return (
                    <tr key={set.id} className={classes.row}>
                      <td className="py-1">
                        <button
                          type="button"
                          onClick={() => handleCycleType(set.id, set.setType)}
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${classes.badge}`}
                          title="Tap to change set type"
                        >
                          {SET_TYPE_LABEL[set.setType] || set.setNumber}
                        </button>
                      </td>
                      {set.isConfirmed ? (
                        <>
                          <td className="py-1 text-zinc-200">{set.weight ?? "-"}</td>
                          <td className="py-1 text-zinc-200">{set.reps ?? "-"}</td>
                        </>
                      ) : (
                        <>
                          <td className="py-1 pr-2">
                            <input
                              type="number"
                              value={getDraft(set.id).weight}
                              onChange={(e) => updateDraft(set.id, "weight", e.target.value)}
                              className="w-16 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-white"
                            />
                          </td>
                          <td className="py-1 pr-2">
                            <input
                              type="number"
                              value={getDraft(set.id).reps}
                              onChange={(e) => updateDraft(set.id, "reps", e.target.value)}
                              className="w-14 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-white"
                            />
                          </td>
                        </>
                      )}
                      <td className="py-1 text-xs text-zinc-500">
                        {exercise.previous ? `${exercise.previous.weight ?? "-"}x${exercise.previous.reps ?? "-"}` : "-"}
                      </td>
                      <td className="py-1 text-right">
                        {set.isConfirmed ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteSet(set.id)}
                            className="text-xs text-zinc-600 hover:text-red-400"
                          >
                            ✕
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleConfirm(set.id)}
                            disabled={isPending}
                            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-black disabled:opacity-50"
                            title="Confirm set"
                          >
                            ✓
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={() => handleAddSet(exercise.sessionExerciseId, exercise.sets)}
            disabled={isPending}
            className="mt-3 rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white"
          >
            Add set
          </button>
        </div>
      ))}

      <div>
        <h2 className="font-semibold text-white">Add exercise</h2>
        <div className="mt-2">
          <AddExercisesToSession sessionId={sessionId} exercises={allExercises} />
        </div>
      </div>
    </div>
  );
}
