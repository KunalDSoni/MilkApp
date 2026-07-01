import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPayments, createPayment } from "./api";
import { CreatePaymentInput } from "./schemas";

export const paymentKeys = {
  all: ["payments"] as const,
};

export function usePayments() {
  return useQuery({
    queryKey: paymentKeys.all,
    queryFn: fetchPayments,
    staleTime: 30_000,
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePaymentInput) => createPayment(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: paymentKeys.all }),
  });
}
