import { z } from "zod";

/** Payment modes accepted when recording a collection (matches the backend). */
export const paymentModeSchema = z.enum(["CASH", "UPI", "CHEQUE", "OTHER"]);
export type PaymentMode = z.infer<typeof paymentModeSchema>;

/**
 * A single ledger line. The API sends decimals as strings; we coerce to numbers
 * at the boundary so components never deal with string money.
 */
export const ledgerEntrySchema = z.object({
  id: z.string(),
  type: z.enum(["DEBIT", "CREDIT"]),
  amount: z.coerce.number(),
  refType: z.string(),
  refId: z.string().nullable(),
  balanceAfter: z.coerce.number(),
  note: z.string().nullable(),
  createdAt: z.string(),
});
export type LedgerEntry = z.infer<typeof ledgerEntrySchema>;

/** An outlet's account statement: balance, limit, and recent entries. */
export const outletLedgerSchema = z.object({
  retailerId: z.string(),
  outletName: z.string(),
  balance: z.coerce.number(),
  creditLimit: z.coerce.number(),
  entries: z.array(ledgerEntrySchema),
});
export type OutletLedger = z.infer<typeof outletLedgerSchema>;

/** Record-payment form (amount is entered as a string, validated > 0). */
export const recordCollectionFormSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, "Enter an amount")
    .refine((v) => Number(v) > 0, "Amount must be greater than 0"),
  mode: paymentModeSchema.default("CASH"),
  note: z.string().trim().max(200).optional(),
});
export type RecordCollectionForm = z.infer<typeof recordCollectionFormSchema>;
