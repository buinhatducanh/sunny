// apps/mobile/app/(tabs)/leaderboard.tsx

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { api } from "../../src/api/client";
import { useAuthStore } from "../../src/store/authStore";

interface Entry {
  rank: number;
  playerId: string;
  displayName: string;
  level: number;
  gamesPlayed: number;
  gamesWon: number;
  totalXP: number;
  winRate: number;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Text style={styles.gold}>🥇</Text>;
  if (rank === 2) return <Text style={styles.silver}>🥈</Text>;
  if (rank === 3) return <Text style={styles.bronze}>🥉</Text>;
  return <Text style={styles.rankText}>{rank}</Text>;
}

export default function LeaderboardScreen() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    try {
      const [board, rankData] = await Promise.all([
        api.get<Entry[]>("/leaderboard?limit=100"),
        api.get<{ rank: number }>("/leaderboard/rank").catch(() => ({ rank: -1 })),
      ]);
      setEntries(board);
      setMyRank(rankData.rank > 0 ? rankData.rank : null);
    } catch {
      setEntries([]);
    }
    setLoading(false);
    setRefreshing(false);
  }

  function onRefresh() {
    setRefreshing(true);
    fetchLeaderboard();
  }

  const renderEntry = ({ item }: { item: Entry }) => {
    const isMe = item.playerId === user?.playerId;
    return (
      <View style={[styles.entry, isMe && styles.entryMe]}>
        <View style={styles.rankCol}>
          <RankBadge rank={item.rank} />
        </View>
        <View style={styles.nameCol}>
          <Text style={[styles.name, isMe && styles.nameMe]}>
            {item.displayName}
            {isMe ? " (Bạn)" : ""}
          </Text>
          <Text style={styles.level}>Lv.{item.level} · {item.gamesPlayed} ván</Text>
        </View>
        <View style={styles.statsCol}>
          <Text style={styles.winRate}>{item.winRate}%</Text>
          <Text style={styles.winLabel}>thắng</Text>
        </View>
        <View style={styles.statsCol}>
          <Text style={styles.wins}>{item.gamesWon}W</Text>
          <Text style={styles.winLabel}>thắng</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bảng Xếp Hạng</Text>
        <Text style={styles.subtitle}>Tuần này</Text>
        {myRank !== null && myRank > 0 && (
          <View style={styles.myRankBadge}>
            <Text style={styles.myRankText}>Hạng của bạn: #{myRank}</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.playerId}
          renderItem={renderEntry}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6C63FF"
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📊</Text>
              <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
              <Text style={styles.emptySub}>Hoàn thành ván đấu để xuất hiện trên bảng xếp hạng</Text>
            </View>
          }
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
  myRankBadge: {
    marginTop: 12,
    backgroundColor: "#1a1a4e",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#6C63FF",
  },
  myRankText: { color: "#6C63FF", fontWeight: "bold", fontSize: 14 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  entry: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a3e",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  entryMe: { borderWidth: 2, borderColor: "#6C63FF", backgroundColor: "#1a1a5e" },
  rankCol: { width: 44, alignItems: "center" },
  gold: { fontSize: 28 },
  silver: { fontSize: 28 },
  bronze: { fontSize: 28 },
  rankText: { fontSize: 16, color: "#888", fontWeight: "bold" },
  nameCol: { flex: 1, marginLeft: 8 },
  name: { fontSize: 15, fontWeight: "bold", color: "#fff" },
  nameMe: { color: "#6C63FF" },
  level: { fontSize: 12, color: "#888", marginTop: 2 },
  statsCol: { alignItems: "center", marginLeft: 16 },
  winRate: { fontSize: 16, fontWeight: "bold", color: "#FFD700" },
  wins: { fontSize: 14, fontWeight: "bold", color: "#00D4AA" },
  winLabel: { fontSize: 10, color: "#888", marginTop: 1 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyEmoji: { fontSize: 64, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  emptySub: { fontSize: 14, color: "#888", textAlign: "center", marginTop: 8, paddingHorizontal: 32 },
});
