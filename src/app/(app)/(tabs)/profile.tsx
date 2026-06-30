import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  LogOut,
  MapPin,
  Phone,
  Settings,
  Store,
  UserCog,
} from "lucide-react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Text";
import { AnimatedItem } from "@/components/AnimatedItem";
import { useAuth } from "@/core/auth/useAuth";
import { useProfile } from "@/features/profile/hooks";
import { confirmDialog } from "@/lib/dialog";
import { colors } from "@/lib/theme";

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const profile = useProfile();
  const p = profile.data;

  const confirmLogout = () => {
    confirmDialog(
      "Log out",
      "Are you sure you want to log out?",
      () => void signOut(),
      "Log out",
    );
  };

  return (
    <ScreenContainer scroll>
      <AnimatedItem index={0}>
        <Card className="items-center gap-3 py-7" variant="elevated">
          <View className="h-20 w-20 items-center justify-center rounded-3xl bg-primary">
            <Store size={32} color={colors.white} strokeWidth={2} />
          </View>
          <View className="items-center gap-1">
            <Txt variant="h3" accessibilityRole="header">
              {p?.businessName ?? "Your business"}
            </Txt>
            {p?.contactName ? <Txt variant="muted">{p.contactName}</Txt> : null}
          </View>
          {p?.phone ? (
            <View className="flex-row items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5">
              <Phone size={14} color={colors.textSecondary} />
              <Txt variant="caption" className="text-ink-muted">
                {p.phone}
              </Txt>
            </View>
          ) : null}
          {p?.address ? (
            <View className="flex-row items-center justify-center gap-1.5 px-4">
              <MapPin size={14} color={colors.textSecondary} />
              <Txt variant="caption" className="text-center text-ink-muted">
                {p.address}
              </Txt>
            </View>
          ) : null}
        </Card>
      </AnimatedItem>

      <AnimatedItem index={1}>
        <Txt variant="overline" className="mt-1">
          Account
        </Txt>
      </AnimatedItem>

      <AnimatedItem index={2}>
        <Card variant="elevated" className="p-0 overflow-hidden">
          <Row
            icon={<UserCog size={20} color={colors.accent} strokeWidth={2.1} />}
            label="Edit profile"
            onPress={() => router.push("/(app)/profile/edit")}
          />
          <View className="h-px bg-border" />
          <Row
            icon={<Settings size={20} color={colors.accent} strokeWidth={2.1} />}
            label="Settings"
            onPress={() => router.push("/(app)/settings")}
          />
          <View className="h-px bg-border" />
          <Row
            icon={<LogOut size={20} color={colors.danger} strokeWidth={2.1} />}
            label="Log out"
            tone="danger"
            onPress={confirmLogout}
          />
        </Card>
      </AnimatedItem>
    </ScreenContainer>
  );
}

function Row({
  icon,
  label,
  onPress,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-4 active:bg-surface-muted"
    >
      <View className="h-10 w-10 items-center justify-center rounded-2xl bg-surface-muted">
        {icon}
      </View>
      <Txt variant="label" className={tone === "danger" ? "flex-1 text-danger" : "flex-1"}>
        {label}
      </Txt>
      <ChevronRight size={18} color={colors.textSubtle} />
    </Pressable>
  );
}
