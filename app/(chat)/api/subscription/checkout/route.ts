import { NextResponse } from "next/server";

// Bedda Chat subscriptions are discontinued. This route no longer creates
// Stripe sessions or changes billing for anyone.
const GONE_BODY = { error: "Subscriptions are no longer available." };

export function GET() {
  return NextResponse.json(GONE_BODY, { status: 410 });
}

export function POST() {
  return NextResponse.json(GONE_BODY, { status: 410 });
}
