import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/core/auth/useAuth";

export default function AuthLayout() {
  const { status } = useAuth();

  // Authenticated users never see the auth stack.
  if (status === "authenticated") {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FFFFFF" },
      }}
    />
  );
}
