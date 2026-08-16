import type { Database, MuscleGroup } from "@/lib/supabase/types";

type Exercise = Database["public"]["Tables"]["exercises"]["Row"];

export type SplitType = "Full Body" | "Upper Body" | "Lower Body" | "Push" | "Pull" | "Legs";

export const SPLIT_OPTIONS: { value: SplitType; description: string }[] = [
  { value: "Full Body", description: "A balanced mix hitting most major muscle groups" },
  { value: "Upper Body", description: "Chest, back, shoulders, arms" },
  { value: "Lower Body", description: "Quads, hamstrings, glutes, calves" },
  { value: "Push", description: "Chest, shoulders, triceps" },
  { value: "Pull", description: "Back, biceps" },
  { value: "Legs", description: "Quads, hamstrings/glutes, calves" },
];

const SPLIT_MUSCLE_MAP: Record<SplitType, MuscleGroup[]> = {
  "Full Body": ["Chest", "Back", "Shoulders", "Quads", "Hamstrings/Glutes", "Core"],
  "Upper Body": ["Chest", "Back", "Shoulders", "Biceps", "Triceps"],
  "Lower Body": ["Quads", "Hamstrings/Glutes", "Calves"],
  Push: ["Chest", "Shoulders", "Triceps"],
  Pull: ["Back", "Biceps"],
  Legs: ["Quads", "Hamstrings/Glutes", "Calves"],
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateTemplateExercises({
  exercises,
  split,
  exerciseCount,
  equipment,
}: {
  exercises: Exercise[];
  split: SplitType;
  exerciseCount: number;
  equipment: string[];
}): Exercise[] {
  const targetGroups = SPLIT_MUSCLE_MAP[split];
  const matchesEquipment = (e: Exercise) =>
    equipment.length === 0 || e.equipment === "Bodyweight" || equipment.includes(e.equipment);

  const poolByGroup = new Map<MuscleGroup, Exercise[]>();
  for (const group of targetGroups) {
    poolByGroup.set(
      group,
      shuffle(exercises.filter((e) => e.muscle_group === group && matchesEquipment(e))),
    );
  }

  const selected: Exercise[] = [];
  const usedIds = new Set<string>();
  let groupIndex = 0;
  let emptyStreak = 0;

  while (selected.length < exerciseCount && emptyStreak < targetGroups.length) {
    const group = targetGroups[groupIndex % targetGroups.length];
    const pool = poolByGroup.get(group) ?? [];
    const candidate = pool.find((e) => !usedIds.has(e.id));

    if (candidate) {
      selected.push(candidate);
      usedIds.add(candidate.id);
      emptyStreak = 0;
    } else {
      emptyStreak++;
    }
    groupIndex++;
  }

  return selected;
}
