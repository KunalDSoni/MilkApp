import { View } from "react-native";
import { TriangleAlert } from "lucide-react-native";
import { Txt } from "./ui/Text";
import { Button } from "./ui/Button";
import { colors } from "@/lib/theme";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-surface-muted p-8">
      <View className="h-20 w-20 items-center justify-center rounded-3xl bg-danger-soft">
        <TriangleAlert size={36} color={colors.danger} strokeWidth={1.75} />
      </View>
      <Txt variant="h3" className="text-center">
        {message ?? "Something went wrong"}
      </Txt>
      {onRetry ? (
        <Button label="Try again" variant="secondary" size="md" onPress={onRetry} className="mt-1" />
      ) : null}
    </View>
  );
}
