import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "./api";

export const productKeys = {
  all: ["products"] as const,
};

export function useProducts() {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // products change rarely
  });
}
