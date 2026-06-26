import { z } from "zod";

/** A customer (retailer/outlet) the distributor manages. */
export const customerSchema = z.object({
  id: z.string(),
  outletName: z.string(),
  address: z.string().nullable(),
  route: z.string().nullable(),
  gstin: z.string().nullable(),
  phone: z.string(),
  createdAt: z.string(),
});
export type Customer = z.infer<typeof customerSchema>;
export const customerListSchema = z.array(customerSchema);

// Optional 15-char GSTIN (empty allowed — many outlets are unregistered).
const gstinSchema = z
  .string()
  .trim()
  .regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/,
    "Enter a valid 15-character GSTIN",
  );

/** Add-customer form (phone is the raw 10-digit number; +91 added on submit). */
export const customerFormSchema = z.object({
  outletName: z.string().trim().min(1, "Outlet name is required").max(120),
  address: z.string().trim().min(1, "Address is required").max(240),
  route: z.string().trim().min(1, "Route name/number is required").max(60),
  gstin: z.union([z.literal(""), gstinSchema]).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
});
export type CustomerForm = z.infer<typeof customerFormSchema>;
