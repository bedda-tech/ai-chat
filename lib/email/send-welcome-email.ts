import { Resend } from "resend";

/** Sends the post-registration welcome email via Resend. */
export async function sendWelcomeEmail(email: string): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.bedda.tech";

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Bedda <onboarding@resend.dev>",
    to: email,
    subject: "Welcome to Bedda — your AI hub is ready",
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #111;">
        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Welcome to Bedda 👋</h1>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          You now have access to 36+ leading AI models — Claude, GPT, Gemini, Grok, Mistral,
          DeepSeek, and more — all in one place, for a fraction of the cost of separate subscriptions.
        </p>

        <div style="background: #f5f5f5; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 12px; font-weight: 600; font-size: 14px; color: #333;">What you can do right now:</p>
          <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 14px; line-height: 1.8;">
            <li>Chat with Claude, GPT-5, Gemini, and Grok side by side</li>
            <li>Generate images with DALL·E 3, Imagen, and Flux</li>
            <li>Upload files, search the web, and build a personal knowledge base</li>
            <li>Switch models mid-conversation to get the best answer</li>
          </ul>
        </div>

        <a href="${appUrl}" style="display: inline-block; background: #000; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin-bottom: 24px;">
          Start chatting →
        </a>

        <p style="color: #888; font-size: 13px; line-height: 1.6; border-top: 1px solid #eee; padding-top: 20px; margin-top: 8px;">
          You're on the <strong>Free plan</strong> — 50 messages per day across all models.
          Upgrade to <strong>Plus ($12/mo)</strong> for 300 messages/day and access to premium models.
          <a href="${appUrl}/upgrade?plan=plus" style="color: #000; font-weight: 600;">Upgrade anytime →</a>
        </p>

        <p style="color: #bbb; font-size: 12px; margin-top: 16px;">
          You're receiving this because you created a Bedda account.
          Questions? Reply to this email.
        </p>
      </div>
    `,
  });
}
