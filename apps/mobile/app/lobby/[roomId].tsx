// apps/mobile/app/lobby/[roomId].tsx

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect } from "react";
import { useLobbyStore } from "../../src/store/lobbyStore";

export default function LobbyScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const {
    room,
    isHost,
    isReady,
    loading,
    joinRoom,
    startGame,
    toggleReady,
    copyInviteCode,
  } = useLobbyStore();

  useEffect(() => {
    if (roomId) joinRoom(roomId);
  }, [roomId]);

  useEffect(() => {
    if (!roomId || loading) return;
    const interval = setInterval(() => {
      useLobbyStore.getState().pollRoom(roomId);
    }, 3000);
    return () => clearInterval(interval);
  }, [roomId, loading]);

  async function handleStart() {
    const result = await startGame(roomId);
    if (result) {
      router.replace(`/game/${roomId}`);
    }
  }

  async function handleShare() {
    if (!room) return;
    try {
      await Share.share({
        message: `Chơi Project Sunny cùng mình! Mã phòng: ${room.inviteCode}\n\nTải app: sunny-game.vn`,
      });
    } catch {}
  }

  if (loading || !room) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Đang tải phòng...</Text>
      </View>
    );
  }

  const canStart = isHost && room.players.length >= 2;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={async () => {
          if (roomId) {
            await useLobbyStore.getState().leaveRoom(roomId);
          }
          router.back();
        }}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.roomName}>{room.name}</Text>
        <View />
      </View>

      <View style={styles.codeSection}>
        <Text style={styles.codeLabel}>Mã phòng</Text>
        <TouchableOpacity onPress={copyInviteCode}>
          <Text style={styles.code}>{room.inviteCode}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareBtnText}>📤 Chia sẻ phòng</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.playersSection}>
        <Text style={styles.sectionTitle}>
          Người chơi ({room.players.length}/{room.maxPlayers})
        </Text>
        {room.players.map((player, i) => (
          <View key={player.id ?? i} style={styles.playerRow}>
            <View style={styles.playerAvatar}>
              <Text style={styles.playerAvatarText}>
                {player.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>
                {player.displayName}
                {isHost && i === 0 ? " 👑" : ""}
              </Text>
              <Text style={styles.playerProf}>{player.profession}</Text>
            </View>
            {player.isReady && (
              <View style={styles.readyBadge}>
                <Text style={styles.readyBadgeText}>✓ Sẵn sàng</Text>
              </View>
            )}
          </View>
        ))}

        {Array.from({ length: room.maxPlayers - room.players.length }).map((_, i) => (
          <View key={`empty-${i}`} style={styles.emptySlot}>
            <Text style={styles.emptySlotText}>Chờ người chơi...</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        {!isHost && (
          <TouchableOpacity
            style={[styles.readyBtn, isReady && styles.readyBtnActive]}
            onPress={toggleReady}
          >
            <Text style={styles.readyBtnText}>
              {isReady ? "✓ Đã sẵn sàng" : "Sẵn sàng"}
            </Text>
          </TouchableOpacity>
        )}

        {isHost && (
          <TouchableOpacity
            style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
            onPress={handleStart}
            disabled={!canStart}
          >
            <Text style={styles.startBtnText}>
              {canStart ? "🚀 Bắt đầu trò chơi" : `Chờ thêm (${room.players.length}/2+)`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A1E" },
  loading: { color: "#fff", textAlign: "center", marginTop: 100 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 60,
  },
  backBtn: { fontSize: 24, color: "#fff" },
  roomName: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  codeSection: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#1a1a3e",
    marginHorizontal: 16,
    borderRadius: 20,
  },
  codeLabel: { fontSize: 14, color: "#888", marginBottom: 8 },
  code: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#6C63FF",
    letterSpacing: 6,
    marginBottom: 16,
  },
  shareBtn: {
    backgroundColor: "#6C63FF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  shareBtnText: { color: "#fff", fontWeight: "bold" },
  playersSection: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 16 },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a3e",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  playerAvatarText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  playerProf: { fontSize: 12, color: "#888" },
  readyBadge: { backgroundColor: "#00D4AA", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  readyBadgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  emptySlot: {
    backgroundColor: "#0F0F2E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#2a2a5e",
  },
  emptySlotText: { color: "#666", textAlign: "center" },
  actions: { padding: 16, gap: 12 },
  readyBtn: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#1a1a3e",
    borderWidth: 2,
    borderColor: "#00D4AA",
    alignItems: "center",
  },
  readyBtnActive: { backgroundColor: "#00D4AA" },
  readyBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  startBtn: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#6C63FF",
    alignItems: "center",
  },
  startBtnDisabled: { backgroundColor: "#2a2a5e" },
  startBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
