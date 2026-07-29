import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Chat } from "@/components/chat";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { getUserPreferences } from "@/lib/db/queries";
import { generateUUID } from "@/lib/utils";
import { auth } from "../(auth)/auth";

export default async function Page(props: {
  searchParams?: Promise<{ projectId?: string }>;
}) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/guest");
  }

  const id = generateUUID();
  const searchParams = await props.searchParams;
  const projectId = searchParams?.projectId ?? undefined;

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");

  // Resolve initial model: cookie → DB general default → DEFAULT_CHAT_MODEL
  let initialChatModel = modelIdFromCookie?.value ?? DEFAULT_CHAT_MODEL;

  if (!modelIdFromCookie && session.user.type !== "guest") {
    try {
      const prefs = await getUserPreferences(session.user.id);
      const generalDefault = prefs?.modelPreferences?.general;
      if (generalDefault) {
        initialChatModel = generalDefault;
      }
    } catch {
      // Non-fatal: fall through to DEFAULT_CHAT_MODEL
    }
  }

  return (
    <>
      <Chat
        autoResume={false}
        id={id}
        initialChatModel={initialChatModel}
        initialMessages={[]}
        initialVisibilityType="private"
        isReadonly={false}
        key={id}
        projectId={projectId}
      />
      <DataStreamHandler />
    </>
  );
}
