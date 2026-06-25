import { View } from "react-native";
import { WifiOff } from "lucide-react-native";
import { Txt } from "./ui/Text";
import { useIsOnline } from "@/core/offline/useNetworkStatus";

/**
 * Thin global banner shown when offline. Cached data stays viewable; the
 * confirm action is disabled elsewhere because it needs a live cutoff check.
 */
export function OfflineBanner() {
  const online = useIsOnline();
  if (online) return null;
  return (
    <View className="flex-row items-center justify-center gap-2 bg-ink px-4 py-2">
      <WifiOff size={16} color="#fff" />
      <Txt variant="caption" className="font-semibold text-white">
        You&apos;re offline — showing saved data
      </Txt>
    </View>
  );
}
