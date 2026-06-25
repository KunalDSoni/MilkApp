import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { cn } from "@/lib/cn";
import { colors, shadow } from "@/lib/theme";

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

// secondary = outlined, ghost = text-only, primary/danger = filled.
const container: Record<Variant, string> = {
  primary: "bg-accent",
  secondary: "bg-surface border border-border",
  ghost: "bg-transparent",
  danger: "bg-danger",
};

const text: Record<Variant, string> = {
  primary: "text-white",
  secondary: "text-ink",
  ghost: "text-accent",
  danger: "text-white",
};

// Large default size keeps touch targets thumb-friendly for one-hand use.
const sizing: Record<Size, string> = {
  lg: "h-14 px-6",
  md: "h-11 px-4",
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.03 }],
    opacity: 1 - pressed.value * 0.05,
  }));

  const filled = variant === "primary" || variant === "danger";

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      onPressIn={() => (pressed.value = withTiming(1, { duration: 90 }))}
      onPressOut={() => (pressed.value = withTiming(0, { duration: 140 }))}
      style={[filled && !isDisabled ? shadow.card : null, animatedStyle]}
      className={cn(
        "flex-row items-center justify-center rounded-2xl",
        sizing[size],
        container[variant],
        isDisabled && "opacity-40",
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator color={filled ? colors.white : colors.accent} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text
            className={cn(text[variant])}
            style={{ fontFamily: "Inter_600SemiBold", fontSize: size === "lg" ? 16 : 15, letterSpacing: -0.2 }}
          >
            {label}
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
}
