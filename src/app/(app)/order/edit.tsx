import { Alert, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { ShoppingBasket } from "lucide-react-native";
import { useCart } from "@/features/cart/store";
import { useProducts } from "@/features/products/hooks";
import { useCurrentWindow, usePlaceOrder } from "@/features/orders/hooks";
import { CutoffBanner } from "@/features/orders/components/CutoffBanner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Txt } from "@/components/ui/Text";
import { QuantityStepper } from "@/components/QuantityStepper";
import { EmptyState } from "@/components/EmptyState";
import { productUnitLabel } from "@/features/products/schemas";
import { normalizeError } from "@/core/api/errors";
import { useIsOnline } from "@/core/offline/useNetworkStatus";

export default function CartReviewScreen() {
  const router = useRouter();
  const online = useIsOnline();
  const products = useProducts();
  const window = useCurrentWindow();
  const placeOrder = usePlaceOrder();

  const quantities = useCart((s) => s.quantities);
  const setQty = useCart((s) => s.setQty);
  const clear = useCart((s) => s.clear);

  const productById = (id: string) => products.data?.find((p) => p.id === id);
  const lines = Object.entries(quantities).map(([productId, qty]) => ({ productId, qty }));

  const onPlace = () => {
    if (!window.data) return;
    placeOrder.mutate(
      { orderWindowId: window.data.id, lines },
      {
        onSuccess: () => {
          clear();
          Alert.alert("Order placed", "Your order has been submitted.", [
            { text: "OK", onPress: () => router.replace("/(app)/(tabs)/orders") },
          ]);
        },
        onError: (err) => Alert.alert("Could not place order", normalizeError(err).message),
      },
    );
  };

  const windowOpen = window.data?.status === "OPEN";
  const canPlace = online && windowOpen && lines.length > 0 && !placeOrder.isPending;

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-surface-muted">
      <Stack.Screen options={{ headerShown: true, title: "Your Cart" }} />

      {lines.length === 0 ? (
        <EmptyState
          icon={ShoppingBasket}
          title="Your cart is empty"
          subtitle="Add products to place an order."
          actionLabel="Browse products"
          onAction={() => router.replace("/(app)/(tabs)/catalog")}
        />
      ) : (
        <>
          <ScrollView contentContainerClassName="p-4 gap-4">
            {window.data ? (
              <CutoffBanner cutoffAt={window.data.cutoffAt} status={window.data.status} />
            ) : window.isError ? (
              <Card className="bg-warning/10">
                <Txt variant="label" className="text-warning">
                  Ordering window unavailable
                </Txt>
                <Txt variant="muted">{normalizeError(window.error).message}</Txt>
              </Card>
            ) : null}

            <Card>
              <Txt variant="title" className="mb-1">
                Items
              </Txt>
              {lines.map((line) => {
                const product = productById(line.productId);
                return (
                  <View
                    key={line.productId}
                    className="flex-row items-center justify-between gap-3 border-b border-surface-muted py-3"
                  >
                    <View className="flex-1">
                      <Txt variant="label">{product?.name ?? line.productId}</Txt>
                      {product ? (
                        <Txt variant="caption">{productUnitLabel(product)}</Txt>
                      ) : null}
                    </View>
                    <QuantityStepper
                      value={line.qty}
                      onChange={(q) => setQty(line.productId, q)}
                      min={0}
                    />
                  </View>
                );
              })}
              <Button
                label="Add more items"
                variant="ghost"
                size="md"
                className="mt-3"
                onPress={() => router.push("/(app)/(tabs)/catalog")}
              />
            </Card>

            <Txt variant="caption" className="px-1">
              Pricing is calculated on submission. You&apos;ll see the total once the
              order is placed.
            </Txt>
          </ScrollView>

          <View className="border-t border-surface-muted bg-surface p-4">
            {!online ? (
              <Txt variant="caption" className="mb-2 text-center text-danger">
                Connect to the internet to place your order.
              </Txt>
            ) : null}
            <Button
              label="Place Order"
              onPress={onPlace}
              loading={placeOrder.isPending}
              disabled={!canPlace}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
