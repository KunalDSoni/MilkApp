/**
 * Standing-order API. Real mode hits the backend standing-order routes
 * (per-outlet recurring orders); mock mode runs the in-memory store.
 */
import { apiClient } from "@/core/api/client";
import { env } from "@/core/config/env";
import {
  StandingForm,
  StandingOrder,
  standingListSchema,
  standingOrderSchema,
} from "./schemas";
import { nextId, productById, standingOrders } from "@/features/_mocks/db";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const embed = (items: StandingForm["items"]) =>
  items.map((i) => ({ ...i, product: productById(i.productId) }));

const toPayload = (input: StandingForm) => ({
  retailerId: input.retailerId,
  name: input.name || undefined,
  weekdayMask: input.weekdayMask,
  active: input.active,
  items: input.items.map((i) => ({ productId: i.productId, qty: String(i.qty) })),
});

export async function fetchStandingOrders(): Promise<StandingOrder[]> {
  if (env.useMocks) {
    await delay(300);
    return standingListSchema.parse(standingOrders);
  }
  const { data } = await apiClient.get("/standing-orders");
  return standingListSchema.parse(data);
}

export async function createStandingOrder(input: StandingForm): Promise<StandingOrder> {
  if (env.useMocks) {
    await delay(300);
    const created = standingOrderSchema.parse({
      id: nextId("so"),
      name: input.name,
      weekdayMask: input.weekdayMask,
      active: input.active,
      items: embed(input.items),
    });
    standingOrders.push(created);
    return created;
  }
  const { data } = await apiClient.post("/standing-orders", toPayload(input));
  return standingOrderSchema.parse(data);
}

export async function updateStandingOrder(
  id: string,
  input: StandingForm,
): Promise<StandingOrder> {
  if (env.useMocks) {
    await delay(300);
    const idx = standingOrders.findIndex((s) => s.id === id);
    if (idx < 0) throw new Error("Standing order not found");
    standingOrders[idx] = standingOrderSchema.parse({
      id,
      name: input.name,
      weekdayMask: input.weekdayMask,
      active: input.active,
      items: embed(input.items),
    });
    return standingOrders[idx];
  }
  const { data } = await apiClient.patch(`/standing-orders/${id}`, toPayload(input));
  return standingOrderSchema.parse(data);
}

export async function deleteStandingOrder(id: string): Promise<void> {
  if (env.useMocks) {
    await delay(200);
    const idx = standingOrders.findIndex((s) => s.id === id);
    if (idx >= 0) standingOrders.splice(idx, 1);
    return;
  }
  await apiClient.delete(`/standing-orders/${id}`);
}
