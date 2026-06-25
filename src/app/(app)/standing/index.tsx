import { View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Plus, Repeat } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";
import { useStandingOrders } from "@/features/standing/hooks";
import { StandingOrderCard } from "@/features/standing/components/StandingOrderCard";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/Button";
import { colors } from "@/lib/theme";
import { normalizeError } from "@/core/api/errors";

export default function StandingOrdersScreen() {
  const router = useRouter();
  const standing = useStandingOrders();

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-surface-muted">
      <Stack.Screen options={{ headerShown: true, title: "Standing Orders" }} />

      {standing.isLoading ? (
        <LoadingState />
      ) : standing.isError ? (
        <ErrorState
          message={normalizeError(standing.error).message}
          onRetry={standing.refetch}
        />
      ) : standing.data && standing.data.length > 0 ? (
        <ScrollView contentContainerClassName="p-4 gap-3">
          {standing.data.map((so) => (
            <StandingOrderCard
              key={so.id}
              standingOrder={so}
              onEdit={() =>
                router.push({ pathname: "/(app)/standing/edit", params: { id: so.id } })
              }
            />
          ))}
        </ScrollView>
      ) : (
        <EmptyState
          icon={Repeat}
          title="No standing orders"
          subtitle="Create one to auto-generate your daily draft orders."
        />
      )}

      <View className="border-t border-border bg-surface p-4">
        <Button
          label="Create Standing Order"
          icon={<Plus size={20} color={colors.white} strokeWidth={2.5} />}
          onPress={() => router.push("/(app)/standing/edit")}
        />
      </View>
    </SafeAreaView>
  );
}
