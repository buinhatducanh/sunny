// apps/mobile/app/game/[roomId].tsx

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useGameBoardStore } from "../../src/store/gameBoardStore";
import { useAuthStore } from "../../src/store/authStore";
import { socket } from "../../src/lib/socket";
import { api } from "../../src/api/client";

const { width } = Dimensions.get("window");

const STORE_ICONS: Record<string, string> = {
  CAFE: "☕",
  CLOTHING: "👕",
  ELECTRONICS: "💻",
  AD_AGENCY: "📺",
};

const STORE_COLORS: Record<string, string> = {
  CAFE: "#8B4513",
  CLOTHING: "#E91E63",
  ELECTRONICS: "#2196F3",
  AD_AGENCY: "#9C27B0",
};

const SLOT_TYPES = ["DOANH THU", "BUFF", "CHI PHÍ", "PHÒNG THỦ", "ĐẶC BIỆT"];

export default function GameBoardScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { user } = useAuthStore();
  const {
    round,
    hp,
    money,
    energy,
    maxEnergy,
    hand,
    slots,
    envName,
    envColor,
    timeLeft,
    phase,
    players,
    isReady,
    gameOver,
    isConnected,
    storeType,
    votingStoreTypes,
    votedStoreType,
    connectRoom,
    disconnectRoom,
    playCard,
    lockCard,
    castVote,
    setReady,
    resetGame,
  } = useGameBoardStore();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const token = await api.loadToken();
      if (token && roomId && user?.playerId) {
        await connectRoom(roomId, token, user.playerId);
      }
    }
    init();
    return () => {
      disconnectRoom();
    };
  }, [roomId]);

  if (gameOver) {
    const sortedScores = [...(gameOver.scores ?? [])].sort((a, b) => b.score - a.score);
    const myRank = sortedScores.findIndex((s) => s.playerId === user?.playerId) + 1;

    const getRankBadge = (rank: number) => {
      if (rank === 1) return { emoji: "🥇", label: "1st" };
      if (rank === 2) return { emoji: "🥈", label: "2nd" };
      if (rank === 3) return { emoji: "🥉", label: "3rd" };
      return { emoji: `${rank}`, label: `${rank}th` };
    };

    return (
      <View style={styles.gameOverContainer}>
        <Text style={styles.gameOverEmoji}>{gameOver.winner ? "🏆" : "💀"}</Text>
        <Text style={styles.gameOverTitle}>
          {gameOver.winner ? "Chiến thắng!" : "Thất bại"}
        </Text>
        <Text style={styles.gameOverSub}>
          Sống sót {gameOver.survivedRounds} vòng
        </Text>
        {gameOver.isMvp && (
          <Text style={styles.mvpBadge}>⭐ MVP</Text>
        )}

        {/* Score breakdown */}
        <View style={styles.scoreBoard}>
          <Text style={styles.scoreBoardTitle}>📊 Kết quả</Text>
          {sortedScores.map((s, idx) => {
            const rank = idx + 1;
            const badge = getRankBadge(rank);
            const isMe = s.playerId === user?.playerId;
            const profitColor = s.profit > 0 ? "#00D4AA" : s.profit < 0 ? "#FF6B6B" : "#888";
            return (
              <View key={s.playerId} style={[styles.scoreRow, isMe && styles.scoreRowMe]}>
                <Text style={styles.scoreRank}>{badge.emoji}</Text>
                <View style={styles.scoreInfo}>
                  <Text style={[styles.scoreName, isMe && styles.scoreNameMe]} numberOfLines={1}>
                    {s.displayName}
                    {isMe ? " (Bạn)" : ""}
                    {s.isWinner && " 👑"}
                  </Text>
                  <View style={styles.scoreStats}>
                    <Text style={[styles.scoreStat, { color: s.isAlive ? "#00D4AA" : "#FF6B6B" }]}>
                      {s.isAlive ? "❤️ " + s.hp : "💀 eliminated"}
                    </Text>
                    <Text style={[styles.scoreProfit, { color: profitColor }]}>
                      {s.profit >= 0 ? "+" : ""}{s.profit.toLocaleString()}đ
                    </Text>
                  </View>
                </View>
                <Text style={[styles.scoreValue, rank === 1 && styles.scoreValueGold]}>
                  {s.score.toLocaleString()}
                </Text>
              </View>
            );
          })}
        </View>

        {myRank > 0 && myRank > 3 && (
          <Text style={styles.myRankText}>
            Vị trí của bạn: #{myRank}
          </Text>
        )}

        <TouchableOpacity
          style={styles.exitBtn}
          onPress={() => {
            resetGame();
            router.replace("/(tabs)/home");
          }}
        >
          <Text style={styles.exitBtnText}>Về trang chủ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === "VOTING") {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>←</Text>
          </TouchableOpacity>
          <Text style={styles.votingTitle}>🏪 Bỏ Phiếu Cửa Hàng</Text>
          <View style={styles.connectBadge}>
            <View style={[styles.connectDot, isConnected && styles.connectDotActive]} />
            <Text style={styles.connectText}>{isConnected ? "Live" : "..."}</Text>
          </View>
        </View>

        <View style={styles.votingContainer}>
          <Text style={styles.votingSubtitle}>Chọn loại cửa hàng cho ván đấu này</Text>
          <View style={styles.storeGrid}>
            {votingStoreTypes.map((st) => (
              <TouchableOpacity
                key={st}
                style={[
                  styles.storeCard,
                  { borderColor: STORE_COLORS[st] ?? "#6C63FF" },
                  votedStoreType === st && styles.storeCardSelected,
                  votedStoreType !== null && votedStoreType !== st && styles.storeCardDisabled,
                ]}
                onPress={() => votedStoreType === null && castVote(st)}
                disabled={votedStoreType !== null}
              >
                <Text style={styles.storeEmoji}>{STORE_ICONS[st] ?? "🏪"}</Text>
                <Text style={styles.storeName}>{st.replace("_", " ")}</Text>
                {votedStoreType === st && (
                  <Text style={styles.votedMark}>✓ Đã chọn</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
          {votedStoreType ? (
            <Text style={styles.waitingVoteText}>
              Chờ người chơi khác bỏ phiếu...
            </Text>
          ) : (
            <Text style={styles.votePrompt}>Chạm vào cửa hàng để bỏ phiếu</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <View style={styles.topStats}>
          <Text style={styles.roundText}>Vòng {round}/20</Text>
          <Text style={styles.hpText}>❤️ {hp}</Text>
          <Text style={styles.moneyText}>💰 {money.toLocaleString()}</Text>
        </View>
        <View style={styles.connectBadge}>
          <View style={[styles.connectDot, isConnected && styles.connectDotActive]} />
          <Text style={styles.connectText}>{isConnected ? "Live" : "..."}</Text>
        </View>
      </View>

      {/* Environment Banner */}
      <View style={[styles.envBanner, { backgroundColor: envColor + "22" }]}>
        <Text style={[styles.envBannerText, { color: envColor }]}>
          {envName}
        </Text>
        <Text style={styles.timer}>{timeLeft}s</Text>
        <View style={[styles.phaseBadge, phase === "ACTION" && styles.phaseAction]}>
          <Text style={styles.phaseText}>{phase}</Text>
        </View>
      </View>

      {/* Player Boards */}
      <ScrollView horizontal style={styles.playerBoards} showsHorizontalScrollIndicator={false}>
        {players.map((p) => (
          <View key={p.id} style={[styles.playerBoard, !p.isAlive && styles.playerDead]}>
            <Text style={styles.playerName}>{p.displayName}</Text>
            <Text style={styles.playerHP}>❤️ {p.hp}</Text>
            <Text style={styles.playerMoney}>💰 {p.money.toLocaleString()}</Text>
            <View style={styles.miniSlots}>
              {p.slots.map((s, i) => (
                <View key={i} style={[styles.miniSlot, s ? styles.miniSlotFilled : {}]} />
              ))}
            </View>
          </View>
        ))}
        {players.length === 0 && (
          <Text style={styles.waitingText}>Chờ người chơi khác...</Text>
        )}
      </ScrollView>

      {/* 5 Card Slots */}
      <View style={styles.slotsArea}>
        {SLOT_TYPES.map((label, i) => (
          <View key={i} style={styles.slotContainer}>
            <Text style={styles.slotLabel}>{label}</Text>
            <TouchableOpacity
              style={[styles.slot, slots[i] ? styles.slotFilled : styles.slotEmpty]}
              onPress={() => {
                if (phase === "ACTION" && !isReady) {
                  if (selectedCardId && !slots[i]) {
                    playCard(selectedCardId, i);
                    setSelectedCardId(null);
                  }
                }
              }}
            >
              {slots[i] ? (
                <Text style={styles.slotCard} numberOfLines={1}>
                  {hand.find((c) => c.id === slots[i])?.emoji ?? "🎴"}
                </Text>
              ) : (
                <Text style={styles.slotPlus}>+</Text>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Energy Bar */}
      <View style={styles.energyBar}>
        <View
          style={[
            styles.energyFill,
            { width: `${Math.min(100, (energy / maxEnergy) * 100)}%` },
          ]}
        />
        <Text style={styles.energyText}>⚡ {energy}/{maxEnergy}</Text>
      </View>

      {/* Player Hand */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.handArea}
        contentContainerStyle={styles.handContent}
      >
        {hand.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[styles.handCard, { borderColor: selectedCardId === card.id ? "#FFD700" : card.rarityColor }]}
            onPress={() => {
              if (phase === "ACTION" && !isReady) {
                if (selectedCardId === card.id) {
                  setSelectedCardId(null);
                } else {
                  const emptySlot = slots.findIndex((s) => s === null);
                  if (emptySlot !== -1) {
                    playCard(card.id, emptySlot);
                  } else {
                    setSelectedCardId(selectedCardId === card.id ? null : card.id);
                  }
                }
              }
            }}
          >
            <Text style={styles.handCardEmoji}>{card.emoji}</Text>
            <Text style={styles.handCardName}>{card.name}</Text>
            <Text style={styles.handCardDesc}>{card.description}</Text>
            <Text style={styles.handCardCost}>⚡{card.energyCost}</Text>
          </TouchableOpacity>
        ))}
        {hand.length === 0 && (
          <Text style={styles.noCardsText}>Không còn bài trên tay</Text>
        )}
      </ScrollView>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.actionBtn, !hand[0] && styles.actionBtnDisabled]}
          onPress={() => hand[0] && lockCard(hand[0].id)}
          disabled={!hand[0] || isReady}
        >
          <Text style={styles.actionBtnText}>🔒 Khóa 1 lá</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.readyBtn, isReady && styles.readyBtnActive]}
          onPress={setReady}
          disabled={isReady}
        >
          <Text style={styles.readyBtnText}>
            {isReady ? "✓ Đã sẵn sàng" : "✅ Sẵn sàng"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A1E" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    paddingTop: 60,
    backgroundColor: "#0F0F2E",
  },
  backBtn: { fontSize: 24, color: "#fff" },
  topStats: { flexDirection: "row", gap: 16 },
  roundText: { color: "#6C63FF", fontWeight: "bold", fontSize: 16 },
  hpText: { color: "#FF4757", fontWeight: "bold" },
  moneyText: { color: "#FFD700", fontWeight: "bold" },
  connectBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  connectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4757",
  },
  connectDotActive: { backgroundColor: "#00D4AA" },
  connectText: { color: "#888", fontSize: 12 },
  envBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  envBannerText: { fontSize: 14, fontWeight: "bold" },
  timer: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  phaseBadge: {
    backgroundColor: "#2a2a5e",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  phaseAction: { backgroundColor: "#6C63FF" },
  phaseText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  playerBoards: { maxHeight: 100, paddingHorizontal: 16, marginTop: 8 },
  playerBoard: {
    backgroundColor: "#1a1a3e",
    borderRadius: 12,
    padding: 10,
    marginRight: 8,
    width: 80,
    alignItems: "center",
  },
  playerDead: { opacity: 0.4 },
  playerName: { color: "#fff", fontSize: 12, fontWeight: "bold", marginBottom: 4 },
  playerHP: { color: "#FF4757", fontSize: 12, marginBottom: 2 },
  playerMoney: { color: "#FFD700", fontSize: 11, marginBottom: 4 },
  miniSlots: { flexDirection: "row", gap: 2 },
  miniSlot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: "#2a2a5e",
    borderWidth: 1,
    borderColor: "#3a3a7e",
  },
  miniSlotFilled: { backgroundColor: "#6C63FF" },
  waitingText: { color: "#666", fontSize: 14, paddingVertical: 20 },
  slotsArea: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    marginTop: 8,
  },
  slotContainer: { alignItems: "center" },
  slotLabel: { fontSize: 10, color: "#666", marginBottom: 4 },
  slot: {
    width: (width - 80) / 5,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  slotEmpty: { borderColor: "#2a2a5e", backgroundColor: "#0F0F2E" },
  slotFilled: { borderColor: "#6C63FF", backgroundColor: "#1a1a3e", borderStyle: "solid" },
  slotPlus: { color: "#2a2a5e", fontSize: 24 },
  slotCard: { fontSize: 28 },
  energyBar: {
    marginHorizontal: 16,
    height: 24,
    backgroundColor: "#1a1a3e",
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
  },
  energyFill: { position: "absolute", left: 0, top: 0, bottom: 0, backgroundColor: "#00D4AA" },
  energyText: { textAlign: "center", color: "#fff", fontSize: 12, fontWeight: "bold", zIndex: 1 },
  handArea: { marginTop: 12, maxHeight: 150 },
  handContent: { paddingHorizontal: 16, gap: 8 },
  handCard: {
    width: 100,
    height: 130,
    backgroundColor: "#1a1a3e",
    borderRadius: 12,
    padding: 8,
    borderWidth: 2,
    alignItems: "center",
    marginRight: 8,
  },
  handCardEmoji: { fontSize: 28, marginBottom: 4 },
  handCardName: { fontSize: 11, color: "#fff", textAlign: "center", fontWeight: "bold" },
  handCardDesc: { fontSize: 9, color: "#888", textAlign: "center", flex: 1 },
  handCardCost: { fontSize: 12, color: "#00D4AA", fontWeight: "bold" },
  noCardsText: { color: "#666", textAlign: "center", paddingVertical: 40 },
  actionBar: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#1a1a3e",
    borderWidth: 1,
    borderColor: "#2a2a5e",
    alignItems: "center",
  },
  actionBtnDisabled: { opacity: 0.4 },
  actionBtnText: { color: "#fff", fontWeight: "bold" },
  readyBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#6C63FF",
    alignItems: "center",
  },
  readyBtnActive: { backgroundColor: "#00D4AA" },
  readyBtnText: { color: "#fff", fontWeight: "bold" },
  gameOverContainer: {
    flex: 1,
    backgroundColor: "#0A0A1E",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  gameOverEmoji: { fontSize: 80, marginBottom: 16 },
  gameOverTitle: { fontSize: 32, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  gameOverSub: { fontSize: 18, color: "#888", marginBottom: 4 },
  gameOverScore: { fontSize: 20, color: "#FFD700", fontWeight: "bold", marginBottom: 8 },
  mvpBadge: { fontSize: 24, color: "#FFD700", marginBottom: 16 },
  scoreBoard: {
    width: "100%",
    backgroundColor: "#1a1a3e",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2a2a5e",
  },
  scoreBoardTitle: { fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 12 },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  scoreRowMe: { backgroundColor: "#2a2a5e" },
  scoreRank: { fontSize: 18, width: 36, textAlign: "center" },
  scoreInfo: { flex: 1, marginLeft: 8 },
  scoreStats: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 2 },
  scoreStat: { fontSize: 11 },
  scoreProfit: { fontSize: 11, fontWeight: "bold" },
  scoreName: { fontSize: 14, color: "#ccc" },
  scoreNameMe: { color: "#6C63FF", fontWeight: "bold" },
  scoreValue: { fontSize: 16, color: "#fff", fontWeight: "bold", marginLeft: 8 },
  scoreValueGold: { color: "#FFD700" },
  myRankText: { fontSize: 14, color: "#888", marginBottom: 8 },
  exitBtn: {
    backgroundColor: "#6C63FF",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 16,
  },
  exitBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  votingTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  votingContainer: { flex: 1, justifyContent: "center", padding: 24 },
  votingSubtitle: { fontSize: 16, color: "#888", textAlign: "center", marginBottom: 24 },
  storeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
  storeCard: {
    width: (width - 80) / 2,
    backgroundColor: "#1a1a3e",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    marginBottom: 8,
  },
  storeCardSelected: { borderWidth: 3, backgroundColor: "#2a2a6e" },
  storeCardDisabled: { opacity: 0.4 },
  storeEmoji: { fontSize: 48, marginBottom: 8 },
  storeName: { fontSize: 14, fontWeight: "bold", color: "#fff", textAlign: "center" },
  votedMark: { fontSize: 12, color: "#00D4AA", marginTop: 4 },
  votePrompt: { fontSize: 14, color: "#666", textAlign: "center", marginTop: 24 },
  waitingVoteText: { fontSize: 14, color: "#888", textAlign: "center", marginTop: 24 },
});
