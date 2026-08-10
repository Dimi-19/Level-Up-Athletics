export function ComingSoon({
  title,
  tagline,
  bullets,
}: {
  title: string;
  tagline: string;
  bullets: string[];
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <p className="mt-1 text-sm text-zinc-400">{tagline}</p>

      <div className="mt-6 rounded-lg border border-dashed border-zinc-700 p-6">
        <p className="font-medium text-zinc-300">Coming soon</p>
        <ul className="mt-3 space-y-1.5 text-sm text-zinc-500">
          {bullets.map((bullet) => (
            <li key={bullet}>· {bullet}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
