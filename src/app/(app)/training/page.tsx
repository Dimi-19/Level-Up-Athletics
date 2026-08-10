import { ComingSoon } from "../_components/ComingSoon";

export default function TrainingPage() {
  return (
    <ComingSoon
      title="Training"
      tagline="Sport-specific skill logging: pick your sport, pick a skill, log a session."
      bullets={[
        "Sport picker with current/target level",
        "Drill & skill library by subcategory (shooting, passing, defense, etc.)",
        "Logging forms routed by type — reps, timed, rated, checklist, or notes",
        "Per-sport radar chart tracking each subcategory",
      ]}
    />
  );
}
