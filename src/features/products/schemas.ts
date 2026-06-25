import { z } from "zod";

// Mirrors @moderns-milk/contracts productDtoSchema. Decimals are JSON strings.
export const productCategorySchema = z.enum(["MILK", "DAIRY"]);
export const uomSchema = z.enum(["LITRE", "ML", "KG", "GRAM", "PIECE", "POUCH"]);

export const productSchema = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string(),
  category: productCategorySchema,
  uom: uomSchema,
  packSize: z.string(), // e.g. "0.500", "1.000"
  taxRate: z.string(),
  isReturnablePack: z.boolean(),
  active: z.boolean(),
  // The backend does not expose a retailer price; pricing is applied server-side
  // at order creation. Kept optional for any future price endpoint.
  price: z.number().optional(),
});

export type Product = z.infer<typeof productSchema>;

export const productListSchema = z.array(productSchema);

const UOM_SHORT: Record<z.infer<typeof uomSchema>, string> = {
  LITRE: "L",
  ML: "ml",
  KG: "kg",
  GRAM: "g",
  PIECE: "pc",
  POUCH: "pouch",
};

/** Human-friendly pack label, e.g. packSize "0.500" + LITRE → "500 ml". */
export function productUnitLabel(p: Pick<Product, "packSize" | "uom">): string {
  const size = Number(p.packSize);
  if (p.uom === "LITRE" && size < 1) return `${Math.round(size * 1000)} ml`;
  if (p.uom === "KG" && size < 1) return `${Math.round(size * 1000)} g`;
  const trimmed = Number.isInteger(size) ? String(size) : String(size);
  return `${trimmed} ${UOM_SHORT[p.uom]}`;
}
