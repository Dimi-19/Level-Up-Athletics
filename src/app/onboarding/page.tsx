import { requireUser } from "@/lib/auth";
import { OnboardingWizard } from "./OnboardingWizard";

export default async function OnboardingPage() {
  const { profile } = await requireUser();

  return (
    <div className="flex flex-1 justify-center px-4 py-12">
      <OnboardingWizard fullName={profile?.full_name ?? "there"} />
    </div>
  );
}
