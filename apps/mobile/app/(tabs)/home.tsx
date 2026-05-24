// apps/mobile/app/(tabs)/home.tsx

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "../../src/store/authStore";
import { useGameStore } from "../../src/store/gameStore";
import { api } from "../../src/api/client";

interface LeaderboardEntry {
  rank: number;
  playerId: string;
  displayName: string;
  level: number;
  gamesPlayed: number;
  gamesWon: number;
  totalXP: number;
  winRate: number;
}

function LeaderboardList() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    api.get<LeaderboardEntry[]>("/leaderboard?limit=10")
      .then(setEntries)
      .catch(() => {});
  }, []);

  if (entries.length === 0) {
    return (
      <View style={styles.lbEmpty}>
        <Text style={styles.lbEmptyText}>Chưa có dữ liệu bảng xếp hạng</Text>
      </View>
    );
  }

  return (
    <View style={styles.lbCard}>
      {entries.slice(0, 5).map((e) => (
        <View key={e.playerId} style={styles.lbRow}>
          <Text style={styles.lbRank}>
            {e.rank === 1 ? "🥇" : e.rank === 2 ? "🥈" : e.rank === 3 ? "🥉" : `#${e.rank}`}
          </Text>
          <View style={styles.lbInfo}>
            <Text style={styles.lbName} numberOfLines={1}>{e.displayName}</Text>
            <Text style={styles.lbStats}>Lv.{e.level} · {e.gamesWon}W/{e.gamesPlayed}G</Text>
          </View>
          <Text style={styles.lbWinRate}>{e.winRate}%</Text>
        </View>
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { rooms, fetchRooms, createRoom, isCreating, isSearching, queuePosition, joinMatchmaking, leaveMatchmaking, pollMatchmaking } = useGameStore();
  const [refreshing, setRefreshing] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    fetchOnline();
    const interval = setInterval(fetchOnline, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isSearching) return;
    const pollInterval = setInterval(pollMatchmaking, 3000);
    return () => clearInterval(pollInterval);
  }, [isSearching]);

  async function fetchOnline() {
    try {
      const res = await api.get<{ online: number }>("/game/online");
      setOnlineCount(res.online);
    } catch {
      // ignore
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([fetchRooms(), fetchOnline()]);
    setRefreshing(false);
  }

  async function handleCreateRoom() {
    const room = await createRoom({});
    if (room) {
      router.push(`/lobby/${room.id}`);
    }
  }

  async function handleQuickJoin() {
    const room = await createRoom({ name: "Phòng nhanh" });
    if (room) {
      router.push(`/lobby/${room.id}`);
    }
  }

  function handleFindMatch() {
    if (isSearching) {
      Alert.alert("Hủy tìm trận", "Bạn có muốn hủy tìm kiếm trận đấu?", [
        { text: "Hủy", style: "cancel" },
        { text: "Hủy tìm trận", style: "destructive", onPress: leaveMatchmaking },
      ]);
    } else {
      Alert.alert(
        "Tìm trận",
        `Đang tìm trận đấu với người chơi cùng level...\n\nVị trí hàng đợi: ${queuePosition > 0 ? `#${queuePosition}` : "..."}`,
        [
          { text: "Hủy", style: "cancel", onPress: leaveMatchmaking },
          { text: "Tìm", onPress: joinMatchmaking },
        ],
      );
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Xin chào, {user?.player?.displayName ?? "Người chơi"}!
          </Text>
          <View style={styles.levelRow}>
            <Text style={styles.level}>
              Level {user?.player?.level ?? 1} · {user?.player?.mainProfession ?? "Software Engineering"}
            </Text>
            <View style={styles.onlineBadge}>
              <Text style={styles.onlineDot}>●</Text>
              <Text style={styles.onlineText}>{onlineCount} online</Text>
            </View>
          </View>
        </View>
        <LinearGradient
          colors={["#6C63FF", "#00D4AA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarGradient}
        >
          <Text style={styles.avatarEmoji}>☀️</Text>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C63FF" />}
      >
        <View style={styles.actionCards}>
          <TouchableOpacity style={styles.actionCard} onPress={handleCreateRoom} disabled={isCreating}>
            <Text style={styles.actionIcon}>🎮</Text>
            <Text style={styles.actionTitle}>Tạo phòng</Text>
            <Text style={styles.actionDesc}>Mời bạn bè</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleFindMatch} disabled={isCreating}>
            <Text style={styles.actionIcon}>{isSearching ? "⏳" : "🎯"}</Text>
            <Text style={styles.actionTitle}>{isSearching ? `Hàng đợi...` : "Tìm trận"}</Text>
            <Text style={styles.actionDesc}>{isSearching && queuePosition > 0 ? `Vị trí #${queuePosition}` : "Auto-match"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, styles.actionCardSecondary]} onPress={handleQuickJoin}>
            <Text style={styles.actionIcon}>⚡</Text>
            <Text style={styles.actionTitle}>Chơi ngay</Text>
            <Text style={styles.actionDesc}>Tạo phòng nhanh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Phòng đang chờ</Text>
            <TouchableOpacity onPress={onRefresh}>
              <Text style={styles.refresh}>🔄 Làm mới</Text>
            </TouchableOpacity>
          </View>

          {rooms.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🎲</Text>
              <Text style={styles.emptyText}>Không có phòng nào đang chờ</Text>
              <Text style={styles.emptySubtext}>Tạo phòng mới để bắt đầu chơi!</Text>
            </View>
          ) : (
            rooms.slice(0, 5).map((room) => (
              <TouchableOpacity
                key={room.id}
                style={styles.roomCard}
                onPress={() => router.push(`/lobby/${room.id}`)}
              >
                <View style={styles.roomInfo}>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <Text style={styles.roomMeta}>
                    {room.players.length}/{room.maxPlayers} người chơi
                  </Text>
                </View>
                <View style={styles.roomPlayers}>
                  {room.players.slice(0, 3).map((p, i) => (
                    <View key={i} style={styles.playerDot}>
                      <Text style={styles.playerDotText}>
                        {p.displayName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  ))}
                  {room.players.length > 3 && (
                    <Text style={styles.morePlayers}>+{room.players.length - 3}</Text>
                  )}
                </View>
                <Text style={styles.joinBtn}>Vào</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bảng xếp hạng</Text>
          <LeaderboardList />
        </View>
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
    backgroundColor: "#0F0F2E",
  },
  greeting: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  levelRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 12 },
  level: { fontSize: 14, color: "#888" },
  onlineBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  onlineDot: { fontSize: 8, color: "#00D4AA" },
  onlineText: { fontSize: 12, color: "#00D4AA" },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: { fontSize: 28 },
  content: { flex: 1 },
  actionCards: { flexDirection: "row", padding: 16, gap: 12 },
  actionCard: {
    flex: 1,
    backgroundColor: "#1a1a3e",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#6C63FF",
  },
  actionCardSecondary: { borderColor: "#00D4AA" },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionTitle: { fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 4 },
  actionDesc: { fontSize: 12, color: "#888" },
  section: { padding: 16, paddingTop: 8 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  refresh: { color: "#6C63FF", fontSize: 14 },
  emptyState: { alignItems: "center", padding: 32, backgroundColor: "#1a1a3e", borderRadius: 16 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: "#fff", fontWeight: "600" },
  emptySubtext: { fontSize: 14, color: "#888", marginTop: 4 },
  roomCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a3e",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  roomInfo: { flex: 1 },
  roomName: { fontSize: 15, fontWeight: "600", color: "#fff" },
  roomMeta: { fontSize: 12, color: "#888", marginTop: 2 },
  roomPlayers: { flexDirection: "row", marginRight: 12, alignItems: "center" },
  playerDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
  },
  playerDotText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  morePlayers: { color: "#888", fontSize: 12, marginLeft: 4 },
  joinBtn: {
    backgroundColor: "#6C63FF",
    color: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    fontWeight: "bold",
    fontSize: 14,
    overflow: "hidden",
  },
  lbCard: {
    backgroundColor: "#1a1a3e",
    borderRadius: 16,
    overflow: "hidden",
  },
  lbEmpty: {
    backgroundColor: "#1a1a3e",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  lbEmptyText: { color: "#666", fontSize: 14 },
  lbRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a5e",
  },
  lbRank: { fontSize: 18, width: 40, textAlign: "center" },
  lbInfo: { flex: 1, marginLeft: 4 },
  lbName: { fontSize: 14, fontWeight: "bold", color: "#fff" },
  lbStats: { fontSize: 12, color: "#888", marginTop: 2 },
  lbWinRate: { fontSize: 14, fontWeight: "bold", color: "#FFD700" },
});
