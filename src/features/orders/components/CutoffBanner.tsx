import { useEffect, useState } from "react";
import { View } from "react-native";
import { Clock, Lock } from "lucide-react-native";
import { Txt } from "@/components/ui/Text";
import { cn } from "@/lib/cn";
import { colors } from "@/lib/theme";
import { formatCountdown, formatTime } from "@/lib/format";
import { WindowStatus } from "../schemas";

interface CutoffBannerProps {
  cutoffAt: string;
  status: WindowStatus;
}

export function CutoffBanner({ cutoffAt, status }: CutoffBannerProps) {
  const [, tick] = useState(0);
  const open = status === "OPEN";

  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, [open]);

  return (
    <View
      className={cn(
        "flex-row items-center gap-3 rounded-2xl border px-4 py-3",
        open ? "border-success/20 bg-success-soft" : "border-danger/20 bg-danger-soft",
      )}
    >
      <View
        className={cn(
          "h-9 w-9 items-center justify-center rounded-xl",
          open ? "bg-success/15" : "bg-danger/15",
        )}
      >
        {open ? (
          <Clock size={18} color={colors.success} strokeWidth={2.25} />
        ) : (
          <Lock size={18} color={colors.danger} strokeWidth={2.25} />
        )}
      </View>
      <View className="flex-1">
        <Txt variant="overline" className={open ? "text-success" : "text-danger"}>
          {open ? "Order window open" : "Window closed"}
        </Txt>
        <Txt variant="label" className={open ? "text-success" : "text-danger"}>
          {open
            ? `${formatCountdown(cutoffAt)} · cutoff ${formatTime(cutoffAt)}`
            : "Cutoff has passed"}
        </Txt>
      </View>
    </View>
  );
}
