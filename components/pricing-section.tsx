"use client";

import { Check, Crown, Rocket, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type BillingPeriod = "monthly" | "annual";

const tiers = [
  {
    name: "Free",
    monthlyPrice: "$0",
    annualPrice: "$0",
    annualPerMonth: null,
    period: "",
    description: "Try all the AI models for free",
    icon: null,
    features: [
      "50 messages per day",
      "500 messages per month",
      "Standard AI models (Haiku, Flash, GPT-5 Nano, DeepSeek)",
      "Basic text and code artifacts",
      "File uploads (images, documents)",
    ],
    cta: "Get Started Free",
    href: "/register",
    highlighted: false,
    planKey: null,
  },
  {
    name: "Plus",
    monthlyPrice: "$12",
    annualPrice: "$115.20",
    annualPerMonth: "$9.60",
    period: "/month",
    description: "All frontier models. One subscription.",
    icon: Zap,
    features: [
      "300 messages per day",
      "Unlimited monthly messages",
      "ALL 36+ AI models (Claude Opus, GPT-5, Gemini Pro, Grok 4, etc.)",
      "Web search with citations",
      "Code execution (Python & JavaScript sandbox)",
      "Image & video generation",
      "Knowledge base & document RAG",
      "Cross-conversation memory",
      "Audio transcription",
      "File uploads (25MB)",
    ],
    cta: "Start free trial",
    trialNote: "7 days free, then $12/mo",
    href: "/upgrade?plan=plus",
    highlighted: true,
    planKey: "plus",
  },
  {
    name: "Pro",
    monthlyPrice: "$25",
    annualPrice: "$240",
    annualPerMonth: "$20",
    period: "/month",
    description: "For power users and professionals",
    icon: Crown,
    features: [
      "1,500 messages per day",
      "Unlimited monthly messages",
      "Everything in Plus",
      "5× more daily capacity than Plus",
      "New model integrations added immediately on release",
    ],
    cta: "Start Pro",
    href: "/upgrade?plan=pro",
    highlighted: false,
    planKey: "pro",
  },
  {
    name: "Max",
    monthlyPrice: "$50",
    annualPrice: "$480",
    annualPerMonth: "$40",
    period: "/month",
    description: "Maximum capacity for heavy users",
    icon: Rocket,
    features: [
      "5,000 messages per day (effectively unlimited)",
      "Everything in Pro",
      "Lowest cost per message of any plan",
      "Ideal for heavy AI users and small teams",
    ],
    cta: "Start Max",
    href: "/upgrade?plan=max",
    highlighted: false,
    planKey: "max",
  },
];

export function PricingSection() {
  const [billing, setBilling] = useState<BillingPeriod>("monthly");

  return (
    <>
      {/* Billing Toggle */}
      <div className="mx-auto mt-10 flex items-center justify-center gap-3">
        <span
          className={`font-medium text-sm ${billing === "monthly" ? "text-foreground" : "text-muted-foreground"}`}
        >
          Monthly
        </span>
        <button
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            billing === "annual" ? "bg-primary" : "bg-input"
          }`}
          onClick={() =>
            setBilling(billing === "monthly" ? "annual" : "monthly")
          }
          type="button"
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              billing === "annual" ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span
          className={`font-medium text-sm ${billing === "annual" ? "text-foreground" : "text-muted-foreground"}`}
        >
          Annual
        </span>
        {billing === "annual" && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-700 text-xs dark:bg-green-900/30 dark:text-green-400">
            Save 20%
          </span>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto mt-10 grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => {
          const displayPrice =
            billing === "annual" && tier.annualPerMonth
              ? tier.annualPerMonth
              : tier.monthlyPrice;
          const href = tier.planKey
            ? `${tier.href}${billing === "annual" ? "&billing=annual" : ""}`
            : tier.href;

          return (
            <Card
              className={
                tier.highlighted
                  ? "relative scale-[1.02] border-primary shadow-lg"
                  : "relative"
              }
              key={tier.name}
            >
              {tier.highlighted && (
                <div className="absolute top-0 right-0 rounded-tr-lg rounded-bl-lg bg-primary px-3 py-1 font-medium text-primary-foreground text-sm">
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
                  <span className="font-bold text-4xl">{displayPrice}</span>
                  {tier.period && (
                    <span className="text-muted-foreground text-sm">
                      {tier.period}
                    </span>
                  )}
                </div>
                {billing === "annual" &&
                  tier.annualPrice &&
                  tier.annualPerMonth && (
                    <p className="text-muted-foreground text-xs">
                      Billed {tier.annualPrice}/year
                    </p>
                  )}
                <ul className="space-y-2.5">
                  {tier.features.map((feature) => (
                    <li className="flex items-start space-x-3" key={feature}>
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button
                  asChild
                  className="w-full"
                  variant={tier.highlighted ? "default" : "outline"}
                >
                  <Link href={href}>{tier.cta}</Link>
                </Button>
                {"trialNote" in tier &&
                  tier.trialNote &&
                  billing === "monthly" && (
                    <p className="text-center text-muted-foreground text-xs">
                      {tier.trialNote}
                    </p>
                  )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </>
  );
}
