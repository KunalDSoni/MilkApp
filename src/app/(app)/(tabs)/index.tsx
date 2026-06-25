import { View } from "react-native";
import { useRouter } from "expo-router";
import { Package, Repeat, ShoppingCart } from "lucide-react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/core/auth/useAuth";
import { useCurrentWindow } from "@/features/orders/hooks";
import { CutoffBanner } from "@/features/orders/components/CutoffBanner";
import { useCart } from "@/features/cart/store";

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const window = useCurrentWindow();
  const itemCount = useCart((s) => Object.keys(s.quantities).length);

  return (
    <ScreenContainer scroll refreshing={window.isRefetching} onRefresh={window.refetch}>
      <View className="gap-1">
        <Txt variant="muted">Welcome,</Txt>
        <Txt variant="h2">{user?.shopName ?? user?.name ?? "Retailer"}</Txt>
      </View>

      {window.data ? (
        <CutoffBanner cutoffAt={window.data.cutoffAt} status={window.data.status} />
      ) : null}

      <Card className="gap-3 border-brand-light bg-brand-light">
        <View className="flex-row items-center gap-2">
          <ShoppingCart size={20} color="#0D47A1" />
          <Txt variant="title" className="text-brand-dark">
            Place today&apos;s order
          </Txt>
        </View>
        <Txt variant="muted">
          {itemCount > 0
            ? `You have ${itemCount} item${itemCount > 1 ? "s" : ""} in your cart.`
            : "Browse products and build your order."}
        </Txt>
        <Button
          label={itemCount > 0 ? "Review Cart & Submit" : "Browse Products"}
          onPress={() =>
            router.push(itemCount > 0 ? "/(app)/order/edit" : "/(app)/(tabs)/catalog")
          }
        />
      </Card>

      <View className="flex-row gap-3">
        <Card className="flex-1 items-center gap-2">
          <Repeat size={24} color="#1565C0" />
          <Txt variant="label">Standing Orders</Txt>
          <Button
            label="Manage"
            variant="ghost"
            size="md"
            onPress={() => router.push("/(app)/standing")}
          />
        </Card>
        <Card className="flex-1 items-center gap-2">
          <Package size={24} color="#1565C0" />
          <Txt variant="label">Products</Txt>
          <Button
            label="Browse"
            variant="ghost"
            size="md"
            onPress={() => router.push("/(app)/(tabs)/catalog")}
          />
        </Card>
      </View>
    </ScreenContainer>
  );
}
