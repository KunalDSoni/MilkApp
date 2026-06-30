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
import { Customer, SalesRep } from "@/features/customers/schemas";
import { LedgerEntry, OutletLedger, PaymentMode } from "@/features/ledger/schemas";
import { Dashboard } from "@/features/dashboard/schemas";

let seq = 1;
export function nextId(prefix: string) {
  return `${prefix}_${seq++}`;
}

// Products as real ProductDto (no price field; decimals as strings).
// Pack size is encoded via uom + packSize; productUnitLabel() renders the
// human label (e.g. LITRE "0.500" → "500 ml", KG "1.000" → "1 kg").
// Returnable containers (buckets/matka) are flagged isReturnablePack.
export const products: Product[] = [
  { id: "p_gold500", sku: "GOLD-500", name: "Gold Milk", category: "MILK", uom: "LITRE", packSize: "0.500", taxRate: "0", isReturnablePack: false, active: true },
  { id: "p_gold1l", sku: "GOLD-1L", name: "Gold Milk", category: "MILK", uom: "LITRE", packSize: "1.000", taxRate: "0", isReturnablePack: false, active: true },
  { id: "p_tond500", sku: "TOND-500", name: "Tond Milk", category: "MILK", uom: "LITRE", packSize: "0.500", taxRate: "0", isReturnablePack: false, active: true },
  { id: "p_tond145", sku: "TOND-145", name: "Tond Milk", category: "MILK", uom: "LITRE", packSize: "0.145", taxRate: "0", isReturnablePack: false, active: true },
  { id: "p_dtond165", sku: "DTOND-165", name: "Double Tond Milk", category: "MILK", uom: "LITRE", packSize: "0.165", taxRate: "0", isReturnablePack: false, active: true },
  { id: "p_dtond500", sku: "DTOND-500", name: "Double Tond Milk", category: "MILK", uom: "LITRE", packSize: "0.500", taxRate: "0", isReturnablePack: false, active: true },
  { id: "p_tea1l", sku: "TEA-1L", name: "Tea Special", category: "MILK", uom: "LITRE", packSize: "1.000", taxRate: "0", isReturnablePack: false, active: true },
  { id: "p_tea500", sku: "TEA-500", name: "Tea Special", category: "MILK", uom: "LITRE", packSize: "0.500", taxRate: "0", isReturnablePack: false, active: true },
  { id: "p_tea150", sku: "TEA-150", name: "Tea Special", category: "MILK", uom: "LITRE", packSize: "0.150", taxRate: "0", isReturnablePack: false, active: true },
  { id: "p_cow1l", sku: "COW-1L", name: "Cow Milk", category: "MILK", uom: "LITRE", packSize: "1.000", taxRate: "0", isReturnablePack: false, active: true },
  { id: "p_cow500", sku: "COW-500", name: "Cow Milk", category: "MILK", uom: "LITRE", packSize: "0.500", taxRate: "0", isReturnablePack: false, active: true },
  { id: "p_cow145", sku: "COW-145", name: "Cow Milk", category: "MILK", uom: "LITRE", packSize: "0.145", taxRate: "0", isReturnablePack: false, active: true },
  { id: "p_skim450", sku: "SKIM-450", name: "Skimmed Milk", category: "MILK", uom: "LITRE", packSize: "0.450", taxRate: "0", isReturnablePack: false, active: true },
  { id: "p_skim180", sku: "SKIM-180", name: "Skimmed Milk", category: "MILK", uom: "LITRE", packSize: "0.180", taxRate: "0", isReturnablePack: false, active: true },
  { id: "p_pchhach325", sku: "PCHHACH-325", name: "Plain Chhach Pouch", category: "DAIRY", uom: "ML", packSize: "325.000", taxRate: "5", isReturnablePack: false, active: true },
  { id: "p_mchhach275", sku: "MCHHACH-275", name: "Masala Chhach Pouch", category: "DAIRY", uom: "ML", packSize: "275.000", taxRate: "5", isReturnablePack: false, active: true },
  { id: "p_dahip400", sku: "DAHI-P-400", name: "Dahi Pouch", category: "DAIRY", uom: "GRAM", packSize: "400.000", taxRate: "5", isReturnablePack: false, active: true },
  { id: "p_dahip1k", sku: "DAHI-P-1K", name: "Dahi Pouch", category: "DAIRY", uom: "KG", packSize: "1.000", taxRate: "5", isReturnablePack: false, active: true },
  { id: "p_dahib500", sku: "DAHI-B-500", name: "Dahi Bucket", category: "DAIRY", uom: "GRAM", packSize: "500.000", taxRate: "5", isReturnablePack: true, active: true },
  { id: "p_dahib1k", sku: "DAHI-B-1K", name: "Dahi Bucket", category: "DAIRY", uom: "KG", packSize: "1.000", taxRate: "5", isReturnablePack: true, active: true },
  { id: "p_dahim5k", sku: "DAHI-M-5K", name: "Dahi Matka", category: "DAIRY", uom: "KG", packSize: "5.000", taxRate: "5", isReturnablePack: true, active: true },
  { id: "p_dahib5k", sku: "DAHI-B-5K", name: "Dahi Bucket", category: "DAIRY", uom: "KG", packSize: "5.000", taxRate: "5", isReturnablePack: true, active: true },
  { id: "p_dahib15k", sku: "DAHI-B-15K", name: "Dahi Bucket", category: "DAIRY", uom: "KG", packSize: "15.000", taxRate: "5", isReturnablePack: true, active: true },
  { id: "p_dahic180", sku: "DAHI-C-180", name: "Dahi Cup", category: "DAIRY", uom: "GRAM", packSize: "180.000", taxRate: "5", isReturnablePack: false, active: true },
  { id: "p_dahic85", sku: "DAHI-C-85", name: "Dahi Cup", category: "DAIRY", uom: "GRAM", packSize: "85.000", taxRate: "5", isReturnablePack: false, active: true },
  { id: "p_sdahic180", sku: "SDAHI-C-180", name: "Sweet Dahi Cup", category: "DAIRY", uom: "GRAM", packSize: "180.000", taxRate: "5", isReturnablePack: false, active: true },
  { id: "p_sdahic85", sku: "SDAHI-C-85", name: "Sweet Dahi Cup", category: "DAIRY", uom: "GRAM", packSize: "85.000", taxRate: "5", isReturnablePack: false, active: true },
  { id: "p_mchhachg180", sku: "MCHHACH-G-180", name: "Masala Chhach Glass", category: "DAIRY", uom: "GRAM", packSize: "180.000", taxRate: "5", isReturnablePack: false, active: true },
  { id: "p_lassiv170", sku: "LASSI-V-170", name: "Vanilla Lassi Glass", category: "DAIRY", uom: "ML", packSize: "170.000", taxRate: "5", isReturnablePack: false, active: true },
  { id: "p_lassim170", sku: "LASSI-M-170", name: "Mango Lassi Glass", category: "DAIRY", uom: "ML", packSize: "170.000", taxRate: "5", isReturnablePack: false, active: true },
  { id: "p_lassir170", sku: "LASSI-R-170", name: "Rose Lassi Glass", category: "DAIRY", uom: "ML", packSize: "170.000", taxRate: "5", isReturnablePack: false, active: true },
  { id: "p_mishti170", sku: "MISHTI-170", name: "Mishti Doi", category: "DAIRY", uom: "GRAM", packSize: "170.000", taxRate: "5", isReturnablePack: false, active: true },
];

