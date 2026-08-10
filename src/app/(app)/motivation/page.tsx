import { ComingSoon } from "../_components/ComingSoon";

export default function MotivationPage() {
  return (
    <ComingSoon
      title="Motivation"
      tagline="Quotes, clips, and podcasts — surfaced when you need them, not a chore."
      bullets={[
        "Personalized to your favorite player/team",
        "Pre-training quote or clip trigger, surfaced on Home",
        "Personal highlight reel pulled from Film Study",
        "No streaks, no rank, no quota — purely additive",
      ]}
    />
  );
}
