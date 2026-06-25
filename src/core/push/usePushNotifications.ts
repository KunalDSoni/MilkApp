/**
 * Push setup hook. Wired once inside the authenticated app shell.
 *
 * Transport: expo-notifications uses FCM on Android (provide the FCM server
 * key / google-services.json via EAS for production builds). To swap to bare
 * @react-native-firebase later, only this file and registerDevice.ts change.
 *
 * In Expo Go remote push is limited; full behavior requires a dev/production
 * build. The hook degrades gracefully if permission is denied.
 */
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { env } from "@/core/config/env";
import { registerDevice } from "./registerDevice";
import { notificationKeys } from "@/features/notifications/hooks";
import { orderKeys } from "@/features/orders/hooks";

// Show heads-up notifications while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function routeFromData(data: unknown): string | null {
  if (data && typeof data === "object" && "route" in data) {
    const r = (data as { route?: unknown }).route;
    if (typeof r === "string") return r;
  }
  return null;
}

export function usePushNotifications() {
  const router = useRouter();
  const qc = useQueryClient();
  const responseListener = useRef<Notifications.EventSubscription>();
  const receivedListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    let mounted = true;

    // expo-notifications device push is not supported on web; skip setup there.
    if (Platform.OS === "web") return;

    (async () => {
      if (!Device.isDevice && !env.useMocks) return;

      const { status: existing } = await Notifications.getPermissionsAsync();
      let status = existing;
      if (existing !== "granted") {
        const req = await Notifications.requestPermissionsAsync();
        status = req.status;
      }
      if (status !== "granted") return;

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Order alerts",
          importance: Notifications.AndroidImportance.HIGH,
        });
      }

      try {
        const token = (await Notifications.getDevicePushTokenAsync()).data;
        if (mounted && typeof token === "string") await registerDevice(token);
      } catch (e) {
        console.warn("[push] could not get device token", e);
      }
    })();

    // Foreground: refresh affected data so the in-app UI stays current.
    receivedListener.current = Notifications.addNotificationReceivedListener(() => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
      qc.invalidateQueries({ queryKey: orderKeys.list });
    });

    // Tap: deep link to the route the backend supplied.
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const route = routeFromData(response.notification.request.content.data);
        if (route) router.push(route as never);
      },
    );

    return () => {
      mounted = false;
      receivedListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [qc, router]);
}
