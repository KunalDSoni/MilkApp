import { useNetInfo } from "@react-native-community/netinfo";

/** True when the device has a usable connection (or status is still unknown). */
export function useIsOnline(): boolean {
  const net = useNetInfo();
  // Treat unknown (null) as online to avoid a false "offline" flash on boot.
  if (net.isConnected === null) return true;
  return Boolean(net.isConnected);
}
