/**
 * Weekday mask helpers. Monday = bit 0 … Sunday = bit 6, per the backend's
 * StandingOrder.weekdayMask (127 = every day).
 */
export const WEEKDAYS = [
  { bit: 0, short: "Mon" },
  { bit: 1, short: "Tue" },
  { bit: 2, short: "Wed" },
  { bit: 3, short: "Thu" },
  { bit: 4, short: "Fri" },
  { bit: 5, short: "Sat" },
  { bit: 6, short: "Sun" },
] as const;

export const FULL_WEEK_MASK = 127;

export function maskHasDay(mask: number, bit: number): boolean {
  return (mask & (1 << bit)) !== 0;
}

export function toggleMaskDay(mask: number, bit: number): number {
  return mask ^ (1 << bit);
}

export function formatMask(mask: number): string {
  if (mask === FULL_WEEK_MASK) return "Every day";
  const days = WEEKDAYS.filter((d) => maskHasDay(mask, d.bit)).map((d) => d.short);
  return days.length ? days.join(", ") : "No days selected";
}
