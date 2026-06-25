import { View } from "react-native";
import { Card } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Text";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { formatCurrency } from "@/lib/format";
import { Order } from "../schemas";

export function OrderSummaryCard({ order }: { order: Order }) {
  const itemCount = order.items.length;
  const totalQty = order.items.reduce((s, l) => s + l.qty, 0);

  return (
    <Card className="gap-3">
      <View className="flex-row items-center justify-between">
        <Txt variant="title">Order summary</Txt>
        <OrderStatusBadge status={order.status} />
      </View>
      <Row label="Items" value={`${itemCount}`} />
      <Row label="Total quantity" value={`${totalQty}`} />
      <Row label="Subtotal" value={formatCurrency(order.subtotal)} />
      <Row label="Tax" value={formatCurrency(order.taxTotal)} />
      <View className="h-px bg-border" />
      <View className="flex-row items-center justify-between">
        <Txt variant="title">Total</Txt>
        <Txt variant="numXl" className="text-accent-dark">
          {formatCurrency(order.total)}
        </Txt>
      </View>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Txt variant="muted">{label}</Txt>
      <Txt variant="num">{value}</Txt>
    </View>
  );
}
