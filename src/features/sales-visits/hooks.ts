import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSalesVisit } from "./api";
import { SalesVisitForm } from "./schemas";

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
    },
  });
}
