import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import {
  getTeamSharedChats,
  getTeamsByUserId,
  isTeamMember,
} from "@/lib/db/team-queries";

export default async function TeamChatsPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/guest");
  }

  const member = await isTeamMember(teamId, session.user.id);
  if (!member) {
    notFound();
  }

  const teams = await getTeamsByUserId(session.user.id);
  const currentTeam = teams.find((t) => t.id === teamId);
  if (!currentTeam) {
    notFound();
  }

  const chats = await getTeamSharedChats(teamId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          className="text-muted-foreground text-sm hover:text-foreground"
          href="/settings"
        >
          ← Settings
        </Link>
      </div>

      <h1 className="mb-1 font-semibold text-2xl">
        {currentTeam.name} — Shared Chats
      </h1>
      <p className="mb-6 text-muted-foreground text-sm">
        Chats shared with team members. Open any chat to read the conversation.
      </p>

      {chats.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No chats shared yet. Open a chat and use the &quot;Share to team&quot;
          button to share it here.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {chats.map((c) => (
            <li className="flex items-center gap-4 px-4 py-3" key={c.chatId}>
              <div className="min-w-0 flex-1">
                <Link
                  className="truncate font-medium hover:underline"
                  href={`/chat/${c.chatId}`}
                >
                  {c.title}
                </Link>
                <p className="mt-0.5 text-muted-foreground text-xs">
                  Shared by {c.ownerEmail} ·{" "}
                  {new Date(c.sharedAt).toLocaleDateString()}
                </p>
              </div>
              <Link
                className="shrink-0 text-muted-foreground text-xs hover:text-foreground"
                href={`/chat/${c.chatId}`}
              >
                Open →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
