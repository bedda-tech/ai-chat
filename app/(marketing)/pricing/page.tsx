import { Check, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PricingSection } from "@/components/pricing-section";

export const metadata: Metadata = {
  title: "Pricing — bedda.ai | All AI Models, One Subscription",
  description:
    "One subscription unlocks Claude 4, GPT-5, Gemini, Grok, DeepSeek and 36+ AI models. Plus plan starts at $12/mo — cheaper than a single ChatGPT Plus subscription. 7-day free trial.",
  openGraph: {
    title: "bedda.ai Pricing — Less Than ChatGPT Plus, More AI Models",
    description:
      "Why pay $20+ for each AI separately? bedda.ai gives you Claude, GPT-5, Gemini, Grok and 36+ models for $12/month. Start free today.",
  },
  alternates: {
    canonical: "https://bedda.ai/pricing",
  },
};

const comparisonData = [
  {
    feature: "Price",
    bedda: "$12/mo",
    claude: "$20/mo",
    chatgpt: "$20/mo",
    gemini: "$19.99/mo",
  },
  {
    feature: "Claude models",
    bedda: true,
    claude: true,
    chatgpt: false,
    gemini: false,
  },
  {
    feature: "GPT models",
    bedda: true,
    claude: false,
    chatgpt: true,
    gemini: false,
  },
  {
    feature: "Gemini models",
    bedda: true,
    claude: false,
    chatgpt: false,
    gemini: true,
  },
  {
    feature: "Grok models",
    bedda: true,
    claude: false,
    chatgpt: false,
    gemini: false,
  },
  {
    feature: "DeepSeek models",
    bedda: true,
    claude: false,
    chatgpt: false,
    gemini: false,
  },
  {
    feature: "Image generation",
    bedda: true,
    claude: false,
    chatgpt: true,
    gemini: true,
  },
  {
    feature: "Audio transcription",
    bedda: true,
    claude: false,
    chatgpt: true,
    gemini: false,
  },
  {
    feature: "Code execution",
    bedda: true,
    claude: true,
    chatgpt: true,
    gemini: true,
  },
  {
    feature: "Video generation",
    bedda: true,
    claude: false,
    chatgpt: true,
    gemini: true,
  },
  {
    feature: "Model comparison arena",
    bedda: true,
    claude: false,
    chatgpt: false,
    gemini: false,
  },
  {
    feature: "Total models",
    bedda: "36+",
    claude: "4",
    chatgpt: "5",
    gemini: "6",
  },
];

function ComparisonCell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="font-medium text-sm">{value}</span>;
  }
  return value ? (
    <Check className="mx-auto h-5 w-5 text-green-500" />
  ) : (
    <X className="mx-auto h-5 w-5 text-red-400" />
  );
}

