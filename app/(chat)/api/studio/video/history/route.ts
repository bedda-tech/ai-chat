import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { listVideoJobsByUser } from "@/lib/db/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await listVideoJobsByUser(session.user.id);
  return NextResponse.json({ jobs: jobs.slice(0, 20) });
}
