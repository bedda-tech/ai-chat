import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Check,
  GitBranch,
  MessageSquare,
  Settings,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Bedda for Teams — Every AI Model, Built for Collaboration",
  description:
    "Give your team access to Claude, GPT-5, Gemini, Grok and 36+ AI models for $12/user/mo. Shared workspaces, team knowledge base, real-time collaboration, and admin controls.",
  openGraph: {
    title: "Bedda for Teams — Every AI Model, Built for Collaboration",
    description:
      "Stop paying $30/user for ChatGPT Teams when you can get 36+ AI models for $12/user/mo. Team workspaces, shared knowledge base, audit logs, and enterprise controls.",
    url: "https://bedda.ai/teams",
  },
  alternates: {
    canonical: "https://bedda.ai/teams",
  },
};

const teamFeatures = [
  {
    icon: BookOpen,
    title: "Shared Knowledge Base",
    description:
      "Upload your company docs, SOPs, product specs, and research once. Every team member and every AI model can reference them via RAG — no copy-pasting context every session.",
  },
  {
    icon: MessageSquare,
    title: "Real-time Collaborative Chats",
    description:
      "Work on the same chat thread together. See teammates' cursors and messages live. Share conversations with your team in one click — no screenshots, no copy-pasting.",
  },
  {
    icon: GitBranch,
    title: "Project Workspaces",
    description:
      "Organize chats by project with shared system instructions. A marketing project can default to 'tone: friendly, audience: consumers' while your dev project defaults to 'language: TypeScript'.",
  },
  {
    icon: Settings,
    title: "Admin Model Policy",
    description:
      "Choose which models your team can use. Block expensive models for cost control, allowlist approved models for compliance, or set a monthly cost cap per team.",
  },
  {
    icon: Shield,
    title: "Audit Logs",
    description:
      "Full audit trail of team activity — who asked what, which model was used, when. Export for compliance reviews, security audits, or usage analysis.",
  },
  {
    icon: Bot,
    title: "Bots in Every Tool Your Team Uses",
    description:
      "Bedda bots are available in Slack, Discord, Microsoft Teams, GitHub, Telegram, and WhatsApp. Your team asks AI where they already work — no context switching.",
  },
];

const comparisons = [
  {
    tool: "ChatGPT Teams",
    price: "$30/user/mo",
    models: "GPT-4o only",
    teamFeatures: "Basic sharing",
    verdict: "Expensive, one model",
  },
  {
    tool: "Microsoft Copilot",
    price: "$30/user/mo",
    models: "GPT-4o only",
    teamFeatures: "M365 integration",
    verdict: "Tied to Microsoft ecosystem",
  },
  {
    tool: "Notion AI",
    price: "$10/user/mo add-on",
    models: "Limited selection",
    teamFeatures: "Notion-only",
    verdict: "Only works inside Notion",
  },
  {
    tool: "bedda Teams",
    price: "$12/user/mo",
    models: "36+ models",
    teamFeatures: "Full team suite",
    verdict: "✓ Best value",
    highlight: true,
  },
];

const faq = [
  {
    q: "How does team billing work?",
    a: "Each team member signs up for their own bedda subscription (Plus at $12/mo, Pro at $25/mo, or Max at $50/mo). The team admin can optionally set up per-seat billing through the Settings page, which manages seats centrally via Stripe.",
  },
  {
    q: "Can I control which AI models my team uses?",
    a: "Yes. Team admins on Max plan can set an organization model policy — allowlist specific models, denylist others, and set a monthly cost cap. Changes take effect within 60 seconds for all team members.",
  },
  {
    q: "Is team data kept separate from individual accounts?",
    a: "Team shared chats and team knowledge base documents are stored under the team workspace and are only accessible to team members. Individual chats and personal knowledge base documents remain private to each user.",
  },
  {
    q: "How do I invite team members?",
    a: "From Settings → Teams, create a team and send invite links via email. Each invitee gets a link to accept and join. You can assign members as admins or regular members.",
  },
  {
    q: "Does the Slack bot work for our whole team?",
    a: "Yes. Once your workspace admin installs the Bedda Slack bot, any team member can @mention it in any channel or DM. Each message uses Bedda's AI with the model of your choice.",
  },
  {
    q: "Do you have SSO / SAML for enterprise?",
    a: "Yes. Max plan teams can configure SAML/SSO via WorkOS for enterprise identity providers (Okta, Azure AD, Google Workspace, etc.) from Settings → Enterprise → SSO.",
  },
];

const stats = [
  { value: "36+", label: "AI models" },
  { value: "$12", label: "per user/mo" },
  { value: "6", label: "platform bots" },
  { value: "7-day", label: "free trial" },
];

