// apps/mobile/src/store/gameBoardStore.ts

import { create } from "zustand";
import { socket } from "../lib/socket";
import type { CardItem } from "@sunny-game/types/card.types";
import type { GameBoardPlayer } from "../types/gameBoard";

export type RoundPhase = "WAITING" | "DRAW" | "ACTION" | "RESOLUTION" | "GAMEOVER";

export type GamePhase = "WAITING" | "VOTING" | "DRAW" | "ACTION" | "RESOLUTION" | "GAMEOVER";

interface RoundResultEvent {
  playerId: string;
  displayName: string;
  hpChange: number;
  moneyChange: number;
  cardsPlayed: string[];
  newHp: number;
  newMoney: number;
}

interface RoundStartEvent {
  round: number;
  hand: CardItem[];
  phase: GamePhase;
  timeLeft: number;
  environment: {
    name: string;
    color: string;
  };
}

interface GameOverEvent {
  winner: boolean;
  finalScore: number;
  survivedRounds: number;
  isMvp: boolean;
  scores?: Array<{
    playerId: string;
    displayName: string;
    score: number;
    hp: number;
    money: number;
    profit: number;
    isAlive: boolean;
    isWinner: boolean;
  }>;
}

interface PlayerJoinedEvent {
  playerId: string;
  displayName: string;
  hp: number;
  slots: (string | null)[];
  isReady: boolean;
}

interface RoomStateEvent {
  roomId: string;
  players: Array<{
    playerId: string;
    displayName: string;
    hp: number;
    slots: (string | null)[];
    isReady: boolean;
  }>;
  bots?: Array<{
    playerId: string;
    displayName: string;
    hp: number;
    slots: (string | null)[];
    isReady: boolean;
  }>;
  status?: string;
}

interface VotingStartEvent {
  storeTypes: string[];
}

interface LevelUpEvent {
  playerId: string;
  newLevel: number;
  maxLevel: number;
}

interface GameBoardState {
  // Connection
  isConnected: boolean;
  roomId: string | null;
  playerId: string | null;

  // Round state
  round: number;
  hp: number;
  money: number;
  energy: number;
  maxEnergy: number;
  hand: CardItem[];
  slots: (string | null)[];
  lockedCardId: string | null;
  phase: GamePhase;
  timeLeft: number;
  storeType: string | null;

  // Environment
  envName: string;
  envColor: string;

  // Players
  players: GameBoardPlayer[];
  isReady: boolean;

  // Voting
  votingStoreTypes: string[];
  votedStoreType: string | null;

  // Results
  lastResults: RoundResultEvent[];
  gameOver: GameOverEvent | null;

  // Actions
  connectRoom: (roomId: string, token: string, playerId: string) => Promise<void>;
  disconnectRoom: () => void;
  playCard: (cardId: string, slotIndex: number) => void;
  lockCard: (cardId: string) => void;
  castVote: (storeType: string) => void;
  setReady: () => void;
  resetGame: () => void;
}

