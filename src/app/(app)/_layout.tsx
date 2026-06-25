import { View } from "react-native";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/core/auth/useAuth";
import { LoadingState } from "@/components/LoadingState";
import { OfflineBanner } from "@/components/OfflineBanner";
import { usePushNotifications } from "@/core/push/usePushNotifications";

export default function AppLayout() {
  const { status } = useAuth();

  if (status === "loading") return <LoadingState />;
  if (status === "unauthenticated") return <Redirect href="/(auth)/login" />;

  return <AuthenticatedShell />;
}

/** Mounted only when authenticated so push setup runs with a valid session. */
function AuthenticatedShell() {
  usePushNotifications();

  return (
    <View className="flex-1">
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" options={{ headerShown: true, title: "Settings" }} />
      </Stack>
    </View>
  );
}
