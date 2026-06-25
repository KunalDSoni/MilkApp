import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOrder,
  fetchCurrentWindow,
  fetchOrderById,
  fetchOrders,
  submitOrder,
} from "./api";
import { CartLine, Order } from "./schemas";

export const orderKeys = {
  window: ["order", "window"] as const,
  list: ["orders", "list"] as const,
  detail: (id: string) => ["order", "detail", id] as const,
};

export function useCurrentWindow() {
  return useQuery({
    queryKey: orderKeys.window,
    queryFn: fetchCurrentWindow,
    staleTime: 60_000,
    retry: false, // WINDOW_UNAVAILABLE is a known gap, not a transient error
  });
}

export function useOrders() {
  return useQuery({
    queryKey: orderKeys.list,
    queryFn: fetchOrders,
    staleTime: 30_000,
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => fetchOrderById(orderId),
  });
}

/**
 * Places an order: POST /orders (DRAFT) then POST /:id/submit. Two calls because
 * the backend models creation and submission as distinct steps. Not auto-retried.
 */
export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderWindowId,
      lines,
    }: {
      orderWindowId: string;
      lines: CartLine[];
    }): Promise<Order> => {
      const created = await createOrder(orderWindowId, lines);
      return submitOrder(created.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.list });
    },
  });
}
