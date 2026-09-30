import { requireUser } from "@/lib/auth";
import { OnboardingWizard } from "./OnboardingWizard";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { profile } = await requireUser();
  const params = await searchParams;

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-12">
      {params.error && (
        <p className="mb-4 w-full max-w-lg rounded-md border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-300">
          {params.error}
        </p>
      )}
      <OnboardingWizard fullName={profile?.full_name ?? "there"} />
    </div>
  );
}
