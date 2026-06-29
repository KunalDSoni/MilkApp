import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  createOrder,
  fetchCurrentWindow,
  fetchOrderById,
  fetchOrders,
  submitOrder,
} from "./api";
import { CartLine, Order } from "./schemas";
import { useCart } from "@/features/cart/store";
import { confirmDialog } from "@/lib/dialog";

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

/**
 * Refills the cart from a past order so the rep can reorder in one tap. Only
 * fills the cart and routes to the cart review — submission still goes through
 * the live window/cutoff check. Confirms before overwriting a non-empty cart.
 */
export function useReorder() {
  const router = useRouter();

  const fill = (order: Order) => {
    const { setQty, clear } = useCart.getState();
    clear();
    for (const line of order.items) {
      if (line.qty > 0) setQty(line.productId, line.qty);
    }
    router.push("/(app)/order/edit");
  };

  return (order: Order) => {
    const hasCart = useCart.getState().itemCount() > 0;
    if (hasCart) {
      confirmDialog(
        "Replace current cart?",
        "Reordering will replace the items currently in your cart.",
        () => fill(order),
        "Replace",
      );
      return;
    }
    fill(order);
  };
}
