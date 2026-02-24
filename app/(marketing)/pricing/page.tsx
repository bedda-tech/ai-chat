import Link from "next/link";
import { Check, X, Zap, Crown, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Try all the AI models for free",
    icon: null,
    features: [
      "50 messages per day",
      "500 messages per month",
      "Standard AI models (Haiku, Flash, GPT-5 Nano, DeepSeek)",
      "5 image generations per day",
      "Basic text artifacts",
      "File uploads (10MB)",
    ],
    cta: "Get Started Free",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Plus",
    price: "$12",
    period: "/month",
    description: "All frontier models. One subscription.",
    icon: Zap,
    features: [
      "300 messages per day",
      "Unlimited monthly messages",
      "ALL 135+ AI models (Claude Opus, GPT-5, Gemini Pro, Grok 4, etc.)",
      "100 image generations per day",
      "All artifact types (text, code, image, spreadsheet)",
      "Web search with citations",
      "File uploads (25MB)",
      "5 active projects",
    ],
    cta: "Start Plus",
    href: "/register",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$25",
    period: "/month",
    description: "For power users and professionals",
    icon: Crown,
    features: [
      "1,500 messages per day",
      "Unlimited monthly messages",
      "ALL models + early access to new releases",
      "Image Studio (unlimited generation, editing, variations)",
      "Video Studio (20 videos/day)",
      "Code execution sandbox",
      "Voice input & audio transcription",
      "25 projects with knowledge bases",
      "Cross-conversation memory",
      "Priority model access",
    ],
    cta: "Start Pro",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Max",
    price: "$50",
    period: "/month",
    description: "Unlimited everything for teams",
    icon: Rocket,
    features: [
      "5,000 messages per day (effectively unlimited)",
      "Everything in Pro",
      "Team workspace (up to 5 members)",
      "API access (50,000 credits/mo)",
      "Video Studio (50 videos/day + longer clips)",
      "Batch image generation",
      "Custom system instructions",
      "Priority support",
      "Beta model access",
    ],
    cta: "Start Max",
    href: "/register",
    highlighted: false,
  },
];

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
    feature: "Video generation",
    bedda: true,
    claude: false,
    chatgpt: true,
    gemini: true,
  },
  {
    feature: "Code execution",
    bedda: true,
    claude: true,
    chatgpt: true,
    gemini: true,
  },
  {
    feature: "Web search",
    bedda: true,
    claude: true,
    chatgpt: true,
    gemini: true,
  },
  {
    feature: "Total models",
    bedda: "135+",
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
          Access Claude, ChatGPT, Gemini, Grok, DeepSeek, and 135+ more models.
          Why pay for three subscriptions when one does it all?
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto mt-16 grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={
              tier.highlighted
                ? "border-primary relative shadow-lg scale-[1.02]"
                : "relative"
            }
          >
            {tier.highlighted && (
              <div className="bg-primary text-primary-foreground absolute top-0 right-0 rounded-bl-lg rounded-tr-lg px-3 py-1 text-sm font-medium">
                Best Value
              </div>
            )}
            <CardHeader>
              <div className="flex items-center gap-2">
                {tier.icon && <tier.icon className="h-5 w-5" />}
                <CardTitle className="text-xl">{tier.name}</CardTitle>
              </div>
              <CardDescription>{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.period && (
                  <span className="text-muted-foreground text-sm">
                    {tier.period}
                  </span>
                )}
              </div>
              <ul className="space-y-2.5">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start space-x-3">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                asChild
                className="w-full"
                variant={tier.highlighted ? "default" : "outline"}
              >
                <Link href={tier.href}>{tier.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Value Proposition */}
      <div className="mx-auto mt-20 max-w-3xl text-center">
        <h2 className="mb-4 font-bold text-2xl">
          Stop paying for multiple AI subscriptions
        </h2>
        <p className="text-muted-foreground text-lg">
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
                <tr key={row.feature} className="border-b">
                  <td className="p-3 font-medium">{row.feature}</td>
                  <td className="p-3 text-center bg-primary/5">
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
              Your limit resets at midnight UTC. You can upgrade to a higher tier
              at any time for more messages. We&apos;ll notify you when
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
              Do you offer refunds?
            </h3>
            <p className="text-muted-foreground">
              We offer a 7-day money-back guarantee for all paid plans. If
              you&apos;re not satisfied, contact support for a full refund.
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
        <Button asChild variant="outline">
          <Link href="mailto:matt@bedda.tech">Contact Sales</Link>
        </Button>
      </div>
    </div>
  );
}
