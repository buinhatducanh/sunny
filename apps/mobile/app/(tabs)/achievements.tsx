// apps/mobile/app/(tabs)/achievements.tsx

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SectionList,
} from "react-native";
import { api } from "../../src/api/client";

const CATEGORY_ORDER = ["PLAY", "ECONOMY", "SOCIAL", "COLLECTION", "SEASON"];
const CATEGORY_LABELS: Record<string, string> = {
  PLAY: "🎮 Chơi Game",
  ECONOMY: "💰 Kinh Tế",
  SOCIAL: "🤝 Xã Hội",
  COLLECTION: "🃏 Sưu Tập",
  SEASON: "🏺 Mùa Giải",
};

const RARITY_COLORS: Record<string, string> = {
  PLAY: "#6C63FF",
  ECONOMY: "#FFD700",
  SOCIAL: "#00D4AA",
  COLLECTION: "#E91E63",
  SEASON: "#8B5CF6",
};

interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  progress: number;
  target: number;
  completed: boolean;
  unlockedAt: string | null;
  reward: { xp?: number; coins?: number; cardPack?: string };
}

export default function AchievementsScreen() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
    fetchAchievements();
  }, []);

  async function fetchAchievements() {
    setLoading(true);
    try {
      const data = await api.get<Achievement[]>("/achievements");
      setAchievements(data);
    } catch {
      setAchievements([]);
    }
    setLoading(false);
  }

  const filtered = selectedCategory === "ALL"
    ? achievements
    : achievements.filter((a) => a.category === selectedCategory);

  const sections = CATEGORY_ORDER.filter((cat) =>
    achievements.some((a) => a.category === cat),
  ).map((cat) => ({
    title: cat,
    data: filtered.filter((a) => a.category === cat),
  }));

  const completedCount = achievements.filter((a) => a.completed).length;

  const renderAchievement = ({ item }: { item: Achievement }) => {
    const pct = Math.min(100, Math.round((item.progress / item.target) * 100));
    const rewardParts = [];
    if (item.reward.xp) rewardParts.push(`+${item.reward.xp} XP`);
    if (item.reward.coins) rewardParts.push(`+${item.reward.coins}`);
    if (item.reward.cardPack) rewardParts.push(`${item.reward.cardPack} Pack`);

    return (
      <View style={[styles.card, item.completed && styles.cardCompleted]}>
        <View style={styles.cardLeft}>
          <Text style={[styles.icon, item.completed && styles.iconCompleted]}>
            {item.icon}
          </Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, item.completed && styles.titleCompleted]}>
            {item.title}
          </Text>
          <Text style={styles.desc}>{item.description}</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${pct}%` },
                  { backgroundColor: item.completed ? "#00D4AA" : RARITY_COLORS[item.category] ?? "#6C63FF" },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {item.completed ? "✓" : `${item.progress}/${item.target}`}
            </Text>
          </View>
          {rewardParts.length > 0 && (
            <Text style={styles.reward}>
              Phần thưởng: {rewardParts.join(", ")}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Thành Tựu</Text>
        <Text style={styles.subtitle}>
          {completedCount} / {achievements.length} đã hoàn thành
        </Text>
      </View>

      {/* Category filters */}
      <FlatList
        horizontal
        data={["ALL", ...CATEGORY_ORDER]}
        keyExtractor={(f) => f}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[
              styles.filterBtn,
              selectedCategory === f && styles.filterBtnActive,
            ]}
            onPress={() => setSelectedCategory(f)}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === f && styles.filterTextActive,
              ]}
            >
              {f === "ALL" ? "Tất cả" : CATEGORY_LABELS[f] ?? f}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🏆</Text>
          <Text style={styles.emptyText}>Chưa có thành tựu nào</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderAchievement}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: RARITY_COLORS[section.title] ?? "#6C63FF" },
                ]}
              >
                {CATEGORY_LABELS[section.title] ?? section.title}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A1E" },
  header: { padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 13, color: "#888", marginTop: 4 },
  filters: { paddingHorizontal: 16, marginBottom: 12, gap: 8 },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#1a1a3e",
    borderWidth: 1,
    borderColor: "#2a2a5e",
    marginRight: 8,
  },
  filterBtnActive: { borderColor: "#6C63FF", backgroundColor: "#1a1a4e" },
  filterText: { color: "#888", fontSize: 13 },
  filterTextActive: { color: "#6C63FF", fontWeight: "bold" },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  sectionHeader: { paddingVertical: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "bold" },
  card: {
    flexDirection: "row",
    backgroundColor: "#1a1a3e",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardCompleted: { borderWidth: 1, borderColor: "#00D4AA" },
  cardLeft: { marginRight: 12 },
  icon: { fontSize: 36 },
  iconCompleted: { opacity: 1 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "bold", color: "#fff", marginBottom: 2 },
  titleCompleted: { color: "#00D4AA" },
  desc: { fontSize: 12, color: "#888", marginBottom: 8 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#2a2a5e",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  progressText: { fontSize: 11, color: "#888", width: 40, textAlign: "right" },
  reward: { fontSize: 11, color: "#FFD700", marginTop: 4 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyEmoji: { fontSize: 64, marginBottom: 12 },
  emptyText: { fontSize: 16, color: "#888" },
});
