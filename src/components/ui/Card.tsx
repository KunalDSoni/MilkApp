import { View, ViewProps } from "react-native";
import { cn } from "@/lib/cn";

interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ className, children, ...rest }: CardProps) {
  return (
    <View
      className={cn(
        "rounded-card border border-surface-muted bg-surface p-4",
        className,
      )}
      {...rest}
    >
      {children}
    </View>
  );
}
