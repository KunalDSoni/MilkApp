import { View } from "react-native";
import { CalendarDays, Pencil } from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
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
        <Txt variant="title">{standingOrder.name ?? "Standing order"}</Txt>
        <View
          className={cn(
            "rounded-full px-3 py-1",
            standingOrder.active ? "bg-success/15" : "bg-ink-subtle/20",
          )}
        >
          <Txt
            variant="caption"
            className={cn(
              "font-semibold",
              standingOrder.active ? "text-success" : "text-ink-muted",
            )}
          >
            {standingOrder.active ? "Active" : "Paused"}
          </Txt>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <CalendarDays size={16} color="#6B7280" />
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
        icon={<Pencil size={18} color="#0D47A1" />}
        onPress={onEdit}
      />
    </Card>
  );
}
