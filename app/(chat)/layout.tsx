import { cookies } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import { DataStreamProvider } from "@/components/data-stream-provider";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { TrialBanner } from "@/components/trial-banner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getUserOnboardingStatus } from "@/lib/db/queries";
import { auth } from "../(auth)/auth";

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get("sidebar_state")?.value !== "true";
  const adminUser = isAdmin(session?.user?.email);

  const isRealUser = !!session?.user?.id && session.user.type !== "guest";
  const showTour = isRealUser
    ? !(await getUserOnboardingStatus(session.user.id))
    : false;

  return (
    <>
      <DataStreamProvider>
        <SidebarProvider defaultOpen={!isCollapsed}>
          <AppSidebar isAdmin={adminUser} user={session?.user} />
          <SidebarInset>
            <TrialBanner />
            {children}
          </SidebarInset>
        </SidebarProvider>
        {showTour && <OnboardingTour />}
      </DataStreamProvider>
    </>
  );
}
