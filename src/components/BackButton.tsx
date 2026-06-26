import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { colors } from "@/lib/theme";

/**
 * Top-left back control for screens that don't have a native stack header
 * (e.g. the custom-designed auth screens). App-stack screens already get a
 * native back arrow via `Stack.Screen headerShown`.
 */
export function BackButton({ onPress }: { onPress?: () => void }) {
  const router = useRouter();
  const goBack = () =>
    router.canGoBack() ? router.back() : router.replace("/(auth)/login");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={onPress ?? goBack}
      hitSlop={8}
      className="h-10 w-10 items-center justify-center rounded-full bg-surface-muted active:opacity-70"
    >
      <ArrowLeft size={22} color={colors.text} strokeWidth={2.2} />
    </Pressable>
  );
}
