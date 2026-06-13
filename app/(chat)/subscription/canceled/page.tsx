import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PLUS_FEATURES = [
  "300 messages/day across all 30+ AI models",
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
        <div className="text-center space-y-2">
          <p className="text-muted-foreground text-sm uppercase tracking-wide font-medium">
            No charges were made
          </p>
          <h1 className="text-3xl font-bold">Still thinking? That&apos;s okay.</h1>
          <p className="text-muted-foreground">
            Here&apos;s a quick recap of what you&apos;d be getting.
          </p>
        </div>

        <Card className="border-2">
          <CardHeader className="pb-3">
            <div className="flex items-baseline justify-between">
              <CardTitle className="text-xl">Bedda Plus</CardTitle>
              <div className="text-right">
                <span className="text-2xl font-bold">$12</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
            </div>
            <p className="text-sm text-green-600 font-medium">
              7-day free trial included — cancel anytime
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {PLUS_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
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
            <div className="flex gap-3 w-full">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/pricing">Compare all plans</Link>
              </Button>
              <Button asChild variant="ghost" className="flex-1">
                <Link href="/">Continue free</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Questions? Email us at{" "}
          <a href="mailto:support@bedda.ai" className="underline">
            support@bedda.ai
          </a>{" "}
          — we respond within 24 hours.
        </p>
      </div>
    </div>
  );
}
