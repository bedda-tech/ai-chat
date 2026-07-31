"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef } from "react";
import { Response } from "@/components/elements/response";
import { ThinkingMessage } from "@/components/message";
import type { ChatMessage } from "@/lib/types";
import {
  cn,
  fetchWithErrorHandlers,
  generateUUID,
  sanitizeText,
} from "@/lib/utils";

type PendingSubmit = {
  text: string;
  version: number;
};

type TryColumnProps = {
  modelId: string;
  modelName: string;
  providerColorClass: string;
  pendingSubmit: PendingSubmit;
  onStatusChange: (modelId: string, status: string) => void;
};

export function TryColumn({
  modelId,
  modelName,
  providerColorClass,
  pendingSubmit,
  onStatusChange,
}: TryColumnProps) {
  const chatId = useRef(generateUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat<ChatMessage>({
    id: chatId.current,
    experimental_throttle: 80,
    generateId: generateUUID,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest(request) {
        return {
          body: {
            id: request.id,
            message: request.messages.at(-1),
            selectedChatModel: modelId,
            selectedVisibilityType: "private",
          },
        };
      },
    }),
  });

  useEffect(() => {
    onStatusChange(modelId, status);
  }, [status, modelId, onStatusChange]);

  const prevVersionRef = useRef(-1);
  useEffect(() => {
    if (
      pendingSubmit.version > 0 &&
      pendingSubmit.version !== prevVersionRef.current &&
      pendingSubmit.text.trim()
    ) {
      prevVersionRef.current = pendingSubmit.version;
      sendMessage({
        role: "user",
        parts: [{ type: "text", text: pendingSubmit.text }],
      });
    }
  }, [pendingSubmit, sendMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="flex min-h-64 min-w-0 flex-1 flex-col border-border border-b last:border-b-0 md:border-r md:border-b-0 md:last:border-r-0">
      <div className="flex shrink-0 items-center gap-2 border-border border-b px-3 py-2">
        <span className={cn("font-medium text-sm", providerColorClass)}>
          {modelName}
        </span>
        {status === "streaming" && (
          <span className="ml-auto animate-pulse text-muted-foreground text-xs">
            Responding...
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-3">
        {messages.length === 0 && status !== "error" && (
          <div className="flex flex-1 items-center justify-center text-center text-muted-foreground text-xs">
            Ask a question below to see how {modelName} responds
          </div>
        )}
        {messages.map((message) => {
          if (message.role === "user") {
            const textParts = message.parts.filter(
              (p): p is { type: "text"; text: string } => p.type === "text"
            );
            return (
              <div className="flex justify-end" key={message.id}>
                <div className="max-w-[85%] rounded-2xl bg-primary px-3 py-2 text-primary-foreground text-sm">
                  {textParts.map((p, i) => (
                    <span key={i}>{p.text}</span>
                  ))}
                </div>
              </div>
            );
          }
          if (message.role === "assistant") {
            const textParts = message.parts.filter(
              (p): p is { type: "text"; text: string } => p.type === "text"
            );
            return (
              <div className="flex justify-start" key={message.id}>
                <div className="max-w-[95%] text-sm">
                  {textParts.map((p, i) => (
                    <Response key={i}>{sanitizeText(p.text)}</Response>
                  ))}
                </div>
              </div>
            );
          }
          return null;
        })}
        {status === "submitted" && <ThinkingMessage />}
        {status === "error" && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-destructive text-xs">
            {error?.message?.toLowerCase().includes("rate")
              ? "Provider rate limit hit — try again in a moment."
              : "Provider temporarily unavailable."}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
