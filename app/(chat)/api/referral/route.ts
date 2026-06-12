import { auth } from "@/app/(auth)/auth";
import { getUserReferralInfo } from "@/lib/db/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const info = await getUserReferralInfo(session.user.id);
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://www.bedda.tech";

  return Response.json({
    referralCode: info.referralCode,
    referralCount: info.referralCount,
    referralUrl: info.referralCode
      ? `${appUrl}/join/${info.referralCode}`
      : null,
  });
}
