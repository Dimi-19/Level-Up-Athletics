import { ComingSoon } from "../_components/ComingSoon";

export default function BadgesPage() {
  return (
    <ComingSoon
      title="Badges"
      tagline="Recognition for behavior and milestones — separate from rank."
      bullets={[
        "Consistency, milestone, cross-module, comeback, and PR badges",
        "Earned + locked grid, nothing hidden",
        "Non-blocking toast when you earn one, no gates on real features",
      ]}
    />
  );
}
