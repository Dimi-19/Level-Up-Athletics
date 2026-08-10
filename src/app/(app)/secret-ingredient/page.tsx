import { ComingSoon } from "../_components/ComingSoon";

export default function SecretIngredientPage() {
  return (
    <ComingSoon
      title="The Secret Ingredient"
      tagline="The features that make this app worth showing to someone else."
      bullets={[
        "Verified Athlete Passport — a shareable, auto-logged performance record",
        "Ghost Rep — race your own best past session live",
        "Auto-generated season story from your real data and film",
        "Recruiting packet builder, with a review-before-send step, always",
      ]}
    />
  );
}
