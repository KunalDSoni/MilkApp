import { Alert, View } from "react-native";
import { useRouter } from "expo-router";
import { LogOut, Phone, Settings, Store } from "lucide-react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/core/auth/useAuth";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const confirmLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: () => void signOut() },
    ]);
  };

  return (
    <ScreenContainer scroll>
      <Card className="gap-3">
        <View className="flex-row items-center gap-3">
          <Store size={28} color="#1565C0" />
          <View>
            <Txt variant="title">{user?.shopName ?? "Your shop"}</Txt>
            <Txt variant="muted">{user?.name}</Txt>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <Phone size={16} color="#6B7280" />
          <Txt variant="muted">+91 {user?.phone}</Txt>
        </View>
      </Card>

      <Button
        label="Settings"
        variant="secondary"
        icon={<Settings size={20} color="#0D47A1" />}
        onPress={() => router.push("/(app)/settings")}
      />

      <Button
        label="Log out"
        variant="danger"
        icon={<LogOut size={20} color="#fff" />}
        onPress={confirmLogout}
      />
    </ScreenContainer>
  );
}
