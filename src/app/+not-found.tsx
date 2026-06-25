import { View } from "react-native";
import { Link, Stack } from "expo-router";
import { Compass } from "lucide-react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Txt } from "@/components/ui/Text";
import { colors } from "@/lib/theme";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <ScreenContainer className="items-center justify-center gap-4">
        <View className="h-20 w-20 items-center justify-center rounded-3xl bg-accent-soft">
          <Compass size={36} color={colors.accent} strokeWidth={1.75} />
        </View>
        <View className="items-center gap-1">
          <Txt variant="h3">This screen doesn&apos;t exist</Txt>
          <Txt variant="muted">The page you&apos;re looking for can&apos;t be found.</Txt>
        </View>
        <Link href="/" className="mt-1 rounded-2xl bg-accent px-6 py-3">
          <Txt variant="label" className="text-white">
            Go home
          </Txt>
        </Link>
      </ScreenContainer>
    </>
  );
}
