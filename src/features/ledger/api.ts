import { apiClient } from "@/core/api/client";
import { env } from "@/core/config/env";
import {
  OutletLedger,
  PaymentMode,
  outletLedgerSchema,
} from "./schemas";
import { outletLedgers, recordMockCollection } from "@/features/_mocks/db";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchOutletLedger(retailerId: string): Promise<OutletLedger> {
  if (env.useMocks) {
    await delay(250);
    const ledger = outletLedgers[retailerId];
    if (!ledger) throw new Error("Outlet statement not found");
    return outletLedgerSchema.parse(ledger);
  }
  const { data } = await apiClient.get(`/customers/${retailerId}/ledger`);
  return outletLedgerSchema.parse(data);
}

export interface RecordCollectionInput {
  retailerId: string;
  amount: number;
  mode: PaymentMode;
  note?: string;
}

export async function recordCollection(
  input: RecordCollectionInput,
): Promise<OutletLedger> {
  if (env.useMocks) {
    await delay(300);
    const ledger = recordMockCollection(
      input.retailerId,
      input.amount,
      input.mode,
      input.note,
    );
    return outletLedgerSchema.parse(ledger);
  }
  // Backend takes the decimal as a string.
  const { data } = await apiClient.post("/collections", {
    retailerId: input.retailerId,
    amount: String(input.amount),
    mode: input.mode,
    note: input.note ? input.note : undefined,
  });
  return outletLedgerSchema.parse(data);
}
