import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, Stack } from "expo-router";
import { ShieldAlert } from "lucide-react-native";
import { useAuth } from "@/core/auth/useAuth";
import { LoadingState } from "@/components/LoadingState";
import { OfflineBanner } from "@/components/OfflineBanner";
import { Txt } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { usePushNotifications } from "@/core/push/usePushNotifications";
import { colors } from "@/lib/theme";

// The app is the field tool for distributors and their sales reps.
const APP_ROLES = ["DISTRIBUTOR", "SALES_OFFICER"];

// Premium, consistent native header across all stack screens.
const headerOptions = {
  headerShadowVisible: false,
  headerStyle: { backgroundColor: colors.card },
  headerTintColor: colors.accent,
  headerTitleStyle: { fontFamily: "Inter_700Bold", fontSize: 17, color: colors.text },
} as const;

export default function AppLayout() {
  const { status, user, signOut } = useAuth();

  if (status === "loading") return <LoadingState />;
  if (status === "unauthenticated") return <Redirect href="/(auth)/login" />;

  // Keep the field app to its audience; anyone else gets a clear exit instead
  // of tapping into distributor-only screens and hitting "Insufficient role".
  if (user?.role && !APP_ROLES.includes(user.role)) {
    return <WrongAccountScreen role={user.role} onSignOut={() => void signOut()} />;
  }

  return <AuthenticatedShell />;
}

function WrongAccountScreen({
  role,
  onSignOut,
}: {
  role: string;
  onSignOut: () => void;
}) {
  const pretty = role.charAt(0) + role.slice(1).toLowerCase().replace(/_/g, " ");
  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-5 bg-surface-muted p-8">
      <View className="h-20 w-20 items-center justify-center rounded-3xl bg-accent-soft">
        <ShieldAlert size={36} color={colors.accent} strokeWidth={1.9} />
      </View>
      <View className="items-center gap-2">
        <Txt variant="h3" className="text-center">
          This app is for distributors
        </Txt>
        <Txt variant="muted" className="text-center">
          You&apos;re signed in as {pretty}. The mobile app is for distributors
          and their sales team — please use the admin panel, or sign in with a
          distributor account.
        </Txt>
      </View>
      <Button label="Sign out" onPress={onSignOut} className="mt-1" />
    </SafeAreaView>
  );
}

/** Mounted only when authenticated so push setup runs with a valid session. */
function AuthenticatedShell() {
  usePushNotifications();

  return (
    <View className="flex-1">
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false, ...headerOptions }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" options={{ headerShown: true, title: "Settings" }} />
      </Stack>
    </View>
  );
}
