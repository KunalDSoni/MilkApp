import { apiClient } from "@/core/api/client";
import { env } from "@/core/config/env";
import { Platform } from "react-native";

/** Registers the device push token with the backend. No-op in mock mode. */
export async function registerDevice(token: string): Promise<void> {
  if (env.useMocks) {
    console.log("[push] mock: would register device token", token.slice(0, 12));
    return;
  }
  await apiClient.post("/devices", { token, platform: Platform.OS });
}

/** Unregisters on logout so confirmed pushes stop. No-op in mock mode. */
export async function unregisterDevice(token: string): Promise<void> {
  if (env.useMocks) return;
  try {
    await apiClient.delete(`/devices/${encodeURIComponent(token)}`);
  } catch {
    // Best-effort.
  }
}
