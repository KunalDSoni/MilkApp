import { z } from "zod";
import { productSchema } from "@/features/products/schemas";

// Real backend enum (@moderns-milk/contracts OrderStatus).
export const orderStatusSchema = z.enum([
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "IN_PRODUCTION",
  "DISPATCHED",
  "DELIVERED",
  "SETTLED",
  "CANCELLED",
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

// OrderWindow.status from the Prisma schema.
export const windowStatusSchema = z.enum(["OPEN", "LOCKED", "DISPATCHED", "CLOSED"]);
export type WindowStatus = z.infer<typeof windowStatusSchema>;

/** Internal window model used by the cart/cutoff UI. */
export const orderWindowSchema = z.object({
  id: z.string(),
  deliveryDate: z.string(),
  cutoffAt: z.string(),
  status: windowStatusSchema,
});
export type OrderWindow = z.infer<typeof orderWindowSchema>;

/**
 * Internal, UI-friendly order model. Decimal strings from the API are parsed to
 * numbers at the api.ts boundary, so components never deal with string money.
 */
export const orderLineSchema = z.object({
  productId: z.string(),
  unitPrice: z.number(),
  qty: z.number(),
  qtyApproved: z.number().nullable().optional(),
  product: productSchema.optional(),
});
export type OrderLine = z.infer<typeof orderLineSchema>;

export const orderSchema = z.object({
  id: z.string(),
  deliveryDate: z.string(),
  status: orderStatusSchema,
  source: z.enum(["STANDING", "MANUAL"]),
  subtotal: z.number(),
  taxTotal: z.number(),
  total: z.number(),
  items: z.array(orderLineSchema),
  createdAt: z.string(),
});
export type Order = z.infer<typeof orderSchema>;

/** A line in the local cart before it becomes an order. */
export interface CartLine {
  productId: string;
  qty: number;
}

/** Body for POST /orders. qty is a decimal string per the contract. */
export interface CreateOrderInput {
  orderWindowId: string;
  items: { productId: string; qty: string }[];
}
