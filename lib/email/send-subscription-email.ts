import { Resend } from "resend";
import { unsubscribeUrl } from "./unsub-token";

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
  trialEndDate?: Date
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
        `<li style="margin-bottom: 8px; font-size: 14px; color: #555;">${f}</li>`
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
          ${
            isTrial
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
  daysLeft: number
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
          To keep your access after the trial, make sure a payment method is set up —
          otherwise your account will revert to the free tier automatically.
        </p>

        <div style="background: #f5f5f5; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px; font-weight: 600; font-size: 14px; color: #333;">You've had access to:</p>
          <ul style="margin: 0; padding-left: 20px;">
            ${(PLAN_FEATURES[planName] ?? [])
              .slice(0, 4)
              .map(
                (f) =>
                  `<li style="margin-bottom: 6px; font-size: 14px; color: #555;">${f}</li>`
              )
              .join("")}
          </ul>
        </div>

        <a href="${appUrl}/settings" style="display: inline-block; background: #000; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin-bottom: 20px;">
          Add payment method →
        </a>

        <p style="color: #555; font-size: 14px; margin-bottom: 20px;">
          Or <a href="${appUrl}/settings" style="color: #000; font-weight: 600;">go to Settings → Subscription</a>
          to cancel before the trial ends — you won't be charged.
        </p>

        <p style="color: #bbb; font-size: 12px; margin-top: 16px; border-top: 1px solid #eee; padding-top: 16px;">
          You're receiving this because you're on a Bedda ${planName} trial.
        </p>
      </div>
    `,
  });
}

export async function sendTrialExpiredEmail(
  email: string,
  planName: string
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.bedda.tech";
  const features = PLAN_FEATURES[planName] ?? PLAN_FEATURES["Plus"] ?? [];
  const monthlyPrice =
    planName === "Pro" ? "25" : planName === "Max" ? "50" : "12";

  const featureList = features
    .slice(0, 4)
    .map(
      (f) =>
        `<li style="margin-bottom: 8px; font-size: 14px; color: #555;">${f}</li>`
    )
    .join("");

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Bedda <onboarding@resend.dev>",
    to: email,
    subject: `Your Bedda ${planName} trial has ended — keep your access for $${monthlyPrice}/mo`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #111;">
        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">
          Your ${planName} trial has ended
        </h1>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Thanks for trying Bedda ${planName}. Your account is now on the Free plan
          (50 messages/day, fewer models). Here's what you had access to during your trial:
        </p>

        <div style="background: #f5f5f5; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 12px; font-weight: 600; font-size: 14px; color: #333;">What you're losing:</p>
          <ul style="margin: 0; padding-left: 20px;">
            ${featureList}
          </ul>
        </div>

        <div style="background: #000; border-radius: 10px; padding: 20px; margin-bottom: 24px; text-align: center;">
          <p style="margin: 0 0 4px; font-size: 13px; color: #aaa;">Get it all back</p>
          <p style="margin: 0 0 16px; font-size: 28px; font-weight: 700; color: #fff;">
            $${monthlyPrice}<span style="font-size: 14px; font-weight: 400; color: #aaa;">/month</span>
          </p>
          <a href="${appUrl}/upgrade?plan=${planName.toLowerCase()}&source=trial_expired_email"
             style="display: inline-block; background: #fff; color: #000; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">
            Upgrade to ${planName} →
          </a>
        </div>

        <p style="color: #888; font-size: 13px; line-height: 1.6; border-top: 1px solid #eee; padding-top: 20px;">
          Questions or feedback about your trial? Reply to this email — we read everything.
        </p>

        <p style="color: #bbb; font-size: 12px; margin-top: 16px;">
          You're receiving this because your Bedda ${planName} trial has ended.
        </p>
      </div>
    `,
  });
}