export const productById = (pid: string) => products.find((p) => p.id === pid);

// Mock retail price list (the real backend computes totals server-side from
// PriceList; the app never sees these — the mock only needs them for totals).
const mockPrice: Record<string, number> = {
  p_gold500: 35, p_gold1l: 68,
  p_tond500: 27, p_tond145: 10,
  p_dtond165: 10, p_dtond500: 25,
  p_tea1l: 60, p_tea500: 32, p_tea150: 12,
  p_cow1l: 60, p_cow500: 30, p_cow145: 10,
  p_skim450: 24, p_skim180: 12,
  p_pchhach325: 15, p_mchhach275: 14,
  p_dahip400: 40, p_dahip1k: 90,
  p_dahib500: 55, p_dahib1k: 100, p_dahim5k: 500, p_dahib5k: 450, p_dahib15k: 1300,
  p_dahic180: 25, p_dahic85: 15,
  p_sdahic180: 30, p_sdahic85: 18,
  p_mchhachg180: 20,
  p_lassiv170: 25, p_lassim170: 25, p_lassir170: 25,
  p_mishti170: 35,
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
      { productId: "p_tond500", qty: 6 },
      { productId: "p_dahip400", qty: 4 },
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
      { productId: "p_tond500", qty: 6, product: productById("p_tond500") },
      { productId: "p_dahip400", qty: 4, product: productById("p_dahip400") },
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

// ── Sales team (GET /sales-team) ───────────────────────────────────────────
export const salesTeam: SalesRep[] = [
  { id: "rep_1", name: "Amit Verma", phone: "+919000000010" },
  { id: "rep_2", name: "Priya Nair", phone: "+919000000011" },
];

// ── Customers / outlets (GET /customers). The list `id` IS the retailer id
// the ledger routes (GET /customers/:id/ledger) expect. ────────────────────
export const customers: Customer[] = [
  {
    id: "cust_seed_1",
    outletName: "Sharma General Store",
    address: "12 Station Road, Sector 4",
    route: "Route A",
    gstin: null,
    phone: "+919811100001",
    whatsapp: "+919811100001",
    paymentTerms: "7 days credit",
    outletType: "EXISTING",
    salesOfficer: "Amit Verma",
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: "cust_seed_2",
    outletName: "Krishna Dairy & Sweets",
    address: "Main Market, Near Bus Stand",
    route: "Route A",
    gstin: "07AABCK1234M1Z5",
    phone: "+919811100002",
    whatsapp: "+919811100002",
    paymentTerms: "Cash on delivery",
    outletType: "EXISTING",
    salesOfficer: "Amit Verma",
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: "cust_seed_3",
    outletName: "Gupta Provision",
    address: "45 Gandhi Nagar",
    route: "Route B",
    gstin: null,
    phone: "+919811100003",
    whatsapp: null,
    paymentTerms: "15 days credit",
    outletType: "EXISTING",
    salesOfficer: "Priya Nair",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "cust_seed_4",
    outletName: "Fresh Mart (New)",
    address: "Shop 8, Green Avenue",
    route: "Route B",
    gstin: null,
    phone: "+919811100004",
    whatsapp: "+919811100004",
    paymentTerms: null,
    outletType: "NEW",
    salesOfficer: "Priya Nair",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export function addMockCustomer(c: Customer) {
  customers.unshift(c);
  // New outlets start with a clean account.
  outletLedgers[c.id] = {
    retailerId: c.id,
    outletName: c.outletName,
    balance: 0,
    creditLimit: 0,
    entries: [],
  };
}

// ── Ledgers (GET /customers/:id/ledger, POST /collections) ─────────────────
// Build a statement from a chronological list of order debits and payments,
// computing the running balanceAfter the way the backend ledger does.
function buildLedger(
  retailerId: string,
  outletName: string,
  creditLimit: number,
  moves: { type: LedgerEntry["type"]; amount: number; refType: string; note: string; daysAgo: number }[],
): OutletLedger {
  let balance = 0;
  const entries: LedgerEntry[] = moves.map((m, i) => {
    balance += m.type === "DEBIT" ? m.amount : -m.amount;
    return {
      id: `led_${retailerId}_${i}`,
      type: m.type,
      amount: m.amount,
      refType: m.refType,
      refId: null,
      balanceAfter: balance,
      note: m.note,
      createdAt: new Date(Date.now() - m.daysAgo * 86400000).toISOString(),
    };
  });
  // Newest first, matching the backend ordering.
  entries.reverse();
  return { retailerId, outletName, balance, creditLimit, entries };
}

export const outletLedgers: Record<string, OutletLedger> = {
  cust_seed_1: buildLedger("cust_seed_1", "Sharma General Store", 15000, [
    { type: "DEBIT", amount: 4200, refType: "ORDER", note: "Order delivery", daysAgo: 12 },
    { type: "CREDIT", amount: 4200, refType: "PAYMENT", note: "CASH", daysAgo: 10 },
    { type: "DEBIT", amount: 5100, refType: "ORDER", note: "Order delivery", daysAgo: 6 },
    { type: "CREDIT", amount: 2000, refType: "PAYMENT", note: "UPI", daysAgo: 3 },
    { type: "DEBIT", amount: 3800, refType: "ORDER", note: "Order delivery", daysAgo: 1 },
  ]), // balance 6900 / 15000 — healthy
  cust_seed_2: buildLedger("cust_seed_2", "Krishna Dairy & Sweets", 10000, [
    { type: "DEBIT", amount: 6500, refType: "ORDER", note: "Order delivery", daysAgo: 9 },
    { type: "DEBIT", amount: 5200, refType: "ORDER", note: "Order delivery", daysAgo: 4 },
    { type: "CREDIT", amount: 1000, refType: "PAYMENT", note: "CASH", daysAgo: 2 },
  ]), // balance 10700 / 10000 — OVER LIMIT
  cust_seed_3: buildLedger("cust_seed_3", "Gupta Provision", 20000, [
    { type: "DEBIT", amount: 3000, refType: "ORDER", note: "Order delivery", daysAgo: 8 },
    { type: "CREDIT", amount: 3000, refType: "PAYMENT", note: "CHEQUE", daysAgo: 5 },
  ]), // balance 0 — clear
  cust_seed_4: buildLedger("cust_seed_4", "Fresh Mart (New)", 5000, [
    { type: "DEBIT", amount: 1500, refType: "ORDER", note: "First order", daysAgo: 2 },
  ]), // balance 1500 / 5000
};

/** Record a payment (CREDIT) and return the updated statement. */
export function recordMockCollection(
  retailerId: string,
  amount: number,
  mode: PaymentMode,
  note?: string,
): OutletLedger {
  const ledger = outletLedgers[retailerId];
  if (!ledger) throw new Error("Outlet not found");
  const balance = ledger.balance - amount;
  const entry: LedgerEntry = {
    id: nextId("led"),
    type: "CREDIT",
    amount,
    refType: "PAYMENT",
    refId: null,
    balanceAfter: balance,
    note: [mode, note].filter(Boolean).join(" · "),
    createdAt: new Date().toISOString(),
  };
  ledger.entries.unshift(entry);
  ledger.balance = balance;
  return ledger;
}

// ── Dashboard (GET /dashboard) — derived live from the seeded data so the KPI
// strip stays consistent after a payment is recorded. ──────────────────────
export function buildDashboard(): Dashboard {
  const ledgerList = Object.values(outletLedgers);
  const outstanding = ledgerList.reduce((s, l) => s + Math.max(l.balance, 0), 0);
  const outletsWithDues = ledgerList.filter((l) => l.balance > 0).length;

  // Top SKUs by value across the mock order history.
  const valueByProduct = new Map<string, { name: string; qty: number; value: number }>();
  for (const o of orders) {
    for (const l of o.items) {
      const name = productById(l.productId)?.name ?? l.productId;
      const prev = valueByProduct.get(l.productId) ?? { name, qty: 0, value: 0 };
      prev.qty += l.qty;
      prev.value += l.unitPrice * l.qty;
      valueByProduct.set(l.productId, prev);
    }
  }
  const topSkus = [...valueByProduct.entries()]
    .map(([productId, v]) => ({ productId, ...v }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return {
    network: { distributors: 1, outlets: customers.length, salesReps: salesTeam.length },
    dues: { outstanding, outletsWithDues },
    visits: { count: 18, newOutlets: 3, withOrder: 11, strikeRatePct: 61 },
    topSkus,
  };
}
