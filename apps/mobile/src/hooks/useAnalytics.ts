// apps/mobile/src/hooks/useAnalytics.ts

import { useCallback } from "react";
import { api } from "../api/client";
import { useAuthStore } from "../store/authStore";

type EventName =
  | "screen_view"
  | "button_tap"
  | "game_start"
  | "game_end"
  | "card_played"
  | "store_vote"
  | "battlepass_view"
  | "achievement_view"
  | "collection_search"
  | "leaderboard_view"
  | "settings_change";

interface EventData {
  [key: string]: string | number | boolean | undefined;
}

const eventQueue: Array<{ eventName: EventName; eventData: EventData }> = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

async function flushEvents() {
  if (eventQueue.length === 0) return;
  const batch = [...eventQueue];
  eventQueue.length = 0;

  await Promise.allSettled(
    batch.map((ev) =>
      api.post("/analytics/track", {
        eventName: ev.eventName,
        eventData: ev.eventData,
      }),
    ),
  );
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushEvents();
  }, 5000);
}

export function useAnalytics() {
  const { user } = useAuthStore();

  const track = useCallback(
    (eventName: EventName, eventData: EventData = {}) => {
      const enriched = {
        ...eventData,
        userId: user?.id ?? "anonymous",
        playerId: user?.playerId ?? undefined,
        timestamp: Date.now(),
      };
      eventQueue.push({ eventName, eventData: enriched });
      scheduleFlush();
    },
    [user],
  );

  const trackScreenView = useCallback(
    (screenName: string) => track("screen_view", { screen: screenName }),
    [track],
  );

  const trackButtonTap = useCallback(
    (button: string, context?: string) =>
      track("button_tap", { button, context: context ?? "" }),
    [track],
  );

  const flush = useCallback(() => flushEvents(), []);

  return { track, trackScreenView, trackButtonTap, flush };
}
