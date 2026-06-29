import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight, MapPin, Phone, Store } from "lucide-react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { AnimatedItem } from "@/components/AnimatedItem";
import { useCustomers } from "@/features/customers/hooks";
import { normalizeError } from "@/core/api/errors";
import { colors } from "@/lib/theme";

export default function CustomersScreen() {
  const router = useRouter();
  const customers = useCustomers();
  const goAdd = () => router.push("/(app)/customers/new");

  return (
    <ScreenContainer scroll className="gap-4">
      <View className="gap-1">
        <Txt variant="overline">Customers</Txt>
        <Txt variant="h2" accessibilityRole="header">
          Your outlets
        </Txt>
      </View>

      {customers.isLoading ? (
        <LoadingState />
      ) : customers.isError ? (
        <ErrorState
          message={normalizeError(customers.error).message}
          onRetry={customers.refetch}
        />
      ) : !customers.data || customers.data.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No customers yet"
          subtitle="Add your first outlet to start building your portfolio."
          actionLabel="＋ Add customer"
          onAction={goAdd}
        />
      ) : (
        <>
          {customers.data.map((c, i) => (
            <AnimatedItem key={c.id} index={i}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open ${c.outletName}`}
                onPress={() => router.push(`/(app)/customers/${c.id}`)}
                className="active:opacity-80"
              >
                <Card className="gap-2">
                  <View className="flex-row items-center gap-2">
                    <Store size={18} color={colors.accent} strokeWidth={2.2} />
                    <Txt variant="label" className="flex-1">
                      {c.outletName}
                    </Txt>
                    <ChevronRight size={18} color={colors.textSubtle} strokeWidth={2.2} />
                  </View>
                  {c.address ? (
                    <View className="flex-row items-start gap-2">
                      <MapPin size={14} color={colors.textSecondary} />
                      <Txt variant="caption" className="flex-1 text-ink-muted">
                        {c.address}
                      </Txt>
                    </View>
                  ) : null}
                  <View className="flex-row items-center gap-2">
                    <Phone size={14} color={colors.textSecondary} />
                    <Txt variant="caption" className="text-ink-muted">
                      {c.phone}
                      {c.route ? ` · ${c.route}` : ""}
                    </Txt>
                  </View>
                </Card>
              </Pressable>
            </AnimatedItem>
          ))}
          <Button label="＋ Add customer" onPress={goAdd} />
        </>
      )}
    </ScreenContainer>
  );
}
