// apps/mobile/src/store/authStore.ts

import { create } from "zustand";
import { api } from "../api/client";

interface AuthState {
  user: {
    id: string;
    email: string;
    username: string;
    playerId?: string;
    player?: {
      id: string;
      displayName: string;
      level: number;
      xp: number;
      title: string;
      mainProfession: string;
      secondaryProfession: string;
      totalGames: number;
      totalWins: number;
      highestRound: number;
      coins: number;
      gems: number;
    };
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  init: async () => {
    const token = await api.loadToken();
    if (token) {
      try {
        await get().fetchMe();
        set({ isAuthenticated: true });
      } catch {
        await api.clearToken();
      }
    }
    set({ isInitialized: true });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await api.post<{
        user: AuthState["user"];
        accessToken: string;
        refreshToken: string;
      }>("/auth/login", { email, password });

      await api.setToken(data.accessToken);
      await api.setRefreshToken(data.refreshToken);
      set({ user: data.user, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email, username, password) => {
    set({ isLoading: true });
    try {
      const data = await api.post<{
        user: AuthState["user"];
        accessToken: string;
        refreshToken: string;
      }>("/auth/register", { email, username, password });

      await api.setToken(data.accessToken);
      await api.setRefreshToken(data.refreshToken);
      set({ user: data.user, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    await api.clearToken();
    set({ user: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    const data = await api.get<AuthState["user"]>("/users/me");
    set({ user: data });
  },
}));
