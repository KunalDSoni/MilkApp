import { Pressable, View } from "react-native";
import { Bell, CheckCircle2, Clock, LucideIcon, Megaphone } from "lucide-react-native";
import { Txt } from "@/components/ui/Text";
import { cn } from "@/lib/cn";
import { colors } from "@/lib/theme";
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
  const unread = !notification.read;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${unread ? "Unread. " : ""}${notification.title}. ${notification.body}`}
      onPress={onPress}
      className={cn(
        "flex-row gap-3 rounded-card border p-4 active:opacity-90",
        unread ? "border-accent/20 bg-accent-soft" : "border-border bg-surface",
      )}
    >
      <View
        className={cn(
          "h-10 w-10 items-center justify-center rounded-2xl",
          unread ? "bg-accent" : "bg-surface-muted",
        )}
      >
        <Icon size={19} color={unread ? colors.white : colors.textSecondary} strokeWidth={2.1} />
      </View>
      <View className="flex-1 gap-1">
        <View className="flex-row items-center justify-between">
          <Txt variant="label" className="flex-1">{notification.title}</Txt>
          {unread ? <View className="ml-2 h-2 w-2 rounded-full bg-accent" /> : null}
        </View>
        <Txt variant="muted">{notification.body}</Txt>
        <Txt variant="caption">
          {formatDate(notification.createdAt)} · {formatTime(notification.createdAt)}
        </Txt>
      </View>
    </Pressable>
  );
}
