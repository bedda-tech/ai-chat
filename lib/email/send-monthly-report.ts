import { Resend } from "resend";

const FROM = process.env.RESEND_FROM_EMAIL ?? "Bedda <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.bedda.tech";

type ModelStat = {
  modelId: string;
  displayName: string;
  count: number;
};

type MonthlyReportData = {
  email: string;
  tier: string;
  month: string;
  messageCount: number;
  totalTokens: number;
  totalCostUsd: number;
  topModels: ModelStat[];
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function tierLabel(tier: string): string {
  if (tier === "pro") return "Plus";
  if (tier === "premium") return "Pro";
  if (tier === "enterprise") return "Max";
  return "Free";
}

export async function sendMonthlyUsageReportEmail(
  data: MonthlyReportData
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const plan = tierLabel(data.tier);
  const isPaid = data.tier !== "free";

  const topModelRows = data.topModels
    .slice(0, 3)
    .map(
      (m, i) =>
        `<tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px 0; font-size: 14px; color: #333;">${i + 1}. ${m.displayName}</td>
          <td style="padding: 10px 0; text-align: right; font-size: 14px; color: #555;">${m.count.toLocaleString()} chats</td>
        </tr>`
    )
    .join("");

  const upgradeSection = !isPaid
    ? `<div style="background: #000; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
        <p style="margin: 0 0 4px; font-size: 13px; color: #aaa;">Unlock all 36+ models, 300 msg/day</p>
        <p style="margin: 0 0 16px; font-size: 26px; font-weight: 700; color: #fff;">
          $12<span style="font-size: 14px; font-weight: 400; color: #aaa;">/month</span>
        </p>
        <a href="${APP_URL}/upgrade?plan=plus&source=monthly_report_email"
           style="display: inline-block; background: #fff; color: #000; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">
          Start 7-day free trial →
        </a>
      </div>`
    : `<p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        Thanks for being a Bedda ${plan} subscriber — we're grateful to have you.
        Keep chatting and let us know if there's anything we can do better.
      </p>`;

  await resend.emails.send({
    from: FROM,
    to: data.email,
    subject: `Your ${data.month} Bedda stats — ${data.messageCount.toLocaleString()} conversations`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #111;">
        <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">Your ${data.month} in AI</h1>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 28px;">
          Here's a look at what you did with Bedda last month.
        </p>

        <div style="display: flex; gap: 16px; margin-bottom: 28px;">
          <div style="flex: 1; background: #f5f5f5; border-radius: 10px; padding: 18px; text-align: center;">
            <p style="margin: 0; font-size: 28px; font-weight: 700; color: #111;">${data.messageCount.toLocaleString()}</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.05em;">conversations</p>
          </div>
          <div style="flex: 1; background: #f5f5f5; border-radius: 10px; padding: 18px; text-align: center;">
            <p style="margin: 0; font-size: 28px; font-weight: 700; color: #111;">${formatNumber(data.totalTokens)}</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.05em;">tokens generated</p>
          </div>
        </div>

        ${
          data.topModels.length > 0
            ? `<div style="background: #f9f9f9; border-radius: 10px; padding: 20px; margin-bottom: 28px;">
                <p style="margin: 0 0 12px; font-weight: 600; font-size: 14px; color: #333;">Your top models</p>
                <table style="width: 100%; border-collapse: collapse;">
                  ${topModelRows}
                </table>
              </div>`
            : ""
        }

        ${upgradeSection}

        <a href="${APP_URL}" style="display: inline-block; background: #111; color: #fff; padding: 13px 26px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-bottom: 28px;">
          Open Bedda →
        </a>

        <p style="color: #bbb; font-size: 12px; margin-top: 8px; border-top: 1px solid #eee; padding-top: 16px;">
          You're receiving this because you have a Bedda account.
          <a href="${APP_URL}/settings" style="color: #999;">Manage preferences</a>
        </p>
      </div>
    `,
  });
}
