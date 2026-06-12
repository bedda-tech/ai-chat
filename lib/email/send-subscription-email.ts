import { Resend } from "resend";

const PLAN_FEATURES: Record<string, string[]> = {
  Plus: [
    "300 messages per day",
    "ALL 30+ AI models (Claude Opus, GPT-5, Gemini Pro, Grok 4, Mistral Large, and more)",
    "Image generation (DALL·E 3, Imagen, Flux)",
    "Full artifact creation: code, documents, spreadsheets, slides, Mermaid diagrams",
    "Audio transcription (Whisper)",
    "25 MB file uploads",
    "Web search and knowledge base",
  ],
  Pro: [
    "1,500 messages per day (5× more than Plus)",
    "Everything in Plus",
    "API access for integrations",
    "Priority new model access",
  ],
  Max: [
    "5,000 messages per day — effectively unlimited",
    "Everything in Pro",
    "Lowest cost per message of any plan",
    "Team workspace features",
    "Enterprise model routing and cost caps",
  ],
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function sendSubscriptionActivatedEmail(
  email: string,
  planName: string,
  trialEndDate?: Date,
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.bedda.tech";
  const features = PLAN_FEATURES[planName] ?? [];
  const isTrial = !!trialEndDate;

  const subject = isTrial
    ? `Your ${planName} trial is active — start exploring`
    : `You're now on ${planName} — let's get started`;

  const trialBanner = isTrial
    ? `<div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 14px; color: #92400e;">
          🎉 <strong>Your 7-day free trial runs until ${formatDate(trialEndDate!)}.</strong>
          We'll send a reminder before it ends. No charge today.
        </p>
      </div>`
    : "";

  const featureList = features
    .map(
      (f) =>
        `<li style="margin-bottom: 8px; font-size: 14px; color: #555;">${f}</li>`,
    )
    .join("");

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Bedda <onboarding@resend.dev>",
    to: email,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #111;">
        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">
          ${isTrial ? `Welcome to your ${planName} trial` : `You're on ${planName}!`}
        </h1>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          ${isTrial
            ? `Your free trial has started. Explore everything ${planName} has to offer — no payment collected until your trial ends.`
            : `Your ${planName} subscription is active. Here's what you now have access to:`
          }
        </p>

        ${trialBanner}

        <div style="background: #f5f5f5; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 12px; font-weight: 600; font-size: 14px; color: #333;">What's included in ${planName}:</p>
          <ul style="margin: 0; padding-left: 20px;">
            ${featureList}
          </ul>
        </div>

        <a href="${appUrl}" style="display: inline-block; background: #000; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin-bottom: 24px;">
          Start chatting →
        </a>

        <p style="color: #888; font-size: 13px; line-height: 1.6; border-top: 1px solid #eee; padding-top: 20px; margin-top: 8px;">
          Manage your subscription anytime from
          <a href="${appUrl}/settings" style="color: #000; font-weight: 600;">Settings</a>.
          Questions? Reply to this email — we're happy to help.
        </p>

        <p style="color: #bbb; font-size: 12px; margin-top: 16px;">
          You're receiving this because you subscribed to Bedda ${planName}.
        </p>
      </div>
    `,
  });
}

export async function sendTrialEndingEmail(
  email: string,
  planName: string,
  trialEndDate: Date,
  daysLeft: number,
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.bedda.tech";

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Bedda <onboarding@resend.dev>",
    to: email,
    subject: `Your ${planName} trial ends ${daysLeft === 1 ? "tomorrow" : `in ${daysLeft} days`}`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #111;">
        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">
          Your trial ends ${daysLeft === 1 ? "tomorrow" : `in ${daysLeft} days`}
        </h1>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Your ${planName} free trial expires on <strong>${formatDate(trialEndDate)}</strong>.
          After that, you'll be billed automatically and can continue using all ${planName} features.
        </p>

        <div style="background: #f5f5f5; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px; font-weight: 600; font-size: 14px; color: #333;">You've had access to:</p>
          <ul style="margin: 0; padding-left: 20px;">
            ${(PLAN_FEATURES[planName] ?? [])
              .slice(0, 4)
              .map((f) => `<li style="margin-bottom: 6px; font-size: 14px; color: #555;">${f}</li>`)
              .join("")}
          </ul>
        </div>

        <p style="color: #555; font-size: 14px; margin-bottom: 20px;">
          To cancel before being charged, go to
          <a href="${appUrl}/settings" style="color: #000; font-weight: 600;">Settings → Subscription</a>
          and cancel anytime.
        </p>

        <a href="${appUrl}" style="display: inline-block; background: #000; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin-bottom: 24px;">
          Continue chatting →
        </a>

        <p style="color: #bbb; font-size: 12px; margin-top: 16px; border-top: 1px solid #eee; padding-top: 16px;">
          You're receiving this because you're on a Bedda ${planName} trial.
        </p>
      </div>
    `,
  });
}

export async function sendPaymentFailedEmail(
  email: string,
  planName: string,
  invoiceUrl?: string,
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.bedda.tech";

  const paymentLink = invoiceUrl
    ? `<a href="${invoiceUrl}" style="display: inline-block; background: #000; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin-bottom: 24px;">Update payment method →</a>`
    : `<a href="${appUrl}/settings" style="display: inline-block; background: #000; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin-bottom: 24px;">Update payment method →</a>`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Bedda <onboarding@resend.dev>",
    to: email,
    subject: "Action required: payment failed for your Bedda subscription",
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #111;">
        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Payment failed</h1>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          We weren't able to process your payment for Bedda ${planName}.
          Please update your payment method to keep your subscription active.
        </p>

        <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #991b1b;">
            ⚠️ If payment isn't updated within a few days, your account will be downgraded to the Free plan.
          </p>
        </div>

        ${paymentLink}

        <p style="color: #888; font-size: 13px; line-height: 1.6; border-top: 1px solid #eee; padding-top: 20px; margin-top: 8px;">
          Need help? Reply to this email and we'll sort it out.
        </p>
      </div>
    `,
  });
}
