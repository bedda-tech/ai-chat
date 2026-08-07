/**
 * Unit tests for lib/ai/tools/get-weather.ts inputSchema.
 * Run with: npx tsx lib/ai/tools/get-weather.test.ts
 */
import assert from "node:assert/strict";
import { getWeather } from "./get-weather";

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

const schema = getWeather.inputSchema;

async function main() {
  console.log("getWeather.inputSchema");

  await test("accepts latitude and longitude", () => {
    const parsed = schema.parse({ latitude: 37.77, longitude: -122.42 });
    assert.equal(parsed.latitude, 37.77);
    assert.equal(parsed.longitude, -122.42);
  });

  await test("accepts a city name alone", () => {
    const parsed = schema.parse({ city: "London" });
    assert.equal(parsed.city, "London");
  });

  await test("rejects when neither coordinates nor city are provided", () => {
    assert.throws(() => {
      schema.parse({});
    });
  });

  await test("rejects latitude without longitude", () => {
    assert.throws(() => {
      schema.parse({ latitude: 37.77 });
    });
  });

  await test("rejects longitude without latitude", () => {
    assert.throws(() => {
      schema.parse({ longitude: -122.42 });
    });
  });

  await test("rejects a non-numeric latitude", () => {
    assert.throws(() => {
      schema.parse({ latitude: "37.77", longitude: -122.42 });
    });
  });

  await test("rejects a non-string city", () => {
    assert.throws(() => {
      schema.parse({ city: 123 });
    });
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
