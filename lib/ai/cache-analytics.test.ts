import assert from "node:assert/strict";
import { getCacheAnalytics, recordCacheStats } from "./cache-analytics";

// getCacheAnalytics filters against the real Date.now(), so fixtures must be
// anchored to actual wall-clock time, not a fixed instant.
function agoStat(
  msAgo: number,
  overrides: Partial<Parameters<typeof recordCacheStats>[0]> = {}
) {
  recordCacheStats({
    requestId: `req-${msAgo}`,
    timestamp: new Date(Date.now() - msAgo),
    modelId: "anthropic-claude-sonnet-4-6",
    cacheHit: true,
    cachedTokens: 100,
    totalTokens: 200,
    costSavings: 0.01,
    ...overrides,
  });
}

function testEmptyAnalyticsBeforeAnyRecords() {
  const result = getCacheAnalytics("1h");
  assert.equal(result.totalRequests, 0);
  assert.equal(result.cacheHits, 0);
  assert.equal(result.cacheMisses, 0);
  assert.equal(result.hitRate, "0.0%");
  assert.equal(result.totalSavings, "$0.00");
  assert.equal(result.cachedTokens, 0);
}

function testHitWithinRangeIsCounted() {
  agoStat(1000, { cacheHit: true, cachedTokens: 150, costSavings: 0.02 });
  const result = getCacheAnalytics("1h");
  assert.equal(result.totalRequests, 1);
  assert.equal(result.cacheHits, 1);
  assert.equal(result.cacheMisses, 0);
  assert.equal(result.hitRate, "100.0%");
  assert.equal(result.totalSavings, "$0.02");
  assert.equal(result.cachedTokens, 150);
}

function testMissOutsideOneHourExcludedButWithin24h() {
  // 2 hours old: outside the 1h window, inside the 24h window
  agoStat(2 * 3_600_000, { cacheHit: false, cachedTokens: 0, costSavings: 0 });

  const oneHour = getCacheAnalytics("1h");
  assert.equal(
    oneHour.totalRequests,
    1,
    "the 2h-old entry must not count toward 1h"
  );

  const day = getCacheAnalytics("24h");
  assert.equal(day.totalRequests, 2);
  assert.equal(day.cacheHits, 1);
  assert.equal(day.cacheMisses, 1);
  assert.equal(day.hitRate, "50.0%");
}

function testEntryOlderThanSevenDaysExcludedFromAllRanges() {
  agoStat(8 * 86_400_000, {
    cacheHit: true,
    cachedTokens: 999,
    costSavings: 5,
  });

  const week = getCacheAnalytics("7d");
  assert.equal(
    week.totalRequests,
    2,
    "an entry older than 7 days must be excluded even from the widest range"
  );
}

function main() {
  const tests: [string, () => void][] = [
    ["empty analytics before any records", testEmptyAnalyticsBeforeAnyRecords],
    ["hit within range is counted", testHitWithinRangeIsCounted],
    [
      "miss outside 1h excluded but within 24h",
      testMissOutsideOneHourExcludedButWithin24h,
    ],
    [
      "entry older than 7 days excluded from all ranges",
      testEntryOlderThanSevenDaysExcludedFromAllRanges,
    ],
  ];

  let failures = 0;
  for (const [name, fn] of tests) {
    try {
      fn();
      console.log(`PASS: ${name}`);
    } catch (err) {
      failures++;
      console.error(`FAIL: ${name}`);
      console.error(err);
    }
  }

  if (failures > 0) {
    console.error(`${failures}/${tests.length} tests failed`);
    process.exit(1);
  }
  console.log(`All ${tests.length} tests passed`);
}

main();
