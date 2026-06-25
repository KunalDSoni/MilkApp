import { View } from "react-native";
import { LucideIcon, Inbox } from "lucide-react-native";
import { Txt } from "./ui/Text";
import { Button } from "./ui/Button";
import { colors } from "@/lib/theme";

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
    <View className="flex-1 items-center justify-center gap-4 bg-surface-muted p-8">
      <View className="h-20 w-20 items-center justify-center rounded-3xl bg-accent-soft">
        <Icon size={36} color={colors.accent} strokeWidth={1.75} />
      </View>
      <View className="items-center gap-1.5">
        <Txt variant="h3" className="text-center">
          {title}
        </Txt>
        {subtitle ? (
          <Txt variant="muted" className="text-center">
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Button label={actionLabel} variant="primary" size="md" onPress={onAction} className="mt-1" />
      ) : null}
    </View>
  );
}
