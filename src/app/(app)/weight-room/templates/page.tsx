import Link from "next/link";
import { requireUser } from "@/lib/auth";

export default async function TemplatesPage() {
  const { supabase, user } = await requireUser();

  const { data: templates } = await supabase
    .from("workout_templates")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Templates</h1>
          <p className="mt-1 text-sm text-zinc-400">Reusable workout plans you can start any time.</p>
        </div>
        <Link
          href="/weight-room/templates/new"
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
        >
          New template
        </Link>
      </div>

      <ul className="space-y-2">
        {(templates ?? []).map((template) => (
          <li key={template.id}>
            <Link
              href={`/weight-room/templates/${template.id}`}
              className="block rounded-lg border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-600"
            >
              <p className="font-medium text-white">{template.name}</p>
            </Link>
          </li>
        ))}
        {(templates ?? []).length === 0 && (
          <p className="rounded-lg border border-dashed border-zinc-700 p-6 text-center text-sm text-zinc-500">
            No templates yet.
          </p>
        )}
      </ul>
    </div>
  );
}
