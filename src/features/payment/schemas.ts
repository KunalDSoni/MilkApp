import { z } from "zod";

export const paymentModeSchema = z.enum(["CASH", "UPI", "CHEQUE", "BANK_TRANSFER"]);
export type PaymentMode = z.infer<typeof paymentModeSchema>;

export const paymentStatusSchema = z.enum(["PENDING", "PAID"]);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const paymentLogSchema = z.object({
  id: z.string(),
  distributorId: z.string(),
  distributorName: z.string(),
  orderId: z.string().nullable(),
  amount: z.string(),
  paymentDate: z.string(),
  mode: paymentModeSchema,
  status: paymentStatusSchema,
  proofImageKey: z.string().nullable(),
  note: z.string().nullable(),
  recordedBy: z.string(),
  createdAt: z.string(),
});
export type PaymentLog = z.infer<typeof paymentLogSchema>;
export const paymentListSchema = z.array(paymentLogSchema);

export const createPaymentSchema = z.object({
  orderId: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  paymentDate: z.string().min(1, "Date is required"),
  mode: paymentModeSchema,
  proofImageKey: z.string().optional(),
  note: z.string().optional(),
});
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
