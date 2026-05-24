// apps/mobile/src/store/lobbyStore.ts

import { create } from "zustand";
import { api } from "../api/client";
import * as Clipboard from "expo-clipboard";

interface LobbyPlayer {
  id?: string;
  playerId?: string;
  displayName: string;
  level: number;
  profession: string;
  isReady: boolean;
  handCount: number;
}

interface LobbyRoom {
  id: string;
  hostId: string;
  inviteCode: string;
  name: string;
  status: string;
  maxPlayers: number;
  players: LobbyPlayer[];
}

interface LobbyStore {
  room: LobbyRoom | null;
  isHost: boolean;
  isReady: boolean;
  loading: boolean;

  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
  startGame: (roomId: string) => Promise<boolean>;
  toggleReady: () => Promise<void>;
  copyInviteCode: () => Promise<void>;
  pollRoom: (roomId: string) => Promise<void>;
}

export const useLobbyStore = create<LobbyStore>((set, get) => ({
  room: null,
  isHost: false,
  isReady: false,
  loading: true,

  joinRoom: async (roomId) => {
    set({ loading: true });
    try {
      const room = await api.post<LobbyRoom>(`/game/rooms/${roomId}/join`);
      set({ room, loading: false });
    } catch (e) {
      set({ loading: false });
      console.error("Failed to join room:", e);
    }
  },

  leaveRoom: async (roomId: string) => {
    try {
      await api.delete(`/game/rooms/${roomId}/leave`);
    } catch {}
    set({ room: null, isReady: false });
  },

  startGame: async (roomId) => {
    try {
      const room = await api.post<LobbyRoom>(`/game/rooms/${roomId}/start`);
      set({ room });
      return true;
    } catch {
      return false;
    }
  },

  toggleReady: async () => {
    const current = get().isReady;
    set({ isReady: !current });
  },

  copyInviteCode: async () => {
    const code = get().room?.inviteCode;
    if (code) {
      await Clipboard.setStringAsync(code);
    }
  },

  pollRoom: async (roomId) => {
    try {
      const room = await api.get<LobbyRoom>(`/game/rooms/${roomId}`);
      set({ room });
    } catch {}
  },
}));
