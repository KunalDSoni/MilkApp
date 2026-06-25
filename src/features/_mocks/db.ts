/**
 * In-memory mock backend. Active only when EXPO_PUBLIC_USE_MOCKS=true.
 * Shapes mirror the real backend (Milk/apps/api). Where the real backend has no
 * endpoint yet (windows, standing, notifications), the mock fills the gap so the
 * app stays demoable — see docs/BACKEND_ALIGNMENT.md.
 */
import { Product } from "@/features/products/schemas";
import { Order, OrderLine, OrderWindow } from "@/features/orders/schemas";
import { StandingOrder } from "@/features/standing/schemas";
import { AppNotification } from "@/features/notifications/schemas";

let seq = 1;
export function nextId(prefix: string) {
  return `${prefix}_${seq++}`;
}

// Products as real ProductDto (no price field; decimals as strings).
export const products: Product[] = [
  { id: "p_gold500", sku: "GOLD-500", name: "Gold Milk", category: "MILK", uom: "LITRE", packSize: "0.500", taxRate: "0", isReturnablePack: false, active: true },
  { id: "p_gold1l", sku: "GOLD-1L", name: "Gold Milk", category: "MILK", uom: "LITRE", packSize: "1.000", taxRate: "0", isReturnablePack: false, active: true },
  { id: "p_tond", sku: "TOND-500", name: "Tond Milk", category: "MILK", uom: "LITRE", packSize: "0.500", taxRate: "0", isReturnablePack: false, active: true },
  { id: "p_dtond", sku: "DTOND-500", name: "Double Tond Milk", category: "MILK", uom: "LITRE", packSize: "0.500", taxRate: "0", isReturnablePack: false, active: true },
  { id: "p_tea", sku: "TEA-500", name: "Tea Special", category: "MILK", uom: "LITRE", packSize: "0.500", taxRate: "0", isReturnablePack: false, active: true },
  { id: "p_cow", sku: "COW-500", name: "Cow Milk", category: "MILK", uom: "LITRE", packSize: "0.500", taxRate: "0", isReturnablePack: false, active: true },
  { id: "p_skim", sku: "SKIM-500", name: "Skimmed Milk", category: "MILK", uom: "LITRE", packSize: "0.500", taxRate: "0", isReturnablePack: false, active: true },
  { id: "p_chhach", sku: "CHHACH-200", name: "Chhach", category: "DAIRY", uom: "ML", packSize: "200.000", taxRate: "5", isReturnablePack: false, active: true },
  { id: "p_dahi", sku: "DAHI-400", name: "Dahi", category: "DAIRY", uom: "GRAM", packSize: "400.000", taxRate: "5", isReturnablePack: false, active: true },
  { id: "p_sdahi", sku: "SDAHI-400", name: "Sweet Dahi", category: "DAIRY", uom: "GRAM", packSize: "400.000", taxRate: "5", isReturnablePack: false, active: true },
  { id: "p_lassi", sku: "LASSI-200", name: "Lassi", category: "DAIRY", uom: "ML", packSize: "200.000", taxRate: "5", isReturnablePack: false, active: true },
  { id: "p_mishti", sku: "MISHTI-400", name: "Mishti Doi", category: "DAIRY", uom: "GRAM", packSize: "400.000", taxRate: "5", isReturnablePack: false, active: true },
];

export const productById = (pid: string) => products.find((p) => p.id === pid);

// Mock retail price list (the real backend computes totals server-side from
// PriceList; the app never sees these — the mock only needs them for totals).
const mockPrice: Record<string, number> = {
  p_gold500: 35, p_gold1l: 68, p_tond: 27, p_dtond: 25, p_tea: 32, p_cow: 30,
  p_skim: 24, p_chhach: 12, p_dahi: 40, p_sdahi: 45, p_lassi: 20, p_mishti: 55,
};

// ── Order window (no real endpoint yet; mock keeps one OPEN for the demo) ──
export const currentWindow: OrderWindow = {
  id: "win_today",
  deliveryDate: new Date().toISOString().slice(0, 10),
  cutoffAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
  status: "OPEN",
};

