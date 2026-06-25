import { View } from "react-native";
import { WifiOff } from "lucide-react-native";
import { Txt } from "./ui/Text";
import { colors } from "@/lib/theme";
import { useIsOnline } from "@/core/offline/useNetworkStatus";

/**
 * Thin global banner shown when offline. Cached data stays viewable; the
 * confirm action is disabled elsewhere because it needs a live cutoff check.
 */
export function OfflineBanner() {
  const online = useIsOnline();
  if (online) return null;
  return (
    <View className="flex-row items-center justify-center gap-2 bg-primary px-4 py-2.5">
      <WifiOff size={14} color={colors.white} />
      <Txt variant="caption" className="text-white">
        You&apos;re offline — showing saved data
      </Txt>
    </View>
  );
}
