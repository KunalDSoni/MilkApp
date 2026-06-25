import { View } from "react-native";
import { Redirect } from "expo-router";
import { MilkIcon } from "lucide-react-native";
import { useAuth } from "@/core/auth/useAuth";
import { LoadingState } from "@/components/LoadingState";
import { Txt } from "@/components/ui/Text";

/** Splash + session resolver. Routes to auth or the app once status is known. */
export default function Index() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <View className="flex-1 items-center justify-center gap-6 bg-surface">
        <MilkIcon size={64} color="#1565C0" />
        <Txt variant="h2">Dairy Retailer</Txt>
        <LoadingState />
      </View>
    );
  }

  return status === "authenticated" ? (
    <Redirect href="/(app)/(tabs)" />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
