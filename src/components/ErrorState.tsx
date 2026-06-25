import { View } from "react-native";
import { TriangleAlert } from "lucide-react-native";
import { Txt } from "./ui/Text";
import { Button } from "./ui/Button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 p-8">
      <TriangleAlert size={48} color="#C62828" />
      <Txt variant="title" className="text-center">
        {message ?? "Something went wrong"}
      </Txt>
      {onRetry ? (
        <Button label="Try again" variant="secondary" size="md" onPress={onRetry} />
      ) : null}
    </View>
  );
}
