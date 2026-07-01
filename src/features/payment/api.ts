import { apiClient } from "@/core/api/client";
import { env } from "@/core/config/env";
import { PaymentLog, CreatePaymentInput, paymentListSchema, paymentLogSchema } from "./schemas";
import { orders } from "@/features/_mocks/db";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let mockPayments: PaymentLog[] = [
  {
    id: "pay_mock_1",
    distributorId: "dist_1",
    distributorName: "Modern Dairy",
    orderId: "ord_1",
    amount: "4200.00",
    paymentDate: new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10),
    mode: "CASH",
    status: "PAID",
    proofImageKey: null,
    note: "Cash collected from Sharma General",
    recordedBy: "Amit Verma",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "pay_mock_2",
    distributorId: "dist_1",
    distributorName: "Modern Dairy",
    orderId: null,
    amount: "2000.00",
    paymentDate: new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10),
    mode: "UPI",
    status: "PENDING",
    proofImageKey: null,
    note: "UPI payment Krishna Sweets",
    recordedBy: "Priya Nair",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "pay_mock_3",
    distributorId: "dist_1",
    distributorName: "Modern Dairy",
    orderId: "ord_2",
    amount: "5100.00",
    paymentDate: new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10),
    mode: "CHEQUE",
    status: "PAID",
    proofImageKey: null,
    note: "Cheque #004251",
    recordedBy: "Amit Verma",
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
];

export async function fetchPayments(): Promise<PaymentLog[]> {
  if (env.useMocks) {
    await delay(250);
    return paymentListSchema.parse(mockPayments);
  }
  const { data } = await apiClient.get("/payments");
  return paymentListSchema.parse(data);
}

export async function createPayment(input: CreatePaymentInput): Promise<PaymentLog> {
  if (env.useMocks) {
    await delay(300);
    const created: PaymentLog = {
      id: `pay_${Date.now()}`,
      distributorId: "dist_1",
      distributorName: "Modern Dairy",
      orderId: input.orderId ?? null,
      amount: input.amount,
      paymentDate: input.paymentDate,
      mode: input.mode,
      status: "PENDING",
      proofImageKey: input.proofImageKey ?? null,
      note: input.note ?? null,
      recordedBy: "You",
      createdAt: new Date().toISOString(),
    };
    mockPayments.unshift(created);
    return paymentLogSchema.parse(created);
  }
  const { data } = await apiClient.post("/payments", input);
  return paymentLogSchema.parse(data);
}
