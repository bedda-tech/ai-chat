/**
 * Unit tests for lib/chat/storage.ts.
 * Run with: npx tsx lib/chat/storage.test.ts
 */
import assert from "node:assert/strict";
import type { ChatMessage } from "../types";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err: unknown) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }
}

class MockStorage {
  private store = new Map<string, string>();
  private failOnceForKey: string | null = null;

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }

  setItem(key: string, value: string): void {
    if (this.failOnceForKey === key) {
      this.failOnceForKey = null;
      throw new DOMException("quota exceeded", "QuotaExceededError");
    }
    this.store.set(key, value);
  }

  /** Makes the next setItem call for exactly this key throw QuotaExceededError. */
  failNextWriteFor(key: string): void {
    this.failOnceForKey = key;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }
}

function makeMessage(id: string): ChatMessage {
  return {
    id,
    role: "user",
    parts: [{ type: "text", text: id }],
  } as unknown as ChatMessage;
}

// `storage.ts` gates every export on `typeof window === "undefined"`, so the
// globals must exist before the module is evaluated. Use a dynamic import
// (rather than a static one, which ESM hoists above this setup) to control
// that order; wrapped in main() since this file runs as CJS (no top-level await).
const mockStorage = new MockStorage();

async function main() {
  (globalThis as Record<string, unknown>).window = {};
  (globalThis as Record<string, unknown>).localStorage = mockStorage;

  const { loadMessages, saveMessages, removeChat, pruneOldSessions } =
    await import("./storage");

  runTests({ loadMessages, saveMessages, removeChat, pruneOldSessions });
}

function runTests({
  loadMessages,
  saveMessages,
  removeChat,
  pruneOldSessions,
}: {
  loadMessages: (chatId: string) => ChatMessage[] | null;
  saveMessages: (chatId: string, messages: ChatMessage[]) => void;
  removeChat: (chatId: string) => void;
  pruneOldSessions: () => void;
}) {
test("loadMessages returns null when nothing is stored", () => {
  assert.equal(loadMessages("nonexistent-chat"), null);
});

test("saveMessages + loadMessages round-trips", () => {
  const messages = [makeMessage("m1"), makeMessage("m2")];
  saveMessages("chat-a", messages);
  const loaded = loadMessages("chat-a");
  assert.deepEqual(loaded, messages);
});

test("saveMessages is a no-op for an empty messages array", () => {
  saveMessages("chat-empty", []);
  assert.equal(loadMessages("chat-empty"), null);
});

test("loadMessages expires and removes entries older than 7 days", () => {
  const eightDaysMs = 8 * 24 * 60 * 60 * 1000;
  const stale = {
    ts: Date.now() - eightDaysMs,
    messages: [makeMessage("old")],
  };
  mockStorage.setItem("bedda:chat:chat-stale", JSON.stringify(stale));
  assert.equal(loadMessages("chat-stale"), null);
  // Expiry should also clean up the underlying storage entry.
  assert.equal(mockStorage.getItem("bedda:chat:chat-stale"), null);
});

test("removeChat deletes the entry and drops it from the session index", () => {
  saveMessages("chat-b", [makeMessage("m1")]);
  removeChat("chat-b");
  assert.equal(loadMessages("chat-b"), null);
  const index = JSON.parse(mockStorage.getItem("bedda:sessions") ?? "[]") as Array<{
    id: string;
  }>;
  assert.equal(
    index.some((s) => s.id === "chat-b"),
    false
  );
});

test("saveMessages evicts the oldest session past MAX_SESSIONS", () => {
  mockStorage.clear();
  for (let i = 0; i < 11; i++) {
    saveMessages(`chat-evict-${i}`, [makeMessage(`m${i}`)]);
  }
  const index = JSON.parse(mockStorage.getItem("bedda:sessions") ?? "[]") as Array<{
    id: string;
  }>;
  assert.equal(index.length, 10);
  // The first-saved session (now the 11th-oldest) should have been evicted.
  assert.equal(loadMessages("chat-evict-0"), null);
  assert.notEqual(loadMessages("chat-evict-10"), null);
});

test("saveMessages recovers from a QuotaExceededError by pruning then retrying", () => {
  mockStorage.clear();
  // Seed one stale session so pruneOldSessions() has something to evict.
  const eightDaysMs = 8 * 24 * 60 * 60 * 1000;
  mockStorage.setItem(
    "bedda:sessions",
    JSON.stringify([{ id: "chat-quota-stale", ts: Date.now() - eightDaysMs }])
  );
  mockStorage.setItem(
    "bedda:chat:chat-quota-stale",
    JSON.stringify({ ts: Date.now() - eightDaysMs, messages: [makeMessage("old")] })
  );

  mockStorage.failNextWriteFor("bedda:chat:chat-quota-new");
  saveMessages("chat-quota-new", [makeMessage("new")]);

  assert.deepEqual(loadMessages("chat-quota-new"), [makeMessage("new")]);
  assert.equal(mockStorage.getItem("bedda:chat:chat-quota-stale"), null);
});

test("pruneOldSessions removes stale entries but keeps fresh ones", () => {
  mockStorage.clear();
  const eightDaysMs = 8 * 24 * 60 * 60 * 1000;
  mockStorage.setItem(
    "bedda:sessions",
    JSON.stringify([
      { id: "chat-fresh", ts: Date.now() },
      { id: "chat-old", ts: Date.now() - eightDaysMs },
    ])
  );
  mockStorage.setItem(
    "bedda:chat:chat-fresh",
    JSON.stringify({ ts: Date.now(), messages: [makeMessage("f")] })
  );
  mockStorage.setItem(
    "bedda:chat:chat-old",
    JSON.stringify({ ts: Date.now() - eightDaysMs, messages: [makeMessage("o")] })
  );

  pruneOldSessions();

  assert.notEqual(loadMessages("chat-fresh"), null);
  assert.equal(mockStorage.getItem("bedda:chat:chat-old"), null);
});

test("all exports no-op safely when window is undefined (SSR)", () => {
  const savedWindow = (globalThis as Record<string, unknown>).window;
  (globalThis as Record<string, unknown>).window = undefined;
  try {
    assert.doesNotThrow(() => {
      saveMessages("ssr-chat", [makeMessage("m1")]);
      assert.equal(loadMessages("ssr-chat"), null);
      removeChat("ssr-chat");
      pruneOldSessions();
    });
  } finally {
    (globalThis as Record<string, unknown>).window = savedWindow;
  }
});

}

main().then(() => {
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
});
