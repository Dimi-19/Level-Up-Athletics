export function dailyIndex(dateKey: string, length: number): number {
  if (length <= 0) return 0;
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) % 1_000_000_007;
  }
  return hash % length;
}
