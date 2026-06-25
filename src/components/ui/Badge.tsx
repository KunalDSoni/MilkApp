import { View } from "react-native";
import { Txt } from "./Text";
import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-muted",
  accent: "bg-accent-soft",
  success: "bg-success-soft",
  warning: "bg-warning-soft",
  danger: "bg-danger-soft",
};

const dot: Record<BadgeTone, string> = {
  neutral: "bg-ink-subtle",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

const textTone: Record<BadgeTone, string> = {
  neutral: "text-ink-muted",
  accent: "text-accent-dark",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  dotted?: boolean;
  className?: string;
}

export function Badge({ label, tone = "neutral", dotted = true, className }: BadgeProps) {
  return (
    <View
      className={cn(
        "flex-row items-center gap-1.5 self-start rounded-full px-2.5 py-1",
        tones[tone],
        className,
      )}
    >
      {dotted ? <View className={cn("h-1.5 w-1.5 rounded-full", dot[tone])} /> : null}
      <Txt variant="overline" className={cn("tracking-normal", textTone[tone])} style={{ letterSpacing: 0.2 }}>
        {label}
      </Txt>
    </View>
  );
}
