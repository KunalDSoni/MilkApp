/**
 * Standing-order API. The backend has NO standing-order routes yet (Slice 2),
 * so real mode is intentionally unsupported and this runs mock-only. Shapes
 * mirror @moderns-milk/contracts upsertStandingOrderSchema for an easy swap.
 */
import { env } from "@/core/config/env";
import {
  StandingForm,
  StandingOrder,
  standingListSchema,
  standingOrderSchema,
} from "./schemas";
import { nextId, productById, standingOrders } from "@/features/_mocks/db";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function unsupported(): never {
  throw new Error("Standing orders are not available on the backend yet.");
}

const embed = (items: StandingForm["items"]) =>
  items.map((i) => ({ ...i, product: productById(i.productId) }));

export async function fetchStandingOrders(): Promise<StandingOrder[]> {
  if (!env.useMocks) unsupported();
  await delay(300);
  return standingListSchema.parse(standingOrders);
}

export async function createStandingOrder(input: StandingForm): Promise<StandingOrder> {
  if (!env.useMocks) unsupported();
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

export async function updateStandingOrder(
  id: string,
  input: StandingForm,
): Promise<StandingOrder> {
  if (!env.useMocks) unsupported();
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

export async function deleteStandingOrder(id: string): Promise<void> {
  if (!env.useMocks) unsupported();
  await delay(200);
  const idx = standingOrders.findIndex((s) => s.id === id);
  if (idx >= 0) standingOrders.splice(idx, 1);
}
