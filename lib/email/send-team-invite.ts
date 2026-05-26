import { Resend } from "resend";

export async function sendTeamInviteEmail(
  email: string,
  teamName: string,
  inviterEmail: string,
  inviteUrl: string
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Bedda <onboarding@resend.dev>",
    to: email,
    subject: `You've been invited to join ${teamName} on Bedda`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="margin-bottom: 16px;">Team invitation</h2>
        <p style="color: #555; margin-bottom: 8px;">
          <strong>${inviterEmail}</strong> has invited you to join the team <strong>${teamName}</strong> on Bedda.
        </p>
        <p style="color: #555; margin-bottom: 24px;">
          Click the button below to accept the invitation. This link expires in 7 days.
        </p>
        <a href="${inviteUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
          Accept Invitation
        </a>
        <p style="color: #888; font-size: 13px; margin-top: 24px;">
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
        <p style="color: #aaa; font-size: 12px; margin-top: 8px;">
          Or copy this link: ${inviteUrl}
        </p>
      </div>
    `,
  });
}
