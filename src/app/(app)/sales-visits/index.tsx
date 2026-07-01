import { FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ClipboardList, Plus } from "lucide-react-native";
import { useSalesVisits } from "@/features/sales-visits/hooks";
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

export default function SalesVisitsScreen() {
  const router = useRouter();
  const visits = useSalesVisits();

  if (visits.isLoading) return <LoadingState />;
  if (visits.isError)
    return <ErrorState message={normalizeError(visits.error).message} onRetry={visits.refetch} />;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-surface-muted">
      <View className="flex-row items-center justify-between px-4 pb-3 pt-3">
        <View className="gap-0.5">
          <Txt variant="overline">Field Visits</Txt>
          <Txt variant="h2" accessibilityRole="header">Sales Visits</Txt>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="New sales visit"
          onPress={() => router.push("/(app)/sales-visits/new")}
          className="h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft active:opacity-80"
        >
          <Plus size={22} color={colors.accent} strokeWidth={2.3} />
        </Pressable>
      </View>
      <FlatList
        data={visits.data}
        keyExtractor={(v) => v.id}
        contentContainerClassName="px-4 pb-4 gap-3"
        refreshing={visits.isRefetching}
        onRefresh={visits.refetch}
        ListEmptyComponent={
          <EmptyState
            icon={ClipboardList}
            title="No visits yet"
            subtitle="Record your first sales visit to start tracking."
          />
        }
        renderItem={({ item, index }) => (
          <AnimatedItem index={index}>
            <Card className="gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 gap-0.5">
                  <Txt variant="label">{item.retailer}</Txt>
                  <Txt variant="caption">{item.route ?? "No route"}</Txt>
                </View>
                <Badge tone={item.outletType === "NEW" ? "accent" : "neutral"} label={item.outletType} />
              </View>
              <View className="h-px bg-border" />
              <View className="flex-row items-center justify-between">
                <View className="gap-0.5">
                  <Txt variant="muted">{formatDate(item.date)}</Txt>
                  <Txt variant="caption">
                    {item.salesOfficer}
                    {item.inTime ? ` · ${item.inTime}` : ""}
                  </Txt>
                </View>
                <View className="items-end gap-0.5">
                  {item.orderTotal ? (
                    <Txt variant="num" className="text-accent-dark">
                      {formatCurrency(Number(item.orderTotal))}
                    </Txt>
                  ) : null}
                  <Txt variant="caption" className="text-ink-muted">
                    {item.itemCount} item{item.itemCount === 1 ? "" : "s"}
                  </Txt>
                </View>
              </View>
              {item.competition ? (
                <View className="rounded-xl bg-surface-muted px-3 py-2">
                  <Txt variant="caption" className="text-ink-muted">
                    Competition: {item.competition}
                  </Txt>
                </View>
              ) : null}
            </Card>
          </AnimatedItem>
        )}
      />
    </SafeAreaView>
  );
}
