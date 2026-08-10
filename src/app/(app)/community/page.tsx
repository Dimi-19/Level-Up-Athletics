import Link from "next/link";
import { ComingSoon } from "../_components/ComingSoon";

export default function CommunityPage() {
  return (
    <div>
      <ComingSoon
        title="Community"
        tagline="Friends, teammates, and (eventually) your team's roster and shared schedule."
        bullets={[
          "Add teammates, see their sessions/badges if they opt in",
          "Shared challenges built on your existing logged data",
          "Team roster & RSVP management will move here",
        ]}
      />
      <p className="mt-6 text-sm text-zinc-500">
        Team roster and scheduling still live at their old spot for now —{" "}
        <Link href="/teams" className="text-emerald-400 hover:text-emerald-300">
          manage teams →
        </Link>
      </p>
    </div>
  );
}
