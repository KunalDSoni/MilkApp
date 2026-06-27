import { z } from "zod";
import { productSchema } from "@/features/products/schemas";

// Real contract uses a 7-bit weekday mask (Monday = bit 0, 127 = every day).
// No backend route exists yet (Slice 2); shapes mirror upsertStandingOrderSchema.
export const standingLineSchema = z.object({
  productId: z.string(),
  qty: z.number().positive(),
  product: productSchema.optional(),
});
export type StandingLine = z.infer<typeof standingLineSchema>;

export const standingOrderSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  retailerId: z.string().optional(),
  retailer: z.string().optional(),
  weekdayMask: z.number().int().min(0).max(127),
  active: z.boolean(),
  items: z.array(standingLineSchema).min(1),
});
export type StandingOrder = z.infer<typeof standingOrderSchema>;

export const standingListSchema = z.array(standingOrderSchema);

export const standingFormSchema = z.object({
  retailerId: z.string().min(1, "Select an outlet"),
  name: z.string().optional(),
  weekdayMask: z.number().int().min(1, "Select at least one day").max(127),
  active: z.boolean(),
  items: z
    .array(z.object({ productId: z.string(), qty: z.number().int().min(1) }))
    .min(1, "Add at least one product"),
});
export type StandingForm = z.infer<typeof standingFormSchema>;
