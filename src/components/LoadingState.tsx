import { ActivityIndicator, View } from "react-native";
import { Txt } from "./ui/Text";
import { colors } from "@/lib/theme";

export function LoadingState({ message }: { message?: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-surface-muted p-8">
      <View className="h-16 w-16 items-center justify-center rounded-2xl bg-surface border border-border">
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
      <Txt variant="muted">{message ?? "Loading…"}</Txt>
    </View>
  );
}
