import { requireUser } from "@/lib/auth";
import {
  updateUnits,
  updateNotifications,
  updateIntegrations,
  updateNutritionTargets,
  updateVisibility,
  changePassword,
} from "./actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { user, profile } = await requireUser();
  const params = await searchParams;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-zinc-400">Configuration you set once and rarely touch.</p>
      </div>

      {params.notice && (
        <p className="rounded-md border border-emerald-800 bg-emerald-950 px-3 py-2 text-sm text-emerald-300">
          {params.notice}
        </p>
      )}
      {params.error && (
        <p className="rounded-md border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-300">
          {params.error}
        </p>
      )}

      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="font-semibold text-white">Account</h2>
        <p className="mt-1 text-sm text-zinc-400">{user.email}</p>
        <form action={changePassword} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-300">New password</label>
            <input
              type="password"
              name="password"
              minLength={6}
              required
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300">Confirm password</label>
            <input
              type="password"
              name="confirmPassword"
              minLength={6}
              required
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-md border border-zinc-600 px-4 py-2 text-sm font-semibold text-white hover:border-zinc-400"
            >
              Update password
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="font-semibold text-white">Units</h2>
        <form action={updateUnits} className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-zinc-300">Weight</label>
            <select
              name="unitsWeight"
              defaultValue={profile?.units_weight ?? "lb"}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
            >
              <option value="lb">lb</option>
              <option value="kg">kg</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300">Distance</label>
            <select
              name="unitsDistance"
              defaultValue={profile?.units_distance ?? "mi"}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
            >
              <option value="mi">mi</option>
              <option value="km">km</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300">Time format</label>
            <select
              name="timeFormat"
              defaultValue={profile?.time_format ?? "12h"}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
            >
              <option value="12h">12-hour</option>
              <option value="24h">24-hour</option>
            </select>
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="rounded-md border border-zinc-600 px-4 py-2 text-sm font-semibold text-white hover:border-zinc-400"
            >
              Save units
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="font-semibold text-white">Notifications</h2>
        <p className="mt-1 text-sm text-zinc-500">Off by default — turn on what you actually want to hear about.</p>
        <form action={updateNotifications} className="mt-4 space-y-2">
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" name="sessionReminders" defaultChecked={profile?.notif_session_reminders} />
            Session reminders
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" name="badgeAlerts" defaultChecked={profile?.notif_badge_alerts} />
            Badge alerts
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" name="missedSession" defaultChecked={profile?.notif_missed_session} />
            Missed-session nudges
          </label>
          <button
            type="submit"
            className="mt-2 rounded-md border border-zinc-600 px-4 py-2 text-sm font-semibold text-white hover:border-zinc-400"
          >
            Save notifications
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="font-semibold text-white">Data &amp; Integrations</h2>
        <p className="mt-1 text-sm text-zinc-500">
          WHOOP sync isn&apos;t connected yet — these toggles just set your preference for when it is.
        </p>
        <form action={updateIntegrations} className="mt-4 space-y-2">
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" name="whoopSync" defaultChecked={profile?.whoop_sync_enabled} />
            Sync with WHOOP
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" name="whoopBurnOverride" defaultChecked={profile?.whoop_burn_override} />
            Don&apos;t add exercise calories back to my daily budget (avoids double-counting burn)
          </label>
          <button
            type="submit"
            className="mt-2 rounded-md border border-zinc-600 px-4 py-2 text-sm font-semibold text-white hover:border-zinc-400"
          >
            Save integrations
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="font-semibold text-white">Nutrition targets</h2>
        <p className="mt-1 text-sm text-zinc-500">Feeds the macro ring on Home. Meal logging comes with Nutrition.</p>
        <form action={updateNutritionTargets} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-300">Calories</label>
            <input
              type="number"
              name="calories"
              min={0}
              defaultValue={profile?.nutrition_calories ?? ""}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300">Dietary restriction</label>
            <select
              name="dietaryRestriction"
              defaultValue={profile?.dietary_restriction ?? ""}
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
          <div>
            <label className="block text-sm font-medium text-zinc-300">Protein (g)</label>
            <input
              type="number"
              name="protein"
              min={0}
              defaultValue={profile?.nutrition_protein_g ?? ""}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300">Carbs (g)</label>
            <input
              type="number"
              name="carbs"
              min={0}
              defaultValue={profile?.nutrition_carbs_g ?? ""}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300">Fat (g)</label>
            <input
              type="number"
              name="fat"
              min={0}
              defaultValue={profile?.nutrition_fat_g ?? ""}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-zinc-300">Notes (day-type periodization, etc.)</label>
            <textarea
              name="notes"
              defaultValue={profile?.nutrition_notes ?? ""}
              rows={2}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
            >
              Save nutrition targets
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="font-semibold text-white">Privacy</h2>
        <form action={updateVisibility} className="mt-4 flex items-center gap-3">
          <select
            name="visibility"
            defaultValue={profile?.profile_visibility ?? "private"}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
          >
            <option value="private">Private profile</option>
            <option value="public">Public profile</option>
          </select>
          <button
            type="submit"
            className="rounded-md border border-zinc-600 px-4 py-2 text-sm font-semibold text-white hover:border-zinc-400"
          >
            Save
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-900 pt-4">
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-600"
          >
            Export my data — coming soon
          </button>
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-600"
          >
            Delete account — coming soon
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-dashed border-zinc-700 p-5">
        <h2 className="font-medium text-zinc-300">Template management</h2>
        <p className="mt-1 text-sm text-zinc-500">
          No Weight Room templates yet — this will let you bulk edit/delete them once that module ships.
        </p>
      </section>
    </div>
  );
}
