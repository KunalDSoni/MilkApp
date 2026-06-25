/**
 * Dismissible inline banner for cross-platform feedback (works on web and
 * native, unlike RN's Alert which is a no-op on web). Used for order-placement
 * success/error messaging.
 */
import { useEffect, useState } from "react";
import { Pressable } from "react-native";
import Animated, { FadeInUp, FadeOut } from "react-native-reanimated";
import { CheckCircle2, AlertCircle, X } from "lucide-react-native";
import { Txt } from "@/components/ui/Text";
import { cn } from "@/lib/cn";
import { colors } from "@/lib/theme";

type Tone = "success" | "error";

interface BannerProps {
  message: string;
  tone?: Tone;
  /** Auto-dismiss after this many ms. Omit to keep it until dismissed. */
  autoDismissMs?: number;
  onDismiss?: () => void;
  className?: string;
}

const tones: Record<Tone, { container: string; text: string; color: string; Icon: typeof CheckCircle2 }> = {
  success: { container: "bg-success-soft border-success/20", text: "text-success", color: colors.success, Icon: CheckCircle2 },
  error: { container: "bg-danger-soft border-danger/20", text: "text-danger", color: colors.danger, Icon: AlertCircle },
};

export function Banner({
  message,
  tone = "success",
  autoDismissMs,
  onDismiss,
  className,
}: BannerProps) {
  const [visible, setVisible] = useState(true);
  const { container, text, color, Icon } = tones[tone];

  const dismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  useEffect(() => {
    if (!autoDismissMs) return;
    const t = setTimeout(dismiss, autoDismissMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDismissMs]);

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInUp.duration(240)}
      exiting={FadeOut.duration(160)}
      className={cn(
        "flex-row items-center gap-2.5 rounded-2xl border px-3.5 py-3",
        container,
        className,
      )}
      accessibilityRole="alert"
    >
      <Icon size={20} color={color} />
      <Txt variant="label" className={cn("flex-1", text)}>
        {message}
      </Txt>
      <Pressable onPress={dismiss} hitSlop={8} accessibilityLabel="Dismiss">
        <X size={18} color={color} />
      </Pressable>
    </Animated.View>
  );
}
