import { z } from "zod";

const optionalTime = z
  .union([
    z.literal(""),
    z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM"),
  ])
  .optional();

/** Visit metadata (the SKU quantities are managed separately as a map). */
export const salesVisitFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  salesOfficerId: z.string().min(1, "Select a sales team member"),
  retailerId: z.string().min(1, "Select an outlet"),
  routeName: z.string().trim().max(60).optional(),
  outletType: z.enum(["NEW", "EXISTING"]).default("EXISTING"),
  dayStartAt: optionalTime,
  inTime: optionalTime,
  bookingTime: optionalTime,
  competition: z.string().trim().max(500).optional(),
  remarks: z.string().trim().max(500).optional(),
});
export type SalesVisitForm = z.infer<typeof salesVisitFormSchema>;

export const salesVisitSchema = z.object({
  id: z.string(),
  date: z.string(),
  salesOfficer: z.string(),
  retailer: z.string(),
  route: z.string().nullable(),
  outletType: z.enum(["NEW", "EXISTING"]),
  inTime: z.string().nullable(),
  bookingTime: z.string().nullable(),
  competition: z.string().nullable(),
  remarks: z.string().nullable(),
  itemCount: z.number(),
  orderId: z.string().nullable(),
  orderTotal: z.string().nullable(),
  createdAt: z.string(),
});
export type SalesVisit = z.infer<typeof salesVisitSchema>;
export const salesVisitListSchema = z.array(salesVisitSchema);
