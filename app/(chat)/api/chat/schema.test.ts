import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { chatModels } from "@/lib/ai/models";
import { postRequestBodySchema } from "./schema";

async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (err) {
    console.error(`FAIL - ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    id: randomUUID(),
    message: {
      id: randomUUID(),
      role: "user",
      parts: [{ type: "text", text: "hello" }],
    },
    selectedChatModel: chatModels[0].id,
    selectedVisibilityType: "private",
    ...overrides,
  };
}

async function main() {
  await test("accepts a minimal valid body", () => {
    const result = postRequestBodySchema.safeParse(validBody());
    assert.strictEqual(result.success, true);
  });

  await test("accepts optional agentMode/webSearchEnabled/projectId when present", () => {
    const result = postRequestBodySchema.safeParse(
      validBody({
        agentMode: true,
        webSearchEnabled: false,
        projectId: randomUUID(),
      })
    );
    assert.strictEqual(result.success, true);
  });

  await test("accepts a null projectId (optional().nullable())", () => {
    const result = postRequestBodySchema.safeParse(
      validBody({ projectId: null })
    );
    assert.strictEqual(result.success, true);
  });

  await test("rejects a non-uuid chat id", () => {
    const result = postRequestBodySchema.safeParse(
      validBody({ id: "not-a-uuid" })
    );
    assert.strictEqual(result.success, false);
  });

  await test("rejects an empty text part (min length 1)", () => {
    const body = validBody();
    body.message.parts = [{ type: "text", text: "" }];
    const result = postRequestBodySchema.safeParse(body);
    assert.strictEqual(result.success, false);
  });

  await test("rejects a text part over 2000 characters", () => {
    const body = validBody();
    body.message.parts = [{ type: "text", text: "a".repeat(2001) }];
    const result = postRequestBodySchema.safeParse(body);
    assert.strictEqual(result.success, false);
  });

  await test("accepts a text part at exactly the 2000 character boundary", () => {
    const body = validBody();
    body.message.parts = [{ type: "text", text: "a".repeat(2000) }];
    const result = postRequestBodySchema.safeParse(body);
    assert.strictEqual(result.success, true);
  });

  await test("accepts a valid file part", () => {
    const body = validBody({
      message: {
        id: randomUUID(),
        role: "user",
        parts: [
          {
            type: "file",
            mediaType: "image/png",
            name: "photo.png",
            url: "https://example.com/photo.png",
          },
        ],
      },
    });
    const result = postRequestBodySchema.safeParse(body);
    assert.strictEqual(result.success, true);
  });

  await test("rejects a file part with an unsupported mediaType", () => {
    const body = validBody({
      message: {
        id: randomUUID(),
        role: "user",
        parts: [
          {
            type: "file",
            mediaType: "application/pdf",
            name: "doc.pdf",
            url: "https://example.com/doc.pdf",
          },
        ],
      },
    });
    const result = postRequestBodySchema.safeParse(body);
    assert.strictEqual(result.success, false);
  });

  await test("rejects a file part with a non-url url", () => {
    const body = validBody({
      message: {
        id: randomUUID(),
        role: "user",
        parts: [
          {
            type: "file",
            mediaType: "image/jpeg",
            name: "photo.jpg",
            url: "not-a-url",
          },
        ],
      },
    });
    const result = postRequestBodySchema.safeParse(body);
    assert.strictEqual(result.success, false);
  });

  await test("rejects an unknown selectedChatModel id", () => {
    const result = postRequestBodySchema.safeParse(
      validBody({ selectedChatModel: "not-a-real-model" })
    );
    assert.strictEqual(result.success, false);
  });

  await test("rejects an invalid selectedVisibilityType", () => {
    const result = postRequestBodySchema.safeParse(
      validBody({ selectedVisibilityType: "shared" })
    );
    assert.strictEqual(result.success, false);
  });

  await test("rejects a message role other than 'user'", () => {
    const body = validBody();
    body.message.role = "assistant";
    const result = postRequestBodySchema.safeParse(body);
    assert.strictEqual(result.success, false);
  });

  if (process.exitCode === 1) {
    console.error("Some tests failed");
  } else {
    console.log("All tests passed");
  }
}

main();
