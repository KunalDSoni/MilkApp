import { apiClient } from "@/core/api/client";
import { env } from "@/core/config/env";
import {
  Customer,
  CustomerForm,
  SalesRep,
  customerListSchema,
  customerSchema,
  salesRepListSchema,
} from "./schemas";
import {
  addMockCustomer,
  customers as mockCustomers,
  salesTeam as mockSalesTeam,
} from "@/features/_mocks/db";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchCustomers(): Promise<Customer[]> {
  if (env.useMocks) {
    await delay(250);
    return customerListSchema.parse(mockCustomers);
  }
  const { data } = await apiClient.get("/customers");
  return customerListSchema.parse(data);
}

export async function fetchSalesTeam(): Promise<SalesRep[]> {
  if (env.useMocks) {
    await delay(150);
    return salesRepListSchema.parse(mockSalesTeam);
  }
  const { data } = await apiClient.get("/sales-team");
  return salesRepListSchema.parse(data);
}

export async function createCustomer(input: CustomerForm): Promise<Customer> {
  const payload = {
    outletName: input.outletName,
    address: input.address,
    route: input.route,
    gstin: input.gstin ? input.gstin : undefined,
    phone: `+91${input.phone}`,
    whatsapp: input.whatsapp ? `+91${input.whatsapp}` : undefined,
    paymentTerms: input.paymentTerms ? input.paymentTerms : undefined,
    outletType: input.outletType,
    salesOfficerId: input.salesOfficerId ? input.salesOfficerId : undefined,
  };
  if (env.useMocks) {
    await delay(300);
    const created: Customer = {
      id: `cust_${Date.now()}`,
      outletName: payload.outletName,
      address: payload.address,
      route: payload.route,
      gstin: payload.gstin ?? null,
      phone: payload.phone,
      whatsapp: payload.whatsapp ?? null,
      paymentTerms: payload.paymentTerms ?? null,
      outletType: payload.outletType,
      salesOfficer:
        mockSalesTeam.find((r) => r.id === payload.salesOfficerId)?.name ?? null,
      createdAt: new Date().toISOString(),
    };
    addMockCustomer(created);
    return created;
  }
  const { data } = await apiClient.post("/customers", payload);
  return customerSchema.parse(data);
}
