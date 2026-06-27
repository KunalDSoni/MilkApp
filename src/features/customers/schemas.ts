import { z } from "zod";

export const outletTypeSchema = z.enum(["NEW", "EXISTING"]);
export type OutletType = z.infer<typeof outletTypeSchema>;

/** A customer (retailer/outlet) the distributor manages. */
export const customerSchema = z.object({
  id: z.string(),
  outletName: z.string(),
  address: z.string().nullable(),
  route: z.string().nullable(),
  gstin: z.string().nullable(),
  phone: z.string(),
  whatsapp: z.string().nullable(),
  paymentTerms: z.string().nullable(),
  outletType: outletTypeSchema,
  salesOfficer: z.string().nullable(),
  createdAt: z.string(),
});
export type Customer = z.infer<typeof customerSchema>;
export const customerListSchema = z.array(customerSchema);

/** A sales rep (for the registration dropdown). */
export const salesRepSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
});
export type SalesRep = z.infer<typeof salesRepSchema>;
export const salesRepListSchema = z.array(salesRepSchema);

// Optional 15-char GSTIN (empty allowed — many outlets are unregistered).
const gstinSchema = z
  .string()
  .trim()
  .regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/,
    "Enter a valid 15-character GSTIN",
  );

const tenDigits = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");

/** Add-customer form (phone numbers are raw 10-digit; +91 added on submit). */
export const customerFormSchema = z.object({
  outletName: z.string().trim().min(1, "Outlet name is required").max(120),
  address: z.string().trim().min(1, "Address is required").max(240),
  route: z.string().trim().min(1, "Route name/number is required").max(60),
  gstin: z.union([z.literal(""), gstinSchema]).optional(),
  phone: tenDigits,
  whatsapp: z.union([z.literal(""), tenDigits]).optional(),
  paymentTerms: z.string().trim().max(120).optional(),
  outletType: outletTypeSchema.default("EXISTING"),
  salesOfficerId: z.string().optional(),
});
export type CustomerForm = z.infer<typeof customerFormSchema>;
