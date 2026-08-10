import { ComingSoon } from "../_components/ComingSoon";

export default function StatsPage() {
  return (
    <ComingSoon
      title="Stats"
      tagline="Every number the app tracks about you, rolled up in one place."
      bullets={[
        "Total stats: days active, streaks, sessions logged, goals hit",
        "Per-pillar breakdowns: Training, Weight Room, Running, Nutrition, Film Study",
        "Unlocks once those logging modules exist",
      ]}
    />
  );
}
