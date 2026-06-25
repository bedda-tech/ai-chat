import { Resend } from "resend";
import { unsubscribeUrl } from "./unsub-token";

const FROM = process.env.RESEND_FROM_EMAIL ?? "Bedda <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.bedda.tech";

function unsubFooter(userId: string): string {
  const url = unsubscribeUrl(userId);
  return `
    <p style="color: #bbb; font-size: 12px; margin-top: 12px;">
      You're receiving this because you have a Bedda account.
      Questions? Reply here.
      <a href="${url}" style="color: #bbb;">Unsubscribe</a>
    </p>
  `;
}

export async function sendDripEmailDay1(email: string, userId: string): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "5 things worth trying on Bedda",
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #111;">
        <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">You've had Bedda for a day</h1>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Here are five things most people don't discover on their own — each one is a good reason to open a new chat.
        </p>

        <div style="margin-bottom: 20px; border-left: 3px solid #000; padding-left: 16px;">
          <p style="margin: 0 0 4px; font-weight: 700; font-size: 14px; color: #111;">1. Compare 4 models on the same prompt</p>
          <p style="margin: 0; color: #555; font-size: 13px; line-height: 1.5;">
            Go to <a href="${APP_URL}/compare" style="color: #000; font-weight: 600;">/compare</a> and ask the same question to GPT-5, Claude, Gemini, and Grok at once.
            Instantly see which one gives the best answer for your use case.
          </p>
        </div>

        <div style="margin-bottom: 20px; border-left: 3px solid #000; padding-left: 16px;">
          <p style="margin: 0 0 4px; font-weight: 700; font-size: 14px; color: #111;">2. Search the web in your chat</p>
          <p style="margin: 0; color: #555; font-size: 13px; line-height: 1.5;">
            Ask about something recent — "What happened with X last week?" or "What's the current price of Y?" — and Bedda will search the web and cite its sources.
          </p>
        </div>

        <div style="margin-bottom: 20px; border-left: 3px solid #000; padding-left: 16px;">
          <p style="margin: 0 0 4px; font-weight: 700; font-size: 14px; color: #111;">3. Upload your own documents</p>
          <p style="margin: 0; color: #555; font-size: 13px; line-height: 1.5;">
            Add PDFs, text files, or notes to your <a href="${APP_URL}/knowledge-base" style="color: #000; font-weight: 600;">Knowledge Base</a>. Then any chat you start will automatically draw on your documents for context.
          </p>
        </div>

        <div style="margin-bottom: 20px; border-left: 3px solid #000; padding-left: 16px;">
          <p style="margin: 0 0 4px; font-weight: 700; font-size: 14px; color: #111;">4. Generate images inline</p>
          <p style="margin: 0; color: #555; font-size: 13px; line-height: 1.5;">
            Type "generate an image of..." and Bedda will create one with DALL·E 3, Imagen 3, or Flux. For a dedicated studio, try <a href="${APP_URL}/studio" style="color: #000; font-weight: 600;">/studio</a>.
          </p>
        </div>

        <div style="margin-bottom: 28px; border-left: 3px solid #000; padding-left: 16px;">
          <p style="margin: 0 0 4px; font-weight: 700; font-size: 14px; color: #111;">5. Use the reasoning models for hard problems</p>
          <p style="margin: 0; color: #555; font-size: 13px; line-height: 1.5;">
            For math, code, or complex logic — switch to DeepSeek R1 or Grok 4 in the model selector. These models think step-by-step before answering.
          </p>
        </div>

        <a href="${APP_URL}" style="display: inline-block; background: #000; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin-bottom: 24px;">
          Open Bedda →
        </a>

        <p style="color: #888; font-size: 13px; line-height: 1.6; border-top: 1px solid #eee; padding-top: 20px; margin-top: 8px;">
          You're on the <strong>Free plan</strong> (500 messages/month, 50/day).
          <a href="${APP_URL}/upgrade?plan=plus&source=drip_day1" style="color: #000; font-weight: 600;">Upgrade to Plus ($12/mo)</a>
          for 300 messages/day, Claude Opus, and GPT-5.
        </p>
        ${unsubFooter(userId)}
      </div>
    `,
  });
}

export async function sendDripEmailDay3(email: string, userId: string): Promise<void> {
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
        ${unsubFooter(userId)}
      </div>
    `,
  });
}

