import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<void> {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Bedda <onboarding@resend.dev>",
    to: email,
    subject: "Reset your Bedda password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="margin-bottom: 16px;">Reset your password</h2>
        <p style="color: #555; margin-bottom: 24px;">
          We received a request to reset the password for your Bedda account.
          Click the button below to choose a new password. This link expires in 1 hour.
        </p>
        <a href="${resetUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
          Reset Password
        </a>
        <p style="color: #888; font-size: 13px; margin-top: 24px;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
        <p style="color: #aaa; font-size: 12px; margin-top: 8px;">
          Or copy this link: ${resetUrl}
        </p>
      </div>
    `,
  });
}
