import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCustomer, fetchCustomers } from "./api";
import { CustomerForm } from "./schemas";

export const customerKeys = {
  all: ["customers"] as const,
};

export function useCustomers() {
  return useQuery({
    queryKey: customerKeys.all,
    queryFn: fetchCustomers,
    staleTime: 30_000,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CustomerForm) => createCustomer(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: customerKeys.all }),
  });
}
