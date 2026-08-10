import Link from "next/link";
import { ComingSoon } from "../_components/ComingSoon";

export default function SchedulePage() {
  return (
    <div>
      <ComingSoon
        title="Schedule"
        tagline="Plan your week across Weight Room, Runs, Skill work, Games, and Film Study."
        bullets={[
          "Week/day/month calendar views",
          "Tap a session to jump straight into its pre-filled logger",
          "Missed sessions flagged, never guilt-tripped",
          "Load-awareness warnings when heavy days stack up",
        ]}
      />
      <p className="mt-6 text-sm text-zinc-500">
        Your team&apos;s shared schedule and RSVPs still work in the meantime —{" "}
        <Link href="/teams" className="text-emerald-400 hover:text-emerald-300">
          manage teams →
        </Link>
      </p>
    </div>
  );
}
