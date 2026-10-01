import { requireUser } from "@/lib/auth";
import { tierForLogCount } from "@/lib/trainingRank";
import { addSkill, deleteSkill, deleteSkillLog } from "./actions";
import { SkillLogger } from "./SkillLogger";

function formatValue(category: string, value: number | null, unitLabel: string): string {
  if (value == null) return "—";
  if (category === "binary") return value === 1 ? "Pass" : "Fail";
  if (category === "rating") return `${value}/10`;
  return `${value}${unitLabel ? ` ${unitLabel}` : ""}`;
}

export default async function TrainingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase, user, profile } = await requireUser();
  const params = await searchParams;

  const [{ data: skillsData }, { data: logsData }] = await Promise.all([
    supabase.from("skills").select("*").order("sport", { ascending: true }).order("name", { ascending: true }),
    supabase
      .from("skill_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("logged_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const skills = skillsData ?? [];
  const skillById = new Map(skills.map((s) => [s.id, s]));
  const logs = (logsData ?? []).map((log) => ({ ...log, skill: skillById.get(log.skill_id) ?? null }));

  const logCountBySkill = new Map<string, number>();
  for (const log of logsData ?? []) {
    logCountBySkill.set(log.skill_id, (logCountBySkill.get(log.skill_id) ?? 0) + 1);
  }

  const skillRanks = Array.from(logCountBySkill.entries())
    .map(([skillId, count]) => {
      const skill = skills.find((s) => s.id === skillId);
      if (!skill) return null;
      return { skill, count, tier: tierForLogCount(count) };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => b.count - a.count);

  const customSkills = skills.filter((s) => s.created_by === user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Training</h1>
        <p className="mt-1 text-sm text-zinc-400">Pick your sport, pick a skill, log a session.</p>
      </div>

      {params.error && (
        <p className="rounded-md border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-300">{params.error}</p>
      )}

      <SkillLogger skills={skills} defaultSport={profile?.sport ?? null} />

      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h2 className="font-semibold text-white">Skill ranks</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Based on how many times you&apos;ve logged a drill — consistency over raw performance.
        </p>
        {skillRanks.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600">No skills logged yet.</p>
        ) : (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {skillRanks.map(({ skill, count, tier }) => (
              <div key={skill.id} className="rounded-md border border-zinc-900 bg-black p-3">
                <p className="text-sm text-white">{skill.name}</p>
                <p className="text-xs text-zinc-500">{skill.sport}</p>
                <p className="mt-1 text-sm font-semibold" style={{ color: tier.color }}>
                  {tier.name}
                </p>
                <p className="text-xs text-zinc-600">{count} logged</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h2 className="font-semibold text-white">History</h2>
        <div className="mt-3 space-y-2">
          {logs.length === 0 ? (
            <p className="text-sm text-zinc-600">No sessions logged yet.</p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-md border border-zinc-900 bg-black px-3 py-2"
              >
                <div>
                  <p className="text-sm text-white">
                    {log.skill?.name ?? "Unknown skill"}{" "}
                    <span className="text-zinc-500">
                      — {formatValue(log.skill?.category ?? "notes", log.value, log.skill?.unit_label ?? "")}
                    </span>
                  </p>
                  <p className="text-xs text-zinc-500">
                    {log.skill?.sport} ·{" "}
                    {new Date(`${log.logged_date}T00:00:00`).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                    {log.notes ? ` · ${log.notes}` : ""}
                  </p>
                </div>
                <form action={deleteSkillLog.bind(null, log.id)}>
                  <button type="submit" className="text-xs text-zinc-600 hover:text-red-400">
                    Remove
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h2 className="font-semibold text-white">Custom skills</h2>
        <p className="mt-1 text-xs text-zinc-500">Don&apos;t see a drill for your sport? Add your own.</p>

        <div className="mt-3 space-y-2">
          {customSkills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center justify-between rounded-md border border-zinc-900 bg-black px-3 py-2"
            >
              <p className="text-sm text-white">
                {skill.sport} — {skill.name}{" "}
                <span className="text-xs text-zinc-500">({skill.category})</span>
              </p>
              <form action={deleteSkill.bind(null, skill.id)}>
                <button type="submit" className="text-xs text-zinc-600 hover:text-red-400">
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>

        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-emerald-400 hover:underline">+ Add a skill</summary>
          <form action={addSkill} className="mt-3 flex flex-wrap items-end gap-3">
            <div className="flex flex-col">
              <label className="text-xs text-zinc-500">Sport</label>
              <input
                type="text"
                name="sport"
                required
                defaultValue={profile?.sport ?? ""}
                className="rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-zinc-500">Skill name</label>
              <input
                type="text"
                name="name"
                required
                className="rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-zinc-500">Type</label>
              <select
                name="category"
                className="rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
              >
                <option value="reps">Countable (reps)</option>
                <option value="timed">Timed (seconds)</option>
                <option value="rating">Self-rating (1-10)</option>
                <option value="binary">Pass/fail</option>
                <option value="notes">Notes only</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-zinc-500">Unit label</label>
              <input
                type="text"
                name="unitLabel"
                placeholder="e.g. makes"
                className="w-28 rounded-md border border-zinc-800 bg-black px-2 py-1.5 text-sm text-white"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-black hover:bg-emerald-500"
            >
              Save skill
            </button>
          </form>
        </details>
      </div>
    </div>
  );
}
