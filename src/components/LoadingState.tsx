import { ActivityIndicator, View } from "react-native";
import { Txt } from "./ui/Text";

export function LoadingState({ message }: { message?: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 p-8">
      <ActivityIndicator size="large" color="#1565C0" />
      {message ? <Txt variant="muted">{message}</Txt> : null}
    </View>
  );
}
