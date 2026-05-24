// apps/mobile/app/settings/notifications.tsx

import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Thông báo</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🔔</Text>
        <Text style={styles.emptyTitle}>Chưa có thông báo</Text>
        <Text style={styles.emptySub}>Các thông báo về sự kiện, achievement, và bạn bè sẽ hiển thị ở đây</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A1E" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 60,
  },
  back: { fontSize: 24, color: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  emptySub: { fontSize: 14, color: "#888", textAlign: "center" },
});
