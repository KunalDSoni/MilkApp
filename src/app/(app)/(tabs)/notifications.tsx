import { FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
} from "@/features/notifications/hooks";
import { NotificationCard } from "@/features/notifications/components/NotificationCard";
import { Txt } from "@/components/ui/Text";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { normalizeError } from "@/core/api/errors";

export default function NotificationsScreen() {
  const router = useRouter();
  const query = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  const unread = query.data?.pages[0]?.unreadCount ?? 0;

  if (query.isLoading) return <LoadingState />;
  if (query.isError)
    return <ErrorState message={normalizeError(query.error).message} onRetry={query.refetch} />;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-surface-muted">
      <View className="flex-row items-center justify-between px-4 pb-2 pt-2">
        <Txt variant="h2">Alerts</Txt>
        {unread > 0 ? (
          <Pressable onPress={() => markAllRead.mutate()}>
            <Txt variant="label" className="text-brand">
              Mark all read
            </Txt>
          </Pressable>
        ) : null}
      </View>
      <FlatList
        data={items}
        keyExtractor={(n) => n.id}
        contentContainerClassName="p-4 gap-3"
        onEndReachedThreshold={0.5}
        onEndReached={() => query.hasNextPage && query.fetchNextPage()}
        ListEmptyComponent={<EmptyState icon={Bell} title="No notifications yet" />}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onPress={() => {
              if (!item.read) markRead.mutate(item.id);
              if (item.route) router.push(item.route as never);
            }}
          />
        )}
      />
    </SafeAreaView>
  );
}
