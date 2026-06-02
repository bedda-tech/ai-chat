import * as Sentry from "@sentry/nextjs";
import { registerOTel } from "@vercel/otel";
import type { InstrumentationOnRequestError } from "next/dist/server/instrumentation/types";

export async function register() {
  registerOTel({ serviceName: "ai-chatbot" });

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError: InstrumentationOnRequestError = (...args) => {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureRequestError(...args);
  }
};
