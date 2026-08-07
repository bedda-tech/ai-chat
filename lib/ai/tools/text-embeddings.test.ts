/**
 * Unit tests for lib/ai/tools/text-embeddings.ts.
 * Run with: npx tsx lib/ai/tools/text-embeddings.test.ts
 */
import assert from "node:assert/strict";
import {
  compareTextSimilarityTool,
  generateTextEmbeddingsTool,
} from "./text-embeddings";

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

const embeddingsSchema = generateTextEmbeddingsTool().inputSchema;
const similaritySchema = compareTextSimilarityTool().inputSchema;

async function main() {
  console.log("generateTextEmbeddingsTool.inputSchema");

  await test("accepts a single text", () => {
    const parsed = embeddingsSchema.parse({ texts: ["hello"] });
    assert.deepEqual(parsed.texts, ["hello"]);
  });

  await test("accepts up to 10 texts", () => {
    const texts = Array.from({ length: 10 }, (_, i) => `text-${i}`);
    const parsed = embeddingsSchema.parse({ texts });
    assert.equal(parsed.texts.length, 10);
  });

  await test("rejects an empty texts array", () => {
    assert.throws(() => {
      embeddingsSchema.parse({ texts: [] });
    });
  });

  await test("rejects more than 10 texts", () => {
    const texts = Array.from({ length: 11 }, (_, i) => `text-${i}`);
    assert.throws(() => {
      embeddingsSchema.parse({ texts });
    });
  });

  await test("dimensions is optional", () => {
    const parsed = embeddingsSchema.parse({ texts: ["hello"] });
    assert.equal(parsed.dimensions, undefined);
  });

  await test("dimensions accepts a value within range", () => {
    const parsed = embeddingsSchema.parse({
      texts: ["hello"],
      dimensions: 512,
    });
    assert.equal(parsed.dimensions, 512);
  });

  await test("dimensions rejects a value below the minimum of 256", () => {
    assert.throws(() => {
      embeddingsSchema.parse({ texts: ["hello"], dimensions: 128 });
    });
  });

  await test("dimensions rejects a value above the maximum of 1536", () => {
    assert.throws(() => {
      embeddingsSchema.parse({ texts: ["hello"], dimensions: 2048 });
    });
  });

  console.log("\ncompareTextSimilarityTool.inputSchema");

  await test("threshold defaults to 0.7 when omitted", () => {
    const parsed = similaritySchema.parse({ texts: ["a", "b"] });
    assert.equal(parsed.threshold, 0.7);
  });

  await test("threshold is preserved when provided within range", () => {
    const parsed = similaritySchema.parse({
      texts: ["a", "b"],
      threshold: 0.9,
    });
    assert.equal(parsed.threshold, 0.9);
  });

  await test("threshold rejects a value below the minimum of 0", () => {
    assert.throws(() => {
      similaritySchema.parse({ texts: ["a", "b"], threshold: -0.1 });
    });
  });

  await test("threshold rejects a value above the maximum of 1", () => {
    assert.throws(() => {
      similaritySchema.parse({ texts: ["a", "b"], threshold: 1.1 });
    });
  });

  await test("rejects fewer than 2 texts", () => {
    assert.throws(() => {
      similaritySchema.parse({ texts: ["only-one"] });
    });
  });

  await test("accepts up to 5 texts", () => {
    const parsed = similaritySchema.parse({
      texts: ["a", "b", "c", "d", "e"],
    });
    assert.equal(parsed.texts.length, 5);
  });

  await test("rejects more than 5 texts", () => {
    assert.throws(() => {
      similaritySchema.parse({ texts: ["a", "b", "c", "d", "e", "f"] });
    });
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
