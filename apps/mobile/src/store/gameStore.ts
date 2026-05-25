// apps/mobile/src/store/gameStore.ts

import { create } from "zustand";
import { router } from "expo-router";
import { api } from "../api/client";

interface RoomPlayer {
  id: string;
  playerId?: string;
  displayName: string;
  level: number;
  profession: string;
  orderIndex: number;
  hp: number;
  money: number;
  energy: number;
  maxEnergy: number;
  isReady: boolean;
  isConnected: boolean;
  handCount: number;
  lockedCardId?: string;
}

interface Room {
  id: string;
  hostId: string;
  inviteCode: string;
  name: string;
  status: string;
  storeType?: string;
  maxPlayers: number;
  currentRound: number;
  maxRounds: number;
  players: RoomPlayer[];
}

interface GameStore {
  rooms: Room[];
  currentRoom: Room | null;
  isCreating: boolean;
  isSearching: boolean;
  queuePosition: number;

  fetchRooms: () => Promise<void>;
  createRoom: (dto: { name?: string; maxPlayers?: number; isPrivate?: boolean }) => Promise<Room | null>;
  createSoloPractice: (dto?: { name?: string; botCount?: number; maxRounds?: number }) => Promise<Room | null>;
  joinRoom: (roomId: string) => Promise<Room | null>;
  leaveRoom: (roomId: string) => Promise<void>;
  getRoom: (roomId: string) => Promise<Room | null>;
  joinMatchmaking: () => Promise<void>;
  leaveMatchmaking: () => Promise<void>;
  pollMatchmaking: () => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  rooms: [],
  currentRoom: null,
  isCreating: false,
  isSearching: false,
  queuePosition: -1,

  fetchRooms: async () => {
    try {
      const data = await api.get<{ rooms: Room[] }>("/game/rooms");
      set({ rooms: data.rooms });
    } catch {}
  },

  createRoom: async (dto) => {
    set({ isCreating: true });
    try {
      const room = await api.post<Room>("/game/rooms", dto);
      set((s) => ({ rooms: [room, ...s.rooms], currentRoom: room }));
      return room;
    } catch {
      return null;
    } finally {
      set({ isCreating: false });
    }
  },

  createSoloPractice: async (dto) => {
    set({ isCreating: true });
    try {
      const room = await api.post<Room>("/game/solo", dto ?? {});
      set({ currentRoom: room });
      return room;
    } catch {
      return null;
    } finally {
      set({ isCreating: false });
    }
  },

  joinRoom: async (roomId) => {
    try {
      const room = await api.post<Room>(`/game/rooms/${roomId}/join`);
      set((s) => ({
        currentRoom: room,
        rooms: s.rooms.map((r) => (r.id === roomId ? room : r)),
      }));
      return room;
    } catch {
      return null;
    }
  },

  leaveRoom: async (roomId) => {
    try {
      await api.delete(`/game/rooms/${roomId}/leave`);
      set((s) => ({
        currentRoom: null,
        rooms: s.rooms.filter((r) => r.id !== roomId),
      }));
    } catch {}
  },

  getRoom: async (roomId) => {
    try {
      const room = await api.get<Room>(`/game/rooms/${roomId}`);
      set({ currentRoom: room });
      return room;
    } catch {
      return null;
    }
  },

  joinMatchmaking: async () => {
    set({ isSearching: true, queuePosition: -1 });
    try {
      const result = await api.post<{ status: string; roomId?: string }>("/game/matchmaking/join");
      if (result.status === "matched" && result.roomId) {
        set({ isSearching: false });
        router.push(`/lobby/${result.roomId}`);
      }
    } catch {
      set({ isSearching: false });
    }
  },

  leaveMatchmaking: async () => {
    try {
      await api.delete("/game/matchmaking/leave");
    } catch {}
    set({ isSearching: false, queuePosition: -1 });
  },

  pollMatchmaking: async () => {
    if (!get().isSearching) return;
    try {
      const result = await api.get<{ status: string; roomId?: string; position?: number }>("/game/matchmaking/status");
      if (result.status === "matched" && result.roomId) {
        set({ isSearching: false });
        router.push(`/lobby/${result.roomId}`);
      } else if (result.position !== undefined) {
        set({ queuePosition: result.position });
      }
    } catch {}
  },
}));
