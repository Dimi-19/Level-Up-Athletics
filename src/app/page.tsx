import Link from "next/link";

const FEATURES = [
  {
    title: "Rosters",
    description: "Create a team, share an invite code, and manage coaches, captains, and athletes.",
  },
  {
    title: "Schedule",
    description: "Post practices, games, and meetings. Everyone RSVPs so you know who's showing up.",
  },
  {
    title: "Training log",
    description: "Assign team workouts and let athletes log what they actually did.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="font-bold text-white">
            Level Up <span className="text-emerald-400">Athletics</span>
          </span>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="text-zinc-300 hover:text-white">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-emerald-500 px-3 py-1.5 font-semibold text-black hover:bg-emerald-400"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Everything your team needs, in one place.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-zinc-400">
          Rosters, schedules, and training logs for athletes who organize
          themselves. No spreadsheets, no group texts.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/signup"
            className="rounded-md bg-emerald-500 px-5 py-2.5 font-semibold text-black hover:bg-emerald-400"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-zinc-700 px-5 py-2.5 font-semibold text-white hover:border-zinc-500"
          >
            Log in
          </Link>
        </div>
      </section>

      <section className="border-t border-zinc-800 bg-zinc-950">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-16 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title}>
              <h2 className="font-semibold text-white">{feature.title}</h2>
              <p className="mt-2 text-sm text-zinc-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