export default function TeamsPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-muted/50 to-background px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span>Bedda for Teams</span>
          </div>
          <h1 className="mb-4 font-bold text-4xl tracking-tight sm:text-5xl md:text-6xl">
            Every AI model.
            <br />
            <span className="text-primary">Built for your whole team.</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground text-xl">
            Stop paying $30/user for ChatGPT Teams and getting one model. Bedda
            gives your entire team Claude, GPT-5, Gemini, Grok and 36+ AI models
            — with shared workspaces, admin controls, and bots in every tool you
            use. From $12/user/mo.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                Start free trial <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">View pricing</Link>
            </Button>
          </div>
          <p className="mt-4 text-muted-foreground text-sm">
            7-day free trial · No credit card required · Cancel anytime
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b py-10">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div className="text-center" key={stat.label}>
                <div className="font-bold text-3xl text-primary">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team features */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-bold text-3xl tracking-tight">
              Everything your team needs to work with AI
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Beyond just giving everyone access to AI models, bedda is built
              for how teams actually work together.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {teamFeatures.map((feature) => (
              <div className="rounded-lg border p-6" key={feature.title}>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-lg">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison vs team AI tools */}
      <section className="border-y bg-muted/30 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-bold text-3xl tracking-tight">
              The most models. The best value.
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Other team AI tools lock you into one model or charge premium
              prices for basic access. Bedda gives your team the full AI
              ecosystem.
            </p>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-sm">
                    Tool
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-sm">
                    Price
                  </th>
                  <th className="hidden px-4 py-3 text-center font-medium text-sm md:table-cell">
                    AI Models
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-sm">
                    Verdict
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row) => (
                  <tr
                    className={`border-b last:border-0 ${row.highlight ? "bg-primary/5" : ""}`}
                    key={row.tool}
                  >
                    <td className="px-4 py-3 font-medium text-sm">
                      {row.highlight ? (
                        <span className="font-bold text-primary">
                          {row.tool}
                        </span>
                      ) : (
                        row.tool
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {row.highlight ? (
                        <span className="font-bold text-primary">
                          {row.price}
                        </span>
                      ) : (
                        row.price
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-center text-sm md:table-cell">
                      {row.highlight ? (
                        <span className="font-bold text-primary">
                          {row.models}
                        </span>
                      ) : (
                        row.models
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {row.highlight ? (
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {row.verdict}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          {row.verdict}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How to get started */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-bold text-3xl tracking-tight">
              Set up your team in minutes
            </h2>
          </div>
          <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-xl">
                1
              </div>
              <h3 className="mb-2 font-semibold">Sign up for bedda</h3>
              <p className="text-muted-foreground text-sm">
                Create your account and start your 7-day free trial. Choose Plus
                ($12/mo), Pro ($25/mo), or Max ($50/mo).
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-xl">
                2
              </div>
              <h3 className="mb-2 font-semibold">Create a team workspace</h3>
              <p className="text-muted-foreground text-sm">
                From Settings → Teams, create your team and invite members by
                email. They&apos;ll get a link to join immediately.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-xl">
                3
              </div>
              <h3 className="mb-2 font-semibold">Upload your docs & ship</h3>
              <p className="text-muted-foreground text-sm">
                Add your company knowledge base, configure model policy, and
                install bots in Slack or Teams. Done.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What teams can do */}
      <section className="border-y bg-muted/30 py-20">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-6 font-bold text-2xl tracking-tight">
                What your team can do with bedda
              </h2>
              <ul className="space-y-3">
                {[
                  "Onboard new hires faster with an AI that knows your documentation",
                  "Run client proposals through multiple models and pick the best draft",
                  "Let engineers use GPT-5 for code while marketers use Claude for copy — same subscription",
                  "Share a research thread with the whole team instead of forwarding screenshots",
                  "Have your Slack bot answer support questions using your product docs",
                  "Track which models your team uses most and optimize your plan",
                  "Get audit logs for compliance and security reviews",
                  "Configure SAML/SSO so team members sign in with their company identity",
                ].map((item) => (
                  <li className="flex items-start gap-2" key={item}>
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    <span className="text-muted-foreground text-sm">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border bg-background p-6">
                <div className="mb-3 flex items-center gap-3">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold">
                    Productivity gains teams report
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Time saved on first drafts
                      </span>
                      <span className="font-medium">~60%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-2 w-3/5 rounded-full bg-primary" />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Reduction in tool-switching
                      </span>
                      <span className="font-medium">~80%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-2 w-4/5 rounded-full bg-primary" />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        AI adoption across team
                      </span>
                      <span className="font-medium">~90%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-2 w-[90%] rounded-full bg-primary" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-background p-6">
                <div className="mb-3 flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold">
                    Cost comparison for a 10-person team
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      ChatGPT Teams (10 seats)
                    </span>
                    <span className="font-medium">$300/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Bedda Plus (10 seats)
                    </span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      $120/mo
                    </span>
                  </div>
                  <div className="mt-2 rounded-md bg-green-500/10 p-2 text-center text-green-700 dark:text-green-400">
                    Save $180/mo · Get 36+ models instead of 1
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-bold text-3xl tracking-tight">
              Frequently asked questions
            </h2>
          </div>
          <div className="mx-auto max-w-3xl space-y-6">
            {faq.map((item) => (
              <div className="rounded-lg border p-6" key={item.q}>
                <h3 className="mb-2 font-semibold">{item.q}</h3>
                <p className="text-muted-foreground text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t bg-primary py-20 text-primary-foreground">
        <div className="container text-center">
          <h2 className="mb-4 font-bold text-3xl tracking-tight">
            Give your team the full AI toolkit
          </h2>
          <p className="mx-auto mb-8 max-w-xl opacity-90">
            Start with a 7-day free trial. No credit card required. Set up your
            team workspace in minutes.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" variant="secondary">
              <Link href="/register">
                Start free trial <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              size="lg"
              variant="outline"
            >
              <Link href="/pricing">See all plans</Link>
            </Button>
          </div>
          <p className="mt-6 text-primary-foreground/70 text-sm">
            Already using bedda?{" "}
            <Link className="underline hover:no-underline" href="/login">
              Sign in
            </Link>{" "}
            and create your team from Settings.
          </p>
        </div>
      </section>
    </div>
  );
}
