export function longestStreak(dateStrings: string[]): number {
  const uniqueDays = Array.from(new Set(dateStrings.map((d) => d.slice(0, 10)))).sort();
  if (uniqueDays.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const dayDiff = Math.round((curr.getTime() - prev.getTime()) / 86_400_000);

    current = dayDiff === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
  }

  return longest;
}
