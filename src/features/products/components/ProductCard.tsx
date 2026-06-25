import { View } from "react-native";
import { Milk } from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Text";
import { QuantityStepper } from "@/components/QuantityStepper";
import { cn } from "@/lib/cn";
import { colors } from "@/lib/theme";
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
  const selected = quantity > 0;
  return (
    <Card variant="elevated" className={cn(selected && "border-accent/40")}>
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft">
          <Milk size={22} color={colors.accent} strokeWidth={2} />
        </View>
        <View className="flex-1">
          <Txt variant="label">{product.name}</Txt>
          <Txt variant="caption">{productUnitLabel(product)}</Txt>
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
      </View>
    </Card>
  );
}
