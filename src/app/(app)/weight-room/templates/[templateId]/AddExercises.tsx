"use client";

import { useTransition } from "react";
import type { Database } from "@/lib/supabase/types";
import { ExerciseSelector, type StagedItem } from "../../ExerciseSelector";
import { addTemplateExercises } from "../actions";

type Exercise = Database["public"]["Tables"]["exercises"]["Row"];

export function AddExercises({ templateId, exercises }: { templateId: string; exercises: Exercise[] }) {
  const [isPending, startTransition] = useTransition();

  function handleStage(items: StagedItem[]) {
    startTransition(() => {
      addTemplateExercises(templateId, items);
    });
  }

  return (
    <div className={isPending ? "opacity-60" : ""}>
      <ExerciseSelector exercises={exercises} onStage={handleStage} buttonLabel="Add" />
    </div>
  );
}
