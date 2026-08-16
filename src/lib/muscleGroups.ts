import type { MuscleGroup } from "@/lib/supabase/types";

export const MUSCLE_GROUPS: MuscleGroup[] = [
  "Chest",
  "Back",
  "Shoulders",
  "Quads",
  "Hamstrings/Glutes",
  "Calves",
  "Biceps",
  "Triceps",
  "Core",
  "Olympic/Power",
  "Full Body/Functional",
  "Explosive/Plyometric",
];

const SLUG_BY_GROUP: Record<MuscleGroup, string> = {
  Chest: "chest",
  Back: "back",
  Shoulders: "shoulders",
  Quads: "quads",
  "Hamstrings/Glutes": "hamstrings-glutes",
  Calves: "calves",
  Biceps: "biceps",
  Triceps: "triceps",
  Core: "core",
  "Olympic/Power": "olympic-power",
  "Full Body/Functional": "full-body-functional",
  "Explosive/Plyometric": "explosive-plyometric",
};

const GROUP_BY_SLUG: Record<string, MuscleGroup> = Object.fromEntries(
  Object.entries(SLUG_BY_GROUP).map(([group, slug]) => [slug, group as MuscleGroup]),
);

export function slugForMuscleGroup(group: MuscleGroup): string {
  return SLUG_BY_GROUP[group];
}

export function muscleGroupForSlug(slug: string): MuscleGroup | null {
  return GROUP_BY_SLUG[slug] ?? null;
}
