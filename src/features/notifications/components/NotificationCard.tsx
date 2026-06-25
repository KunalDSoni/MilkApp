import { Pressable, View } from "react-native";
import { Bell, CheckCircle2, Clock, LucideIcon, Megaphone } from "lucide-react-native";
import { Txt } from "@/components/ui/Text";
import { cn } from "@/lib/cn";
import { formatDate, formatTime } from "@/lib/format";
import { AppNotification, NotificationType } from "../schemas";

const icons: Record<NotificationType, LucideIcon> = {
  ORDER_REMINDER: Bell,
  CUTOFF_REMINDER: Clock,
  ORDER_CONFIRMATION: CheckCircle2,
  BROADCAST: Megaphone,
};

interface NotificationCardProps {
  notification: AppNotification;
  onPress: () => void;
}

export function NotificationCard({ notification, onPress }: NotificationCardProps) {
  const Icon = icons[notification.type];
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-row gap-3 rounded-card border p-4",
        notification.read
          ? "border-surface-muted bg-surface"
          : "border-brand-light bg-brand-light",
      )}
    >
      <View className="mt-0.5">
        <Icon size={22} color="#1565C0" />
      </View>
      <View className="flex-1 gap-1">
        <View className="flex-row items-center justify-between">
          <Txt variant="label">{notification.title}</Txt>
          {!notification.read ? <View className="h-2 w-2 rounded-full bg-brand" /> : null}
        </View>
        <Txt variant="muted">{notification.body}</Txt>
        <Txt variant="caption">
          {formatDate(notification.createdAt)} · {formatTime(notification.createdAt)}
        </Txt>
      </View>
    </Pressable>
  );
}
