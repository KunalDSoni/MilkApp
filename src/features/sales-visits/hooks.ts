import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSalesVisit, fetchSalesVisits } from "./api";
import { SalesVisitForm } from "./schemas";

export const salesVisitKeys = {
  all: ["sales-visits"] as const,
};

export function useSalesVisits() {
  return useQuery({
    queryKey: salesVisitKeys.all,
    queryFn: fetchSalesVisits,
    staleTime: 30_000,
  });
}

export function useCreateSalesVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      form,
      quantities,
    }: {
      form: SalesVisitForm;
      quantities: Record<string, string>;
    }) => createSalesVisit(form, quantities),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders", "list"] });
      qc.invalidateQueries({ queryKey: salesVisitKeys.all });
    },
  });
}
