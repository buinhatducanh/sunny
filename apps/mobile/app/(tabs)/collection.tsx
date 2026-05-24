// apps/mobile/app/(tabs)/collection.tsx

import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { api } from "../../src/api/client";
import type { Rarity } from "@sunny-game/types/card.types";

const RARITY_COLORS: Record<Rarity | "ALL", string> = {
  ALL: "#6C63FF",
  COMMON: "#888",
  RARE: "#3B82F6",
  EPIC: "#8B5CF6",
  LEGENDARY: "#F59E0B",
};

const RARITY_ORDER = ["ALL", "COMMON", "RARE", "EPIC", "LEGENDARY"] as const;
type FilterType = (typeof RARITY_ORDER)[number];

const STORE_FILTERS = ["ALL", "CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"] as const;
type SortOption = "name" | "rarity" | "owned";

const RARITY_RANK: Record<Rarity, number> = {
  COMMON: 0, RARE: 1, EPIC: 2, LEGENDARY: 3,
};

interface CollectionCard {
  id: string;
  cardKey: string;
  name: string;
  emoji: string;
  rarity: Rarity;
  storeType: string;
  isOwned: boolean;
  description: string;
  count: number;
}

export default function CollectionScreen() {
  const [rarityFilter, setRarityFilter] = useState<FilterType>("ALL");
  const [storeFilter, setStoreFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [cards, setCards] = useState<CollectionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownedCount, setOwnedCount] = useState(0);

  useEffect(() => {
    fetchCards();
  }, []);

  async function fetchCards() {
    setLoading(true);
    try {
      const data = await api.get<{ cards: CollectionCard[]; total: number }>("/cards");
      setCards(data.cards);
      setOwnedCount(data.total);
    } catch {
      setCards([]);
    }
    setLoading(false);
  }

  const filtered = cards
    .filter((c) => rarityFilter === "ALL" || c.rarity === rarityFilter)
    .filter((c) => storeFilter === "ALL" || c.storeType === storeFilter)
    .filter((c) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "rarity") return RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity];
      if (sortBy === "owned") return (b.isOwned ? 1 : 0) - (a.isOwned ? 1 : 0);
      return 0;
    });

  const renderCard = useCallback(
    ({ item }: { item: CollectionCard }) => (
      <View
        style={[
          styles.card,
          { borderColor: RARITY_COLORS[item.rarity] },
          !item.isOwned && styles.cardLocked,
        ]}
      >
        <Text style={styles.cardEmoji}>{item.emoji}</Text>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={[styles.cardRarity, { color: RARITY_COLORS[item.rarity] }]}>
          {item.rarity}
        </Text>
        <Text style={styles.cardStore}>{item.storeType}</Text>
        {item.isOwned && item.count > 1 && (
          <Text style={styles.cardCount}>x{item.count}</Text>
        )}
        {!item.isOwned && (
          <View style={styles.lockedOverlay}>
            <Text style={styles.lockedText}>🔒</Text>
          </View>
        )}
      </View>
    ),
    [],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Bộ sưu tập</Text>
          <Text style={styles.count}>
            {ownedCount} / {cards.length} thẻ đang sở hữu
          </Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm thẻ..."
          placeholderTextColor="#555"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sort options */}
      <View style={styles.sortRow}>
        {(["name", "rarity", "owned"] as SortOption[]).map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.sortBtn, sortBy === opt && styles.sortBtnActive]}
            onPress={() => setSortBy(opt)}
          >
            <Text style={[styles.sortBtnText, sortBy === opt && styles.sortBtnTextActive]}>
              {opt === "name" ? "🔤 Tên" : opt === "rarity" ? "⭐ Hiếm" : "✓ Sở hữu"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Rarity filter */}
      <FlatList
        horizontal
        data={RARITY_ORDER}
        keyExtractor={(f) => f}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[
              styles.filterBtn,
              rarityFilter === f && {
                backgroundColor: RARITY_COLORS[f],
                borderColor: RARITY_COLORS[f],
              },
            ]}
            onPress={() => setRarityFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                rarityFilter === f && styles.filterTextActive,
              ]}
            >
              {f === "ALL" ? "Tất cả" : f}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Store type filter */}
      <FlatList
        horizontal
        data={STORE_FILTERS}
        keyExtractor={(f) => f}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[
              styles.filterBtn,
              styles.filterBtnSmall,
              storeFilter === f && styles.filterBtnSmallActive,
            ]}
            onPress={() => setStoreFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                styles.filterTextSmall,
                storeFilter === f && styles.filterTextActive,
              ]}
            >
              {f === "ALL" ? "Mọi cửa hàng" : f.replace("_", " ")}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🃏</Text>
          <Text style={styles.emptyText}>Không có thẻ nào</Text>
          <Text style={styles.emptySub}>
            {search ? "Thử từ khóa khác" : "Mở gói thẻ hoặc hoàn thành quest để nhận thẻ mới"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          numColumns={2}
          renderItem={renderCard}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  count: { fontSize: 13, color: "#888", marginTop: 2 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#1a1a3e",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, color: "#fff", fontSize: 14, paddingVertical: 10 },
  clearBtn: { padding: 4 },
  clearBtnText: { color: "#666", fontSize: 14 },
  sortRow: { flexDirection: "row", paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  sortBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: "#1a1a3e",
    borderWidth: 1,
    borderColor: "#2a2a5e",
  },
  sortBtnActive: { borderColor: "#6C63FF", backgroundColor: "#1a1a4e" },
  sortBtnText: { color: "#888", fontSize: 12 },
  sortBtnTextActive: { color: "#6C63FF", fontWeight: "bold" },
  filters: {
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#1a1a3e",
    borderWidth: 1,
    borderColor: "#2a2a5e",
    marginRight: 8,
  },
  filterText: { color: "#888", fontSize: 13 },
  filterTextActive: { color: "#fff", fontWeight: "bold" },
  filterBtnSmall: { paddingHorizontal: 10, paddingVertical: 4 },
  filterBtnSmallActive: { backgroundColor: "#00D4AA", borderColor: "#00D4AA" },
  filterTextSmall: { fontSize: 11 },
  gridContent: { padding: 12 },
  gridRow: { justifyContent: "space-between" },
  card: {
    width: "48%",
    backgroundColor: "#1a1a3e",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    alignItems: "center",
    marginBottom: 12,
    position: "relative",
  },
  cardLocked: { opacity: 0.5 },
  cardEmoji: { fontSize: 40, marginBottom: 8 },
  cardName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },
  cardRarity: { fontSize: 12, fontWeight: "bold", marginBottom: 2 },
  cardStore: { fontSize: 11, color: "#666" },
  cardCount: { fontSize: 11, color: "#00D4AA", marginTop: 2 },
  lockedOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  lockedText: { fontSize: 14 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  emptySub: { fontSize: 14, color: "#888", textAlign: "center" },
});
