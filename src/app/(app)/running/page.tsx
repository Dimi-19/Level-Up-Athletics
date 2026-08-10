import { ComingSoon } from "../_components/ComingSoon";

export default function RunningPage() {
  return (
    <ComingSoon
      title="Running"
      tagline="GPS-tracked runs, structured interval workouts, and pace/load trends."
      bullets={[
        "Outdoor, treadmill, track, and structured-interval run types",
        "Live distance, pace, time, HR, and elevation tracking",
        "Post-run summaries with splits, RPE, and shoe tracking",
        "Personal records per distance, training load trends",
      ]}
    />
  );
}
