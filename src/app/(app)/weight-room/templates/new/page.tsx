import { requireUser } from "@/lib/auth";
import { TemplateBuilder } from "../TemplateBuilder";

export default async function NewTemplatePage() {
  const { supabase } = await requireUser();
  const { data: exercises } = await supabase.from("exercises").select("*").order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">New template</h1>
        <p className="mt-1 text-sm text-zinc-400">Name it, then add exercises from the library.</p>
      </div>
      <TemplateBuilder exercises={exercises ?? []} />
    </div>
  );
}
