import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { UpgradeInitiator } from "@/components/upgrade-initiator";

const VALID_PLANS = ["plus", "pro", "max"] as const;
const VALID_PERIODS = ["monthly", "annual"] as const;
type PlanName = (typeof VALID_PLANS)[number];
type BillingPeriod = (typeof VALID_PERIODS)[number];

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; billing?: string }>;
}) {
  const { plan, billing } = await searchParams;

  // Validate params
  const validPlan = VALID_PLANS.includes(plan as PlanName)
    ? (plan as PlanName)
    : "plus";
  const validBilling = VALID_PERIODS.includes(billing as BillingPeriod)
    ? (billing as BillingPeriod)
    : "monthly";

  const session = await auth();

  // If no session or guest user, redirect to register with plan context
  const isGuest = /^guest-\d+$/.test(session?.user?.email ?? "");
  if (!session?.user || isGuest || !session.user.email) {
    redirect(`/register?plan=${validPlan}`);
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <UpgradeInitiator billingPeriod={validBilling} plan={validPlan} />
    </div>
  );
}
