/**
 * Ordering API — aligned to Milk/apps/api ordering controller.
 *   POST /orders               { orderWindowId, items:[{productId, qty:string}] }
 *   POST /orders/:id/submit
 *   GET  /orders               (retailer-scoped, ≤100, newest first)
 *   GET  /orders/:id
 * Decimal strings from the API are parsed to numbers here so the UI never deals
 * with string money. The current order window comes from
 * GET /orders/windows/current; mock mode supplies one.
 */
import { z } from "zod";
import { apiClient } from "@/core/api/client";
import { env } from "@/core/config/env";
import {
  CartLine,
  Order,
  OrderWindow,
  orderSchema,
  orderStatusSchema,
  orderWindowSchema,
} from "./schemas";
import {
  createMockOrder,
  currentWindow,
  orders as mockOrders,
  submitMockOrder,
} from "@/features/_mocks/db";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Raw backend shape (decimals as strings, no embedded product).
const rawItem = z.object({
  productId: z.string(),
  unitPrice: z.string(),
  qtyOrdered: z.string(),
  qtyApproved: z.string().nullable().optional(),
});
const rawOrder = z.object({
  id: z.string(),
  deliveryDate: z.string(),
  status: orderStatusSchema,
  source: z.enum(["STANDING", "MANUAL"]),
  subtotal: z.string(),
  taxTotal: z.string(),
  total: z.string(),
  items: z.array(rawItem),
  createdAt: z.string(),
});

function toOrder(raw: z.infer<typeof rawOrder>): Order {
  return orderSchema.parse({
    id: raw.id,
    deliveryDate: raw.deliveryDate,
    status: raw.status,
    source: raw.source,
    subtotal: Number(raw.subtotal),
    taxTotal: Number(raw.taxTotal),
    total: Number(raw.total),
    createdAt: raw.createdAt,
    items: raw.items.map((i) => ({
      productId: i.productId,
      unitPrice: Number(i.unitPrice),
      qty: Number(i.qtyOrdered),
      qtyApproved: i.qtyApproved != null ? Number(i.qtyApproved) : null,
    })),
  });
}

/** Returns the retailer's open order window, or throws WINDOW_UNAVAILABLE (404). */
export async function fetchCurrentWindow(): Promise<OrderWindow> {
  if (env.useMocks) {
    await delay(200);
    return currentWindow;
  }
  try {
    const { data } = await apiClient.get("/orders/windows/current");
    return orderWindowSchema.parse({
      id: data.id,
      deliveryDate: data.deliveryDate,
      cutoffAt: data.cutoffAt,
      status: data.status,
    });
  } catch (e) {
    const status = (e as { response?: { status?: number } }).response?.status;
    if (status === 404) {
      const err = new Error("No order window is open right now.");
      (err as { code?: string }).code = "WINDOW_UNAVAILABLE";
      throw err;
    }
    throw e;
  }
}

export async function createOrder(
  orderWindowId: string,
  lines: CartLine[],
): Promise<Order> {
  if (env.useMocks) {
    await delay(400);
    return createMockOrder(lines);
  }
  const { data } = await apiClient.post("/orders", {
    orderWindowId,
    items: lines.map((l) => ({ productId: l.productId, qty: String(l.qty) })),
  });
  return toOrder(rawOrder.parse(data));
}

export async function submitOrder(orderId: string): Promise<Order> {
  if (env.useMocks) {
    await delay(400);
    return submitMockOrder(orderId);
  }
  const { data } = await apiClient.post(`/orders/${orderId}/submit`);
  return toOrder(rawOrder.parse(data));
}

export async function fetchOrders(): Promise<Order[]> {
  if (env.useMocks) {
    await delay(300);
    return mockOrders;
  }
  const { data } = await apiClient.get("/orders");
  return z.array(rawOrder).parse(data).map(toOrder);
}

export async function fetchOrderById(orderId: string): Promise<Order> {
  if (env.useMocks) {
    await delay(200);
    const found = mockOrders.find((o) => o.id === orderId);
    if (!found) throw new Error("Order not found");
    return found;
  }
  const { data } = await apiClient.get(`/orders/${orderId}`);
  return toOrder(rawOrder.parse(data));
}
