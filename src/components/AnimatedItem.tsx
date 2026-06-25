import Animated, { FadeInDown } from "react-native-reanimated";

/**
 * Subtle staggered entrance for cards and list rows. Fast and professional —
 * a short fade + upward slide. Purely presentational.
 */
export function AnimatedItem({
  children,
  index = 0,
  className,
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(260).delay(Math.min(index, 8) * 45)}
      className={className}
    >
      {children}
    </Animated.View>
  );
}
