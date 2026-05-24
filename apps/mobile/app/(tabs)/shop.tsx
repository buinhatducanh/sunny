// apps/mobile/app/(tabs)/shop.tsx

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { api } from "../../src/api/client";
import { useAuthStore } from "../../src/store/authStore";

interface ShopPack {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: "coins" | "gems";
  cardCount: number;
  guaranteedRarity?: string;
}

interface PackCard {
  id: string;
  cardKey: string;
  name: string;
  rarity: string;
  description: string;
}

const RARITY_COLORS: Record<string, string> = {
  COMMON: "#AAAAAA",
  UNCOMMON: "#4ADE80",
  RARE: "#3B82F6",
  EPIC: "#8B5CF6",
  LEGENDARY: "#F59E0B",
};

const RARITY_ICONS: Record<string, string> = {
  COMMON: "⚪",
  UNCOMMON: "🟢",
  RARE: "🔵",
  EPIC: "🟣",
  LEGENDARY: "🟡",
};

export default function ShopScreen() {
  const { user } = useAuthStore();
  const [packs, setPacks] = useState<ShopPack[]>([]);
  const [opening, setOpening] = useState(false);
  const [lastResult, setLastResult] = useState<PackCard[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPacks();
  }, []);

  async function fetchPacks() {
    try {
      const data = await api.get<ShopPack[]>("/shop/packs");
      setPacks(data);
    } catch {
      Alert.alert("Lỗi", "Không tể tải cửa hàng");
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await fetchPacks();
    setRefreshing(false);
  }

  async function buyPack(pack: ShopPack) {
    setOpening(true);
    try {
      const result = await api.post<{ cards: PackCard[] }>(`/shop/buy/${pack.id}`);
      setLastResult(result.cards);

      // Refresh user coins
      await useAuthStore.getState().fetchMe?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi";
      Alert.alert("Lỗi", msg);
    } finally {
      setOpening(false);
    }
  }

  function getPriceDisplay(pack: ShopPack) {
    if (pack.currency === "gems") {
      return `💎 ${pack.price}`;
    }
    return `💰 ${pack.price.toLocaleString()}`;
  }

  function canAfford(pack: ShopPack): boolean {
    if (pack.currency === "gems") return (user?.player?.gems ?? 0) >= pack.price;
    return (user?.player?.coins ?? 0) >= pack.price;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Cửa hàng</Text>
        <View style={styles.currency}>
          <Text style={styles.coins}>💰 {(user?.player?.coins ?? 0).toLocaleString()}</Text>
          <Text style={styles.gems}>💎 {user?.player?.gems ?? 0}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C63FF" />}
      >
        {/* Last opened */}
        {lastResult && (
          <View style={styles.lastOpen}>
            <Text style={styles.lastTitle}>🎉 Vừa mở</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {lastResult.map((card) => (
                <View
                  key={card.cardKey}
                  style={[styles.cardReveal, { borderColor: RARITY_COLORS[card.rarity] ?? "#666" }]}
                >
                  <Text style={styles.cardRevealIcon}>
                    {RARITY_ICONS[card.rarity] ?? "🃏"}
                  </Text>
                  <Text style={[styles.cardRevealName, { color: RARITY_COLORS[card.rarity] ?? "#fff" }]}>
                    {card.name}
                  </Text>
                  <Text style={styles.cardRevealRarity}>{card.rarity}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Packs */}
        <Text style={styles.sectionTitle}>Gói thẻ bài</Text>
        {packs.map((pack) => {
          const affordable = canAfford(pack);
          return (
            <TouchableOpacity
              key={pack.id}
              style={[styles.packCard, !affordable && styles.packCardDisabled]}
              onPress={() => {
                Alert.alert(
                  "Xác nhận",
                  `Mua ${pack.name} với giá ${getPriceDisplay(pack)}?`,
                  [
                    { text: "Hủy", style: "cancel" },
                    { text: "Mua", onPress: () => buyPack(pack) },
                  ],
                );
              }}
              disabled={!affordable || opening}
            >
              <View style={styles.packIconArea}>
                <Text style={styles.packIcon}>📦</Text>
              </View>
              <View style={styles.packInfo}>
                <Text style={styles.packName}>{pack.name}</Text>
                <Text style={styles.packDesc}>{pack.description}</Text>
                {pack.guaranteedRarity && (
                  <Text style={styles.packGuarantee}>
                    Bảo đảm {pack.guaranteedRarity}
                  </Text>
                )}
              </View>
              <View style={[styles.packPrice, affordable ? styles.packPriceAffordable : styles.packPriceDisabled]}>
                <Text style={[styles.packPriceText, affordable ? {} : { color: "#888" }]}>
                  {getPriceDisplay(pack)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Gem shop info */}
        <View style={styles.gemInfo}>
          <Text style={styles.gemInfoTitle}>💎 Mua Gems</Text>
          <Text style={styles.gemInfoText}>Liên hệ admin để mua Gems — hỗ trợ: admin@loopsolutions.vn</Text>
        </View>

        <View style={{ height: 100 }} />
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  currency: { flexDirection: "row", gap: 12 },
  coins: { fontSize: 14, color: "#FFD700" },
  gems: { fontSize: 14, color: "#60A5FA" },
  content: { flex: 1, paddingHorizontal: 16 },
  lastOpen: { backgroundColor: "#1a1a3e", borderRadius: 16, padding: 16, marginBottom: 20 },
  lastTitle: { fontSize: 16, fontWeight: "bold", color: "#FFD700", marginBottom: 12 },
  cardReveal: {
    width: 90,
    marginRight: 12,
    backgroundColor: "#0F0F2E",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 2,
  },
  cardRevealIcon: { fontSize: 28, marginBottom: 6 },
  cardRevealName: { fontSize: 11, fontWeight: "bold", textAlign: "center" },
  cardRevealRarity: { fontSize: 10, color: "#888", marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 12 },
  packCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a3e",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2a2a5e",
  },
  packCardDisabled: { opacity: 0.5 },
  packIconArea: { width: 56, height: 56, backgroundColor: "#0F0F2E", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  packIcon: { fontSize: 28 },
  packInfo: { flex: 1, marginLeft: 12 },
  packName: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  packDesc: { fontSize: 12, color: "#888", marginTop: 2 },
  packGuarantee: { fontSize: 11, color: "#6C63FF", marginTop: 4 },
  packPrice: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  packPriceAffordable: { backgroundColor: "#FFD70022" },
  packPriceDisabled: { backgroundColor: "#2a2a5e" },
  packPriceText: { fontSize: 14, fontWeight: "bold", color: "#FFD700" },
  gemInfo: { backgroundColor: "#1a1a3e", borderRadius: 16, padding: 16, marginTop: 8, borderWidth: 1, borderColor: "#2a2a5e" },
  gemInfoTitle: { fontSize: 16, fontWeight: "bold", color: "#60A5FA", marginBottom: 8 },
  gemInfoText: { fontSize: 13, color: "#888", lineHeight: 20 },
});
