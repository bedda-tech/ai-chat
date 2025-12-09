import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { createBillingPortalSession } from "@/lib/stripe";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { userTier } from "@/lib/db/schema";

const connectionString = process.env.POSTGRES_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

export async function POST(_req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get customer ID from database
    const userTierRecord = await db
      .select()
      .from(userTier)
      .where(eq(userTier.userId, session.user.id))
      .limit(1);

    if (
      !userTierRecord.length ||
      !userTierRecord[0].stripeCustomerId
    ) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const portalSession = await createBillingPortalSession({
      customerId: userTierRecord[0].stripeCustomerId,
      returnUrl: `${baseUrl}/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
