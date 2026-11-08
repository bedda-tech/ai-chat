import "server-only";
import { createClient } from "redis";
import { decryptValue } from "@/lib/ai/plugin-encrypt";
import { getUserProviderKey } from "@/lib/db/queries";
import {
  creditDayKey,
  type DailyCounter,
  debitKrainMessage,
  isKrainCreditEligible,
  KRAIN_CREDIT_PROVIDER,
  type KrainNotice,
  parseDailyCeiling,
  reserveCreditSlot,
} from "./spend-rules";

type RedisClient = ReturnType<typeof createClient>;

let _redis: RedisClient | null = null;
let _redisConnecting = false;

/** Returns a connected Redis client, or null when REDIS_URL is unset or unreachable. */
async function getRedis(): Promise<RedisClient | null> {
  if (!process.env.REDIS_URL) {
    return null;
  }
  if (_redis?.isReady) {
    return _redis;
  }
  if (_redisConnecting) {
    return null;
  }
  try {
    _redisConnecting = true;
    const client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (err) => console.error("[krain] redis error:", err));
    await client.connect();
    _redis = client;
    return _redis;
  } catch (err) {
    console.error("[krain] redis connect failed:", err);
    return null;
  } finally {
    _redisConnecting = false;
  }
}

const CREDIT_COUNTER_TTL_SECONDS = 2 * 24 * 60 * 60;

/** Throws when Redis is unavailable, so the credit path fails closed. */
const creditCounter: DailyCounter = {
  async incr(key) {
    const redis = await getRedis();
    if (!redis) {
      throw new Error("redis unavailable");
    }
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, CREDIT_COUNTER_TTL_SECONDS);
    }
    return count;
  },
  async decr(key) {
    const redis = await getRedis();
    if (redis) {
      await redis.decr(key);
    }
  },
};

export type KrainSpend = { paid: boolean; notice?: KrainNotice };

/**
 * Tries to pay for one chat message with the user's linked testnet KRAIN key.
 * Returns paid: true only when krain-app answers 200. Every other path leaves the
 * message on the normal tier allowance, never on unlimited use.
 */
export async function trySpendKrainCredit({
  userId,
  modelId,
  messageId,
}: {
  userId: string;
  modelId: string;
  messageId: string;
}): Promise<KrainSpend> {
  if (!isKrainCreditEligible(modelId)) {
    return { paid: false };
  }

  const row = await getUserProviderKey(userId, KRAIN_CREDIT_PROVIDER);
  if (!row) {
    return { paid: false };
  }
  const apiKey = decryptValue(row.encryptedKey);
  if (!apiKey) {
    console.warn(
      "[krain] stored key could not be decrypted; using normal allowance"
    );
    return { paid: false };
  }

  const dayKey = creditDayKey(new Date());
  let reserved: boolean;
  try {
    reserved = await reserveCreditSlot(
      creditCounter,
      dayKey,
      parseDailyCeiling(process.env.KRAIN_CREDIT_DAILY_CEILING)
    );
  } catch (error) {
    console.warn(
      `[krain] ceiling check failed (${error instanceof Error ? error.message : "unknown"}); using normal allowance`
    );
    return { paid: false };
  }
  if (!reserved) {
    return { paid: false, notice: "ceiling" };
  }

  const outcome = await debitKrainMessage({ apiKey, messageId });
  if (outcome === "debited") {
    return { paid: true };
  }
  if (outcome === "unavailable") {
    // The debit may have landed before the failure, so the reserved slot stays counted.
    return { paid: false };
  }

  // krain-app refused the debit, so release the slot this message reserved.
  try {
    await creditCounter.decr(dayKey);
  } catch (error) {
    console.warn(
      `[krain] could not release ceiling slot (${error instanceof Error ? error.message : "unknown"})`
    );
  }
  return { paid: false, notice: outcome };
}
