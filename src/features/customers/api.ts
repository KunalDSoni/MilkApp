import { apiClient } from "@/core/api/client";
import { env } from "@/core/config/env";
import {
  Customer,
  CustomerForm,
  customerListSchema,
  customerSchema,
} from "./schemas";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const mockCustomers: Customer[] = [];

export async function fetchCustomers(): Promise<Customer[]> {
  if (env.useMocks) {
    await delay(250);
    return customerListSchema.parse(mockCustomers);
  }
  const { data } = await apiClient.get("/customers");
  return customerListSchema.parse(data);
}

export async function createCustomer(input: CustomerForm): Promise<Customer> {
  const payload = {
    outletName: input.outletName,
    address: input.address,
    route: input.route,
    gstin: input.gstin ? input.gstin : undefined,
    phone: `+91${input.phone}`,
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
      createdAt: new Date().toISOString(),
    };
    mockCustomers.unshift(created);
    return created;
  }
  const { data } = await apiClient.post("/customers", payload);
  return customerSchema.parse(data);
}
