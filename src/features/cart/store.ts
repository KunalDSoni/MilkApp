/**
 * Local cart. The backend has no draft/PATCH endpoint — the retailer builds a
 * cart on-device, then it's posted as one order (POST /orders) and submitted.
 */
import { create } from "zustand";
import { CartLine } from "@/features/orders/schemas";

interface CartState {
  quantities: Record<string, number>;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  lines: () => CartLine[];
  itemCount: () => number;
}

export const useCart = create<CartState>((set, get) => ({
  quantities: {},
  setQty: (productId, qty) =>
    set((s) => {
      const next = { ...s.quantities };
      if (qty > 0) next[productId] = qty;
      else delete next[productId];
      return { quantities: next };
    }),
  clear: () => set({ quantities: {} }),
  lines: () =>
    Object.entries(get().quantities).map(([productId, qty]) => ({ productId, qty })),
  itemCount: () => Object.keys(get().quantities).length,
}));
