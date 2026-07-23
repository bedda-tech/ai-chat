"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { ChatHeader } from "@/components/chat-header";
import { SharedChatBanner } from "@/components/shared-chat-banner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAnalytics } from "@/hooks/use-analytics";
import { useArtifactSelector } from "@/hooks/use-artifact";
import { useAutoResume } from "@/hooks/use-auto-resume";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import { useTeamRealtime } from "@/hooks/use-team-realtime";
import type { Vote } from "@/lib/db/schema";
import { pruneOldSessions, saveMessages } from "@/lib/chat/storage";
import { ChatSDKError } from "@/lib/errors";
import type { Attachment, ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { fetcher, fetchWithErrorHandlers, generateUUID } from "@/lib/utils";
import { Artifact } from "./artifact";
import { useDataStream } from "./data-stream-provider";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";
import { ReferralBanner } from "./referral-banner";
import { getChatHistoryPaginationKey } from "./sidebar-history";
import { TeamTypingIndicator } from "./team-typing-indicator";
import { toast } from "./toast";
import type { VisibilityType } from "./visibility-selector";

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  autoResume,
  initialLastContext,
  isTeamShared = false,
  projectId,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  autoResume: boolean;
  initialLastContext?: AppUsage;
  isTeamShared?: boolean;
  projectId?: string | null;
}) {
  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const { mutate } = useSWRConfig();
  const { setDataStream } = useDataStream();

  const [input, setInput] = useState<string>("");
  const [usage, setUsage] = useState<AppUsage | undefined>(initialLastContext);
  const [messageUsageMap, setMessageUsageMap] = useState<
    Record<string, AppUsage>
  >(() => {
    if (!initialLastContext) {
      return {};
    }
    const lastAssistant = initialMessages
      .filter((m) => m.role === "assistant")
      .at(-1);
    return lastAssistant ? { [lastAssistant.id]: initialLastContext } : {};
  });
  const messagesRef = useRef<ChatMessage[]>([]);
  const [showCreditCardAlert, setShowCreditCardAlert] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeDialogContent, setUpgradeDialogContent] = useState<{
    title: string;
    description: string;
  }>({
    title: "Daily limit reached",
    description:
      "You've used all your free messages for today. Upgrade to Plus for 300 messages/day, or Pro for 1,500/day — all 36+ AI models included.",
  });
  const [currentModelId, setCurrentModelId] = useState(initialChatModel);
  const currentModelIdRef = useRef(currentModelId);
  const streamingModelRef = useRef<string | null>(null);

  const { typingUsers, sendTyping } = useTeamRealtime(id, isTeamShared);
  const { track } = useAnalytics();

  const { data: dailyUsage } = useSWR<{
    used: number;
    limit: number;
    tier: string;
    pct: number;
  }>(!isReadonly ? "/api/usage/daily" : null, fetcher, {
    refreshInterval: 60_000,
  });

  useEffect(() => {
    currentModelIdRef.current = currentModelId;
  }, [currentModelId]);

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
  } = useChat<ChatMessage>({
    id,
    messages: initialMessages,
    experimental_throttle: 100,
    generateId: generateUUID,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest(request) {
        return {
          body: {
            id: request.id,
            message: request.messages.at(-1),
            selectedChatModel: currentModelIdRef.current,
            selectedVisibilityType: visibilityType,
            ...(projectId ? { projectId } : {}),
            ...request.body,
          },
        };
      },
    }),
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
      if ((dataPart.type as string) === "data-active-model") {
        streamingModelRef.current = dataPart.data as string;
      }
      if (dataPart.type === "data-usage") {
        setUsage(dataPart.data);
        const lastMsg = messagesRef.current.at(-1);
        if (lastMsg?.role === "assistant") {
          setMessageUsageMap((prev) => ({
            ...prev,
            [lastMsg.id]: dataPart.data,
          }));
        }
      }
      if ((dataPart.type as string) === "data-context-warnings") {
        const warnings = dataPart.data as unknown as string[];
        warnings.forEach((w) => {
          toast({ type: "error", description: w });
        });
      }
    },
    onFinish: () => {
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
    onError: (error) => {
      if (error instanceof ChatSDKError) {
        if (
          error.message?.includes("AI Gateway requires a valid credit card")
        ) {
          setShowCreditCardAlert(true);
        } else if (error.upgrade) {
          // Any error with upgrade=true → show upgrade dialog with context-appropriate messaging
          if (error.type === "forbidden") {
            setUpgradeDialogContent({
              title: "Premium model",
              description:
                (error.cause as string) ||
                "This model requires a Plus plan. Try Plus free for 7 days to access all 36+ AI models, then $12/mo.",
            });
          } else {
            // rate_limit or other upgrade-required errors
            setUpgradeDialogContent({
              title: "Daily limit reached",
              description:
                "You've used all your free messages for today. Try Plus free for 7 days — 300 messages/day and all 36+ AI models. Then $12/mo.",
            });
          }
          track("upgrade_modal_shown", {
            reason: error.type,
            model: currentModelIdRef.current,
          });
          setShowUpgradeDialog(true);
        } else if (error.type === "rate_limit") {
          // Paid user hitting daily/minute limit — no upgrade needed, just wait
          toast({
            type: "error",
            description: (error.cause as string) || error.message,
          });
        } else {
          toast({
            type: "error",
            description: error.message,
          });
        }
      } else {
        // Handle unexpected errors with a user-friendly message
        toast({
          type: "error",
          description:
            "We're having trouble processing your request. Please try again in a moment.",
        });
        console.error("Unexpected chat error:", error);
      }
    },
  });

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const prevStatusRef = useRef(status);
  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = status;
    if (
      (prevStatus === "streaming" || prevStatus === "submitted") &&
      status === "ready" &&
      streamingModelRef.current
    ) {
      const modelId = streamingModelRef.current;
      streamingModelRef.current = null;
      setMessages((prev) => {
        const last = prev.at(-1);
        if (!last || last.role !== "assistant" || last.metadata?.modelId) {
          return prev;
        }
        return [
          ...prev.slice(0, -1),
          {
            ...last,
            metadata: {
              createdAt: last.metadata?.createdAt ?? new Date().toISOString(),
              modelId,
            },
          },
        ];
      });
    }
  }, [status, setMessages]);

  // Persist messages to localStorage when a stream finishes so the session
  // survives navigation and provides offline resilience.
  useEffect(() => {
    if (status === "ready" && messages.length > 0 && !isReadonly) {
      saveMessages(id, messages);
    }
  }, [status, messages, id, isReadonly]);

  // Prune expired/excess localStorage sessions on mount.
  useEffect(() => {
    pruneOldSessions();
  }, []);

  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: "user" as const,
        parts: [{ type: "text", text: query }],
      });

      setHasAppendedQuery(true);
      window.history.replaceState({}, "", `/chat/${id}`);
    }
  }, [query, sendMessage, hasAppendedQuery, id]);

  const { data: votes } = useSWR<Vote[]>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher
  );

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  return (
    <>
      <div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
        <ChatHeader
          chatId={id}
          isReadonly={isReadonly}
          selectedVisibilityType={initialVisibilityType}
        />

        {isReadonly && <SharedChatBanner chatId={id} />}

        <Messages
          chatId={id}
          isArtifactVisible={isArtifactVisible}
          isReadonly={isReadonly}
          messages={messages}
          messageUsageMap={messageUsageMap}
          onModelChange={setCurrentModelId}
          regenerate={regenerate}
          selectedModelId={currentModelId}
          selectedVisibilityType={visibilityType}
          sendMessage={sendMessage}
          setInput={setInput}
          setMessages={setMessages}
          status={status}
          votes={votes}
        />

        {isTeamShared && (
          <TeamTypingIndicator
            currentUserId={undefined}
            typingUsers={typingUsers}
          />
        )}

        <div className="sticky bottom-0 z-1 w-full bg-background px-2 pb-3 md:px-4 md:pb-4">
          {!isReadonly &&
            dailyUsage &&
            dailyUsage.tier === "free" &&
            dailyUsage.pct >= 0.8 && (
              <div className="mx-auto mb-2 flex max-w-4xl items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-800 dark:bg-amber-950/30">
                <span className="text-amber-800 dark:text-amber-200">
                  {dailyUsage.used}/{dailyUsage.limit} daily messages used —
                  upgrade to keep going
                </span>
                <Link
                  className="shrink-0 rounded-md bg-primary px-3 py-1 font-medium text-primary-foreground text-xs hover:bg-primary/90"
                  href="/upgrade?plan=plus"
                  onClick={() =>
                    track("upgrade_cta_clicked", {
                      source: "near_limit_nudge",
                      plan: "plus",
                    })
                  }
                >
                  Upgrade — 7-day free trial
                </Link>
              </div>
            )}
          {!isReadonly && messages.length >= 2 && <ReferralBanner />}
          <div className="mx-auto flex w-full max-w-4xl gap-2 border-t-0">
          {!isReadonly && (
            <MultimodalInput
              attachments={attachments}
              chatId={id}
              input={input}
              messages={messages}
              onModelChange={setCurrentModelId}
              onTyping={isTeamShared ? sendTyping : undefined}
              selectedModelId={currentModelId}
              selectedVisibilityType={visibilityType}
              sendMessage={sendMessage}
              setAttachments={setAttachments}
              setInput={setInput}
              setMessages={setMessages}
              status={status}
              stop={stop}
              usage={usage}
            />
          )}
          </div>
        </div>
      </div>

      <Artifact
        attachments={attachments}
        chatId={id}
        input={input}
        isReadonly={isReadonly}
        messages={messages}
        regenerate={regenerate}
        selectedModelId={currentModelId}
        selectedVisibilityType={visibilityType}
        sendMessage={sendMessage}
        setAttachments={setAttachments}
        setInput={setInput}
        setMessages={setMessages}
        status={status}
        stop={stop}
        votes={votes}
      />

      <AlertDialog
        onOpenChange={setShowCreditCardAlert}
        open={showCreditCardAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate AI Gateway</AlertDialogTitle>
            <AlertDialogDescription>
              This application requires{" "}
              {process.env.NODE_ENV === "production" ? "the owner" : "you"} to
              activate Vercel AI Gateway.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                window.open(
                  "https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card",
                  "_blank"
                );
                window.location.href = "/";
              }}
            >
              Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog onOpenChange={setShowUpgradeDialog} open={showUpgradeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{upgradeDialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {upgradeDialogContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Maybe later</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link
                href="/upgrade?plan=plus"
                onClick={() =>
                  track("upgrade_cta_clicked", {
                    source: "upgrade_dialog",
                    plan: "plus",
                  })
                }
              >
                Start 7-day free trial
              </Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
