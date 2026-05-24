// apps/mobile/app/(tabs)/settings.tsx

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  async function handleLogout() {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  function handlePrivacy() {
    Linking.openURL("https://sunny-game.vn/privacy");
  }

  function handleTerms() {
    Linking.openURL("https://sunny-game.vn/terms");
  }

  function handleSupport() {
    Linking.openURL("mailto:support@sunny-game.vn");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Cài Đặt</Text>
      </View>

      {/* Account section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tài Khoản</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Tên hiển thị</Text>
            <Text style={styles.value}>{user?.player?.displayName ?? "—"}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Level</Text>
            <Text style={styles.value}>Lv.{user?.player?.level ?? 1}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email ?? "—"}</Text>
          </View>
        </View>
      </View>

      {/* Audio section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Âm Thanh</Text>
        <View style={styles.card}>
          <View style={styles.rowToggle}>
            <Text style={styles.label}>Âm thanh</Text>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: "#2a2a5e", true: "#6C63FF" }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.rowToggle}>
            <Text style={styles.label}>Nhạc nền</Text>
            <Switch
              value={musicEnabled}
              onValueChange={setMusicEnabled}
              trackColor={{ false: "#2a2a5e", true: "#6C63FF" }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.rowToggle}>
            <Text style={styles.label}>Rung khi chơi</Text>
            <Switch
              value={hapticEnabled}
              onValueChange={setHapticEnabled}
              trackColor={{ false: "#2a2a5e", true: "#6C63FF" }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông Báo</Text>
        <View style={styles.card}>
          <View style={styles.rowToggle}>
            <Text style={styles.label}>Thông báo</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#2a2a5e", true: "#6C63FF" }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Về Ứng Dụng</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={handleSupport}>
            <Text style={styles.label}>Hỗ trợ</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={handlePrivacy}>
            <Text style={styles.label}>Chính sách bảo mật</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={handleTerms}>
            <Text style={styles.label}>Điều khoản sử dụng</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Version */}
      <View style={styles.versionSection}>
        <Text style={styles.version}>Sunny Game v1.0.0</Text>
        <Text style={styles.copyright}>© 2026 LOOP Solutions</Text>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A1E" },
  content: { paddingBottom: 100 },
  header: { padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  section: { marginBottom: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 13, fontWeight: "bold", color: "#888", marginBottom: 8, textTransform: "uppercase" },
  card: { backgroundColor: "#1a1a3e", borderRadius: 14, overflow: "hidden" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16 },
  rowToggle: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16 },
  divider: { height: 1, backgroundColor: "#2a2a5e", marginLeft: 16 },
  label: { fontSize: 15, color: "#fff" },
  value: { fontSize: 15, color: "#888" },
  arrow: { fontSize: 20, color: "#555" },
  versionSection: { alignItems: "center", marginVertical: 16 },
  version: { fontSize: 13, color: "#555" },
  copyright: { fontSize: 12, color: "#444", marginTop: 4 },
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#2a1a1a",
    borderWidth: 1,
    borderColor: "#FF4757",
    alignItems: "center",
  },
  logoutText: { color: "#FF4757", fontSize: 16, fontWeight: "bold" },
});
