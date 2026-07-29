"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSWRConfig } from "swr";

export type TypingUser = {
  userId: string;
  userName: string;
  /** timestamp when the typing event was received */
  since: number;
};

const TYPING_DISPLAY_MS = 4000;

export function useTeamRealtime(chatId: string, enabled: boolean) {
  const { mutate } = useSWRConfig();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Expire stale typing indicators
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) =>
        prev.filter((u) => now - u.since < TYPING_DISPLAY_MS)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [enabled]);

  const connect = useCallback(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    const es = new EventSource(`/api/realtime/${chatId}`);
    esRef.current = es;

    es.onmessage = (e) => {
      let payload: { type: string; userId?: string; userName?: string };
      try {
        payload = JSON.parse(e.data);
      } catch {
        return;
      }

      if (payload.type === "new_message") {
        // Invalidate the chat messages SWR cache so they refetch
        mutate((key: unknown) => {
          if (typeof key === "string") {
            return key.includes(`/api/chat/${chatId}/messages`);
          }
          if (Array.isArray(key)) {
            return key.some((k) => typeof k === "string" && k.includes(chatId));
          }
          return false;
        });
      } else if (
        payload.type === "typing" &&
        payload.userId &&
        payload.userName
      ) {
        const { userId, userName } = payload;
        setTypingUsers((prev) => {
          const filtered = prev.filter((u) => u.userId !== userId);
          return [...filtered, { userId, userName, since: Date.now() }];
        });
      }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
      // Reconnect after 3 s
      reconnectTimer.current = setTimeout(connect, 3000);
    };
  }, [chatId, enabled, mutate]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    connect();
    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, [connect, enabled]);

  const sendTyping = useCallback(() => {
    if (!enabled) {
      return;
    }
    // Fire-and-forget
    fetch(`/api/realtime/${chatId}`, { method: "POST" }).catch(() => {});
  }, [chatId, enabled]);

  return { typingUsers, sendTyping };
}
