"use client";

import { Download } from "lucide-react";
import { memo } from "react";
import { ShareToTeamButton } from "@/components/share-to-team-button";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { Button } from "@/components/ui/button";
import type { VisibilityType } from "./visibility-selector";

function handleExport(chatId: string) {
  fetch(`/api/history/${chatId}/export?format=markdown`)
    .then((res) => {
      if (!res.ok) throw new Error("Export failed");
      return res.blob();
    })
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chat-${chatId}.md`;
      a.click();
      URL.revokeObjectURL(url);
    })
    .catch(() => {});
}

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
    <div className="absolute top-2 left-2 z-50 flex items-center gap-2 md:top-2 md:left-2">
      <SidebarToggle />
      {!isReadonly && <ShareToTeamButton chatId={chatId} />}
      {!isReadonly && (
        <Button
          className="size-8"
          onClick={() => handleExport(chatId)}
          size="icon"
          title="Export chat as Markdown"
          variant="ghost"
        >
          <Download className="size-4" />
        </Button>
      )}
    </div>
  );
}

export const ChatHeader = memo(
  PureChatHeader,
  (prevProps, nextProps) =>
    prevProps.chatId === nextProps.chatId &&
    prevProps.selectedVisibilityType === nextProps.selectedVisibilityType &&
    prevProps.isReadonly === nextProps.isReadonly
);
