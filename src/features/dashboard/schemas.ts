import { z } from "zod";

/**
 * Field dashboard KPIs (GET /dashboard). Money figures arrive as decimal
 * strings; coerced to numbers at the api.ts boundary.
 */
export const dashboardSchema = z.object({
  network: z.object({
    distributors: z.number(),
    outlets: z.number(),
    salesReps: z.number(),
  }),
  dues: z.object({
    outstanding: z.coerce.number(),
    outletsWithDues: z.number(),
  }),
  visits: z.object({
    count: z.number(),
    newOutlets: z.number(),
    withOrder: z.number(),
    strikeRatePct: z.number(),
  }),
  topSkus: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      qty: z.coerce.number(),
      value: z.coerce.number(),
    }),
  ),
});
export type Dashboard = z.infer<typeof dashboardSchema>;
