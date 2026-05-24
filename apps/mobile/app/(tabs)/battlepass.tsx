// apps/mobile/app/(tabs)/battlepass.tsx

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { api } from "../../src/api/client";

interface TierStatus {
  tier: number;
  xpRequired: number;
  reward: { coins?: number; xp?: number };
  isPremium: boolean;
  unlocked: boolean;
  claimed: boolean;
}

interface BattlePass {
  seasonId: string;
  seasonName: string;
  xp: number;
  tier: number;
  purchased: boolean;
  totalTiers: number;
  tiers: TierStatus[];
}

export default function BattlePassScreen() {
  const [bp, setBp] = useState<BattlePass | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<number | null>(null);

  useEffect(() => {
    fetchBattlePass();
  }, []);

  async function fetchBattlePass() {
    setLoading(true);
    try {
      const data = await api.get<BattlePass>("/battlepass");
      setBp(data);
    } catch {
      setBp(null);
    }
    setLoading(false);
  }

  async function handleClaim(tier: number) {
    if (!bp) return;
    const tierDef = bp.tiers[tier - 1];
    if (!tierDef) return;

    if (tierDef.isPremium && !bp.purchased) {
      Alert.alert(
        "Battle Pass",
        `Cần mua Battle Pass để nhận phần thưởng Tier ${tier} (Premium).`,
        [{ text: "OK" }],
      );
      return;
    }

    setClaiming(tier);
    try {
      await api.post(`/battlepass/claim/${tier}`);
      await fetchBattlePass();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi";
      Alert.alert("Lỗi", msg);
    }
    setClaiming(null);
  }

  function handlePurchase() {
    Alert.alert(
      "Mua Battle Pass",
      "Battle Pass hiện tại miễn phí cho tất cả người chơi. Các Season tới sẽ có Battle Pass trả phí với phần thưởng đặc biệt.\n\nLiên hệ admin@loopsolutions.vn để biết thêm chi tiết.",
      [{ text: "OK" }],
    );
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  if (!bp) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🎖️</Text>
        <Text style={styles.emptyText}>Không có Season nào</Text>
      </View>
    );
  }

  const currentTier = bp.tiers.findIndex((t) => !t.unlocked);
  const prevTierXP = currentTier > 0 ? bp.tiers[currentTier - 1]?.xpRequired ?? 0 : 0;
  const nextTierXP = currentTier >= 0 ? bp.tiers[currentTier]?.xpRequired ?? bp.xp : bp.tiers[bp.tiers.length - 1]?.xpRequired ?? 0;
  const progressPct = nextTierXP > prevTierXP
    ? Math.round(((bp.xp - prevTierXP) / (nextTierXP - prevTierXP)) * 100)
    : 100;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.seasonName}>{bp.seasonName}</Text>
          <Text style={styles.seasonSub}>Season 1 · 50 Tiers</Text>
        </View>

        {/* XP + Tier */}
        <View style={styles.xpCard}>
          <View style={styles.xpRow}>
            <View>
              <Text style={styles.xpLabel}>XP Hiện Tại</Text>
              <Text style={styles.xpValue}>{bp.xp.toLocaleString()}</Text>
            </View>
            <View style={styles.tierBadge}>
              <Text style={styles.tierLabel}>Tier</Text>
              <Text style={styles.tierValue}>{bp.tier}</Text>
            </View>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(100, progressPct)}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentTier >= 0
              ? `Tier ${currentTier + 1} tại ${nextTierXP} XP`
              : "MAX TIER!"}
          </Text>

          {!bp.purchased && (
            <TouchableOpacity style={styles.buyBtn} onPress={handlePurchase}>
              <Text style={styles.buyBtnText}>Mua Battle Pass — 49.000đ</Text>
            </TouchableOpacity>
          )}
          {bp.purchased && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>⭐ Battle Pass Premium</Text>
            </View>
          )}
        </View>

        {/* Tiers */}
        <View style={styles.tiersGrid}>
          {bp.tiers.map((tier) => (
            <TouchableOpacity
              key={tier.tier}
              style={[
                styles.tierCard,
                tier.claimed && styles.tierClaimed,
                tier.isPremium && !tier.claimed && styles.tierPremium,
              ]}
              onPress={() => !tier.claimed && tier.unlocked && handleClaim(tier.tier)}
              disabled={!tier.unlocked || tier.claimed || claiming !== null}
            >
              {tier.isPremium && (
                <View style={styles.premiumTag}>
                  <Text style={styles.premiumTagText}>⭐</Text>
                </View>
              )}
              <Text style={styles.tierNum}>#{tier.tier}</Text>
              {tier.claimed ? (
                <Text style={styles.tierCheck}>✓</Text>
              ) : tier.unlocked ? (
                <Text style={styles.tierCoins}>
                  💰 {tier.reward.coins?.toLocaleString() ?? "—"}
                </Text>
              ) : (
                <Text style={styles.tierLocked}>🔒</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A1E" },
  loading: { flex: 1, backgroundColor: "#0A0A1E", justifyContent: "center", alignItems: "center" },
  empty: { flex: 1, backgroundColor: "#0A0A1E", justifyContent: "center", alignItems: "center" },
  emptyEmoji: { fontSize: 64, marginBottom: 12 },
  emptyText: { fontSize: 18, color: "#888" },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: { padding: 20, paddingTop: 60, alignItems: "center" },
  seasonName: { fontSize: 24, fontWeight: "bold", color: "#FFD700" },
  seasonSub: { fontSize: 14, color: "#888", marginTop: 4 },
  xpCard: {
    marginHorizontal: 16,
    backgroundColor: "#1a1a3e",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#FFD70044",
    marginBottom: 20,
  },
  xpRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  xpLabel: { fontSize: 12, color: "#888" },
  xpValue: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  tierBadge: { alignItems: "center", backgroundColor: "#FFD70022", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 },
  tierLabel: { fontSize: 12, color: "#FFD700" },
  tierValue: { fontSize: 24, fontWeight: "bold", color: "#FFD700" },
  progressBar: { height: 8, backgroundColor: "#2a2a5e", borderRadius: 4, overflow: "hidden", marginBottom: 8 },
  progressFill: { height: "100%", backgroundColor: "#FFD700", borderRadius: 4 },
  progressText: { fontSize: 12, color: "#888", textAlign: "center" },
  buyBtn: { marginTop: 16, backgroundColor: "#FFD700", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  buyBtnText: { color: "#0A0A1E", fontWeight: "bold", fontSize: 16 },
  premiumBadge: { marginTop: 12, backgroundColor: "#FFD70022", borderRadius: 10, paddingVertical: 8, alignItems: "center" },
  premiumText: { color: "#FFD700", fontWeight: "bold", fontSize: 14 },
  tiersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 8,
  },
  tierCard: {
    width: "18%",
    aspectRatio: 1,
    backgroundColor: "#1a1a3e",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2a2a5e",
  },
  tierClaimed: { backgroundColor: "#1a3a1e", borderColor: "#00D4AA" },
  tierPremium: { borderColor: "#FFD700", borderWidth: 2 },
  premiumTag: { position: "absolute", top: 2, right: 2 },
  premiumTagText: { fontSize: 10 },
  tierNum: { fontSize: 11, color: "#666", fontWeight: "bold" },
  tierCoins: { fontSize: 12, color: "#FFD700", fontWeight: "bold", marginTop: 2 },
  tierLocked: { fontSize: 14, marginTop: 2 },
  tierCheck: { fontSize: 16, color: "#00D4AA", fontWeight: "bold" },
});
