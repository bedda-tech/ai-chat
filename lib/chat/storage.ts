import type { ChatMessage } from "@/lib/types";

const STORAGE_PREFIX = "bedda:chat:";
const SESSIONS_INDEX_KEY = "bedda:sessions";
const MAX_SESSIONS = 10;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type SessionEntry = { id: string; ts: number };
type StoredChat = { ts: number; messages: ChatMessage[] };

function isAvailable(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    const k = "__bedda_ls_test__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

function getSessions(): SessionEntry[] {
  try {
    const raw = localStorage.getItem(SESSIONS_INDEX_KEY);
    return raw ? (JSON.parse(raw) as SessionEntry[]) : [];
  } catch {
    return [];
  }
}

function setSessions(sessions: SessionEntry[]): void {
  try {
    localStorage.setItem(SESSIONS_INDEX_KEY, JSON.stringify(sessions));
  } catch {
    // ignore — index write failing is non-fatal
  }
}

function updateIndex(chatId: string): void {
  const now = Date.now();
  const sessions = getSessions().filter((s) => s.id !== chatId);
  sessions.unshift({ id: chatId, ts: now });
  const evicted = sessions.splice(MAX_SESSIONS);
  for (const s of evicted) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + s.id);
    } catch {
      // ignore
    }
  }
  setSessions(sessions);
}

/** Returns cached messages for a chat session, or null if missing or older than 7 days. */
export function loadMessages(chatId: string): ChatMessage[] | null {
  if (!isAvailable()) {
    return null;
  }
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + chatId);
    if (!raw) {
      return null;
    }
    const stored = JSON.parse(raw) as StoredChat;
    if (Date.now() - stored.ts > MAX_AGE_MS) {
      removeChat(chatId);
      return null;
    }
    return stored.messages;
  } catch {
    return null;
  }
}

/** Persists messages to localStorage; evicts oldest sessions when the quota is exceeded or MAX_SESSIONS is reached. */
export function saveMessages(chatId: string, messages: ChatMessage[]): void {
  if (!isAvailable() || messages.length === 0) {
    return;
  }
  const payload = JSON.stringify({
    ts: Date.now(),
    messages,
  } satisfies StoredChat);
  try {
    localStorage.setItem(STORAGE_PREFIX + chatId, payload);
    updateIndex(chatId);
  } catch (err) {
    if (err instanceof DOMException && err.name === "QuotaExceededError") {
      pruneOldSessions();
      try {
        localStorage.setItem(STORAGE_PREFIX + chatId, payload);
        updateIndex(chatId);
      } catch {
        // Storage full even after pruning — silently skip
      }
    }
  }
}

/** Removes a chat's cached messages and its entry from the session index. */
export function removeChat(chatId: string): void {
  if (!isAvailable()) {
    return;
  }
  try {
    localStorage.removeItem(STORAGE_PREFIX + chatId);
    setSessions(getSessions().filter((s) => s.id !== chatId));
  } catch {
    // ignore
  }
}

/** Evicts sessions older than 7 days and trims the index to MAX_SESSIONS, freeing localStorage space. */
export function pruneOldSessions(): void {
  if (!isAvailable()) {
    return;
  }
  try {
    const now = Date.now();
    const kept: SessionEntry[] = [];
    for (const s of getSessions()) {
      if (now - s.ts > MAX_AGE_MS) {
        localStorage.removeItem(STORAGE_PREFIX + s.id);
      } else {
        kept.push(s);
      }
    }
    const evicted = kept.splice(MAX_SESSIONS);
    for (const s of evicted) {
      localStorage.removeItem(STORAGE_PREFIX + s.id);
    }
    setSessions(kept);
  } catch {
    // ignore
  }
}
