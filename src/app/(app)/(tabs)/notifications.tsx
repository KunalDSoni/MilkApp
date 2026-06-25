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
import { AnimatedItem } from "@/components/AnimatedItem";
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
      <View className="flex-row items-end justify-between px-4 pb-3 pt-3">
        <View className="gap-0.5">
          <Txt variant="overline">Notifications</Txt>
          <Txt variant="h2">Alerts</Txt>
        </View>
        {unread > 0 ? (
          <Pressable onPress={() => markAllRead.mutate()} className="py-1 active:opacity-70">
            <Txt variant="label" className="text-accent">
              Mark all read
            </Txt>
          </Pressable>
        ) : null}
      </View>
      <FlatList
        data={items}
        keyExtractor={(n) => n.id}
        contentContainerClassName="px-4 pb-4 gap-3"
        onEndReachedThreshold={0.5}
        onEndReached={() => query.hasNextPage && query.fetchNextPage()}
        ListEmptyComponent={
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            subtitle="Order updates and alerts will show up here."
          />
        }
        renderItem={({ item, index }) => (
          <AnimatedItem index={index}>
            <NotificationCard
              notification={item}
              onPress={() => {
                if (!item.read) markRead.mutate(item.id);
                if (item.route) router.push(item.route as never);
              }}
            />
          </AnimatedItem>
        )}
      />
    </SafeAreaView>
  );
}
