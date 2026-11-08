/**
 * Unit tests for testnet KRAIN spend rules.
 * Run with: npx tsx lib/krain/spend-rules.test.ts
 */
import assert from "node:assert/strict";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import {
  creditDayKey,
  type DailyCounter,
  debitKrainMessage,
  isKrainCreditEligible,
  KRAIN_CREDIT_ELIGIBLE_MODEL_IDS,
  KRAIN_DEBIT_URL,
  parseDailyCeiling,
  reserveCreditSlot,
} from "./spend-rules";

let passed = 0;
let failed = 0;

const pending: Promise<void>[] = [];

function test(name: string, fn: () => void | Promise<void>) {
  pending.push(run(name, fn));
}

async function run(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err: unknown) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }
}

const API_KEY = "krain_test_secret_key_123456";

function fakeFetch(status: number) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchImpl = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(null, { status });
  }) as typeof fetch;
  return { fetchImpl, calls };
}

function memoryCounter(): DailyCounter & { value: number } {
  const counter = {
    value: 0,
    async incr() {
      counter.value++;
      return counter.value;
    },
    async decr() {
      counter.value--;
    },
  };
  return counter;
}

console.log("eligibility");

test("eligible models are exactly the four zero-cost guest models", () => {
  assert.deepEqual([...KRAIN_CREDIT_ELIGIBLE_MODEL_IDS].sort(), [
    "deepseek-deepseek-r1",
    "google-gemini-2.5-flash",
    "groq-llama-3.3-70b-versatile",
    "groq-llama-4-scout-17b-16e-instruct",
  ]);
});

test("every eligible model is on the guest zero-cost list", () => {
  for (const id of KRAIN_CREDIT_ELIGIBLE_MODEL_IDS) {
    assert.ok(
      entitlementsByUserType.guest.availableChatModelIds.includes(
        id as (typeof entitlementsByUserType.guest.availableChatModelIds)[number]
      ),
      `${id} is not on the guest list`
    );
  }
});

test("paid models are never credit-eligible", () => {
  assert.equal(isKrainCreditEligible("openai-gpt-5"), false);
  assert.equal(isKrainCreditEligible("anthropic-claude-opus-4-1"), false);
  assert.equal(isKrainCreditEligible("chat-model"), false);
});

console.log("ceiling");

test("unset or invalid ceiling falls back to 1,000", () => {
  assert.equal(parseDailyCeiling(undefined), 1000);
  assert.equal(parseDailyCeiling(""), 1000);
  assert.equal(parseDailyCeiling("abc"), 1000);
  assert.equal(parseDailyCeiling("-1"), 1000);
  assert.equal(parseDailyCeiling("1.5"), 1000);
});

test("valid ceiling is honoured, including 0 to disable", () => {
  assert.equal(parseDailyCeiling("250"), 250);
  assert.equal(parseDailyCeiling("0"), 0);
});

test("day key is the UTC date", () => {
  assert.equal(
    creditDayKey(new Date("2026-11-08T23:59:59.000Z")),
    "krain:credit-messages:2026-11-08"
  );
});

test("reserve succeeds under the ceiling", async () => {
  const counter = memoryCounter();
  assert.equal(await reserveCreditSlot(counter, "k", 2), true);
  assert.equal(counter.value, 1);
});

test("reserve is refused at the ceiling and leaves the count unchanged", async () => {
  const counter = memoryCounter();
  counter.value = 2;
  assert.equal(await reserveCreditSlot(counter, "k", 2), false);
  assert.equal(counter.value, 2);
});

test("ceiling of 0 refuses without touching the counter", async () => {
  const counter = memoryCounter();
  assert.equal(await reserveCreditSlot(counter, "k", 0), false);
  assert.equal(counter.value, 0);
});

console.log("debit-key outcomes");

test("200 is debited and sends the bearer key, amount, reason and message id", async () => {
  const { fetchImpl, calls } = fakeFetch(200);
  const outcome = await debitKrainMessage({
    apiKey: API_KEY,
    messageId: "msg-1",
    fetchImpl,
  });
  assert.equal(outcome, "debited");
  assert.equal(calls[0].url, KRAIN_DEBIT_URL);
  assert.equal(calls[0].init.method, "POST");
  const headers = calls[0].init.headers as Record<string, string>;
  assert.equal(headers.authorization, `Bearer ${API_KEY}`);
  assert.deepEqual(JSON.parse(calls[0].init.body as string), {
    amount: 1,
    reason: "bedda-chat message",
    idempotencyKey: "msg-1",
  });
});

test("402 maps to out_of_credits", async () => {
  const { fetchImpl } = fakeFetch(402);
  assert.equal(
    await debitKrainMessage({ apiKey: API_KEY, messageId: "m", fetchImpl }),
    "out_of_credits"
  );
});

test("429 maps to daily_cap", async () => {
  const { fetchImpl } = fakeFetch(429);
  assert.equal(
    await debitKrainMessage({ apiKey: API_KEY, messageId: "m", fetchImpl }),
    "daily_cap"
  );
});

test("5xx maps to unavailable", async () => {
  const { fetchImpl } = fakeFetch(503);
  assert.equal(
    await debitKrainMessage({ apiKey: API_KEY, messageId: "m", fetchImpl }),
    "unavailable"
  );
});

test("network failure or timeout maps to unavailable", async () => {
  const fetchImpl = (async () => {
    throw new DOMException("The operation was aborted.", "TimeoutError");
  }) as typeof fetch;
  assert.equal(
    await debitKrainMessage({ apiKey: API_KEY, messageId: "m", fetchImpl }),
    "unavailable"
  );
});

test("the API key never appears in logged output", async () => {
  const logged: unknown[][] = [];
  const originalWarn = console.warn;
  const originalError = console.error;
  console.warn = (...args: unknown[]) => logged.push(args);
  console.error = (...args: unknown[]) => logged.push(args);
  try {
    const { fetchImpl } = fakeFetch(500);
    await debitKrainMessage({ apiKey: API_KEY, messageId: "m", fetchImpl });
    await debitKrainMessage({
      apiKey: API_KEY,
      messageId: "m",
      fetchImpl: (async () => {
        throw new Error(`boom ${API_KEY}`);
      }) as typeof fetch,
    });
  } finally {
    console.warn = originalWarn;
    console.error = originalError;
  }
  assert.equal(logged.length > 0, true);
  assert.equal(JSON.stringify(logged).includes(API_KEY), false);
});

Promise.all(pending).then(() => {
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
});
