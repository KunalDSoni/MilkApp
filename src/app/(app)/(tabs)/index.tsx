import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  ChevronRight,
  ClipboardList,
  IndianRupee,
  MapPin,
  Package,
  Repeat,
  ShoppingCart,
  Store,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Text";
import { AnimatedItem } from "@/components/AnimatedItem";
import { useAuth } from "@/core/auth/useAuth";
import { useCurrentWindow } from "@/features/orders/hooks";
import { CutoffBanner } from "@/features/orders/components/CutoffBanner";
import { useDashboard } from "@/features/dashboard/hooks";
import { useCart } from "@/features/cart/store";
import { formatCurrency } from "@/lib/format";
import { colors, shadow } from "@/lib/theme";

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const window = useCurrentWindow();
  const dashboard = useDashboard();
  const itemCount = useCart((s) => Object.keys(s.quantities).length);
  const kpi = dashboard.data;

  return (
    <ScreenContainer
      scroll
      refreshing={window.isRefetching || dashboard.isRefetching}
      onRefresh={() => {
        window.refetch();
        dashboard.refetch();
      }}
    >
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

      {kpi ? (
        <AnimatedItem index={1}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Dues to collect ${formatCurrency(kpi.dues.outstanding)} across ${kpi.dues.outletsWithDues} outlets`}
            onPress={() => router.push("/(app)/(tabs)/customers")}
            className="active:opacity-90"
          >
            <View
              className="gap-3 overflow-hidden rounded-card bg-primary p-5"
              style={shadow.elevated}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="h-9 w-9 items-center justify-center rounded-2xl bg-white/15">
                    <IndianRupee size={18} color={colors.white} strokeWidth={2.4} />
                  </View>
                  <Txt variant="overline" className="text-white/70">
                    Dues to collect
                  </Txt>
                </View>
                <ChevronRight size={18} color={colors.white} strokeWidth={2.2} />
              </View>
              <Txt variant="numXl" className="text-white">
                {formatCurrency(kpi.dues.outstanding)}
              </Txt>
              <Txt variant="caption" className="text-white/70">
                Across {kpi.dues.outletsWithDues} outlet
                {kpi.dues.outletsWithDues === 1 ? "" : "s"} with pending dues
              </Txt>
            </View>
          </Pressable>
        </AnimatedItem>
      ) : null}

      {kpi ? (
        <View className="flex-row gap-3">
          <AnimatedItem index={2} className="flex-1">
            <Card className="gap-2" variant="elevated">
              <View className="h-9 w-9 items-center justify-center rounded-2xl bg-accent-soft">
                <TrendingUp size={18} color={colors.accent} strokeWidth={2.3} />
              </View>
              <Txt variant="numXl" style={{ fontSize: 22, lineHeight: 26 }}>
                {kpi.visits.strikeRatePct}%
              </Txt>
              <Txt variant="caption" className="text-ink-muted">
                Strike rate · {kpi.visits.count} visits (30d)
              </Txt>
            </Card>
          </AnimatedItem>
          <AnimatedItem index={3} className="flex-1">
            <Card className="gap-2" variant="elevated">
              <View className="h-9 w-9 items-center justify-center rounded-2xl bg-accent-soft">
                <Store size={18} color={colors.accent} strokeWidth={2.3} />
              </View>
              <Txt variant="numXl" style={{ fontSize: 22, lineHeight: 26 }}>
                {kpi.visits.newOutlets}
              </Txt>
              <Txt variant="caption" className="text-ink-muted">
                New outlets (30d)
              </Txt>
            </Card>
          </AnimatedItem>
        </View>
      ) : null}

      {kpi && kpi.topSkus.length > 0 ? (
        <AnimatedItem index={4}>
          <Card className="gap-3" variant="elevated">
            <Txt variant="overline">Top products</Txt>
            {kpi.topSkus.slice(0, 3).map((s, idx) => (
              <View key={s.productId} className="flex-row items-center gap-3">
                <Txt variant="num" className="w-5 text-ink-subtle">
                  {idx + 1}
                </Txt>
                <Txt variant="label" className="flex-1" numberOfLines={1}>
                  {s.name}
                </Txt>
                <Txt variant="num" className="text-ink-muted">
                  {formatCurrency(s.value)}
                </Txt>
              </View>
            ))}
          </Card>
        </AnimatedItem>
      ) : null}

      {window.data ? (
        <AnimatedItem index={5}>
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

      <AnimatedItem index={3}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Plan today's beat"
          onPress={() => router.push("/(app)/beat")}
          className="active:opacity-90"
        >
          <Card className="flex-row items-center gap-3" variant="elevated">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft">
              <MapPin size={20} color={colors.accent} strokeWidth={2.25} />
            </View>
            <View className="flex-1 gap-0.5">
              <Txt variant="label">Today&apos;s Beat</Txt>
              <Txt variant="caption">Plan your route &amp; check in outlets</Txt>
            </View>
            <ChevronRight size={18} color={colors.textSubtle} strokeWidth={2.2} />
          </Card>
        </Pressable>
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

      <View className="flex-row gap-3">
        <AnimatedItem index={6} className="flex-1">
          <QuickAction
            icon={<ClipboardList size={20} color={colors.accent} strokeWidth={2.25} />}
            title="Sales visits"
            subtitle="History &amp; new visits"
            onPress={() => router.push("/(app)/sales-visits")}
          />
        </AnimatedItem>
        <AnimatedItem index={7} className="flex-1">
          <QuickAction
            icon={<Users size={20} color={colors.accent} strokeWidth={2.25} />}
            title="Customers"
            subtitle="Your outlets"
            onPress={() => router.push("/(app)/(tabs)/customers")}
          />
        </AnimatedItem>
      </View>

      <AnimatedItem index={8}>
        <QuickAction
          icon={<Wallet size={20} color={colors.accent} strokeWidth={2.25} />}
          title="Payments"
          subtitle="Log &amp; view payments"
          onPress={() => router.push("/(app)/payments")}
        />
      </AnimatedItem>
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
