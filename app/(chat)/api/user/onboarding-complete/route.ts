import { auth } from "@/app/(auth)/auth";
import { markOnboardingComplete } from "@/lib/db/queries";

export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  await markOnboardingComplete(session.user.id);
  return new Response(null, { status: 204 });
}
