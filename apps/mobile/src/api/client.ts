// apps/mobile/src/api/client.ts

import * as SecureStore from "expo-secure-store";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

class ApiClient {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  async setToken(token: string) {
    this.token = token;
    await SecureStore.setItemAsync("accessToken", token);
  }

  async loadToken() {
    this.token = await SecureStore.getItemAsync("accessToken");
    return this.token;
  }

  async setRefreshToken(token: string) {
    this.refreshToken = token;
    await SecureStore.setItemAsync("refreshToken", token);
  }

  async loadRefreshToken() {
    this.refreshToken = await SecureStore.getItemAsync("refreshToken");
    return this.refreshToken;
  }

  async clearToken() {
    this.token = null;
    this.refreshToken = null;
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
  }

  private subscribeToRefresh(token: string) {
    return new Promise<string>((resolve) => {
      this.refreshSubscribers.push((t) => resolve(t));
    });
  }

  private onRefreshDone(token: string) {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
    this.isRefreshing = false;
  }

  private async tryRefresh(): Promise<boolean> {
    if (this.isRefreshing) return false;
    this.isRefreshing = true;

    try {
      const storedRefresh = await this.loadRefreshToken();
      if (!storedRefresh) return false;

      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: storedRefresh }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      if (data.accessToken) {
        await this.setToken(data.accessToken);
        if (data.refreshToken) await this.setRefreshToken(data.refreshToken);
        this.onRefreshDone(data.accessToken);
        return true;
      }
      return false;
    } catch {
      this.isRefreshing = false;
      return false;
    }
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    retry = true,
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401 && retry) {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        return this.request<T>(method, path, body, false);
      }
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message ?? `HTTP ${res.status}`);
    }

    return res.json();
  }

  get<T>(path: string) {
    return this.request<T>("GET", path);
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>("POST", path, body);
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>("PATCH", path, body);
  }

  delete<T>(path: string) {
    return this.request<T>("DELETE", path);
  }
}

export const api = new ApiClient();
