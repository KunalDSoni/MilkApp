import "../../global.css";

import { useEffect } from "react";
import { Platform, useWindowDimensions, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, queryPersister } from "@/core/api/queryClient";
import { AuthProvider } from "@/core/auth/AuthProvider";
import { shadow } from "@/lib/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * Frames the mobile app as a centered phone-width column on web so it doesn't
 * stretch edge-to-edge on large screens. On native this is a passthrough.
 */
function ResponsiveFrame({ children }: { children: React.ReactNode }) {
  // Hooks must run unconditionally; only the web branch uses the dimensions.
  const { height } = useWindowDimensions();
  if (Platform.OS !== "web") return <>{children}</>;
  // Pin to the exact window height and clip overflow so the bottom tab bar
  // always lands inside the viewport instead of falling below the fold.
  return (
    <View
      className="items-center bg-surface-muted"
      style={{ height, overflow: "hidden" }}
    >
      <View
        className="flex-1 w-full max-w-[440px] bg-surface-muted"
        style={shadow.elevated}
      >
        {children}
      </View>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, fontError]);

  // Hold the splash until fonts resolve so we never flash the system font.
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister: queryPersister,
            maxAge: 24 * 60 * 60 * 1000,
          }}
        >
          <AuthProvider>
            <StatusBar style="dark" />
            <ResponsiveFrame>
              <Slot />
            </ResponsiveFrame>
          </AuthProvider>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
