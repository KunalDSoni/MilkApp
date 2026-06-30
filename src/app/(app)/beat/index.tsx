import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import {
  Check,
  ChevronRight,
  ClipboardList,
  MapPin,
  Route as RouteIcon,
  Store,
  X,
} from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { AnimatedItem } from "@/components/AnimatedItem";
import { useCustomers } from "@/features/customers/hooks";
import { Customer } from "@/features/customers/schemas";
import { useBeat, useTodayStatuses, BeatStatus } from "@/features/beat/store";
import { normalizeError } from "@/core/api/errors";
import { colors } from "@/lib/theme";
import { cn } from "@/lib/cn";

const UNASSIGNED = "Unassigned";

export default function BeatScreen() {
  const router = useRouter();
  const customers = useCustomers();
  const statuses = useTodayStatuses();
  const setStatus = useBeat((s) => s.setStatus);
  const clearStatus = useBeat((s) => s.clearStatus);
  const [pendingOnly, setPendingOnly] = useState(false);

  const all = useMemo(() => customers.data ?? [], [customers.data]);
  const doneCount = all.filter((c) => statuses[c.id]).length;

  // Group outlets by route; "Unassigned" sinks to the bottom.
  const sections = useMemo(() => {
    const visible = pendingOnly ? all.filter((c) => !statuses[c.id]) : all;
    const map = new Map<string, Customer[]>();
    for (const c of visible) {
      const key = c.route?.trim() || UNASSIGNED;
      const list = map.get(key) ?? [];
      list.push(c);
      map.set(key, list);
    }
    return [...map.entries()].sort(([a], [b]) => {
      if (a === UNASSIGNED) return 1;
      if (b === UNASSIGNED) return -1;
      return a.localeCompare(b);
    });
  }, [all, statuses, pendingOnly]);

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-surface-muted">
      <Stack.Screen options={{ headerShown: true, title: "Today's Beat" }} />
      {customers.isLoading ? (
        <LoadingState />
      ) : customers.isError ? (
        <ErrorState
          message={normalizeError(customers.error).message}
          onRetry={customers.refetch}
        />
      ) : all.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No outlets on your beat"
          subtitle="Add outlets to plan your route for the day."
          actionLabel="＋ Add customer"
          onAction={() => router.push("/(app)/customers/new")}
        />
      ) : (
        <ScrollView contentContainerClassName="p-4 gap-4">
          {/* Progress */}
          <Card variant="elevated" className="gap-3">
            <View className="flex-row items-center justify-between">
              <Txt variant="overline">Progress</Txt>
              <Txt variant="num" className="text-ink-muted">
                {doneCount} of {all.length} done
              </Txt>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-surface-muted">
              <View
                className="h-2 rounded-full bg-accent"
                style={{ width: `${all.length ? (doneCount / all.length) * 100 : 0}%` }}
              />
            </View>
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: pendingOnly }}
              onPress={() => setPendingOnly((v) => !v)}
              className="flex-row items-center gap-2 self-start"
            >
              <View
                className={cn(
                  "h-5 w-5 items-center justify-center rounded-md border",
                  pendingOnly ? "border-accent bg-accent" : "border-border bg-card",
                )}
              >
                {pendingOnly ? <Check size={14} color={colors.white} strokeWidth={3} /> : null}
              </View>
              <Txt variant="caption" className="text-ink-muted">
                Show pending only
              </Txt>
            </Pressable>
          </Card>

          {sections.map(([route, outlets], si) => (
            <View key={route} className="gap-2">
              <View className="flex-row items-center gap-2">
                <RouteIcon size={15} color={colors.textSecondary} strokeWidth={2.2} />
                <Txt variant="overline">
                  {route} · {outlets.length}
                </Txt>
              </View>
              {outlets.map((c, i) => (
                <AnimatedItem key={c.id} index={si + i}>
                  <OutletBeatRow
                    customer={c}
                    status={statuses[c.id]}
                    onOpen={() => router.push(`/(app)/customers/${c.id}`)}
                    onVisit={() => setStatus(c.id, "VISITED")}
                    onSkip={() => setStatus(c.id, "SKIPPED")}
                    onUndo={() => clearStatus(c.id)}
                    onBook={() =>
                      router.push(
                        `/(app)/sales-visits/new?retailerId=${c.id}&route=${encodeURIComponent(
                          c.route ?? "",
                        )}`,
                      )
                    }
                  />
                </AnimatedItem>
              ))}
            </View>
          ))}

          {pendingOnly && sections.length === 0 ? (
            <Card variant="flat">
              <Txt variant="muted">All outlets handled for today. 🎉</Txt>
            </Card>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function OutletBeatRow({
  customer,
  status,
  onOpen,
  onVisit,
  onSkip,
  onUndo,
  onBook,
}: {
  customer: Customer;
  status?: BeatStatus;
  onOpen: () => void;
  onVisit: () => void;
  onSkip: () => void;
  onUndo: () => void;
  onBook: () => void;
}) {
  return (
    <Card
      variant="elevated"
      className={cn("gap-3", status === "SKIPPED" && "opacity-60")}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${customer.outletName}`}
        onPress={onOpen}
        className="flex-row items-center gap-2 active:opacity-80"
      >
        <Store size={18} color={colors.accent} strokeWidth={2.2} />
        <Txt variant="label" className="flex-1">
          {customer.outletName}
        </Txt>
        {status === "VISITED" ? (
          <Badge label="Visited" tone="success" />
        ) : status === "SKIPPED" ? (
          <Badge label="Skipped" tone="neutral" />
        ) : (
          <ChevronRight size={18} color={colors.textSubtle} strokeWidth={2.2} />
        )}
      </Pressable>

      {customer.address ? (
        <View className="flex-row items-start gap-2">
          <MapPin size={14} color={colors.textSecondary} />
          <Txt variant="caption" className="flex-1 text-ink-muted">
            {customer.address}
          </Txt>
        </View>
      ) : null}

      {/* Actions */}
      <View className="flex-row flex-wrap gap-2">
        {status ? (
          <ActionChip label="Undo" onPress={onUndo} />
        ) : (
          <>
            <ActionChip
              label="Check in"
              tone="accent"
              icon={<Check size={15} color={colors.accent} strokeWidth={2.6} />}
              onPress={onVisit}
            />
            <ActionChip
              label="Skip"
              icon={<X size={15} color={colors.textSecondary} strokeWidth={2.6} />}
              onPress={onSkip}
            />
          </>
        )}
        <ActionChip
          label="Book visit"
          icon={<ClipboardList size={15} color={colors.textSecondary} strokeWidth={2.4} />}
          onPress={onBook}
        />
      </View>
    </Card>
  );
}

function ActionChip({
  label,
  icon,
  tone = "neutral",
  onPress,
}: {
  label: string;
  icon?: React.ReactNode;
  tone?: "neutral" | "accent";
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={cn(
        "flex-row items-center gap-1.5 rounded-full border px-3.5 py-2 active:opacity-70",
        tone === "accent" ? "border-accent bg-accent-soft" : "border-border bg-card",
      )}
    >
      {icon}
      <Txt
        variant="caption"
        className={tone === "accent" ? "text-accent" : "text-ink-muted"}
      >
        {label}
      </Txt>
    </Pressable>
  );
}
