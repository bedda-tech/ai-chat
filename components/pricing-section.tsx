"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Zap, Crown, Rocket } from "lucide-react";
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
      "5 image generations per day",
      "Basic text artifacts",
      "File uploads (10MB)",
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
      "ALL 30+ AI models (Claude Opus, GPT-5, Gemini Pro, Grok 4, etc.)",
      "100 image generations per day",
      "All artifact types (text, code, image, spreadsheet)",
      "Web search with citations",
      "File uploads (25MB)",
      "5 active projects",
    ],
    cta: "Start Plus",
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
        <span className={`text-sm font-medium ${billing === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
          Monthly
        </span>
        <button
          type="button"
          onClick={() => setBilling(billing === "monthly" ? "annual" : "monthly")}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            billing === "annual" ? "bg-primary" : "bg-input"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              billing === "annual" ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${billing === "annual" ? "text-foreground" : "text-muted-foreground"}`}>
          Annual
        </span>
        {billing === "annual" && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Save 20%
          </span>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto mt-10 grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => {
          const displayPrice = billing === "annual" && tier.annualPerMonth
            ? tier.annualPerMonth
            : tier.monthlyPrice;
          const href = tier.planKey
            ? `${tier.href}${billing === "annual" ? "&billing=annual" : ""}`
            : tier.href;

          return (
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
                  <span className="text-4xl font-bold">{displayPrice}</span>
                  {tier.period && (
                    <span className="text-muted-foreground text-sm">
                      {tier.period}
                    </span>
                  )}
                </div>
                {billing === "annual" && tier.annualPrice && tier.annualPerMonth && (
                  <p className="text-xs text-muted-foreground">
                    Billed {tier.annualPrice}/year
                  </p>
                )}
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
                  <Link href={href}>{tier.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </>
  );
}
