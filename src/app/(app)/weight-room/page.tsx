import { ComingSoon } from "../_components/ComingSoon";

export default function WeightRoomPage() {
  return (
    <ComingSoon
      title="Weight Room"
      tagline="Full exercise library, live set logging, and a per-muscle-group rank."
      bullets={[
        "Custom or app-proposed workout templates",
        "Exercise picker organized by muscle group or equipment",
        "Live logging with set-type tagging (warmup, failure, drop-set)",
        "Body-diagram rank visualization, Wood → Olympian per muscle group",
      ]}
    />
  );
}
