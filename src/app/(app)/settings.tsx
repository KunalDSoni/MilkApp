import Constants from "expo-constants";
import { View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Text";
import { env } from "@/core/config/env";

export default function SettingsScreen() {
  return (
    <ScreenContainer scroll>
      <Card className="gap-2">
        <Txt variant="title">About</Txt>
        <Row label="App version" value={Constants.expoConfig?.version ?? "1.0.0"} />
        <Row label="Environment" value={env.useMocks ? "Mock data" : "Live API"} />
      </Card>
      <Card className="gap-2">
        <Txt variant="title">Notifications</Txt>
        <Txt variant="muted">
          Notification preferences are configured in Phase 5 (FCM).
        </Txt>
      </Card>
    </ScreenContainer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-1">
      <Txt variant="muted">{label}</Txt>
      <Txt variant="label">{value}</Txt>
    </View>
  );
}
