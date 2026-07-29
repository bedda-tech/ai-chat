/**
 * AI SDK Cache Analytics for tracking prompt caching performance
 * This module tracks cache hits/misses and calculates cost savings
 */

export type CacheStats = {
  requestId: string;
  timestamp: Date;
  modelId: string;
  cacheHit: boolean;
  cachedTokens: number;
  totalTokens: number;
  costSavings: number; // in dollars
};

const cacheStats: CacheStats[] = [];

/**
 * Record cache statistics for monitoring performance
 */
export function recordCacheStats(stats: CacheStats) {
  cacheStats.push(stats);

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Cache] ${stats.cacheHit ? "HIT" : "MISS"} - Saved $${stats.costSavings.toFixed(4)}`
    );
  }
}

/**
 * Get cache analytics for a time range
 */
export function getCacheAnalytics(timeRange: "1h" | "24h" | "7d") {
  const now = Date.now();
  const rangeMs =
    timeRange === "1h"
      ? 3_600_000
      : timeRange === "24h"
        ? 86_400_000
        : 604_800_000;

  const recentStats = cacheStats.filter(
    (s) => now - s.timestamp.getTime() < rangeMs
  );

  const totalRequests = recentStats.length;
  const cacheHits = recentStats.filter((s) => s.cacheHit).length;
  const hitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;

  const totalSavings = recentStats.reduce((sum, s) => sum + s.costSavings, 0);
  const cachedTokens = recentStats.reduce((sum, s) => sum + s.cachedTokens, 0);

  return {
    totalRequests,
    cacheHits,
    cacheMisses: totalRequests - cacheHits,
    hitRate: `${hitRate.toFixed(1)}%`,
    totalSavings: `$${totalSavings.toFixed(2)}`,
    cachedTokens,
  };
}
