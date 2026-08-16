import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { TemplateBuilder } from "../TemplateBuilder";
import { AiTemplateBuilder } from "./AiTemplateBuilder";

export default async function NewTemplatePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; error?: string }>;
}) {
  const { supabase, profile } = await requireUser();
  const params = await searchParams;

  const { data: exercises } = await supabase.from("exercises").select("*").order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">New template</h1>
        {params.mode && (
          <Link href="/weight-room/templates/new" className="text-sm text-zinc-400 hover:text-white">
            ← Choose a different way to build it
          </Link>
        )}
      </div>

      {params.error && (
        <p className="rounded-md border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-300">
          {params.error}
        </p>
      )}

      {!params.mode && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/weight-room/templates/new?mode=ai"
            className="rounded-lg border border-zinc-800 bg-zinc-950 p-5 hover:border-emerald-600"
          >
            <p className="font-semibold text-white">Build it for me</p>
            <p className="mt-1 text-sm text-zinc-400">
              Answer a couple of quick questions and get a ready-to-go template.
            </p>
          </Link>
          <Link
            href="/weight-room/templates/new?mode=custom"
            className="rounded-lg border border-zinc-800 bg-zinc-950 p-5 hover:border-zinc-600"
          >
            <p className="font-semibold text-white">Build my own</p>
            <p className="mt-1 text-sm text-zinc-400">
              Name it and pick exercises yourself, the same way you add them during a live session.
            </p>
          </Link>
        </div>
      )}

      {params.mode === "ai" && <AiTemplateBuilder initialEquipment={profile?.equipment_access ?? []} />}

      {params.mode === "custom" && (
        <>
          <p className="text-sm text-zinc-400">Name it, then add exercises from the library.</p>
          <TemplateBuilder exercises={exercises ?? []} />
        </>
      )}
    </div>
  );
}