export async function sendDripEmailDay7(email: string, userId: string): Promise<void> {
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
          but includes Claude, GPT, Gemini, Grok, and 36+ more models. Start with a 7-day free trial,
          cancel anytime.
        </p>

        <a href="${APP_URL}/upgrade?plan=plus" style="display: inline-block; background: #000; color: #fff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; margin-bottom: 24px;">
          Start 7-day free trial →
        </a>

        <p style="color: #888; font-size: 13px; line-height: 1.6; border-top: 1px solid #eee; padding-top: 20px;">
          No charge for 7 days. Cancel before day 7 and you won't be charged.
        </p>
        ${unsubFooter(userId)}
      </div>
    `,
  });
}

export async function sendDripEmailDay14(email: string, userId: string): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Two weeks on Bedda — still on the free plan?",
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #111;">
        <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">Two weeks in 🗓️</h1>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          You've been using Bedda for two weeks now. A lot of our users are surprised
          how much more they get done after upgrading — so we wanted to share a few real reasons people switch.
        </p>

        <div style="background: #f9f9f9; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 14px; font-weight: 600; font-size: 14px; color: #333;">"Why I upgraded after two weeks..."</p>

          <div style="margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid #eee;">
            <p style="margin: 0; font-size: 14px; color: #444; line-height: 1.6;">
              <strong>Hit the 50/day limit</strong> — once I started relying on Bedda for real work,
              50 messages wasn't enough. Plus gives me 300/day.
            </p>
          </div>

          <div style="margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid #eee;">
            <p style="margin: 0; font-size: 14px; color: #444; line-height: 1.6;">
              <strong>Needed Claude Opus for writing</strong> — free tier is limited to smaller models.
              The best reasoning models are Plus-only.
            </p>
          </div>

          <div>
            <p style="margin: 0; font-size: 14px; color: #444; line-height: 1.6;">
              <strong>Image generation &amp; web search</strong> — both locked on free.
              Plus gets DALL·E 3, Imagen, live web search, and video generation.
            </p>
          </div>
        </div>

        <div style="background: #000; color: #fff; border-radius: 10px; padding: 20px; margin-bottom: 24px; text-align: center;">
          <p style="margin: 0 0 4px; font-size: 13px; color: #aaa;">Bedda Plus</p>
          <p style="margin: 0 0 4px; font-size: 32px; font-weight: 700;">$12<span style="font-size: 15px; font-weight: 400; color: #aaa;">/mo</span></p>
          <p style="margin: 0 0 16px; font-size: 13px; color: #aaa;">7-day free trial · cancel anytime</p>
          <a href="${APP_URL}/upgrade?plan=plus&source=drip_day14"
             style="display: inline-block; background: #fff; color: #000; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">
            Start free trial →
          </a>
        </div>

        <p style="color: #888; font-size: 13px; line-height: 1.6; border-top: 1px solid #eee; padding-top: 20px;">
          No charge for 7 days. Bedda Plus is less than a single ChatGPT Plus subscription
          but gives you access to every major AI model in one place.
        </p>
        ${unsubFooter(userId)}
      </div>
    `,
  });
}

