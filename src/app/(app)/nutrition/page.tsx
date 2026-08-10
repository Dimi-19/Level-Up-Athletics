import { ComingSoon } from "../_components/ComingSoon";

export default function NutritionPage() {
  return (
    <ComingSoon
      title="Nutrition"
      tagline="Daily food diary against your macro targets — no wearable-driven guesswork."
      bullets={[
        "Meal diary: breakfast/lunch/dinner/snacks with running totals",
        "Verified food database + barcode scan",
        "Flat daily targets — set them now in Settings, no exercise add-back",
        "7-day rolling weight trend, meal plans and recipes",
      ]}
    />
  );
}