export async function sendCheckoutAbandonedEmail(email: string): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.bedda.tech";

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Bedda <onboarding@resend.dev>",
    to: email,
    subject: "You were so close — your 7-day free trial is still waiting",
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #111;">
        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">
          Left without finishing?
        </h1>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          You started upgrading to Bedda Plus but didn't complete it.
          Your <strong>7-day free trial</strong> is still available — no charge until day 8, cancel anytime.
        </p>

        <div style="background: #f9f9f9; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 12px; font-weight: 600; font-size: 14px; color: #333;">What you get with Plus:</p>
          <ul style="margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px; font-size: 14px; color: #555;">300 messages/day (vs 50 on Free)</li>
            <li style="margin-bottom: 8px; font-size: 14px; color: #555;">ALL 30+ models — Claude Opus, GPT-5, Gemini Pro, Grok 4</li>
            <li style="margin-bottom: 8px; font-size: 14px; color: #555;">Image &amp; video generation</li>
            <li style="margin-bottom: 8px; font-size: 14px; color: #555;">Web search, knowledge base, code execution</li>
          </ul>
        </div>

        <a href="${appUrl}/upgrade?plan=plus&source=checkout_abandoned_email"
           style="display: inline-block; background: #000; color: #fff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; margin-bottom: 24px;">
          Start my 7-day free trial →
        </a>

        <p style="color: #888; font-size: 13px; line-height: 1.6; border-top: 1px solid #eee; padding-top: 20px; margin-top: 8px;">
          Only <strong>$12/month</strong> after the trial — less than a single ChatGPT Plus subscription,
          but includes every major AI model in one place.
          Questions? Reply to this email.
        </p>

        <p style="color: #bbb; font-size: 12px; margin-top: 16px;">
          You're receiving this because you started a checkout session on Bedda.
        </p>
      </div>
    `,
  });
}

export async function sendCancellationEmail(
  email: string,
  planName: string,
  periodEnd: Date
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.bedda.tech";
  const features = PLAN_FEATURES[planName] ?? PLAN_FEATURES["Plus"] ?? [];
  const monthlyPrice =
    planName === "Pro" ? "25" : planName === "Max" ? "50" : "12";

  const featureList = features
    .slice(0, 4)
    .map(
      (f) =>
        `<li style="margin-bottom: 8px; font-size: 14px; color: #555;">${f}</li>`
    )
    .join("");

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Bedda <onboarding@resend.dev>",
    to: email,
    subject: `Your Bedda ${planName} subscription has been canceled`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #111;">
        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">
          Subscription canceled
        </h1>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Your Bedda ${planName} subscription has been canceled. Your access will continue
          until <strong>${formatDate(periodEnd)}</strong>, after which your account will
          revert to the Free plan (50 messages/day, limited models).
        </p>

        <div style="background: #f5f5f5; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 12px; font-weight: 600; font-size: 14px; color: #333;">What you'll lose on ${formatDate(periodEnd)}:</p>
          <ul style="margin: 0; padding-left: 20px;">
            ${featureList}
          </ul>
        </div>

        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
          Changed your mind? You can reactivate anytime — no new trial required.
        </p>

        <a href="${appUrl}/upgrade?plan=${planName.toLowerCase()}&source=cancellation_email"
           style="display: inline-block; background: #000; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin-bottom: 24px;">
          Reactivate ${planName} — $${monthlyPrice}/mo →
        </a>

        <p style="color: #888; font-size: 13px; line-height: 1.6; border-top: 1px solid #eee; padding-top: 20px; margin-top: 8px;">
          If you canceled by mistake or have any questions, just reply to this email —
          we're happy to help sort it out.
        </p>

        <p style="color: #bbb; font-size: 12px; margin-top: 16px;">
          You're receiving this because you canceled your Bedda ${planName} subscription.
        </p>
      </div>
    `,
  });
}

export async function sendAnnualUpgradeEmail(
  email: string,
  userId: string,
  planName: string,
  monthlyCents: number,
  annualCents: number
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.bedda.tech";

  const monthlyFmt = (monthlyCents / 100).toFixed(0);
  const annualMonthlyFmt = (annualCents / 100 / 12).toFixed(2);
  const annualFmt = (annualCents / 100).toFixed(0);
  const savedPerYear = ((monthlyCents * 12 - annualCents) / 100).toFixed(0);
  const planLower = planName.toLowerCase();

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Bedda <onboarding@resend.dev>",
    to: email,
    subject: `Save $${savedPerYear}/year on Bedda ${planName} — switch to annual`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #111;">
        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">
          Save $${savedPerYear} this year
        </h1>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          You're on Bedda ${planName} — that's great taste. One quick change could save you
          <strong>$${savedPerYear}/year</strong>: switch to the annual plan and pay 20% less.
        </p>

        <div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
          <div style="display: flex; background: #f9fafb; padding: 12px 20px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">
            <div style="flex: 1;">Plan</div>
            <div style="width: 120px; text-align: right;">Price</div>
          </div>
          <div style="display: flex; align-items: center; padding: 16px 20px; border-top: 1px solid #e5e7eb;">
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 14px; color: #111;">${planName} Monthly</div>
              <div style="font-size: 12px; color: #9ca3af; margin-top: 2px;">Current plan</div>
            </div>
            <div style="width: 120px; text-align: right; font-size: 15px; font-weight: 600; color: #6b7280;">$${monthlyFmt}/mo</div>
          </div>
          <div style="display: flex; align-items: center; padding: 16px 20px; border-top: 1px solid #e5e7eb; background: #fafff4;">
            <div style="flex: 1;">
              <div style="font-weight: 700; font-size: 14px; color: #111;">${planName} Annual</div>
              <div style="font-size: 12px; color: #16a34a; margin-top: 2px; font-weight: 600;">20% off · $${annualFmt} billed once per year</div>
            </div>
            <div style="width: 120px; text-align: right; font-size: 15px; font-weight: 700; color: #16a34a;">$${annualMonthlyFmt}/mo</div>
          </div>
        </div>

        <a href="${appUrl}/settings?tab=subscription&source=annual_offer_email"
           style="display: inline-block; background: #000; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; margin-bottom: 20px;">
          Switch to annual — save $${savedPerYear} →
        </a>

        <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin-bottom: 0;">
          Go to <a href="${appUrl}/settings" style="color: #111; font-weight: 600;">Settings → Subscription</a>
          and click "Change plan" to switch. The unused portion of your current month is prorated.
        </p>

        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 16px;">
          You're receiving this because you're an active Bedda ${planName} subscriber.
          <a href="${unsubscribeUrl(userId)}" style="color: #9ca3af;">Unsubscribe</a>
        </p>
      </div>
    `,
  });
}

export async function sendPaymentFailedEmail(
  email: string,
  planName: string,
  invoiceUrl?: string
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
