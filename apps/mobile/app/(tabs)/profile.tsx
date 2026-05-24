// apps/mobile/app/(tabs)/profile.tsx

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";
import { PROFESSION_ICONS, PROFESSION_COLORS } from "@sunny-game/constants/profession.data";
import type { ProfessionType } from "@sunny-game/types/player.types";

const MENU_ITEMS = [
  { icon: "⚙️", label: "Cài đặt", screen: "/settings" },
  { icon: "🔔", label: "Thông báo", screen: "/notifications" },
  { icon: "❓", label: "Trợ giúp & FAQ", screen: "/help" },
  { icon: "📜", label: "Điều khoản sử dụng", screen: "/terms" },
];

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const player = user?.player;
  const mainProf = (player?.mainProfession ?? "SOFTWARE_ENGINEERING") as ProfessionType;
  const winRate =
    player && player.totalGames > 0
      ? Math.round((player.totalWins / player.totalGames) * 100)
      : 0;

  function handleLogout() {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hồ sơ</Text>
        <View style={styles.currency}>
          <Text style={styles.coins}>💰 {player?.coins?.toLocaleString() ?? 0}</Text>
          <Text style={styles.gems}>💎 {player?.gems ?? 0}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>☀️</Text>
          </View>
          <Text style={styles.displayName}>
            {player?.displayName ?? "Người chơi"}
          </Text>
          <Text style={styles.username}>@{user?.username ?? "player"}</Text>

          <View style={styles.levelRow}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>
                Level {player?.level ?? 1}
              </Text>
            </View>
            {mainProf && (
              <View
                style={[
                  styles.profBadge,
                  { backgroundColor: PROFESSION_COLORS[mainProf] + "33", borderColor: PROFESSION_COLORS[mainProf] },
                ]}
              >
                <Text style={styles.profIcon}>
                  {PROFESSION_ICONS[mainProf]}
                </Text>
                <Text style={[styles.profName, { color: PROFESSION_COLORS[mainProf] }]}>
                  {mainProf.replace(/_/g, " ")}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.title2}>{player?.title ?? "Tân Binh"}</Text>

          {/* XP Progress */}
          <View style={styles.xpSection}>
            <View style={styles.xpBar}>
              <View
                style={[
                  styles.xpFill,
                  {
                    width: `${
                      player ? ((player.xp % 1000) / 1000) * 100 : 0
                    }%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.xpText}>
              {player?.xp ?? 0} / 1000 XP
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🎮</Text>
            <Text style={styles.statValue}>{player?.totalGames ?? 0}</Text>
            <Text style={styles.statLabel}>Trận đấu</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statValue}>{player?.totalWins ?? 0}</Text>
            <Text style={styles.statLabel}>Chiến thắng</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statValue}>{winRate}%</Text>
            <Text style={styles.statLabel}>Tỷ lệ thắng</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⬆️</Text>
            <Text style={styles.statValue}>{player?.highestRound ?? 0}</Text>
            <Text style={styles.statLabel}>Vòng cao nhất</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={() => router.push("/(tabs)/shop")}>
            <Text style={styles.quickIcon}>📦</Text>
            <Text style={styles.quickLabel}>Mở gói thẻ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => router.push("/settings/notifications")}>
            <Text style={styles.quickIcon}>🔔</Text>
            <Text style={styles.quickLabel}>Thông báo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => router.push("/(tabs)/achievements")}>
            <Text style={styles.quickIcon}>🏅</Text>
            <Text style={styles.quickLabel}>Thành tựu</Text>
          </TouchableOpacity>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => {}}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A1E" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  currency: { flexDirection: "row", gap: 12 },
  coins: { color: "#FFD700", fontWeight: "bold", fontSize: 14 },
  gems: { color: "#EC4899", fontWeight: "bold", fontSize: 14 },
  content: { flex: 1 },
  profileCard: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#1a1a3e",
    margin: 16,
    borderRadius: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarEmoji: { fontSize: 40 },
  displayName: { fontSize: 22, fontWeight: "bold", color: "#fff", marginBottom: 2 },
  username: { fontSize: 14, color: "#888", marginBottom: 8 },
  levelRow: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 8 },
  levelBadge: {
    backgroundColor: "#6C63FF",
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  profBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  profIcon: { fontSize: 14 },
  profName: { fontSize: 12, fontWeight: "bold" },
  title2: { fontSize: 14, color: "#888", marginBottom: 12 },
  xpSection: { width: "100%", alignItems: "center" },
  xpBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#2a2a5e",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  xpFill: { height: "100%", backgroundColor: "#6C63FF", borderRadius: 4 },
  xpText: { fontSize: 12, color: "#888" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", padding: 12, gap: 8 },
  statCard: {
    width: "48%",
    backgroundColor: "#1a1a3e",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  statLabel: { fontSize: 12, color: "#888", marginTop: 2 },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  quickAction: {
    flex: 1,
    backgroundColor: "#1a1a3e",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a5e",
  },
  quickIcon: { fontSize: 28, marginBottom: 4 },
  quickLabel: { fontSize: 11, color: "#fff", fontWeight: "600" },
  menuSection: {
    marginHorizontal: 16,
    backgroundColor: "#1a1a3e",
    borderRadius: 16,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a5e",
  },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 15, color: "#fff" },
  menuArrow: { color: "#666", fontSize: 20 },
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    alignItems: "center",
    backgroundColor: "#1a1a3e",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FF4757",
  },
  logoutText: { color: "#FF4757", fontSize: 16, fontWeight: "bold" },
});
