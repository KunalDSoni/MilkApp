import { apiClient } from "@/core/api/client";
import { env } from "@/core/config/env";
import { SalesVisitForm, SalesVisit, salesVisitListSchema } from "./schemas";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface CreatedVisit {
  id: string;
  orderTotal: string | null;
}

let mockVisits: SalesVisit[] = [
  {
    id: "visit_mock_1",
    date: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10),
    salesOfficer: "Amit Verma",
    retailer: "Sharma General Store",
    route: "Route A",
    outletType: "EXISTING",
    inTime: "09:15",
    bookingTime: "09:30",
    competition: null,
    remarks: "Regular visit, collected order",
    itemCount: 3,
    orderId: "ord_mock_1",
    orderTotal: "3800.00",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "visit_mock_2",
    date: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
    salesOfficer: "Priya Nair",
    retailer: "Krishna Dairy & Sweets",
    route: "Route A",
    outletType: "EXISTING",
    inTime: "10:00",
    bookingTime: "10:20",
    competition: "Amul",
    remarks: "Competitor offering 5% discount",
    itemCount: 2,
    orderId: null,
    orderTotal: null,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "visit_mock_3",
    date: new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10),
    salesOfficer: "Amit Verma",
    retailer: "Gupta Provision",
    route: "Route B",
    outletType: "NEW",
    inTime: "11:30",
    bookingTime: "11:45",
    competition: "Mother Dairy",
    remarks: "New outlet onboarded, placed first order",
    itemCount: 4,
    orderId: "ord_mock_2",
    orderTotal: "1500.00",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

export async function fetchSalesVisits(): Promise<SalesVisit[]> {
  if (env.useMocks) {
    await delay(250);
    return salesVisitListSchema.parse(mockVisits);
  }
  const { data } = await apiClient.get("/sales-visits");
  return salesVisitListSchema.parse(data);
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
    await delay(300);
    return { id: `visit_${Date.now()}`, orderTotal: null };
  }
  const { data } = await apiClient.post("/sales-visits", payload);
  return { id: data.id, orderTotal: data.orderTotal ?? null };
}
