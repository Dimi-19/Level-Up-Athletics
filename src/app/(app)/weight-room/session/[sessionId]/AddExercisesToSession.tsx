"use client";

import { useTransition } from "react";
import type { Database } from "@/lib/supabase/types";
import { ExerciseSelector, type StagedItem } from "../../ExerciseSelector";
import { addExercisesToSession } from "../actions";

type Exercise = Database["public"]["Tables"]["exercises"]["Row"];

export function AddExercisesToSession({ sessionId, exercises }: { sessionId: string; exercises: Exercise[] }) {
  const [isPending, startTransition] = useTransition();

  function handleStage(items: StagedItem[]) {
    startTransition(() => {
      addExercisesToSession(sessionId, items);
    });
  }

  return (
    <div className={isPending ? "opacity-60" : ""}>
      <ExerciseSelector exercises={exercises} onStage={handleStage} buttonLabel="Add" />
    </div>
  );
}
