import { useMemo } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams } from "expo-router";
import { RotateCcw } from "lucide-react-native";
import { useOrder, useReorder } from "@/features/orders/hooks";
import { useProducts } from "@/features/products/hooks";
import { Product } from "@/features/products/schemas";
import { OrderLineRow } from "@/features/orders/components/OrderLineRow";
import { OrderSummaryCard } from "@/features/orders/components/OrderSummaryCard";
import { Card } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { normalizeError } from "@/core/api/errors";
import { formatDate } from "@/lib/format";
import { colors } from "@/lib/theme";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useOrder(id);
  const products = useProducts();
  const reorder = useReorder();

  // Order items carry only productId; join with the catalog for names/units.
  const productById = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of products.data ?? []) map.set(p.id, p);
    return map;
  }, [products.data]);

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
              <OrderLineRow
                key={line.productId}
                line={{ ...line, product: productById.get(line.productId) }}
              />
            ))}
          </Card>
          <OrderSummaryCard order={order.data} />
          <Button
            label="Reorder these items"
            icon={<RotateCcw size={18} color={colors.white} strokeWidth={2.3} />}
            onPress={() => reorder(order.data!)}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
