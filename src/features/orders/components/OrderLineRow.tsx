import { View } from "react-native";
import { Txt } from "@/components/ui/Text";
import { formatCurrency } from "@/lib/format";
import { OrderLine } from "../schemas";
import { productUnitLabel } from "@/features/products/schemas";

/** Read-only line for a placed order (quantities are fixed once submitted). */
export function OrderLineRow({ line }: { line: OrderLine }) {
  const name = line.product?.name ?? line.productId;
  const unit = line.product ? productUnitLabel(line.product) : "";
  const lineTotal = line.unitPrice * line.qty;

  return (
    <View className="flex-row items-center justify-between gap-3 border-b border-surface-muted py-3">
      <View className="flex-1">
        <Txt variant="label">{name}</Txt>
        {unit ? <Txt variant="caption">{unit}</Txt> : null}
      </View>
      <View className="items-end">
        <Txt variant="title">× {line.qty}</Txt>
        {line.unitPrice > 0 ? (
          <Txt variant="caption">{formatCurrency(lineTotal)}</Txt>
        ) : null}
      </View>
    </View>
  );
}
