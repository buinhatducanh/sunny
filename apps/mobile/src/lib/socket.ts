// apps/mobile/src/lib/socket.ts

import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL?.replace("/api/v1", "") ?? "http://localhost:3000";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SocketHandler = (...args: any[]) => void;

class SocketClient {
  private socket: Socket | null = null;
  private handlers = new Map<string, Set<SocketHandler>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 10000,
      });

      this.socket.on("connect", () => {
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on("connect_error", () => {
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.disconnect();
          reject(new Error("Kết nối WebSocket thất bại sau nhiều lần thử"));
        }
      });

      this.socket.on("disconnect", (reason) => {
        if (reason === "io server disconnect") {
          this.socket?.connect();
        }
      });

      this.socket.onAny((event, ...args) => {
        const set = this.handlers.get(event);
        if (set) {
          set.forEach((handler) => handler(...args));
        }
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.handlers.clear();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, handler: (...args: any[]) => void) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  off(event: string, handler: (...args: any[]) => void) {
    this.handlers.get(event)?.delete(handler);
  }

  emit(event: string, ...args: unknown[]) {
    if (!this.socket?.connected) {
      console.warn(`[Socket] Cannot emit "${event}" — not connected`);
      return;
    }
    this.socket.emit(event, ...args);
  }

  get isConnected() {
    return this.socket?.connected ?? false;
  }

  async reconnect(token: string) {
    this.disconnect();
    await this.connect(token);
  }
}

export const socket = new SocketClient();
