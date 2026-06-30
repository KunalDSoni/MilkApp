import { View } from "react-native";
import { CalendarDays, Pencil } from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { colors } from "@/lib/theme";
import { formatMask } from "@/lib/constants";
import { StandingOrder } from "../schemas";

interface StandingOrderCardProps {
  standingOrder: StandingOrder;
  onEdit: () => void;
}

export function StandingOrderCard({ standingOrder, onEdit }: StandingOrderCardProps) {
  const itemCount = standingOrder.items.length;
  return (
    <Card className="gap-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Txt variant="title">{standingOrder.name ?? "Standing order"}</Txt>
          {standingOrder.retailer ? (
            <Txt variant="caption" className="text-ink-muted">
              {standingOrder.retailer}
            </Txt>
          ) : null}
        </View>
        <Badge
          label={standingOrder.active ? "Active" : "Paused"}
          tone={standingOrder.active ? "success" : "neutral"}
        />
      </View>

      <View className="flex-row items-center gap-2">
        <CalendarDays size={16} color={colors.textSecondary} />
        <Txt variant="muted">{formatMask(standingOrder.weekdayMask)}</Txt>
      </View>

      <Txt variant="muted">
        {itemCount} {itemCount === 1 ? "product" : "products"} ·{" "}
        {standingOrder.items
          .map((l) => `${l.product?.name ?? l.productId} ×${l.qty}`)
          .join(", ")}
      </Txt>

      <Button
        label="Edit"
        variant="secondary"
        size="md"
        icon={<Pencil size={18} color={colors.accent} />}
        onPress={onEdit}
      />
    </Card>
  );
}
