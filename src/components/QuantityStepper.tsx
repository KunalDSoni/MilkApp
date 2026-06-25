import { Pressable, View } from "react-native";
import { Minus, Plus } from "lucide-react-native";
import { Txt } from "./ui/Text";
import { cn } from "@/lib/cn";

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number | null;
  step?: number;
  disabled?: boolean;
}

/**
 * Large −/+ stepper with 48dp targets. The core input for placing orders;
 * minimal typing by design.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = null,
  step = 1,
  disabled = false,
}: QuantityStepperProps) {
  const atMin = value <= min;
  const atMax = max != null && value >= max;

  const dec = () => !disabled && !atMin && onChange(Math.max(min, value - step));
  const inc = () => !disabled && !atMax && onChange(value + step);

  return (
    <View
      className={cn(
        "h-12 flex-row items-center overflow-hidden rounded-xl border border-brand-light bg-surface",
        disabled && "opacity-50",
      )}
    >
      <StepButton onPress={dec} disabled={disabled || atMin}>
        <Minus size={20} color="#0D47A1" />
      </StepButton>
      <View className="min-w-12 items-center justify-center px-3">
        <Txt variant="title">{value}</Txt>
      </View>
      <StepButton onPress={inc} disabled={disabled || atMax}>
        <Plus size={20} color="#0D47A1" />
      </StepButton>
    </View>
  );
}

function StepButton({
  onPress,
  disabled,
  children,
}: {
  onPress: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className={cn(
        "h-12 w-12 items-center justify-center bg-brand-light active:bg-brand-light/60",
        disabled && "opacity-40",
      )}
    >
      {children}
    </Pressable>
  );
}
