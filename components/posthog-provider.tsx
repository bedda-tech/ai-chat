"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { useSession } from "next-auth/react";
import { guestRegex } from "@/lib/constants";

if (
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_POSTHOG_KEY
) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
  });
}

function PostHogUserIdentifier() {
  const { data: session } = useSession();
  const ph = usePostHog();

  useEffect(() => {
    if (!ph || !session?.user?.email) return;
    const isGuest = guestRegex.test(session.user.email);
    if (isGuest) {
      ph.reset();
      return;
    }
    ph.identify(session.user.id ?? session.user.email, {
      email: session.user.email,
      name: session.user.name ?? undefined,
    });
  }, [ph, session]);

  return null;
}

export function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <PostHogUserIdentifier />
      {children}
    </PHProvider>
  );
}
