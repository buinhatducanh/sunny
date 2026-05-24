// apps/mobile/app/(tabs)/_layout.tsx

import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    home: "🏠",
    collection: "🃏",
    achievements: "🏆",
    battlepass: "🎖️",
    shop: "🛒",
    friends: "👥",
    profile: "👤",
  };
  const labels: Record<string, string> = {
    home: "Trang chủ",
    collection: "Bộ sưu tập",
    achievements: "Thành tựu",
    battlepass: "Battle Pass",
    shop: "Cửa hàng",
    friends: "Bạn bè",
    profile: "Hồ sơ",
  };
  return (
    <View style={[styles.tab, focused && styles.tabFocused]}>
      <Text style={styles.tabIcon}>{icons[name] ?? "●"}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
        {labels[name] ?? name}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0F0F2E",
          borderTopColor: "#2a2a5e",
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} /> }}
      />
      <Tabs.Screen
        name="collection"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="collection" focused={focused} /> }}
      />
      <Tabs.Screen
        name="achievements"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="achievements" focused={focused} /> }}
      />
      <Tabs.Screen
        name="battlepass"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="battlepass" focused={focused} /> }}
      />
      <Tabs.Screen
        name="shop"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="shop" focused={focused} /> }}
      />
      <Tabs.Screen
        name="friends"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="friends" focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} /> }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tab: { alignItems: "center", justifyContent: "center", paddingHorizontal: 10 },
  tabFocused: {},
  tabIcon: { fontSize: 22, marginBottom: 2 },
  tabLabel: { fontSize: 10, color: "#666" },
  tabLabelFocused: { color: "#6C63FF" },
});