export async function sendDripEmailDay21(email: string, userId: string): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "The math behind switching to Plus",
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #111;">
        <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">Three weeks on Bedda 🔢</h1>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          You've been using Bedda for three weeks. Here's a comparison most people find surprisingly convincing:
        </p>

        <div style="background: #f9f9f9; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 16px; font-weight: 700; font-size: 15px; color: #111;">Without Bedda Plus — paying per product:</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0; color: #555;">ChatGPT Plus (GPT-5)</td>
              <td style="padding: 8px 0; text-align: right; color: #555;">$20/mo</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0; color: #555;">Claude Pro (Claude Opus)</td>
              <td style="padding: 8px 0; text-align: right; color: #555;">$20/mo</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0; color: #555;">Gemini Advanced</td>
              <td style="padding: 8px 0; text-align: right; color: #555;">$20/mo</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: 700; color: #111;">Total</td>
              <td style="padding: 10px 0; text-align: right; font-weight: 700; color: #c00;">$60/mo</td>
            </tr>
          </table>
        </div>

        <div style="background: #000; color: #fff; border-radius: 10px; padding: 20px; margin-bottom: 24px; text-align: center;">
          <p style="margin: 0 0 4px; font-size: 13px; color: #aaa;">Bedda Plus — every model, one subscription</p>
          <p style="margin: 0 0 4px; font-size: 36px; font-weight: 700;">$12<span style="font-size: 16px; font-weight: 400; color: #aaa;">/mo</span></p>
          <p style="margin: 0 0 4px; font-size: 13px; color: #aaa;">GPT-5 · Claude Opus · Gemini · Grok · 36+ models</p>
          <p style="margin: 0 0 20px; font-size: 13px; color: #aaa;">7-day free trial · cancel anytime</p>
          <a href="${APP_URL}/upgrade?plan=plus&source=drip_day21"
             style="display: inline-block; background: #fff; color: #000; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">
            Start free trial — save $48/mo →
          </a>
        </div>

        <p style="color: #888; font-size: 13px; line-height: 1.6; border-top: 1px solid #eee; padding-top: 20px;">
          Bedda Plus is $12/month or $115.20/year (save $29). One account, every major AI model. No switching tabs.
        </p>
        ${unsubFooter(userId)}
      </div>
    `,
  });
}

export async function sendDripEmailDay30(email: string, userId: string): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "One month on Bedda — a few things worth knowing",
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #111;">
        <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">One month 🗓️</h1>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          You've been using Bedda for a month. You clearly like it — and we want to address
          a few things we hear from people who are on the fence about upgrading:
        </p>

        <div style="margin-bottom: 20px; padding: 16px; border-radius: 8px; background: #f9f9f9;">
          <p style="margin: 0 0 6px; font-weight: 600; font-size: 15px;">"I don't use it enough to justify paying"</p>
          <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">
            You've been coming back for 30 days. That's not "not using it" — that's a habit.
            Upgrading removes the 50/day limit so the habit doesn't hit a wall.
          </p>
        </div>

        <div style="margin-bottom: 20px; padding: 16px; border-radius: 8px; background: #f9f9f9;">
          <p style="margin: 0 0 6px; font-weight: 600; font-size: 15px;">"I'm not sure I'll use the premium models"</p>
          <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">
            The 7-day free trial lets you try Claude Opus, GPT-5, and image generation with zero risk.
            If it's not worth $12 after 7 days, cancel before you're charged.
          </p>
        </div>

        <div style="margin-bottom: 24px; padding: 16px; border-radius: 8px; background: #f9f9f9;">
          <p style="margin: 0 0 6px; font-weight: 600; font-size: 15px;">"I'll upgrade when I need it more"</p>
          <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">
            Hitting your daily limit in the middle of a project is the worst time to decide.
            The trial means you can upgrade now and the clock starts on your terms, not when you're blocked.
          </p>
        </div>

        <a href="${APP_URL}/upgrade?plan=plus&source=drip_day30"
           style="display: inline-block; background: #000; color: #fff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; margin-bottom: 24px;">
          Start your 7-day free trial →
        </a>

        <p style="color: #888; font-size: 13px; line-height: 1.6; border-top: 1px solid #eee; padding-top: 20px;">
          Bedda Plus is $12/month. No charge for 7 days. Includes GPT-5, Claude Opus, Gemini Pro,
          Grok, web search, image generation, video generation, and 300 messages/day.
        </p>
        ${unsubFooter(userId)}
      </div>
    `,
  });
}

