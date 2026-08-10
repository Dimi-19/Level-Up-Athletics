import { requireUser } from "@/lib/auth";
import { completeOnboarding, skipOnboarding } from "./actions";

export default async function OnboardingPage() {
  const { profile } = await requireUser();

  return (
    <div className="flex flex-1 justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold text-white">Let&apos;s set you up, {profile?.full_name}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          A few questions so Home and Nutrition are actually useful from day one. Skip anything you&apos;d
          rather not share.
        </p>

        <form id="onboarding-form" action={completeOnboarding} className="mt-8 space-y-8">
          <section>
            <h2 className="font-semibold text-white">Sport</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-300">Sport</label>
                <input
                  name="sport"
                  placeholder="Basketball"
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300">Position</label>
                <input
                  name="position"
                  placeholder="Guard"
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300">Favorite player</label>
                <input
                  name="favoritePlayer"
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300">Favorite team</label>
                <input
                  name="favoriteTeam"
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-white">Body basics</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Used only to suggest calorie/macro targets — you can change everything later in Settings.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-300">Age</label>
                <input
                  type="number"
                  name="age"
                  min={5}
                  max={100}
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300">Sex (for calorie calc)</label>
                <select
                  name="biologicalSex"
                  defaultValue=""
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300">Height (cm)</label>
                <input
                  type="number"
                  name="heightCm"
                  min={100}
                  max={250}
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300">Weight (kg)</label>
                <input
                  type="number"
                  name="weightKg"
                  min={30}
                  max={250}
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-white">Training</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-300">Goal</label>
                <select
                  name="primaryGoal"
                  defaultValue="maintain"
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
                >
                  <option value="cut">Cut</option>
                  <option value="maintain">Maintain</option>
                  <option value="bulk">Bulk</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300">Workouts per week</label>
                <input
                  type="number"
                  name="workoutsPerWeek"
                  min={0}
                  max={14}
                  defaultValue={4}
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-300">Dietary restriction</label>
                <select
                  name="dietaryRestriction"
                  defaultValue=""
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
                >
                  <option value="">None</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="pescatarian">Pescatarian</option>
                  <option value="gluten-free">Gluten-free</option>
                  <option value="dairy-free">Dairy-free</option>
                </select>
              </div>
            </div>
          </section>

        </form>

        <div className="mt-6 flex items-center gap-4">
          <button
            type="submit"
            form="onboarding-form"
            className="rounded-md bg-emerald-500 px-5 py-2.5 font-semibold text-black hover:bg-emerald-400"
          >
            Finish setup
          </button>
          <form action={skipOnboarding}>
            <button type="submit" className="text-sm text-zinc-400 hover:text-white">
              Skip for now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
