import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell, Home, Package, Receipt, User } from "lucide-react-native";
import { useUnreadCount } from "@/features/notifications/hooks";
import { colors } from "@/lib/theme";

export default function TabsLayout() {
  const unread = useUnreadCount();
  const insets = useSafeAreaInsets();
  // Fixed vertical room for the icon + label so the label is never clipped,
  // plus a bottom cushion that respects the device safe-area inset.
  const CONTENT = 60;
  const paddingTop = 10;
  const paddingBottom = Math.max(insets.bottom, 10);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarLabelStyle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.1, marginTop: 2 },
        tabBarStyle: {
          height: CONTENT + paddingTop + paddingBottom,
          paddingTop,
          paddingBottom,
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarItemStyle: { paddingTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarIcon: ({ color, focused }) => <Home color={color} size={23} strokeWidth={focused ? 2.4 : 2} /> }}
      />
      <Tabs.Screen
        name="catalog"
        options={{ title: "Products", tabBarIcon: ({ color, focused }) => <Package color={color} size={23} strokeWidth={focused ? 2.4 : 2} /> }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: "Orders", tabBarIcon: ({ color, focused }) => <Receipt color={color} size={23} strokeWidth={focused ? 2.4 : 2} /> }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Alerts",
          tabBarBadge: unread > 0 ? unread : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.danger, fontSize: 10, fontFamily: "Inter_700Bold" },
          tabBarIcon: ({ color, focused }) => <Bell color={color} size={23} strokeWidth={focused ? 2.4 : 2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarIcon: ({ color, focused }) => <User color={color} size={23} strokeWidth={focused ? 2.4 : 2} /> }}
      />
    </Tabs>
  );
}