export async function sendNearLimitEmail(
  email: string,
  userId: string,
  used: number,
  total: number
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const remaining = total - used;
  const percent = Math.round((used / total) * 100);

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `You have ${remaining} free messages left this month`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #111;">
        <div style="background: #fff8e6; border: 1px solid #f5c842; border-radius: 10px; padding: 16px 20px; margin-bottom: 28px;">
          <p style="margin: 0; font-weight: 700; font-size: 15px; color: #7a5c00;">
            You have used ${percent}% of your free messages this month
          </p>
          <p style="margin: 6px 0 0; font-size: 14px; color: #7a5c00;">
            ${remaining} message${remaining === 1 ? "" : "s"} remaining until your free limit resets.
          </p>
        </div>

        <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">Don't get cut off mid-conversation</h1>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Free accounts get 500 messages per month. At your current pace you'll hit the limit soon.
          Upgrade to Plus and you'll never have to think about quotas again.
        </p>

        <div style="background: #f9f9f9; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 14px; font-weight: 700; font-size: 15px; color: #111;">Bedda Plus — $12/month</p>
          <div style="margin-bottom: 10px;">
            <p style="margin: 0; font-size: 14px; color: #555; line-height: 1.5;"><strong style="color: #22a06b;">&#10003; Unlimited messages</strong> — no monthly cap, ever</p>
          </div>
          <div style="margin-bottom: 10px;">
            <p style="margin: 0; font-size: 14px; color: #555; line-height: 1.5;"><strong style="color: #22a06b;">&#10003; GPT-5, Claude Opus, Gemini Pro</strong> — the best models</p>
          </div>
          <div style="margin-bottom: 10px;">
            <p style="margin: 0; font-size: 14px; color: #555; line-height: 1.5;"><strong style="color: #22a06b;">&#10003; Web search, image gen, code execution</strong> — included</p>
          </div>
          <div>
            <p style="margin: 0; font-size: 14px; color: #555; line-height: 1.5;"><strong style="color: #22a06b;">&#10003; Knowledge base &amp; cross-conversation memory</strong> — context that carries over</p>
          </div>
        </div>

        <a href="${APP_URL}/upgrade?plan=plus&source=near_limit_email" style="display: inline-block; background: #000; color: #fff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; margin-bottom: 24px;">
          Start 7-day free trial &rarr;
        </a>

        <p style="color: #888; font-size: 13px; line-height: 1.6; border-top: 1px solid #eee; padding-top: 20px;">
          7 days free, then $12/month. Cancel anytime before the trial ends and you won't be charged.
          Your free messages continue until the end of the month either way.
        </p>
        ${unsubFooter(userId)}
      </div>
    `,
  });
}

export async function sendReengagementEmail(email: string, userId: string): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "You haven't been on Bedda in a while — here's what's new",
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #111;">
        <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">We noticed you've been away 👋</h1>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          It's been a couple of weeks. A few things have changed on Bedda that might be worth a look.
        </p>

        <div style="margin-bottom: 20px; border-left: 3px solid #000; padding-left: 16px;">
          <p style="margin: 0 0 4px; font-weight: 700; font-size: 14px; color: #111;">Try GPT-5 and Claude Opus 4</p>
          <p style="margin: 0; color: #555; font-size: 13px; line-height: 1.5;">
            The latest flagship models from OpenAI and Anthropic are available on Bedda.
            Free plan users can try them with a 7-day Plus trial — no charge until the trial ends.
          </p>
        </div>

        <div style="margin-bottom: 20px; border-left: 3px solid #000; padding-left: 16px;">
          <p style="margin: 0 0 4px; font-weight: 700; font-size: 14px; color: #111;">Compare 4 models on the same prompt</p>
          <p style="margin: 0; color: #555; font-size: 13px; line-height: 1.5;">
            The model comparison arena at
            <a href="${APP_URL}/compare" style="color: #000; font-weight: 600;">/compare</a>
            lets you ask a question once and see answers from GPT-5, Claude, Gemini, and Grok side by side.
            Takes about 10 seconds and is surprisingly useful.
          </p>
        </div>

        <div style="margin-bottom: 28px; border-left: 3px solid #000; padding-left: 16px;">
          <p style="margin: 0 0 4px; font-weight: 700; font-size: 14px; color: #111;">Generate images inline or in the studio</p>
          <p style="margin: 0; color: #555; font-size: 13px; line-height: 1.5;">
            Type "generate an image of..." in any chat, or head to
            <a href="${APP_URL}/studio" style="color: #000; font-weight: 600;">/studio</a>
            to create images and videos side by side using DALL·E 3, Imagen 3, and Flux.
          </p>
        </div>

        <a href="${APP_URL}" style="display: inline-block; background: #000; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin-bottom: 24px;">
          Open Bedda →
        </a>

        <p style="color: #888; font-size: 13px; line-height: 1.6; border-top: 1px solid #eee; padding-top: 20px; margin-top: 8px;">
          Want access to every model with no daily limits?
          <a href="${APP_URL}/upgrade?plan=plus&source=reengagement_email" style="color: #000; font-weight: 600;">Start a 7-day free trial ($12/mo after)</a>
          — cancel any time before the trial ends.
        </p>
        ${unsubFooter(userId)}
      </div>
    `,
  });
}
