/**
 * Rules for paying chat messages with testnet KRAIN credits (stage 2).
 * Client-safe: no database, Redis or server-only imports.
 * Server wiring lives in ./credits.ts.
 */

/** `UserProviderKey.provider` value used to store a linked KRAIN API key. */
export const KRAIN_CREDIT_PROVIDER = "krain";

export const KRAIN_DEBIT_URL = "https://app.krain.ai/api/credits/debit-key";
export const KRAIN_DEBIT_TIMEOUT_MS = 5000;
export const KRAIN_DEFAULT_DAILY_CEILING = 1000;

/**
 * Zero-cost models only: the guest-tier free provider list in lib/ai/entitlements.ts.
 * Never add a paid model here. That needs a money decision from Matt.
 */
export const KRAIN_CREDIT_ELIGIBLE_MODEL_IDS: readonly string[] = [
  "google-gemini-2.5-flash",
  "groq-llama-4-scout-17b-16e-instruct",
  "groq-llama-3.3-70b-versatile",
  "deepseek-deepseek-r1",
];

export const KRAIN_NOTICE_HEADER = "x-krain-credit-notice";

/** Why a message fell back to the normal tier allowance. */
export type KrainNotice = "out_of_credits" | "daily_cap" | "ceiling";

export const KRAIN_NOTICE_TEXT: Record<KrainNotice, string> = {
  out_of_credits:
    "Out of testnet KRAIN credits. This message uses your normal allowance.",
  daily_cap:
    "Daily testnet KRAIN cap reached. This message uses your normal allowance.",
  ceiling:
    "Testnet KRAIN credits are paused for today. This message uses your normal allowance.",
};

export const KRAIN_COPY =
  "Testnet KRAIN, no monetary value, not the TGE token. Balances will not carry over unless we say so.";

/** `debited`: krain-app took one credit. The other outcomes leave the message on the normal allowance. */
export type KrainDebitOutcome =
  | "debited"
  | "out_of_credits"
  | "daily_cap"
  | "unavailable";

export function isKrainCreditEligible(modelId: string): boolean {
  return KRAIN_CREDIT_ELIGIBLE_MODEL_IDS.includes(modelId);
}

/** Reads KRAIN_CREDIT_DAILY_CEILING. Unset or invalid values fall back to the default. */
export function parseDailyCeiling(raw: string | undefined): number {
  if (raw === undefined || raw.trim() === "") {
    return KRAIN_DEFAULT_DAILY_CEILING;
  }
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0
    ? value
    : KRAIN_DEFAULT_DAILY_CEILING;
}

/** Redis key for the global credit-paid message count on the given UTC day. */
export function creditDayKey(now: Date): string {
  return `krain:credit-messages:${now.toISOString().slice(0, 10)}`;
}

export type DailyCounter = {
  incr(key: string): Promise<number>;
  decr(key: string): Promise<void>;
};

/**
 * Reserves one slot under the global daily ceiling. Returns false (and leaves the
 * counter unchanged) when the ceiling is already reached or disabled with 0.
 */
export async function reserveCreditSlot(
  counter: DailyCounter,
  key: string,
  ceiling: number
): Promise<boolean> {
  if (ceiling <= 0) {
    return false;
  }
  const count = await counter.incr(key);
  if (count > ceiling) {
    await counter.decr(key);
    return false;
  }
  return true;
}

/**
 * Calls krain-app's debit-key for one message. The idempotency key is the bedda-chat
 * message id, so a retried request debits at most once. Never logs the API key.
 */
export async function debitKrainMessage({
  apiKey,
  messageId,
  fetchImpl = fetch,
}: {
  apiKey: string;
  messageId: string;
  fetchImpl?: typeof fetch;
}): Promise<KrainDebitOutcome> {
  try {
    const response = await fetchImpl(KRAIN_DEBIT_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        amount: 1,
        reason: "bedda-chat message",
        idempotencyKey: messageId,
      }),
      signal: AbortSignal.timeout(KRAIN_DEBIT_TIMEOUT_MS),
    });

    if (response.ok) {
      return "debited";
    }
    if (response.status === 402) {
      return "out_of_credits";
    }
    if (response.status === 429) {
      return "daily_cap";
    }
    console.warn(
      `[krain] debit-key responded ${response.status}; using normal allowance`
    );
    return "unavailable";
  } catch (error) {
    console.warn(
      `[krain] debit-key request failed (${error instanceof Error ? error.name : "unknown"}); using normal allowance`
    );
    return "unavailable";
  }
}
