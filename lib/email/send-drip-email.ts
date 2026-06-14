import { Resend } from "resend";

const FROM = process.env.RESEND_FROM_EMAIL ?? "Bedda <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.bedda.tech";

export async function sendDripEmailDay3(email: string): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "3 Bedda features most people miss 🔍",
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #111;">
        <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">Getting the most out of Bedda?</h1>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          You joined 3 days ago — here are three things most users discover only after a week:
        </p>

        <div style="border-left: 3px solid #000; padding-left: 16px; margin-bottom: 20px;">
          <p style="margin: 0 0 4px; font-weight: 600; font-size: 15px;">1. Compare models side-by-side</p>
          <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">
            Go to <a href="${APP_URL}/compare" style="color: #000; font-weight: 600;">/compare</a> to send the same prompt to Claude, GPT, and Gemini at once.
            See which model gives the best answer for your specific task.
          </p>
        </div>

        <div style="border-left: 3px solid #000; padding-left: 16px; margin-bottom: 20px;">
          <p style="margin: 0 0 4px; font-weight: 600; font-size: 15px;">2. Build a personal knowledge base</p>
          <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">
            Upload your documents to <a href="${APP_URL}/knowledge-base" style="color: #000; font-weight: 600;">/knowledge-base</a>
            and any model can search them automatically when you ask a question.
            Great for research, notes, or company docs.
          </p>
        </div>

        <div style="border-left: 3px solid #000; padding-left: 16px; margin-bottom: 24px;">
          <p style="margin: 0 0 4px; font-weight: 600; font-size: 15px;">3. Web search in chat</p>
          <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">
            Just ask "search the web for..." and the AI pulls live results. No plugin needed —
            it works in any conversation, with any model.
          </p>
        </div>

        <a href="${APP_URL}" style="display: inline-block; background: #000; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin-bottom: 24px;">
          Try these now →
        </a>

        <p style="color: #888; font-size: 13px; line-height: 1.6; border-top: 1px solid #eee; padding-top: 20px;">
          You're on the <strong>Free plan</strong> (50 messages/day).
          <a href="${APP_URL}/upgrade?plan=plus" style="color: #000; font-weight: 600;">Upgrade to Plus ($12/mo)</a>
          for 300 messages/day, Claude Opus, and GPT-5 access — with a 7-day free trial.
        </p>
        <p style="color: #bbb; font-size: 12px; margin-top: 12px;">
          You're receiving this because you created a Bedda account. Questions? Reply here.
        </p>
      </div>
    `,
  });
}

export async function sendDripEmailDay7(email: string): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Your free Plus trial is waiting ⏳",
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #111;">
        <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">One week with Bedda 🎉</h1>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          You've been using Bedda for a week now. Here's what's waiting for you on Plus:
        </p>

        <div style="background: #f9f9f9; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; color: #888;">Daily messages</td>
              <td style="padding: 10px 0; text-align: right; color: #555;">50 free</td>
              <td style="padding: 10px 0; text-align: right; font-weight: 600;">→ 300 Plus</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; color: #888;">Claude Opus (best for writing)</td>
              <td style="padding: 10px 0; text-align: right; color: #d00;">✗</td>
              <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #060;">✓</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; color: #888;">GPT-5 (OpenAI's best)</td>
              <td style="padding: 10px 0; text-align: right; color: #d00;">✗</td>
              <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #060;">✓</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; color: #888;">Image generation</td>
              <td style="padding: 10px 0; text-align: right; color: #d00;">✗</td>
              <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #060;">✓</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888;">Video generation</td>
              <td style="padding: 10px 0; text-align: right; color: #d00;">✗</td>
              <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #060;">✓</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px; color: #333;">
          <strong>Plus is $12/month</strong> — less than a single ChatGPT Plus subscription,
          but includes Claude, GPT, Gemini, Grok, and 30+ more models. Start with a 7-day free trial,
          cancel anytime.
        </p>

        <a href="${APP_URL}/upgrade?plan=plus" style="display: inline-block; background: #000; color: #fff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; margin-bottom: 24px;">
          Start 7-day free trial →
        </a>

        <p style="color: #888; font-size: 13px; line-height: 1.6; border-top: 1px solid #eee; padding-top: 20px;">
          No credit card needed to explore — but a trial locks in your 7 free days at the Plus tier.
          Cancel before day 7 and you won't be charged.
        </p>
        <p style="color: #bbb; font-size: 12px; margin-top: 12px;">
          You're receiving this because you created a Bedda account. Questions? Reply here.
        </p>
      </div>
    `,
  });
}
