import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { ApiKeysManagement } from "@/components/api-keys-management";
import { CustomInstructionsForm } from "@/components/custom-instructions-form";
import { McpServersForm } from "@/components/mcp-servers-form";
import { MemoryManagement } from "@/components/memory-management";
import { PluginToolsForm } from "@/components/plugin-tools-form";
import { ReferralCard } from "@/components/referral-card";
import { SubscriptionManagement } from "@/components/subscription-management";
import { TeamManagement } from "@/components/team-management";
import { UsageDisplay } from "@/components/usage-display";
import { getUserPreferences } from "@/lib/db/queries";
import { getUserTier } from "@/lib/usage/tracking";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  let tier: "free" | "pro" | "premium" | "enterprise" = "free";
  try {
    tier = await getUserTier(session.user.id);
  } catch (error) {
    console.error("Error getting user tier:", error);
    // Default to free tier on error
  }

  let prefs = null;
  try {
    prefs = await getUserPreferences(session.user.id);
  } catch (error) {
    console.error("Error getting user preferences:", error);
  }

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <div className="mb-8">
        <h1 className="font-bold text-3xl tracking-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account, subscription, and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <SubscriptionManagement currentTier={tier} />
        </div>
        <div>
          <UsageDisplay />
        </div>
      </div>

      <div className="mt-6 rounded-lg border p-6">
        <h2 className="mb-4 font-semibold text-lg">Personalization</h2>
        <CustomInstructionsForm
          initialValue={prefs?.customInstructions ?? ""}
        />
      </div>

      <div className="mt-6 rounded-lg border p-6">
        <h2 className="mb-4 font-semibold text-lg">Memory</h2>
        <MemoryManagement />
      </div>

      <div className="mt-6 rounded-lg border p-6">
        <h2 className="mb-4 font-semibold text-lg">API Keys</h2>
        <ApiKeysManagement />
      </div>

      <div className="mt-6 rounded-lg border p-6">
        <h2 className="mb-4 font-semibold text-lg">Teams</h2>
        <TeamManagement userId={session.user.id} />
      </div>

      <div className="mt-6 rounded-lg border p-6">
        <h2 className="mb-4 font-semibold text-lg">Integrations</h2>
        <McpServersForm />
      </div>

      <div className="mt-6 rounded-lg border p-6">
        <h2 className="mb-4 font-semibold text-lg">Plugin Tools</h2>
        <PluginToolsForm />
      </div>

      <div className="mt-6 rounded-lg border p-6">
        <h2 className="mb-4 font-semibold text-lg">Refer a Friend</h2>
        <ReferralCard />
      </div>
    </div>
  );
}
