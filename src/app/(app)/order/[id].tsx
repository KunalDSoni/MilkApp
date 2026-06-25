import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams } from "expo-router";
import { useOrder } from "@/features/orders/hooks";
import { OrderLineRow } from "@/features/orders/components/OrderLineRow";
import { OrderSummaryCard } from "@/features/orders/components/OrderSummaryCard";
import { Card } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Text";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { normalizeError } from "@/core/api/errors";
import { formatDate } from "@/lib/format";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useOrder(id);

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-surface-muted">
      <Stack.Screen options={{ headerShown: true, title: "Order Details" }} />
      {order.isLoading ? (
        <LoadingState />
      ) : order.isError || !order.data ? (
        <ErrorState message={normalizeError(order.error).message} onRetry={order.refetch} />
      ) : (
        <ScrollView contentContainerClassName="p-4 gap-4">
          <Card className="gap-1">
            <Txt variant="overline">Delivery date</Txt>
            <Txt variant="h3">{formatDate(order.data.deliveryDate)}</Txt>
          </Card>
          <Card>
            <Txt variant="overline" className="mb-1">
              Items · {order.data.items.length}
            </Txt>
            {order.data.items.map((line) => (
              <OrderLineRow key={line.productId} line={line} />
            ))}
          </Card>
          <OrderSummaryCard order={order.data} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
