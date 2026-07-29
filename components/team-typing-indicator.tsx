"use client";

import type { TypingUser } from "@/hooks/use-team-realtime";

type Props = {
  typingUsers: TypingUser[];
  currentUserId?: string;
};

export function TeamTypingIndicator({ typingUsers, currentUserId }: Props) {
  const others = typingUsers.filter((u) => u.userId !== currentUserId);
  if (others.length === 0) {
    return null;
  }

  const names =
    others.length === 1
      ? others[0].userName
      : others.length === 2
        ? `${others[0].userName} and ${others[1].userName}`
        : `${others[0].userName} and ${others.length - 1} others`;

  return (
    <div className="flex items-center gap-1.5 px-4 py-1 text-muted-foreground text-xs">
      <span className="flex gap-0.5">
        <span className="animate-bounce [animation-delay:0ms]">·</span>
        <span className="animate-bounce [animation-delay:150ms]">·</span>
        <span className="animate-bounce [animation-delay:300ms]">·</span>
      </span>
      <span>
        <strong>{names}</strong> {others.length === 1 ? "is" : "are"} typing…
      </span>
    </div>
  );
}
