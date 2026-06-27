import { apiClient } from "@/core/api/client";
import { env } from "@/core/config/env";
import { SalesVisitForm } from "./schemas";

export interface CreatedVisit {
  id: string;
  orderTotal: string | null;
}

export async function createSalesVisit(
  form: SalesVisitForm,
  quantities: Record<string, string>,
): Promise<CreatedVisit> {
  const items = Object.entries(quantities)
    .filter(([, q]) => Number(q) > 0)
    .map(([productId, q]) => ({ productId, qty: q }));

  const payload = {
    date: form.date,
    salesOfficerId: form.salesOfficerId,
    retailerId: form.retailerId,
    routeName: form.routeName || undefined,
    outletType: form.outletType,
    dayStartAt: form.dayStartAt || undefined,
    inTime: form.inTime || undefined,
    bookingTime: form.bookingTime || undefined,
    competition: form.competition || undefined,
    remarks: form.remarks || undefined,
    items,
  };

  if (env.useMocks) {
    await new Promise((r) => setTimeout(r, 300));
    return { id: `visit_${Date.now()}`, orderTotal: null };
  }
  const { data } = await apiClient.post("/sales-visits", payload);
  return { id: data.id, orderTotal: data.orderTotal ?? null };
}
