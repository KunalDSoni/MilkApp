import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cn } from "@/lib/cn";

interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  className?: string;
  edges?: ("top" | "bottom" | "left" | "right")[];
}

export function ScreenContainer({
  children,
  scroll = false,
  refreshing = false,
  onRefresh,
  className,
  edges = ["top"],
}: ScreenContainerProps) {
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-surface-muted">
      {scroll ? (
        <ScrollView
          contentContainerClassName={cn("p-4 gap-4", className)}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View className={cn("flex-1 p-4", className)}>{children}</View>
      )}
    </SafeAreaView>
  );
}
