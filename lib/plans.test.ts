/**
 * Unit tests for lib/plans.ts — client-safe pricing display data.
 * Run with: npx tsx lib/plans.test.ts
 *
 * This file has zero imports (pure constants), so no env/module-cache setup
 * is needed. The tests exist to catch a future edit that breaks the
 * documented invariants (20% annual discount, per-month = annual/12,
 * every PlanKey/DbTier present in every record) rather than to test any
 * function logic, since there is none.
 */
import assert from "node:assert/strict";

import {
  PLAN_ANNUAL_PER_MONTH,
  PLAN_ANNUAL_PRICE,
  PLAN_MONTHLY_PRICE,
  TIER_DISPLAY_NAMES,
  type DbTier,
  type PlanKey,
} from "./plans";

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

const PLAN_KEYS: PlanKey[] = ["free", "plus", "pro", "max"];
const DB_TIERS: DbTier[] = ["free", "pro", "premium", "enterprise"];

console.log("PLAN_MONTHLY_PRICE / PLAN_ANNUAL_PRICE / PLAN_ANNUAL_PER_MONTH");

test("every paid plan's annual price is a 20% discount off monthly * 12", () => {
  for (const key of PLAN_KEYS) {
    if (key === "free") continue;
    const expectedAnnual = PLAN_MONTHLY_PRICE[key] * 12 * 0.8;
    assert.ok(
      Math.abs(PLAN_ANNUAL_PRICE[key] - expectedAnnual) < 0.001,
      `${key}: expected annual ${expectedAnnual}, got ${PLAN_ANNUAL_PRICE[key]}`
    );
  }
});

test("PLAN_ANNUAL_PER_MONTH equals PLAN_ANNUAL_PRICE / 12 for every plan", () => {
  for (const key of PLAN_KEYS) {
    const expected = PLAN_ANNUAL_PRICE[key] / 12;
    assert.ok(
      Math.abs(PLAN_ANNUAL_PER_MONTH[key] - expected) < 0.001,
      `${key}: expected per-month ${expected}, got ${PLAN_ANNUAL_PER_MONTH[key]}`
    );
  }
});

test("the free plan is $0 across all three price records", () => {
  assert.equal(PLAN_MONTHLY_PRICE.free, 0);
  assert.equal(PLAN_ANNUAL_PRICE.free, 0);
  assert.equal(PLAN_ANNUAL_PER_MONTH.free, 0);
});

test("monthly prices strictly increase across free < plus < pro < max", () => {
  assert.ok(PLAN_MONTHLY_PRICE.free < PLAN_MONTHLY_PRICE.plus);
  assert.ok(PLAN_MONTHLY_PRICE.plus < PLAN_MONTHLY_PRICE.pro);
  assert.ok(PLAN_MONTHLY_PRICE.pro < PLAN_MONTHLY_PRICE.max);
});

test("every PlanKey has an entry in all three price records", () => {
  for (const key of PLAN_KEYS) {
    assert.ok(key in PLAN_MONTHLY_PRICE, `missing ${key} in PLAN_MONTHLY_PRICE`);
    assert.ok(key in PLAN_ANNUAL_PRICE, `missing ${key} in PLAN_ANNUAL_PRICE`);
    assert.ok(
      key in PLAN_ANNUAL_PER_MONTH,
      `missing ${key} in PLAN_ANNUAL_PER_MONTH`
    );
  }
});

console.log("TIER_DISPLAY_NAMES");

test("every DbTier has a non-empty display name", () => {
  for (const tier of DB_TIERS) {
    const name = TIER_DISPLAY_NAMES[tier];
    assert.ok(typeof name === "string" && name.length > 0, `missing name for ${tier}`);
  }
});

test("display names are unique across tiers", () => {
  const names = DB_TIERS.map((tier) => TIER_DISPLAY_NAMES[tier]);
  assert.equal(new Set(names).size, names.length);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
