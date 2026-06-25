import { View, ViewProps } from "react-native";
import { cn } from "@/lib/cn";
import { shadow } from "@/lib/theme";

type Variant = "elevated" | "flat" | "outline";

interface CardProps extends ViewProps {
  className?: string;
  /** elevated = soft shadow (default), flat = no shadow, outline = border only */
  variant?: Variant;
}

const base: Record<Variant, string> = {
  elevated: "rounded-card border border-border bg-surface p-5",
  flat: "rounded-card bg-surface p-5",
  outline: "rounded-card border border-border bg-surface p-5",
};

export function Card({ className, variant = "elevated", style, children, ...rest }: CardProps) {
  return (
    <View
      className={cn(base[variant], className)}
      style={[variant === "elevated" ? shadow.card : null, style]}
      {...rest}
    >
      {children}
    </View>
  );
}
