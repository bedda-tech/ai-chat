import { Resend } from "resend";
import { unsubscribeUrl } from "./unsub-token";

const FROM = process.env.RESEND_FROM_EMAIL ?? "Bedda <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.bedda.ai";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Emails the user that a scheduled task ran, with a preview and a link to the chat. */
export async function sendScheduledTaskEmail(opts: {
  email: string;
  userId: string;
  prompt: string;
  answer: string;
  chatId: string;
}): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const preview = escapeHtml(opts.answer.slice(0, 1500));
  await resend.emails.send({
    from: FROM,
    to: opts.email,
    subject: `Your scheduled task ran: ${opts.prompt.slice(0, 60)}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #111;">
        <h1 style="font-size: 20px; font-weight: 700;">Your scheduled task ran</h1>
        <p style="color: #555; font-size: 14px;"><strong>Task:</strong> ${escapeHtml(opts.prompt)}</p>
        <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6; border-left: 3px solid #000; padding-left: 16px; margin: 16px 0;">${preview}</div>
        <a href="${APP_URL}/chat/${opts.chatId}" style="display: inline-block; background: #000; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-size: 14px;">Open the chat</a>
        <p style="color: #bbb; font-size: 12px; margin-top: 24px;">
          Manage schedules in <a href="${APP_URL}/settings" style="color: #bbb;">Settings</a>.
          <a href="${unsubscribeUrl(opts.userId)}" style="color: #bbb;">Unsubscribe</a>
        </p>
      </div>
    `,
  });
}
