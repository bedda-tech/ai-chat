import "server-only";
import { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient>;

let _publisher: RedisClient | null = null;
let _publisherConnecting = false;

async function getPublisher(): Promise<RedisClient | null> {
  if (!process.env.REDIS_URL) return null;
  if (_publisher?.isReady) return _publisher;
  if (_publisherConnecting) return null;
  try {
    _publisherConnecting = true;
    const client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (err) =>
      console.error("[realtime] publisher error:", err)
    );
    await client.connect();
    _publisher = client;
    return _publisher;
  } catch (err) {
    console.error("[realtime] publisher connect failed:", err);
    return null;
  } finally {
    _publisherConnecting = false;
  }
}

export type RealtimeEvent =
  | { type: "new_message" }
  | { type: "typing"; userId: string; userName: string };

export async function publishChatEvent(
  chatId: string,
  event: RealtimeEvent
): Promise<void> {
  const pub = await getPublisher();
  if (!pub) return;
  try {
    await pub.publish(`team:chat:${chatId}`, JSON.stringify(event));
  } catch (err) {
    console.warn("[realtime] publish error:", err);
  }
}

export async function createSubscriber(): Promise<RedisClient | null> {
  if (!process.env.REDIS_URL) return null;
  try {
    const client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (err) =>
      console.error("[realtime] subscriber error:", err)
    );
    await client.connect();
    return client;
  } catch (err) {
    console.error("[realtime] subscriber connect failed:", err);
    return null;
  }
}

export const REALTIME_CHANNEL = (chatId: string) => `team:chat:${chatId}`;

export const TYPING_KEY = (chatId: string, userId: string) =>
  `typing:${chatId}:${userId}`;

export const TYPING_TTL_SECONDS = 4;

export async function setTyping(
  chatId: string,
  userId: string,
  userName: string
): Promise<void> {
  const pub = await getPublisher();
  if (!pub) return;
  try {
    await pub.set(TYPING_KEY(chatId, userId), userName, {
      EX: TYPING_TTL_SECONDS,
    });
  } catch (err) {
    console.warn("[realtime] setTyping error:", err);
  }
}
