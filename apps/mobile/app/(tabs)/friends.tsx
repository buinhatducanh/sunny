// apps/mobile/app/(tabs)/friends.tsx

import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from "react-native";
import { api } from "../../src/api/client";
import { useAuthStore } from "../../src/store/authStore";

interface Friend {
  friendId: string;
  displayName: string;
  avatarUrl: string | null;
  level: number;
  since: string;
}

interface FriendRequest {
  requestId: string;
  senderId: string;
  receiverId: string;
  displayName: string;
  avatarUrl: string | null;
  level: number;
  sentAt: string;
}

interface SearchResult {
  userId: string;
  playerId: string;
  displayName: string;
  level: number;
  username: string;
}

type Tab = "friends" | "requests";

export default function FriendsScreen() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>("friends");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequest[]>([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [friendsRes, incomingRes, outgoingRes] = await Promise.all([
        api.get<Friend[]>("/friends"),
        api.get<FriendRequest[]>("/friends/requests/incoming"),
        api.get<FriendRequest[]>("/friends/requests/outgoing"),
      ]);
      setFriends(friendsRes);
      setIncoming(incomingRes);
      setOutgoing(outgoingRes);
    } catch {
      // not logged in or no data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function onRefresh() {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }

  async function handleSearch(q: string) {
    setSearch(q);
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await api.get<SearchResult[]>(`/friends/search?q=${encodeURIComponent(q.trim())}`);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    }
    setSearching(false);
  }

  async function handleSendRequest(targetUserId: string) {
    try {
      await api.post(`/friends/request/${targetUserId}`);
      Alert.alert("Thành công", "Đã gửi lời mời kết bạn!");
      setSearch("");
      setSearchResults([]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi";
      Alert.alert("Lỗi", msg);
    }
  }

  async function handleAccept(requestId: string) {
    try {
      await api.post(`/friends/accept/${requestId}`);
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi";
      Alert.alert("Lỗi", msg);
    }
  }

  async function handleReject(requestId: string) {
    try {
      await api.post(`/friends/reject/${requestId}`);
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi";
      Alert.alert("Lỗi", msg);
    }
  }

  async function handleRemove(friendId: string) {
    Alert.alert("Xóa bạn", "Bạn chắc chắn muốn xóa người này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/friends/${friendId}`);
            await fetchData();
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Lỗi";
            Alert.alert("Lỗi", msg);
          }
        },
      },
    ]);
  }

  function renderFriend({ item }: { item: Friend }) {
    return (
      <View style={styles.friendCard}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{item.displayName[0]?.toUpperCase()}</Text>
        </View>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.displayName}</Text>
          <Text style={styles.friendLevel}>Lv.{item.level}</Text>
        </View>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => handleRemove(item.friendId)}
        >
          <Text style={styles.removeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderRequest({ item }: { item: FriendRequest }) {
    return (
      <View style={styles.requestCard}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{item.displayName[0]?.toUpperCase()}</Text>
        </View>
        <View style={styles.requestInfo}>
          <Text style={styles.friendName}>{item.displayName}</Text>
          <Text style={styles.friendLevel}>Lv.{item.level}</Text>
        </View>
        {tab === "requests" && (
          <View style={styles.requestActions}>
            <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item.requestId)}>
              <Text style={styles.acceptBtnText}>✓</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item.requestId)}>
              <Text style={styles.rejectBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  function renderSearchResult({ item }: { item: SearchResult }) {
    return (
      <View style={styles.requestCard}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{item.displayName[0]?.toUpperCase()}</Text>
        </View>
        <View style={styles.requestInfo}>
          <Text style={styles.friendName}>{item.displayName}</Text>
          <Text style={styles.friendLevel}>@{item.username} · Lv.{item.level}</Text>
        </View>
        <TouchableOpacity style={styles.acceptBtn} onPress={() => handleSendRequest(item.userId)}>
          <Text style={styles.acceptBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const incomingCount = incoming.length;
  const requestList = [...incoming, ...outgoing];

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loading} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bạn bè</Text>
        <TouchableOpacity
          style={styles.inviteBtn}
          onPress={() => Alert.alert("Mời bạn", "Chia sẻ link game với bạn bè để mời chơi!")}
        >
          <Text style={styles.inviteBtnText}>+ Mời bạn</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === "friends" && styles.tabActive]}
          onPress={() => setTab("friends")}
        >
          <Text style={[styles.tabText, tab === "friends" && styles.tabTextActive]}>
            Bạn bè ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "requests" && styles.tabActive]}
          onPress={() => setTab("requests")}
        >
          <Text style={[styles.tabText, tab === "requests" && styles.tabTextActive]}>
            Lời mời {incomingCount > 0 ? `(${incomingCount})` : ""}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder={tab === "friends" ? "Tìm bạn bè..." : "Tìm người chơi để kết bạn..."}
          placeholderTextColor="#666"
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.userId}
          renderItem={renderSearchResult}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Text style={styles.searchHeader}>Kết quả tìm kiếm</Text>
          }
        />
      )}

      {/* List */}
      {searchResults.length === 0 && (
        tab === "friends" ? (
          <FlatList
            data={friends.filter((f) => f.displayName.toLowerCase().includes(search.toLowerCase()))}
            keyExtractor={(item) => item.friendId}
            renderItem={renderFriend}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C63FF" />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Chưa có bạn bè</Text>
                <Text style={styles.emptySub}>Tìm người chơi để kết bạn!</Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={requestList}
            keyExtractor={(item) => ("requestId" in item ? item.requestId : "none")}
            renderItem={renderRequest}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C63FF" />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Không có lời mời nào</Text>
              </View>
            }
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A1E" },
  loading: { flex: 1, backgroundColor: "#0A0A1E" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  inviteBtn: {
    backgroundColor: "#6C63FF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  inviteBtnText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  tabActive: { backgroundColor: "#1a1a3e" },
  tabText: { color: "#666", fontSize: 14 },
  tabTextActive: { color: "#6C63FF", fontWeight: "bold" },
  searchRow: { paddingHorizontal: 16, paddingVertical: 8 },
  searchInput: {
    backgroundColor: "#1a1a3e",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 14,
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a3e",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2a2a5e",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "bold", color: "#6C63FF" },
  friendInfo: { flex: 1, marginLeft: 12 },
  friendName: { fontSize: 15, fontWeight: "bold", color: "#fff" },
  friendLevel: { fontSize: 12, color: "#888", marginTop: 2 },
  requestCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a3e",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2a2a5e",
  },
  requestInfo: { flex: 1, marginLeft: 12 },
  requestActions: { flexDirection: "row", gap: 8 },
  acceptBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#00D4AA22",
    alignItems: "center",
    justifyContent: "center",
  },
  acceptBtnText: { color: "#00D4AA", fontSize: 18, fontWeight: "bold" },
  rejectBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FF475722",
    alignItems: "center",
    justifyContent: "center",
  },
  rejectBtnText: { color: "#FF4757", fontSize: 16, fontWeight: "bold" },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF475722",
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtnText: { color: "#FF4757", fontSize: 14 },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyText: { fontSize: 18, color: "#888" },
  emptySub: { fontSize: 14, color: "#666", marginTop: 8 },
  searchHeader: { fontSize: 12, color: "#888", marginBottom: 8, marginTop: 8 },
});
