import { apiClient } from "@/core/api/client";
import { env } from "@/core/config/env";
import { Product, productListSchema } from "./schemas";
import { products as mockProducts } from "@/features/_mocks/db";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** GET /catalog/products → ProductDto[] (active products only). */
export async function fetchProducts(): Promise<Product[]> {
  if (env.useMocks) {
    await delay(300);
    return productListSchema.parse(mockProducts);
  }
  const { data } = await apiClient.get("/catalog/products", {
    params: { active: true },
  });
  return productListSchema.parse(data);
}
