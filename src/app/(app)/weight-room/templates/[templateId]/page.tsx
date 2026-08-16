import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { renameTemplate, removeTemplateExercise, deleteTemplate } from "../actions";
import { startSessionFromTemplate } from "../../session/actions";
import { AddExercises } from "./AddExercises";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const { supabase } = await requireUser();

  const { data: template } = await supabase
    .from("workout_templates")
    .select("*")
    .eq("id", templateId)
    .single();
  if (!template) notFound();

  const [{ data: templateExercises }, { data: allExercises }] = await Promise.all([
    supabase
      .from("template_exercises")
      .select("*")
      .eq("template_id", templateId)
      .order("position", { ascending: true }),
    supabase.from("exercises").select("*").order("name"),
  ]);

  const exerciseById = new Map((allExercises ?? []).map((e) => [e.id, e]));

  return (
    <div className="space-y-6">
      <form action={renameTemplate.bind(null, templateId)} className="flex items-center gap-2">
        <input
          name="name"
          defaultValue={template.name}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xl font-bold text-white outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          className="rounded-md border border-zinc-600 px-3 py-2 text-sm text-white hover:border-zinc-400"
        >
          Save name
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <form action={startSessionFromTemplate.bind(null, templateId)}>
          <button
            type="submit"
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
          >
            Start session
          </button>
        </form>
        <form action={deleteTemplate.bind(null, templateId)}>
          <button
            type="submit"
            className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:border-red-700 hover:text-red-400"
          >
            Delete template
          </button>
        </form>
      </div>

      <div>
        <h2 className="font-semibold text-white">Exercises</h2>
        <ul className="mt-2 space-y-1.5">
          {(templateExercises ?? []).map((te) => {
            const exercise = exerciseById.get(te.exercise_id);
            return (
              <li
                key={te.id}
                className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
              >
                <span className="text-zinc-200">
                  {exercise?.name ?? "Unknown exercise"}
                  {te.superset_group && (
                    <span className="ml-2 rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs text-emerald-400">
                      superset
                    </span>
                  )}
                </span>
                <form action={removeTemplateExercise.bind(null, templateId, te.id)}>
                  <button type="submit" className="text-xs text-zinc-500 hover:text-red-400">
                    Remove
                  </button>
                </form>
              </li>
            );
          })}
          {(templateExercises ?? []).length === 0 && (
            <p className="text-sm text-zinc-500">No exercises yet — add some below.</p>
          )}
        </ul>
      </div>

      <div>
        <h2 className="font-semibold text-white">Add exercises</h2>
        <div className="mt-2">
          <AddExercises templateId={templateId} exercises={allExercises ?? []} />
        </div>
      </div>
    </div>
  );
}