export const useGameBoardStore = create<GameBoardState>((set, get) => {
  // Local handlers for socket events
  function onRoomState(data: RoomStateEvent) {
    const humanPlayers = data.players.map((p) => ({
      id: p.playerId,
      displayName: p.displayName,
      hp: p.hp,
      maxHp: 100,
      money: 5000,
      energy: 100,
      maxEnergy: 100,
      slots: p.slots,
      profession: "",
      isAlive: p.hp > 0,
      isReady: p.isReady,
    }));
    const botPlayers = (data.bots ?? []).map((b) => ({
      id: b.playerId,
      displayName: b.displayName,
      hp: b.hp,
      maxHp: 100,
      money: 5000,
      energy: 100,
      maxEnergy: 100,
      slots: b.slots,
      profession: "",
      isAlive: b.hp > 0,
      isReady: b.isReady,
    }));
    set({ players: [...humanPlayers, ...botPlayers] });
  }

  function onPlayerJoined(data: PlayerJoinedEvent) {
    set((s) => {
      const exists = s.players.some((p) => p.id === data.playerId);
      if (exists) return {};
      return {
        players: [
          ...s.players,
          {
            id: data.playerId,
            displayName: data.displayName,
            hp: data.hp,
            maxHp: 100,
            money: 5000,
            energy: 100,
            maxEnergy: 100,
            slots: data.slots,
            profession: "",
            isAlive: data.hp > 0,
            isReady: data.isReady,
          },
        ],
      };
    });
  }

  function onPlayerReady(data: { playerId: string; ready: boolean }) {
    set((s) => ({
      players: s.players.map((p) =>
        p.id === data.playerId ? { ...p, isReady: data.ready } : p,
      ),
    }));
  }

  function onCardPlayed(data: { playerId: string; slotIndex: number; cardInstanceId: string }) {
    const { playerId } = get();
    if (data.playerId !== playerId) return;
    set((s) => {
      const newSlots = [...s.slots];
      newSlots[data.slotIndex] = data.cardInstanceId;
      return { slots: newSlots };
    });
  }

  function onVotingStart(data: VotingStartEvent) {
    set({ phase: "VOTING", votingStoreTypes: data.storeTypes, votedStoreType: null });
  }

  function onVotingComplete(data: { storeType: string; votes: Record<string, number> }) {
    set({ phase: "ACTION", storeType: data.storeType, votingStoreTypes: [], votedStoreType: null });
  }

  function onLevelUp(data: LevelUpEvent) {
    // Could show a toast/notification here
    console.log(`Level up: ${data.newLevel}`);
  }

  function onSlotUpdated(data: { playerId: string; slotIndex: number; cardInstanceId: string | null }) {
    const { playerId } = get();
    if (data.playerId !== playerId) return;
    set((s) => {
      const newSlots = [...s.slots];
      newSlots[data.slotIndex] = data.cardInstanceId;
      return { slots: newSlots };
    });
  }

  function onRoundStart(data: RoundStartEvent) {
    set({
      round: data.round,
      hand: data.hand,
      phase: data.phase,
      timeLeft: data.timeLeft,
      envName: data.environment.name,
      envColor: data.environment.color,
      slots: [null, null, null, null, null],
      lockedCardId: null,
      lastResults: [],
      isReady: false,
    });
  }

  function onRoundResolved(results: RoundResultEvent[]) {
    const { playerId } = get();
    const selfResult = results.find((r) => r.playerId === playerId);
    set((s) => ({
      hp: selfResult?.newHp ?? s.hp,
      money: selfResult?.newMoney ?? s.money,
      lastResults: results,
      players: s.players.map((p) => {
        const result = results.find((r) => r.playerId === p.id);
        return result ? { ...p, hp: result.newHp, money: result.newMoney, isAlive: result.newHp > 0 } : p;
      }),
    }));
  }

  function onPlayerDied(data: { playerId: string; cause: string }) {
    set((s) => ({
      players: s.players.map((p) =>
        p.id === data.playerId ? { ...p, hp: 0, isAlive: false } : p,
      ),
    }));
  }

  function onGameOver(data: GameOverEvent) {
    set({ phase: "GAMEOVER", gameOver: data });
  }

  function onPhaseUpdate(data: { phase: GamePhase; timeLeft: number }) {
    set({ phase: data.phase, timeLeft: data.timeLeft });
  }

  function onConnect() {
    set({ isConnected: true });
    const { roomId } = get();
    if (roomId) {
      socket.emit("room:join", { roomId });
    }
  }

  function onDisconnect() {
    set({ isConnected: false });
  }

  return {
    isConnected: false,
    roomId: null,
    playerId: null,

    round: 0,
    hp: 100,
    money: 5000,
    energy: 100,
    maxEnergy: 100,
    hand: [],
    slots: [null, null, null, null, null],
    lockedCardId: null,
    phase: "WAITING",
    timeLeft: 0,

    envName: "Bình Thường",
    envColor: "#6C63FF",

    players: [],
    isReady: false,

    storeType: null,
    votingStoreTypes: [],
    votedStoreType: null,

    lastResults: [],
    gameOver: null,

    connectRoom: async (roomId, token, playerId) => {
      set({ roomId, playerId });
      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      socket.on("room:state", onRoomState);
      socket.on("player:joined", onPlayerJoined);
      socket.on("player:ready", onPlayerReady);
      socket.on("card:played", onCardPlayed);
      socket.on("slot:updated", onSlotUpdated);
      socket.on("votingStart", onVotingStart);
      socket.on("votingComplete", onVotingComplete);
      socket.on("roundStart", onRoundStart);
      socket.on("roundResolved", onRoundResolved);
      socket.on("playerDied", onPlayerDied);
      socket.on("gameOver", onGameOver);
      socket.on("phaseUpdate", onPhaseUpdate);
      socket.on("levelUp", onLevelUp);

      try {
        await socket.connect(token);
        socket.emit("room:join", { roomId });
      } catch (err) {
        console.error("Socket connection failed:", err);
      }
    },

    disconnectRoom: () => {
      const { roomId } = get();
      if (roomId) {
        socket.emit("room:leave", { roomId });
      }
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room:state", onRoomState);
      socket.off("player:joined", onPlayerJoined);
      socket.off("player:ready", onPlayerReady);
      socket.off("card:played", onCardPlayed);
      socket.off("slot:updated", onSlotUpdated);
      socket.off("votingStart", onVotingStart);
      socket.off("votingComplete", onVotingComplete);
      socket.off("roundStart", onRoundStart);
      socket.off("roundResolved", onRoundResolved);
      socket.off("playerDied", onPlayerDied);
      socket.off("gameOver", onGameOver);
      socket.off("phaseUpdate", onPhaseUpdate);
      socket.off("levelUp", onLevelUp);
      socket.disconnect();
      set({ roomId: null, playerId: null, isConnected: false });
    },

    playCard: (cardId, slotIndex) => {
      const { roomId, hand } = get();
      const card = hand.find((c) => c.id === cardId);
      if (!card) return;

      set((s) => {
        const newSlots = [...s.slots];
        newSlots[slotIndex] = cardId;
        const newHand = s.hand.filter((c) => c.id !== cardId);
        return {
          slots: newSlots,
          hand: newHand,
          energy: Math.max(0, s.energy - card.energyCost),
        };
      });

      socket.emit("card:play", { roomId, cardId, slotIndex });
    },

    lockCard: (cardId) => {
      const { roomId } = get();
      set({ lockedCardId: cardId });
      socket.emit("card:lock", { roomId, cardId });
    },

    castVote: (storeType) => {
      const { roomId } = get();
      set({ votedStoreType: storeType });
      socket.emit("player:vote", { roomId, storeType });
    },

    setReady: () => {
      const { roomId } = get();
      set({ isReady: true });
      socket.emit("player:ready", { roomId });
    },

    resetGame: () => {
      set({
        round: 0,
        hp: 100,
        money: 5000,
        energy: 100,
        maxEnergy: 100,
        hand: [],
        slots: [null, null, null, null, null],
        lockedCardId: null,
        phase: "WAITING",
        timeLeft: 0,
        envName: "Bình Thường",
        envColor: "#6C63FF",
        players: [],
        isReady: false,
        storeType: null,
        votingStoreTypes: [],
        votedStoreType: null,
        lastResults: [],
        gameOver: null,
      });
    },
  };
});
