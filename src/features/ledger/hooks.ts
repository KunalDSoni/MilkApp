import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  RecordCollectionInput,
  fetchOutletLedger,
  recordCollection,
} from "./api";
import { customerKeys } from "@/features/customers/hooks";
import { dashboardKeys } from "@/features/dashboard/hooks";

export const ledgerKeys = {
  outlet: (retailerId: string) => ["ledger", retailerId] as const,
};

export function useOutletLedger(retailerId: string) {
  return useQuery({
    queryKey: ledgerKeys.outlet(retailerId),
    queryFn: () => fetchOutletLedger(retailerId),
    enabled: !!retailerId,
    staleTime: 30_000,
  });
}

export function useRecordCollection(retailerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RecordCollectionInput) => recordCollection(input),
    onSuccess: (ledger) => {
      // Seed the cache with the fresh statement, then refresh dependents.
      qc.setQueryData(ledgerKeys.outlet(retailerId), ledger);
      qc.invalidateQueries({ queryKey: customerKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
