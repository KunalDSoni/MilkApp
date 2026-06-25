import Constants from "expo-constants";
import { View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Text";
import { env } from "@/core/config/env";

export default function SettingsScreen() {
  return (
    <ScreenContainer scroll>
      <View className="gap-1">
        <Txt variant="overline">About</Txt>
        <Card className="gap-3">
          <Row label="App version" value={Constants.expoConfig?.version ?? "1.0.0"} />
          <View className="h-px bg-border" />
          <Row label="Environment" value={env.useMocks ? "Mock data" : "Live API"} />
        </Card>
      </View>

      <View className="gap-1">
        <Txt variant="overline">Notifications</Txt>
        <Card>
          <Txt variant="muted">
            Notification preferences are configured in Phase 5 (FCM).
          </Txt>
        </Card>
      </View>
    </ScreenContainer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Txt variant="muted">{label}</Txt>
      <Txt variant="num">{value}</Txt>
    </View>
  );
}
