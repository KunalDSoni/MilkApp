import { FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { IndianRupee, Plus } from "lucide-react-native";
import { usePayments } from "@/features/payment/hooks";
import { PaymentLog } from "@/features/payment/schemas";
import { Card } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { AnimatedItem } from "@/components/AnimatedItem";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { colors } from "@/lib/theme";
import { normalizeError } from "@/core/api/errors";
import { formatCurrency, formatDate } from "@/lib/format";

const modeColors: Record<string, string> = {
  CASH: "#16a34a",
  UPI: "#2563eb",
  CHEQUE: "#ca8a04",
  BANK_TRANSFER: "#7c3aed",
};

const statusColors: Record<string, "warning" | "success" | "neutral"> = {
  PENDING: "warning",
  PAID: "success",
};

export default function PaymentsScreen() {
  const router = useRouter();
  const payments = usePayments();

  if (payments.isLoading) return <LoadingState />;
  if (payments.isError)
    return <ErrorState message={normalizeError(payments.error).message} onRetry={payments.refetch} />;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-surface-muted">
      <View className="flex-row items-center justify-between px-4 pb-3 pt-3">
        <View className="gap-0.5">
          <Txt variant="overline">Payments</Txt>
          <Txt variant="h2" accessibilityRole="header">Payment Log</Txt>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log a payment"
          onPress={() => router.push("/(app)/payments/new")}
          className="h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft active:opacity-80"
        >
          <Plus size={22} color={colors.accent} strokeWidth={2.3} />
        </Pressable>
      </View>
      <FlatList
        data={payments.data}
        keyExtractor={(p) => p.id}
        contentContainerClassName="px-4 pb-4 gap-3"
        refreshing={payments.isRefetching}
        onRefresh={payments.refetch}
        ListEmptyComponent={
          <EmptyState
            icon={IndianRupee}
            title="No payments yet"
            subtitle="Log a payment to track collections from your outlets."
          />
        }
        renderItem={({ item, index }) => (
          <AnimatedItem index={index}>
            <Card className="gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View
                    className="h-8 w-8 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${modeColors[item.mode]}18` }}
                  >
                    <IndianRupee size={15} color={modeColors[item.mode]} strokeWidth={2.5} />
                  </View>
                  <View>
                    <Txt variant="label">{item.distributorName}</Txt>
                    <Txt variant="caption">{item.mode.replace("_", " ")}</Txt>
                  </View>
                </View>
                <Badge tone={statusColors[item.status]} label={item.status} />
              </View>
              <View className="h-px bg-border" />
              <View className="flex-row items-center justify-between">
                <View className="gap-0.5">
                  <Txt variant="muted">{formatDate(item.paymentDate)}</Txt>
                  {item.note ? (
                    <Txt variant="caption" numberOfLines={1} className="max-w-48">{item.note}</Txt>
                  ) : null}
                </View>
                <Txt variant="num" className="text-accent-dark text-lg">
                  {formatCurrency(Number(item.amount))}
                </Txt>
              </View>
            </Card>
          </AnimatedItem>
        )}
      />
    </SafeAreaView>
  );
}
