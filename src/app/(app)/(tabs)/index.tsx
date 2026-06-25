import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowRight, Package, Repeat, ShoppingCart } from "lucide-react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Text";
import { AnimatedItem } from "@/components/AnimatedItem";
import { useAuth } from "@/core/auth/useAuth";
import { useCurrentWindow } from "@/features/orders/hooks";
import { CutoffBanner } from "@/features/orders/components/CutoffBanner";
import { useCart } from "@/features/cart/store";
import { colors, shadow } from "@/lib/theme";

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const window = useCurrentWindow();
  const itemCount = useCart((s) => Object.keys(s.quantities).length);

  return (
    <ScreenContainer scroll refreshing={window.isRefetching} onRefresh={window.refetch}>
      <AnimatedItem index={0}>
        <View className="flex-row items-center justify-between">
          <View className="gap-1">
            <Txt variant="overline">Welcome back</Txt>
            <Txt variant="h2" accessibilityRole="header">
              {user?.shopName ?? user?.name ?? "Retailer"}
            </Txt>
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary">
            <Txt variant="title" className="text-white">
              {(user?.shopName ?? user?.name ?? "R").trim().charAt(0).toUpperCase()}
            </Txt>
          </View>
        </View>
      </AnimatedItem>

      {window.data ? (
        <AnimatedItem index={1}>
          <CutoffBanner cutoffAt={window.data.cutoffAt} status={window.data.status} />
        </AnimatedItem>
      ) : null}

      <AnimatedItem index={2}>
        <View
          className="gap-4 overflow-hidden rounded-card bg-accent p-5"
          style={shadow.elevated}
        >
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
            <ShoppingCart size={22} color={colors.white} strokeWidth={2.25} />
          </View>
          <View className="gap-1">
            <Txt variant="h3" className="text-white">
              Place today&apos;s order
            </Txt>
            <Txt variant="body" className="text-white/80">
              {itemCount > 0
                ? `You have ${itemCount} item${itemCount > 1 ? "s" : ""} in your cart.`
                : "Browse products and build your order before cutoff."}
            </Txt>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={itemCount > 0 ? "Review cart and submit order" : "Browse products"}
            onPress={() =>
              router.push(itemCount > 0 ? "/(app)/order/edit" : "/(app)/(tabs)/catalog")
            }
            className="mt-1 h-12 flex-row items-center justify-center gap-2 rounded-2xl bg-white active:opacity-90"
          >
            <Txt variant="label" className="text-accent-dark">
              {itemCount > 0 ? "Review Cart & Submit" : "Browse Products"}
            </Txt>
            <ArrowRight size={18} color={colors.accentDark} strokeWidth={2.5} />
          </Pressable>
        </View>
      </AnimatedItem>

      <AnimatedItem index={3}>
        <Txt variant="overline" className="mt-1">
          Quick actions
        </Txt>
      </AnimatedItem>

      <View className="flex-row gap-3">
        <AnimatedItem index={4} className="flex-1">
          <QuickAction
            icon={<Repeat size={20} color={colors.accent} strokeWidth={2.25} />}
            title="Standing Orders"
            subtitle="Manage recurring"
            onPress={() => router.push("/(app)/standing")}
          />
        </AnimatedItem>
        <AnimatedItem index={5} className="flex-1">
          <QuickAction
            icon={<Package size={20} color={colors.accent} strokeWidth={2.25} />}
            title="Products"
            subtitle="Browse catalog"
            onPress={() => router.push("/(app)/(tabs)/catalog")}
          />
        </AnimatedItem>
      </View>
    </ScreenContainer>
  );
}

function QuickAction({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      onPress={onPress}
      className="active:opacity-80"
    >
      <Card className="gap-3" variant="elevated">
        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft">
          {icon}
        </View>
        <View className="gap-0.5">
          <Txt variant="label">{title}</Txt>
          <Txt variant="caption">{subtitle}</Txt>
        </View>
      </Card>
    </Pressable>
  );
}
