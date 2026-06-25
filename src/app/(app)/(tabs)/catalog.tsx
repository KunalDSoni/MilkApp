import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ShoppingCart } from "lucide-react-native";
import { useProducts } from "@/features/products/hooks";
import { ProductCard } from "@/features/products/components/ProductCard";
import { useCart } from "@/features/cart/store";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { AnimatedItem } from "@/components/AnimatedItem";
import { Button } from "@/components/ui/Button";
import { Txt } from "@/components/ui/Text";
import { colors } from "@/lib/theme";
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
      <View className="gap-0.5 px-4 pb-3 pt-3">
        <Txt variant="overline">Catalog</Txt>
        <Txt variant="h2" accessibilityRole="header">Products</Txt>
      </View>
      <FlatList
        data={products.data}
        keyExtractor={(p) => p.id}
        contentContainerClassName="px-4 pb-4 gap-3"
        renderItem={({ item, index }) => (
          <AnimatedItem index={index}>
            <ProductCard
              product={item}
              quantity={quantities[item.id] ?? 0}
              onChange={(q) => setQty(item.id, q)}
            />
          </AnimatedItem>
        )}
      />
      {itemCount > 0 ? (
        <View className="border-t border-border bg-surface p-4">
          <Button
            label={`Review Cart · ${itemCount} item${itemCount > 1 ? "s" : ""}`}
            icon={<ShoppingCart size={18} color={colors.white} strokeWidth={2.25} />}
            onPress={() => router.push("/(app)/order/edit")}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}
