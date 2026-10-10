export const strikes = new Map<number, number>();
export const strikeLog: { midi: number; at: number }[] = [];

export function markStrike(midi: number): void {
  const at = performance.now();
  strikes.set(midi, at);
  strikeLog.push({ midi, at });
  if (strikeLog.length > 24) strikeLog.shift();
}
