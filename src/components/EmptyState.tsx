import { View } from "react-native";
import { LucideIcon, Inbox } from "lucide-react-native";
import { Txt } from "./ui/Text";
import { Button } from "./ui/Button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 p-8">
      <Icon size={48} color="#9CA3AF" />
      <Txt variant="title" className="text-center">
        {title}
      </Txt>
      {subtitle ? (
        <Txt variant="muted" className="text-center">
          {subtitle}
        </Txt>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} variant="secondary" size="md" onPress={onAction} className="mt-2" />
      ) : null}
    </View>
  );
}
