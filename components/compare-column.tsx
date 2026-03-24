"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Response } from "@/components/elements/response";
import { ThinkingMessage } from "@/components/message";
import type { ChatMessage } from "@/lib/types";
import { fetchWithErrorHandlers, generateUUID, sanitizeText } from "@/lib/utils";
import { ChevronDownIcon } from "./icons";
import { cn } from "@/lib/utils";

interface PendingSubmit {
  text: string;
  version: number;
}

interface ColumnModel {
  id: string;
  name: string;
  provider: string;
}

interface CompareColumnProps {
  initialModelId: string;
  models: ColumnModel[];
  pendingSubmit: PendingSubmit;
}

export function CompareColumn({
  initialModelId,
  models,
  pendingSubmit,
}: CompareColumnProps) {
  const chatId = useRef(generateUUID());
  const [modelId, setModelId] = useState(initialModelId);
  const modelIdRef = useRef(modelId);
  useEffect(() => {
    modelIdRef.current = modelId;
  }, [modelId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat<ChatMessage>({
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
            selectedChatModel: modelIdRef.current,
            selectedVisibilityType: "private",
          },
        };
      },
    }),
  });

  // Trigger send when parent submits
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

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, status]);

  const currentModel = models.find((m) => m.id === modelId);

  const providerColor: Record<string, string> = {
    anthropic: "text-orange-500",
    openai: "text-green-500",
    google: "text-blue-500",
    xai: "text-purple-500",
    mistral: "text-sky-500",
    deepseek: "text-indigo-500",
    groq: "text-yellow-500",
    cerebras: "text-rose-500",
  };

  const provider = currentModel?.provider || modelId.split("-")[0];
  const colorClass = providerColor[provider] || "text-foreground";

  return (
    <div className="flex min-w-0 flex-1 flex-col border-r last:border-r-0 border-border">
      {/* Column header: model selector */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto gap-1.5 px-2 py-1 text-sm font-medium"
            >
              <span className={cn("truncate max-w-[160px]", colorClass)}>
                {currentModel?.name ?? modelId}
              </span>
              <ChevronDownIcon size={12} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto w-64">
            {models.map((m) => (
              <DropdownMenuItem
                key={m.id}
                onSelect={() => setModelId(m.id)}
                className={cn(
                  "text-sm",
                  m.id === modelId && "font-medium bg-accent"
                )}
              >
                {m.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {status === "streaming" && (
          <span className="ml-auto text-xs text-muted-foreground animate-pulse">
            Responding...
          </span>
        )}
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-3"
      >
        {messages.length === 0 && (
          <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
            Ask a question below to compare this model
          </div>
        )}
        {messages.map((message) => {
          if (message.role === "user") {
            const textParts = message.parts.filter(
              (p): p is { type: "text"; text: string } => p.type === "text"
            );
            return (
              <div key={message.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl bg-primary px-3 py-2 text-sm text-primary-foreground">
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
              <div key={message.id} className="flex justify-start">
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
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
