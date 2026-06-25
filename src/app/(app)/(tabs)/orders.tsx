import { useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight, Receipt } from "lucide-react-native";
import { useOrders } from "@/features/orders/hooks";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { Card } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Text";
import { Banner } from "@/components/Banner";
import { AnimatedItem } from "@/components/AnimatedItem";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { colors } from "@/lib/theme";
import { normalizeError } from "@/core/api/errors";
import { formatCurrency, formatDate } from "@/lib/format";

export default function OrdersScreen() {
  const router = useRouter();
  const orders = useOrders();
  // Set by the place-order flow (router param) to confirm a successful submit.
  const { placed } = useLocalSearchParams<{ placed?: string }>();
  const [showPlaced, setShowPlaced] = useState(placed === "1");

  if (orders.isLoading) return <LoadingState />;
  if (orders.isError)
    return <ErrorState message={normalizeError(orders.error).message} onRetry={orders.refetch} />;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-surface-muted">
      <View className="gap-0.5 px-4 pb-3 pt-3">
        <Txt variant="overline">History</Txt>
        <Txt variant="h2">Your orders</Txt>
      </View>
      {showPlaced ? (
        <View className="px-4 pb-1">
          <Banner
            tone="success"
            message="Order placed successfully"
            autoDismissMs={4000}
            onDismiss={() => setShowPlaced(false)}
          />
        </View>
      ) : null}
      <FlatList
        data={orders.data}
        keyExtractor={(o) => o.id}
        contentContainerClassName="px-4 pb-4 gap-3"
        refreshing={orders.isRefetching}
        onRefresh={orders.refetch}
        ListEmptyComponent={
          <EmptyState
            icon={Receipt}
            title="No past orders yet"
            subtitle="Your placed orders will appear here."
          />
        }
        renderItem={({ item, index }) => (
          <AnimatedItem index={index}>
            <Pressable
              onPress={() =>
                router.push({ pathname: "/(app)/order/[id]", params: { id: item.id } })
              }
              className="active:opacity-90"
            >
              <Card className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Txt variant="title">{formatDate(item.deliveryDate)}</Txt>
                  <OrderStatusBadge status={item.status} />
                </View>
                <View className="h-px bg-border" />
                <View className="flex-row items-center justify-between">
                  <Txt variant="muted">
                    {item.items.length} items · {item.items.reduce((s, l) => s + l.qty, 0)} qty
                  </Txt>
                  <View className="flex-row items-center gap-1">
                    <Txt variant="num" className="text-accent-dark text-base">
                      {formatCurrency(item.total)}
                    </Txt>
                    <ChevronRight size={16} color={colors.textSubtle} />
                  </View>
                </View>
              </Card>
            </Pressable>
          </AnimatedItem>
        )}
      />
    </SafeAreaView>
  );
}
