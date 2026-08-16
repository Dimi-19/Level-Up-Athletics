"use client";

import { useState, useTransition } from "react";
import type { BiologicalSex, ExperienceLevel, PrimaryGoal } from "@/lib/supabase/types";
import { completeOnboarding, skipOnboarding, type OnboardingData } from "./actions";

const EQUIPMENT_OPTIONS = [
  "Barbell",
  "Dumbbell",
  "Machines",
  "Cable",
  "Kettlebell",
  "Bands",
  "Bodyweight only",
] as const;

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string; description: string }[] = [
  { value: "beginner", label: "New to training", description: "Less than 6 months of consistent training" },
  { value: "intermediate", label: "Some experience", description: "Roughly 6 months to 3 years" },
  { value: "advanced", label: "Very experienced", description: "3+ years, know your way around a gym" },
];

const GOAL_OPTIONS: { value: PrimaryGoal; label: string; description: string }[] = [
  { value: "cut", label: "Cut", description: "Lose fat while holding onto muscle" },
  { value: "maintain", label: "Maintain", description: "Stay around where you are" },
  { value: "bulk", label: "Bulk", description: "Build muscle and size" },
];

type FormState = {
  sport: string;
  position: string;
  favoritePlayer: string;
  favoriteTeam: string;
  experienceLevel: ExperienceLevel | "";
  equipmentAccess: string[];
  fullGymAccess: boolean;
  workoutsPerWeek: string;
  primaryGoal: PrimaryGoal;
  age: string;
  biologicalSex: BiologicalSex | "";
  heightCm: string;
  weightKg: string;
  skipBodyBasics: boolean;
  dietaryRestriction: string;
};

const INITIAL_STATE: FormState = {
  sport: "",
  position: "",
  favoritePlayer: "",
  favoriteTeam: "",
  experienceLevel: "",
  equipmentAccess: [],
  fullGymAccess: false,
  workoutsPerWeek: "4",
  primaryGoal: "maintain",
  age: "",
  biologicalSex: "",
  heightCm: "",
  weightKg: "",
  skipBodyBasics: false,
  dietaryRestriction: "",
};

const TOTAL_STEPS = 6;

function inputClasses() {
  return "mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500";
}

