import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getUserTier, getUserTierRecord, getCurrentMonthUsage, getDailyUsage, TIER_LIMITS } from "@/lib/usage/tracking";

export async function GET(_req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const [tier, record, [usage, dailyCount]] = await Promise.all([
      getUserTier(session.user.id),
      getUserTierRecord(session.user.id),
      Promise.all([
        getCurrentMonthUsage(session.user.id),
        getDailyUsage(session.user.id),
      ]),
    ]);

    const isTrial = record?.subscriptionStatus === "trialing";
    const trialEndDate = isTrial && record?.currentPeriodEnd ? record.currentPeriodEnd : null;
    const trialDaysLeft = trialEndDate
      ? Math.max(0, Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;
    const limits = TIER_LIMITS[tier];

    const monthlyLimit = limits.messagesPerMonth;
    const dailyLimit = limits.messagesPerDay;

    return NextResponse.json({
      tier,
      isTrial,
      trialEndDate: trialEndDate?.toISOString() ?? null,
      trialDaysLeft,
      usage: {
        messageCount: usage.messageCount,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        cachedTokens: usage.cachedTokens,
        totalCost: usage.totalCost,
        cachedSavings: usage.cachedSavings,
        dailyCount,
      },
      limits: {
        messagesPerMonth: monthlyLimit,
        messagesPerDay: dailyLimit,
        messagesPerMinute: limits.messagesPerMinute,
      },
      percentUsed: monthlyLimit > 0 && monthlyLimit < 999_999_999
        ? (usage.messageCount / monthlyLimit) * 100
        : 0,
      dailyPercentUsed: dailyLimit > 0 && dailyLimit < 999_999_999
        ? (dailyCount / dailyLimit) * 100
        : 0,
    });
  } catch (error) {
    console.error("Error getting subscription status:", error);
    return NextResponse.json(
      { error: "Failed to get subscription status" },
      { status: 500 }
    );
  }
}
