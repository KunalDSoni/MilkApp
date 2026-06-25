import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useProducts } from "@/features/products/hooks";
import { ProductCard } from "@/features/products/components/ProductCard";
import { useCart } from "@/features/cart/store";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/Button";
import { Txt } from "@/components/ui/Text";
import { normalizeError } from "@/core/api/errors";

export default function CatalogScreen() {
  const router = useRouter();
  const products = useProducts();
  const quantities = useCart((s) => s.quantities);
  const setQty = useCart((s) => s.setQty);
  const itemCount = Object.keys(quantities).length;

  if (products.isLoading) return <LoadingState />;
  if (products.isError)
    return <ErrorState message={normalizeError(products.error).message} onRetry={products.refetch} />;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-surface-muted">
      <View className="px-4 pb-2 pt-2">
        <Txt variant="h2">Products</Txt>
      </View>
      <FlatList
        data={products.data}
        keyExtractor={(p) => p.id}
        contentContainerClassName="p-4 gap-3"
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            quantity={quantities[item.id] ?? 0}
            onChange={(q) => setQty(item.id, q)}
          />
        )}
      />
      {itemCount > 0 ? (
        <View className="border-t border-surface-muted bg-surface p-4">
          <Button
            label={`Review Cart (${itemCount} items)`}
            onPress={() => router.push("/(app)/order/edit")}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}
