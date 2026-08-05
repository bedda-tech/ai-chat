/**
 * Unit tests for lib/ai/tools/generate-image.ts.
 * Run with: npx tsx lib/ai/tools/generate-image.test.ts
 */
import assert from "node:assert/strict";
import { generateImageTool } from "./generate-image";

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

const schema = generateImageTool().inputSchema;

async function main() {
  console.log("generateImageTool.inputSchema");

  await test("model defaults to dalle3 when omitted", () => {
    const parsed = schema.parse({ prompt: "a cat" });
    assert.equal(parsed.model, "dalle3");
  });

  await test("size defaults to square when omitted", () => {
    const parsed = schema.parse({ prompt: "a cat" });
    assert.equal(parsed.size, "square");
  });

  await test("style is left undefined when omitted", () => {
    const parsed = schema.parse({ prompt: "a cat" });
    assert.equal(parsed.style, undefined);
  });

  await test("accepts every documented model value", () => {
    for (const model of ["dalle3", "imagen3", "flux"]) {
      const parsed = schema.parse({ prompt: "a cat", model });
      assert.equal(parsed.model, model);
    }
  });

  await test("accepts every documented size value", () => {
    for (const size of ["square", "landscape", "portrait"]) {
      const parsed = schema.parse({ prompt: "a cat", size });
      assert.equal(parsed.size, size);
    }
  });

  await test("accepts every documented style value", () => {
    for (const style of ["vivid", "natural"]) {
      const parsed = schema.parse({ prompt: "a cat", model: "dalle3", style });
      assert.equal(parsed.style, style);
    }
  });

  await test("rejects an unknown model", () => {
    assert.throws(() => {
      schema.parse({ prompt: "a cat", model: "midjourney" });
    });
  });

  await test("rejects an unknown size", () => {
    assert.throws(() => {
      schema.parse({ prompt: "a cat", size: "widescreen" });
    });
  });

  await test("rejects an unknown style", () => {
    assert.throws(() => {
      schema.parse({ prompt: "a cat", style: "moody" });
    });
  });

  await test("rejects a missing prompt", () => {
    assert.throws(() => {
      schema.parse({ model: "dalle3" });
    });
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