export function OnboardingWizard({ fullName }: { fullName: string }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleEquipment(item: string) {
    setForm((prev) => ({
      ...prev,
      equipmentAccess: prev.equipmentAccess.includes(item)
        ? prev.equipmentAccess.filter((e) => e !== item)
        : [...prev.equipmentAccess, item],
    }));
  }

  function toggleFullGym() {
    setForm((prev) => ({
      ...prev,
      fullGymAccess: !prev.fullGymAccess,
      equipmentAccess: !prev.fullGymAccess ? [...EQUIPMENT_OPTIONS] : [],
    }));
  }

  function next() {
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }

  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  function submit() {
    const data: OnboardingData = {
      sport: form.sport,
      position: form.position,
      favoritePlayer: form.favoritePlayer,
      favoriteTeam: form.favoriteTeam,
      experienceLevel: form.experienceLevel || null,
      equipmentAccess: form.equipmentAccess,
      workoutsPerWeek: form.workoutsPerWeek ? Number(form.workoutsPerWeek) : null,
      primaryGoal: form.primaryGoal,
      age: !form.skipBodyBasics && form.age ? Number(form.age) : null,
      biologicalSex: !form.skipBodyBasics ? form.biologicalSex || null : null,
      heightCm: !form.skipBodyBasics && form.heightCm ? Number(form.heightCm) : null,
      weightKg: !form.skipBodyBasics && form.weightKg ? Number(form.weightKg) : null,
      dietaryRestriction: form.dietaryRestriction,
    };
    startTransition(() => {
      completeOnboarding(data);
    });
  }

  function skipAll() {
    startTransition(() => {
      skipOnboarding();
    });
  }

  return (
    <div className="w-full max-w-lg">
      <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
        <span>
          Step {step} of {TOTAL_STEPS}
        </span>
        <button type="button" onClick={skipAll} className="text-zinc-400 hover:text-white">
          Skip for now
        </button>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full bg-emerald-500 transition-all"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      <div className="mt-6">
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-white">Hey {fullName}, let&apos;s get to know you</h1>
            <p className="mt-1 text-sm text-zinc-400">
              This shows up on your Profile and personalizes Motivation. Skip anything you&apos;d rather not
              share.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-300">Sport</label>
                <input
                  value={form.sport}
                  onChange={(e) => set("sport", e.target.value)}
                  placeholder="Basketball"
                  className={inputClasses()}
                />
              </div>
              {form.sport.trim() && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300">Position</label>
                  <input
                    value={form.position}
                    onChange={(e) => set("position", e.target.value)}
                    placeholder="Guard"
                    className={inputClasses()}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-zinc-300">Favorite player</label>
                <input
                  value={form.favoritePlayer}
                  onChange={(e) => set("favoritePlayer", e.target.value)}
                  className={inputClasses()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300">Favorite team</label>
                <input
                  value={form.favoriteTeam}
                  onChange={(e) => set("favoriteTeam", e.target.value)}
                  className={inputClasses()}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold text-white">Where are you starting from?</h1>
            <p className="mt-1 text-sm text-zinc-400">
              We&apos;ll use this to suggest workout templates that actually match your experience and what
              you have access to.
            </p>
            <div className="mt-5">
              <p className="text-sm font-medium text-zinc-300">Experience level</p>
              <div className="mt-2 space-y-2">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 ${
                      form.experienceLevel === opt.value
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-zinc-700 hover:border-zinc-500"
                    }`}
                  >
                    <input
                      type="radio"
                      name="experienceLevel"
                      className="mt-1"
                      checked={form.experienceLevel === opt.value}
                      onChange={() => set("experienceLevel", opt.value)}
                    />
                    <span>
                      <span className="block text-sm font-medium text-white">{opt.label}</span>
                      <span className="block text-xs text-zinc-500">{opt.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-5">
              <p className="text-sm font-medium text-zinc-300">Equipment you have access to</p>
              <label className="mt-2 flex items-center gap-2 text-sm text-zinc-200">
                <input type="checkbox" checked={form.fullGymAccess} onChange={toggleFullGym} />
                Full gym access (selects everything)
              </label>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {EQUIPMENT_OPTIONS.map((item) => (
                  <label key={item} className="flex items-center gap-2 text-sm text-zinc-300">
                    <input
                      type="checkbox"
                      checked={form.equipmentAccess.includes(item)}
                      disabled={form.fullGymAccess}
                      onChange={() => toggleEquipment(item)}
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-2xl font-bold text-white">What&apos;s your training rhythm?</h1>
            <p className="mt-1 text-sm text-zinc-400">
              This sets your starting calorie target and how templates get scheduled.
            </p>
            <div className="mt-5">
              <label className="block text-sm font-medium text-zinc-300">
                Workouts per week: <span className="text-white">{form.workoutsPerWeek}</span>
              </label>
              <input
                type="range"
                min={0}
                max={14}
                value={form.workoutsPerWeek}
                onChange={(e) => set("workoutsPerWeek", e.target.value)}
                className="mt-2 w-full accent-emerald-500"
              />
            </div>
            <div className="mt-5">
              <p className="text-sm font-medium text-zinc-300">Goal</p>
              <div className="mt-2 space-y-2">
                {GOAL_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 ${
                      form.primaryGoal === opt.value
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-zinc-700 hover:border-zinc-500"
                    }`}
                  >
                    <input
                      type="radio"
                      name="primaryGoal"
                      className="mt-1"
                      checked={form.primaryGoal === opt.value}
                      onChange={() => set("primaryGoal", opt.value)}
                    />
                    <span>
                      <span className="block text-sm font-medium text-white">{opt.label}</span>
                      <span className="block text-xs text-zinc-500">{opt.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="text-2xl font-bold text-white">A few body basics</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Used only to suggest calorie/macro targets — nothing else. Skip this step entirely if you&apos;d
              rather not.
            </p>
            <label className="mt-4 flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={form.skipBodyBasics}
                onChange={(e) => set("skipBodyBasics", e.target.checked)}
              />
              Skip this step
            </label>
            {!form.skipBodyBasics && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-300">Age</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={form.age}
                    onChange={(e) => set("age", e.target.value)}
                    className={inputClasses()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300">Sex (for calorie calc)</label>
                  <select
                    value={form.biologicalSex}
                    onChange={(e) => set("biologicalSex", e.target.value as BiologicalSex | "")}
                    className={inputClasses()}
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
                    min={100}
                    max={250}
                    value={form.heightCm}
                    onChange={(e) => set("heightCm", e.target.value)}
                    className={inputClasses()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300">Weight (kg)</label>
                  <input
                    type="number"
                    min={30}
                    max={250}
                    value={form.weightKg}
                    onChange={(e) => set("weightKg", e.target.value)}
                    className={inputClasses()}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {step === 5 && (
          <div>
            <h1 className="text-2xl font-bold text-white">Any dietary restrictions?</h1>
            <p className="mt-1 text-sm text-zinc-400">Helps if we ever suggest meals or recipes.</p>
            <select
              value={form.dietaryRestriction}
              onChange={(e) => set("dietaryRestriction", e.target.value)}
              className={`mt-4 ${inputClasses()}`}
            >
              <option value="">None</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="pescatarian">Pescatarian</option>
              <option value="gluten-free">Gluten-free</option>
              <option value="dairy-free">Dairy-free</option>
            </select>
          </div>
        )}

        {step === 6 && (
          <div>
            <h1 className="text-2xl font-bold text-white">Looks good?</h1>
            <p className="mt-1 text-sm text-zinc-400">Here&apos;s what we&apos;ve got. Hit Back to change anything.</p>
            <dl className="mt-4 space-y-2 text-sm">
              <SummaryRow label="Sport" value={[form.sport, form.position].filter(Boolean).join(" · ")} />
              <SummaryRow
                label="Experience"
                value={EXPERIENCE_OPTIONS.find((o) => o.value === form.experienceLevel)?.label}
              />
              <SummaryRow label="Equipment" value={form.equipmentAccess.join(", ")} />
              <SummaryRow label="Frequency" value={`${form.workoutsPerWeek} workouts/week`} />
              <SummaryRow label="Goal" value={GOAL_OPTIONS.find((o) => o.value === form.primaryGoal)?.label} />
              <SummaryRow
                label="Body basics"
                value={form.skipBodyBasics ? "Skipped" : [form.age, form.heightCm, form.weightKg].filter(Boolean).length ? "Provided" : "Skipped"}
              />
              <SummaryRow label="Diet" value={form.dietaryRestriction || "None"} />
            </dl>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 1}
          className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Back
        </button>
        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={next}
            className="rounded-md bg-emerald-500 px-5 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={isPending}
            className="rounded-md bg-emerald-500 px-5 py-2 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Finish setup"}
          </button>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-zinc-200">{value || "—"}</dd>
    </div>
  );
}
