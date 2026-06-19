import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PLUS_FEATURES = [
  "300 messages/day across all 36+ AI models",
  "Claude Opus, GPT-5, Gemini Pro, Grok 4, Mistral Large",
  "Image generation — DALL·E 3, Imagen, Flux",
  "Web search, file uploads, knowledge base RAG",
  "Code execution, artifacts, Mermaid diagrams, slides",
  "7-day free trial — no charge today",
];

export default function SubscriptionCanceledPage() {
  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="space-y-2 text-center">
          <p className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
            No charges were made
          </p>
          <h1 className="font-bold text-3xl">
            Still thinking? That&apos;s okay.
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s a quick recap of what you&apos;d be getting.
          </p>
        </div>

        <Card className="border-2">
          <CardHeader className="pb-3">
            <div className="flex items-baseline justify-between">
              <CardTitle className="text-xl">Bedda Plus</CardTitle>
              <div className="text-right">
                <span className="font-bold text-2xl">$12</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
            </div>
            <p className="font-medium text-green-600 text-sm">
              7-day free trial included — cancel anytime
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {PLUS_FEATURES.map((f) => (
                <li className="flex items-start gap-2 text-sm" key={f}>
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button asChild className="w-full" size="lg">
              <Link href="/upgrade?plan=plus&source=canceled_page">
                Start my free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <div className="flex w-full gap-3">
              <Button asChild className="flex-1" variant="outline">
                <Link href="/pricing">Compare all plans</Link>
              </Button>
              <Button asChild className="flex-1" variant="ghost">
                <Link href="/">Continue free</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-muted-foreground text-xs">
          Questions? Email us at{" "}
          <a className="underline" href="mailto:support@bedda.ai">
            support@bedda.ai
          </a>{" "}
          — we respond within 24 hours.
        </p>
      </div>
    </div>
  );
}
