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

export function currentStreak(dateStrings: string[]): number {
  const uniqueDays = new Set(dateStrings.map((d) => d.slice(0, 10)));
  if (uniqueDays.size === 0) return 0;

  const today = new Date().toISOString().slice(0, 10);
  const cursor = new Date(`${today}T00:00:00`);

  if (!uniqueDays.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
    if (!uniqueDays.has(cursor.toISOString().slice(0, 10))) return 0;
  }

  let streak = 0;
  while (uniqueDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