function buildLine(productId: string, qty: number): OrderLine {
  const unitPrice = mockPrice[productId] ?? 0;
  return { productId, unitPrice, qty, product: productById(productId) };
}

function buildOrder(
  id: string,
  items: { productId: string; qty: number }[],
  status: Order["status"],
  date: string,
  source: Order["source"] = "MANUAL",
): Order {
  const lines = items.map((i) => buildLine(i.productId, i.qty));
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  const taxTotal = lines.reduce((s, l) => {
    const rate = Number(productById(l.productId)?.taxRate ?? 0);
    return s + (l.unitPrice * l.qty * rate) / 100;
  }, 0);
  return {
    id,
    deliveryDate: date,
    status,
    source,
    subtotal,
    taxTotal,
    total: subtotal + taxTotal,
    items: lines,
    createdAt: new Date(date).toISOString(),
  };
}

// ── Order history (past orders) ───────────────────────────────────────────
export const orders: Order[] = Array.from({ length: 8 }).map((_, i) => {
  const date = new Date(Date.now() - (i + 1) * 86400000).toISOString().slice(0, 10);
  return buildOrder(
    nextId("ord"),
    [
      { productId: "p_gold1l", qty: 10 },
      { productId: "p_tond", qty: 6 },
      { productId: "p_dahi", qty: 4 },
    ],
    i % 5 === 0 ? "DELIVERED" : "APPROVED",
    date,
    i % 2 === 0 ? "STANDING" : "MANUAL",
  );
});

export function createMockOrder(items: { productId: string; qty: number }[]): Order {
  if (currentWindow.status !== "OPEN") {
    const err = new Error("Order window is closed (cutoff passed).");
    (err as { code?: string }).code = "WINDOW_CLOSED";
    throw err;
  }
  const order = buildOrder(nextId("ord"), items, "DRAFT", currentWindow.deliveryDate);
  orders.unshift(order);
  return order;
}

export function submitMockOrder(orderId: string): Order {
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) throw new Error("Order not found");
  // Mimic auto-approval for the demo.
  orders[idx] = { ...orders[idx], status: "APPROVED" };
  pushNotification({
    type: "ORDER_CONFIRMATION",
    title: "Order submitted",
    body: `Your order of ${orders[idx].items.length} items is confirmed.`,
    route: "/(app)/(tabs)/orders",
  });
  return orders[idx];
}

// ── Standing orders (no real endpoint; mock-only, deferred to Slice 2) ─────
export const standingOrders: StandingOrder[] = [
  {
    id: "so_1",
    name: "Daily milk",
    weekdayMask: 127,
    active: true,
    items: [
      { productId: "p_gold1l", qty: 10, product: productById("p_gold1l") },
      { productId: "p_tond", qty: 6, product: productById("p_tond") },
      { productId: "p_dahi", qty: 4, product: productById("p_dahi") },
    ],
  },
];

// ── Notifications (no real endpoint; mock-only, deferred to Slice 2) ───────
export const notifications: AppNotification[] = [
  {
    id: "n_1",
    type: "ORDER_REMINDER",
    title: "Place today's order",
    body: "Build your cart and submit before cutoff.",
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
    read: false,
    route: "/(app)/(tabs)",
  },
  {
    id: "n_2",
    type: "BROADCAST",
    title: "Holiday schedule",
    body: "Deliveries run as usual this week.",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    read: true,
    route: "/(app)/(tabs)/notifications",
  },
];

export function pushNotification(
  n: Omit<AppNotification, "id" | "createdAt" | "read">,
): AppNotification {
  const created: AppNotification = {
    ...n,
    id: nextId("n"),
    createdAt: new Date().toISOString(),
    read: false,
  };
  notifications.unshift(created);
  return created;
}

export function markNotificationRead(nid: string) {
  const n = notifications.find((x) => x.id === nid);
  if (n) n.read = true;
}

export function markAllRead() {
  notifications.forEach((n) => (n.read = true));
}
