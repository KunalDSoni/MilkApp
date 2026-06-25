import { FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Receipt } from "lucide-react-native";
import { useOrders } from "@/features/orders/hooks";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { Card } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Text";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { normalizeError } from "@/core/api/errors";
import { formatCurrency, formatDate } from "@/lib/format";

export default function OrdersScreen() {
  const router = useRouter();
  const orders = useOrders();

  if (orders.isLoading) return <LoadingState />;
  if (orders.isError)
    return <ErrorState message={normalizeError(orders.error).message} onRetry={orders.refetch} />;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-surface-muted">
      <View className="px-4 pb-2 pt-2">
        <Txt variant="h2">Order History</Txt>
      </View>
      <FlatList
        data={orders.data}
        keyExtractor={(o) => o.id}
        contentContainerClassName="p-4 gap-3"
        refreshing={orders.isRefetching}
        onRefresh={orders.refetch}
        ListEmptyComponent={<EmptyState icon={Receipt} title="No past orders yet" />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({ pathname: "/(app)/order/[id]", params: { id: item.id } })
            }
          >
            <Card className="gap-2">
              <View className="flex-row items-center justify-between">
                <Txt variant="title">{formatDate(item.deliveryDate)}</Txt>
                <OrderStatusBadge status={item.status} />
              </View>
              <View className="flex-row items-center justify-between">
                <Txt variant="muted">
                  {item.items.length} items · {item.items.reduce((s, l) => s + l.qty, 0)} qty
                </Txt>
                <Txt variant="label" className="text-brand-dark">
                  {formatCurrency(item.total)}
                </Txt>
              </View>
            </Card>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
