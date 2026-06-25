/** Display formatting helpers. Currency is INR, the platform's only currency. */

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatQty(quantity: number, unit: string): string {
  return `${quantity} × ${unit}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "2h 15m left" style countdown to a future ISO timestamp. */
export function formatCountdown(targetIso: string, now = Date.now()): string {
  const diffMs = new Date(targetIso).getTime() - now;
  if (diffMs <= 0) return "Closed";
  const totalMinutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}
