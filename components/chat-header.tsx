"use client";

import { memo } from "react";
import { ShareToTeamButton } from "@/components/share-to-team-button";
import { SidebarToggle } from "@/components/sidebar-toggle";
import type { VisibilityType } from "./visibility-selector";

function PureChatHeader({
  chatId,
  selectedVisibilityType,
  isReadonly,
}: {
  chatId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  return (
    <div className="absolute left-2 top-2 z-50 flex items-center gap-2 md:left-2 md:top-2">
      <SidebarToggle />
      {!isReadonly && <ShareToTeamButton chatId={chatId} />}
    </div>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return (
    prevProps.chatId === nextProps.chatId &&
    prevProps.selectedVisibilityType === nextProps.selectedVisibilityType &&
    prevProps.isReadonly === nextProps.isReadonly
  );
});
