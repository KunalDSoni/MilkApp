import { useEffect, useState } from "react";
import { View } from "react-native";
import { Clock, Lock } from "lucide-react-native";
import { Txt } from "@/components/ui/Text";
import { cn } from "@/lib/cn";
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
        "flex-row items-center gap-2 rounded-xl px-4 py-3",
        open ? "bg-success/10" : "bg-danger/10",
      )}
    >
      {open ? <Clock size={18} color="#2E7D32" /> : <Lock size={18} color="#C62828" />}
      <Txt variant="label" className={open ? "text-success" : "text-danger"}>
        {open
          ? `${formatCountdown(cutoffAt)} · cutoff ${formatTime(cutoffAt)}`
          : "Order window closed"}
      </Txt>
    </View>
  );
}
