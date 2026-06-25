import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStandingOrder,
  deleteStandingOrder,
  fetchStandingOrders,
  updateStandingOrder,
} from "./api";
import { StandingForm } from "./schemas";

export const standingKeys = {
  all: ["standing"] as const,
};

export function useStandingOrders() {
  return useQuery({
    queryKey: standingKeys.all,
    queryFn: fetchStandingOrders,
  });
}

export function useCreateStandingOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StandingForm) => createStandingOrder(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: standingKeys.all }),
  });
}

export function useUpdateStandingOrder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StandingForm) => updateStandingOrder(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: standingKeys.all }),
  });
}

export function useDeleteStandingOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStandingOrder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: standingKeys.all }),
  });
}
