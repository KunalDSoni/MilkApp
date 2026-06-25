import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "lg" | "md";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const container: Record<Variant, string> = {
  primary: "bg-brand active:bg-brand-dark",
  secondary: "bg-brand-light active:bg-brand-light/70",
  ghost: "bg-transparent active:bg-surface-muted",
  danger: "bg-danger active:opacity-90",
};

const text: Record<Variant, string> = {
  primary: "text-white",
  secondary: "text-brand-dark",
  ghost: "text-brand-dark",
  danger: "text-white",
};

// Large default size keeps touch targets thumb-friendly for one-hand use.
const sizing: Record<Size, string> = {
  lg: "h-14 px-6",
  md: "h-11 px-4",
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "lg",
  disabled,
  loading,
  icon,
  className,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      className={cn(
        "flex-row items-center justify-center rounded-2xl",
        sizing[size],
        container[variant],
        isDisabled && "opacity-50",
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" || variant === "danger" ? "#fff" : "#0D47A1"} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text className={cn("text-lg font-semibold", text[variant])}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}
