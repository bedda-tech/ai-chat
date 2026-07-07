import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { AnimatePresence } from "framer-motion";
import { ArrowDownIcon } from "lucide-react";
import {
  type Dispatch,
  Fragment,
  memo,
  type SetStateAction,
  useEffect,
  useMemo,
} from "react";
import { useMessages } from "@/hooks/use-messages";
import { chatModels } from "@/lib/ai/models";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { cn } from "@/lib/utils";
import { useDataStream } from "./data-stream-provider";
import { Conversation, ConversationContent } from "./elements/conversation";
import { Greeting } from "./greeting";
import { getProviderColor, PreviewMessage, ThinkingMessage } from "./message";
import type { VisibilityType } from "./visibility-selector";

type MessagesProps = {
  chatId: string;
  status: UseChatHelpers<ChatMessage>["status"];
  votes: Vote[] | undefined;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  isArtifactVisible: boolean;
  selectedModelId: string;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  selectedVisibilityType: VisibilityType;
  onModelChange?: (modelId: string) => void;
  setInput: Dispatch<SetStateAction<string>>;
  messageUsageMap?: Record<string, AppUsage>;
};

function ModelSwitchSeparator({ modelId }: { modelId: string }) {
  const model = chatModels.find((m) => m.id === modelId);
  const displayName = model?.name ?? modelId.split("-").slice(1).join("-");
  const colorClass = getProviderColor(modelId);

  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-border" />
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
        <span className={cn("size-2 rounded-full shrink-0", colorClass)} />
        <span>Switched to {displayName}</span>
      </div>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function PureMessages({
  chatId,
  status,
  votes,
  messages,
  setMessages,
  regenerate,
  isReadonly,
  selectedModelId: _selectedModelId,
  sendMessage,
  selectedVisibilityType,
  onModelChange,
  setInput,
  messageUsageMap,
}: MessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    isAtBottom,
    scrollToBottom,
    hasSentMessage,
  } = useMessages({
    status,
  });

  const hasMixedModels = useMemo(() => {
    const assistantModelIds = new Set(
      messages
        .filter((m) => m.role === "assistant" && m.metadata?.modelId)
        .map((m) => m.metadata?.modelId as string)
    );
    return assistantModelIds.size > 1;
  }, [messages]);

  useDataStream();

  useEffect(() => {
    if (status === "submitted") {
      requestAnimationFrame(() => {
        const container = messagesContainerRef.current;
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
        }
      });
    }
  }, [status, messagesContainerRef]);

  return (
    <div
      className="overscroll-behavior-contain -webkit-overflow-scrolling-touch flex flex-1 touch-pan-y overflow-y-scroll"
      ref={messagesContainerRef}
      style={{ overflowAnchor: "none" }}
    >
      <Conversation className="mx-auto flex min-w-0 max-w-4xl flex-1 flex-col gap-4 md:gap-6">
        <ConversationContent className="flex flex-1 flex-col gap-4 px-2 py-4 md:gap-6 md:px-4">
          {messages.length === 0 && (
            <Greeting
              chatId={chatId}
              onModelChange={onModelChange}
              selectedVisibilityType={selectedVisibilityType}
              sendMessage={sendMessage}
              setInput={setInput}
            />
          )}

          {messages.map((message, index) => {
            const prevAssistantModelId = messages
              .slice(0, index)
              .filter((m) => m.role === "assistant" && m.metadata?.modelId)
              .at(-1)?.metadata?.modelId as string | undefined;
            const thisModelId =
              message.role === "assistant"
                ? (message.metadata?.modelId as string | undefined)
                : undefined;
            const showModelSwitch =
              !!thisModelId &&
              !!prevAssistantModelId &&
              thisModelId !== prevAssistantModelId;

            return (
              <Fragment key={message.id}>
                {showModelSwitch && (
                  <ModelSwitchSeparator modelId={thisModelId} />
                )}
                <PreviewMessage
                  chatId={chatId}
                  isLoading={
                    status === "streaming" && messages.length - 1 === index
                  }
                  isReadonly={isReadonly}
                  message={message}
                  regenerate={regenerate}
                  requiresScrollPadding={
                    hasSentMessage && index === messages.length - 1
                  }
                  setMessages={setMessages}
                  showModelBadge={hasMixedModels}
                  usage={messageUsageMap?.[message.id]}
                  vote={
                    votes
                      ? votes.find((vote) => vote.messageId === message.id)
                      : undefined
                  }
                />
              </Fragment>
            );
          })}

          <AnimatePresence mode="wait">
            {status === "submitted" && <ThinkingMessage key="thinking" />}
          </AnimatePresence>

          <div
            className="min-h-[24px] min-w-[24px] shrink-0"
            ref={messagesEndRef}
          />
        </ConversationContent>
      </Conversation>

      {!isAtBottom && (
        <button
          aria-label="Scroll to bottom"
          className="-translate-x-1/2 absolute bottom-40 left-1/2 z-10 rounded-full border bg-background p-2 shadow-lg transition-colors hover:bg-muted"
          onClick={() => scrollToBottom("smooth")}
          type="button"
        >
          <ArrowDownIcon className="size-4" />
        </button>
      )}
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) {
    return true;
  }

  if (prevProps.status !== nextProps.status) {
    return false;
  }
  if (prevProps.selectedModelId !== nextProps.selectedModelId) {
    return false;
  }
  if (prevProps.messages.length !== nextProps.messages.length) {
    return false;
  }
  if (!equal(prevProps.messages, nextProps.messages)) {
    return false;
  }
  if (!equal(prevProps.votes, nextProps.votes)) {
    return false;
  }

  return false;
});