export default function PricingPage() {
  return (
    <div className="container py-12 md:py-24">
      {/* Hero */}
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
        <h1 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          All the world&apos;s best AI models.
          <br />
          One simple subscription.
        </h1>
        <p className="max-w-[85%] text-muted-foreground leading-normal sm:text-lg sm:leading-7">
          Access Claude, ChatGPT, Gemini, Grok, DeepSeek, and 36+ more models.
          Why pay for three subscriptions when one does it all?
        </p>
      </div>

      {/* Pricing toggle + cards */}
      <PricingSection />

      {/* Zero-friction try link */}
      <p className="mt-6 text-center text-muted-foreground text-sm">
        Not ready to commit?{" "}
        <Link
          className="underline underline-offset-4 transition-colors hover:text-foreground"
          href="/api/auth/guest?redirectUrl=/"
        >
          Try bedda without an account →
        </Link>
      </p>

      {/* Value Proposition */}
      <div className="mx-auto mt-20 max-w-3xl text-center">
        <h2 className="mb-4 font-bold text-2xl">
          Stop paying for multiple AI subscriptions
        </h2>
        <p className="text-lg text-muted-foreground">
          Claude Pro costs $20/mo. ChatGPT Plus costs $20/mo. Gemini Pro costs
          $20/mo. That&apos;s $60/mo for three services. Bedda Plus gives you
          all of them for $12/mo.
        </p>
      </div>

      {/* Comparison Table */}
      <div className="mx-auto mt-16 max-w-4xl">
        <h2 className="mb-8 text-center font-bold text-2xl">
          Bedda vs. the competition
        </h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">Feature</th>
                <th className="p-3 text-center font-bold text-primary">
                  Bedda Plus
                </th>
                <th className="p-3 text-center font-medium">Claude Pro</th>
                <th className="p-3 text-center font-medium">ChatGPT Plus</th>
                <th className="p-3 text-center font-medium">Gemini Pro</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row) => (
                <tr className="border-b" key={row.feature}>
                  <td className="p-3 font-medium">{row.feature}</td>
                  <td className="bg-primary/5 p-3 text-center">
                    <ComparisonCell value={row.bedda} />
                  </td>
                  <td className="p-3 text-center">
                    <ComparisonCell value={row.claude} />
                  </td>
                  <td className="p-3 text-center">
                    <ComparisonCell value={row.chatgpt} />
                  </td>
                  <td className="p-3 text-center">
                    <ComparisonCell value={row.gemini} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="mx-auto mt-20 max-w-3xl">
        <h2 className="mb-8 text-center font-bold text-2xl">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 font-semibold text-lg">
              How is this cheaper than individual AI subscriptions?
            </h3>
            <p className="text-muted-foreground">
              We route through the Vercel AI Gateway, which gives us access to
              all major AI providers at API rates. Combined with prompt caching
              (50-90% cost reduction) and smart routing, we can offer all models
              at a fraction of individual subscription costs.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-lg">
              Can I switch between models mid-conversation?
            </h3>
            <p className="text-muted-foreground">
              Yes! You can switch models at any time during a conversation. Use
              Claude for writing, GPT for coding, Gemini for research, and Grok
              for analysis -- all in the same chat.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-lg">
              What happens when I hit my daily limit?
            </h3>
            <p className="text-muted-foreground">
              Your limit resets at midnight UTC. You can upgrade to a higher
              tier at any time for more messages. We&apos;ll notify you when
              you&apos;re approaching your limit.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-lg">
              Can I cancel anytime?
            </h3>
            <p className="text-muted-foreground">
              Yes, you can cancel anytime from your account settings. Your
              subscription will remain active until the end of your billing
              period, and you won&apos;t be charged again.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-lg">
              Is there a free trial?
            </h3>
            <p className="text-muted-foreground">
              Yes! Bedda Plus includes a 7-day free trial (no credit card
              required to start). Referred users get a 14-day trial. You can
              cancel before the trial ends and you won&apos;t be charged.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-lg">
              Do you offer refunds?
            </h3>
            <p className="text-muted-foreground">
              We offer a 7-day money-back guarantee for all paid plans. If
              you&apos;re not satisfied, contact support for a full refund.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-lg">
              Is annual billing available?
            </h3>
            <p className="text-muted-foreground">
              Yes! Choose annual billing on the pricing toggle above and save
              20% compared to month-to-month. Annual plans are billed once per
              year and include all the same features.
            </p>
          </div>
        </div>
      </div>

      {/* Enterprise CTA */}
      <div className="mx-auto mt-20 max-w-2xl rounded-lg border bg-muted/30 p-8 text-center">
        <h2 className="mb-2 font-bold text-2xl">Need enterprise features?</h2>
        <p className="mb-6 text-muted-foreground">
          SSO, audit logging, custom model routing, SLA guarantees, and
          dedicated support for your organization.
        </p>
        <Link
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 font-medium text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          href="mailto:matt@bedda.tech"
        >
          Contact Sales
        </Link>
      </div>
    </div>
  );
}
