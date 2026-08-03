/**
 * Unit tests for lib/ai/plugin-tool-dispatcher.ts.
 * Run with: npx tsx lib/ai/plugin-tool-dispatcher.test.ts
 */
import assert from "node:assert/strict";
import type { PluginTool } from "@/lib/db/schema";
import { dispatchPluginTool } from "./plugin-tool-dispatcher";

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => void | Promise<void>) {
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

const basePluginTool = {
  webhookUrl: "https://example.com/webhook",
  authHeaderName: null,
  authHeaderValueEncrypted: null,
} as unknown as PluginTool;

const originalFetch = globalThis.fetch;

function restoreFetch() {
  globalThis.fetch = originalFetch;
}

async function main() {
  console.log("dispatchPluginTool");

  await test("returns parsed JSON when response content-type is application/json", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ ok: true, value: 42 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })) as typeof fetch;
    const result = await dispatchPluginTool(basePluginTool, { foo: "bar" });
    assert.deepEqual(result, { ok: true, value: 42 });
    restoreFetch();
  });

  await test("wraps plain-text responses as { result: text }", async () => {
    globalThis.fetch = (async () =>
      new Response("plain text reply", {
        status: 200,
        headers: { "content-type": "text/plain" },
      })) as typeof fetch;
    const result = await dispatchPluginTool(basePluginTool, {});
    assert.deepEqual(result, { result: "plain text reply" });
    restoreFetch();
  });

  await test("returns an error object when the webhook responds with a non-OK status", async () => {
    globalThis.fetch = (async () =>
      new Response("nope", { status: 503 })) as typeof fetch;
    const result = await dispatchPluginTool(basePluginTool, {});
    assert.deepEqual(result, { error: "Webhook returned HTTP 503" });
    restoreFetch();
  });

  await test("returns a timeout error when the request is aborted", async () => {
    globalThis.fetch = (async (_url: unknown, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const err = new Error("This operation was aborted");
          err.name = "AbortError";
          reject(err);
        });
      })) as typeof fetch;
    const result = await dispatchPluginTool(basePluginTool, {});
    assert.deepEqual(result, { error: "Webhook timed out after 5 seconds" });
    restoreFetch();
  });

  await test("returns a generic error message when fetch throws a non-abort error", async () => {
    globalThis.fetch = (async () => {
      throw new Error("DNS resolution failed");
    }) as typeof fetch;
    const result = await dispatchPluginTool(basePluginTool, {});
    assert.deepEqual(result, {
      error: "Webhook error: DNS resolution failed",
    });
    restoreFetch();
  });

  await test("attaches the decrypted auth header when authHeaderName is configured", async () => {
    const originalKey = process.env.PLUGIN_TOOL_ENCRYPTION_KEY;
    delete process.env.PLUGIN_TOOL_ENCRYPTION_KEY;
    let capturedHeaders: Record<string, string> = {};
    globalThis.fetch = (async (_url: unknown, init?: RequestInit) => {
      capturedHeaders = Object.fromEntries(
        new Headers(init?.headers as HeadersInit).entries()
      );
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;
    const pt = {
      ...basePluginTool,
      authHeaderName: "X-Api-Key",
      authHeaderValueEncrypted: "unset-key-passthrough-value",
    } as unknown as PluginTool;
    await dispatchPluginTool(pt, {});
    // With no PLUGIN_TOOL_ENCRYPTION_KEY configured, decryptValue is a no-op passthrough.
    assert.equal(capturedHeaders["x-api-key"], "unset-key-passthrough-value");
    restoreFetch();
    if (originalKey === undefined) {
      delete process.env.PLUGIN_TOOL_ENCRYPTION_KEY;
    } else {
      process.env.PLUGIN_TOOL_ENCRYPTION_KEY = originalKey;
    }
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
