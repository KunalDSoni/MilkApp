import { View } from "react-native";
import { Card } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Text";
import { QuantityStepper } from "@/components/QuantityStepper";
import { Product, productUnitLabel } from "../schemas";

interface ProductCardProps {
  product: Product;
  quantity: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}

// No price shown: the backend prices orders server-side (see BACKEND_ALIGNMENT).
export function ProductCard({ product, quantity, onChange, disabled }: ProductCardProps) {
  const unavailable = !product.active;
  return (
    <Card className="flex-row items-center justify-between gap-3">
      <View className="flex-1">
        <Txt variant="title">{product.name}</Txt>
        <Txt variant="muted">{productUnitLabel(product)}</Txt>
        {unavailable ? (
          <Txt variant="caption" className="text-danger">
            Unavailable
          </Txt>
        ) : null}
      </View>
      <QuantityStepper
        value={quantity}
        onChange={onChange}
        min={0}
        disabled={disabled || unavailable}
      />
    </Card>
  );
}
