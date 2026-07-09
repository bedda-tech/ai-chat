"use client";
import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { motion } from "framer-motion";
import { memo, useState } from "react";
import { chatModels } from "@/lib/ai/models";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { cn, sanitizeText } from "@/lib/utils";
import { Chart } from "./chart";
import { useDataStream } from "./data-stream-provider";
import { DocumentToolResult } from "./document";
import { DocumentPreview } from "./document-preview";
import { CodeBlock } from "./elements/code-block";
import { MessageContent } from "./elements/message";
import { Response } from "./elements/response";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "./elements/tool";
import { GenerativeUIRenderer } from "./generative-ui-renderer";
import { SparklesIcon } from "./icons";
import { MessageActions } from "./message-actions";
import { MessageEditor } from "./message-editor";
import { MessageReasoning } from "./message-reasoning";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";

export const PROVIDER_COLORS: Record<string, string> = {
  anthropic: "bg-orange-500",
  openai: "bg-green-500",
  google: "bg-blue-500",
  xai: "bg-zinc-400",
  mistral: "bg-orange-400",
  deepseek: "bg-indigo-500",
  groq: "bg-red-400",
  cerebras: "bg-amber-500",
  moonshotai: "bg-cyan-500",
  zai: "bg-purple-400",
};

export function getProviderColor(modelId: string): string {
  const provider = modelId.split("-")[0];
  return PROVIDER_COLORS[provider] ?? "bg-zinc-400";
}

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  regenerate,
  isReadonly,
  requiresScrollPadding,
  showModelBadge,
  usage,
}: {
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  requiresScrollPadding: boolean;
  showModelBadge?: boolean;
  usage?: AppUsage;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");

  // Only show attachment previews for user uploads, not AI-generated images
  const attachmentsFromMessage = message.parts.filter(
    (part) =>
      part.type === "file" &&
      (message.role === "user" || !part.mediaType?.startsWith("image/"))
  );

  useDataStream();

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="group/message w-full"
      data-role={message.role}
      data-testid={`message-${message.role}`}
      initial={{ opacity: 0 }}
    >
      <div
        className={cn("flex w-full items-start gap-2 md:gap-3", {
          "justify-end": message.role === "user" && mode !== "edit",
          "justify-start": message.role === "assistant",
        })}
      >
        {message.role === "assistant" && (
          <div className="-mt-1 flex shrink-0 flex-col items-center gap-1">
            <div className="flex size-8 items-center justify-center rounded-full bg-background ring-1 ring-border">
              <SparklesIcon size={14} />
            </div>
            {showModelBadge &&
              message.metadata?.modelId &&
              (() => {
                const modelId = message.metadata.modelId as string;
                const model = chatModels.find((m) => m.id === modelId);
                const displayName =
                  model?.name ?? modelId.split("-").slice(1).join("-");
                const colorClass = getProviderColor(modelId);
                return (
                  <span className="flex max-w-[5rem] flex-col items-center gap-0.5 opacity-100 transition-opacity md:opacity-0 md:group-hover/message:opacity-100">
                    <span className={cn("size-1.5 rounded-full", colorClass)} />
                    <span className="max-w-[4.5rem] text-center font-medium text-[10px] text-muted-foreground leading-tight">
                      {displayName}
                    </span>
                  </span>
                );
              })()}
          </div>
        )}

        <div
          className={cn("flex flex-col", {
            "gap-2 md:gap-4": message.parts?.some(
              (p) => p.type === "text" && p.text?.trim()
            ),
            "min-h-96": message.role === "assistant" && requiresScrollPadding,
            "w-full":
              (message.role === "assistant" &&
                message.parts?.some(
                  (p) => p.type === "text" && p.text?.trim()
                )) ||
              mode === "edit",
            "max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]":
              message.role === "user" && mode !== "edit",
          })}
        >
          {attachmentsFromMessage.length > 0 && (
            <div
              className="flex flex-row justify-end gap-2"
              data-testid={"message-attachments"}
            >
              {attachmentsFromMessage.map((attachment) => {
                const filePart = attachment as any;
                return (
                  <PreviewAttachment
                    attachment={{
                      name: filePart.filename ?? "file",
                      contentType: filePart.mediaType,
                      url: filePart.url,
                    }}
                    key={filePart.url}
                  />
                );
              })}
            </div>
          )}

          {message.parts?.map((part, index) => {
            const { type } = part;
            const key = `message-${message.id}-part-${index}`;

            if (type === "reasoning" && part.text?.trim().length > 0) {
              return (
                <MessageReasoning
                  isLoading={isLoading}
                  key={key}
                  reasoning={part.text}
                />
              );
            }

            if (type === "text") {
              if (mode === "view") {
                return (
                  <div key={key}>
                    <MessageContent
                      className={cn({
                        "w-fit break-words rounded-2xl bg-primary px-3 py-2 text-right text-primary-foreground":
                          message.role === "user",
                        "bg-transparent px-0 py-0 text-left":
                          message.role === "assistant",
                      })}
                      data-testid="message-content"
                    >
                      <Response>{sanitizeText(part.text)}</Response>
                    </MessageContent>
                  </div>
                );
              }

              if (mode === "edit") {
                return (
                  <div
                    className="flex w-full flex-row items-start gap-3"
                    key={key}
                  >
                    <div className="size-8" />
                    <div className="min-w-0 flex-1">
                      <MessageEditor
                        key={message.id}
                        message={message}
                        regenerate={regenerate}
                        setMessages={setMessages}
                        setMode={setMode}
                      />
                    </div>
                  </div>
                );
              }
            }

            if (type === "file" && part.mediaType?.startsWith("image/")) {
              const imagePart = part as any;
              // Handle both base64 string and URL formats
              const imageSrc =
                imagePart.url ||
                (imagePart.data
                  ? `data:${imagePart.mediaType};base64,${imagePart.data}`
                  : null) ||
                (imagePart.base64
                  ? `data:${imagePart.mediaType};base64,${imagePart.base64}`
                  : null);

              if (!imageSrc) {
                return null;
              }

              return (
                <div
                  className="overflow-hidden rounded-lg border border-border bg-muted/30 p-2"
                  key={key}
                >
                  {/* biome-ignore lint/nursery/useImageSize: Generated image from model */}
                  {/* biome-ignore lint/performance/noImgElement: Generated image display */}
                  <img
                    alt="Generated by AI model"
                    className="w-full max-w-2xl rounded-md"
                    src={imageSrc}
                  />
                  <div className="mt-2 text-muted-foreground text-xs">
                    Generated by {imagePart.filename || "AI model"}
                  </div>
                </div>
              );
            }

            if (type === "tool-getWeather") {
              const { toolCallId, state } = part;

              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-getWeather" />
                  <ToolContent>
                    {state === "input-available" && (
                      <ToolInput input={part.input} />
                    )}
                    {state === "output-available" &&
                      (() => {
                        const output = part.output as any;

                        return (
                          <ToolOutput
                            errorText={
                              output?.error || output?.status === "error"
                                ? output.error
                                : undefined
                            }
                            output={
                              output?.data ? (
                                <Weather weatherAtLocation={output.data} />
                              ) : output?.status === "loading" ? (
                                <div className="p-4 text-muted-foreground text-sm">
                                  {output.message}
                                </div>
                              ) : null
                            }
                          />
                        );
                      })()}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === "tool-createDocument") {
              const { toolCallId } = part;

              if (part.output && "error" in part.output) {
                return (
                  <div
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
                    key={toolCallId}
                  >
                    Error creating document: {String(part.output.error)}
                  </div>
                );
              }

              return (
                <DocumentPreview
                  isReadonly={isReadonly}
                  key={toolCallId}
                  result={part.output}
                />
              );
            }

            if (type === "tool-updateDocument") {
              const { toolCallId } = part;

              if (part.output && "error" in part.output) {
                return (
                  <div
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
                    key={toolCallId}
                  >
                    Error updating document: {String(part.output.error)}
                  </div>
                );
              }

              return (
                <div className="relative" key={toolCallId}>
                  <DocumentPreview
                    args={{ ...part.output, isUpdate: true }}
                    isReadonly={isReadonly}
                    result={part.output}
                  />
                </div>
              );
            }

            if (type === "tool-requestSuggestions") {
              const { toolCallId, state } = part;

              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-requestSuggestions" />
                  <ToolContent>
                    {state === "input-available" && (
                      <ToolInput input={part.input} />
                    )}
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={undefined}
                        output={
                          "error" in part.output ? (
                            <div className="rounded border p-2 text-red-500">
                              Error: {String(part.output.error)}
                            </div>
                          ) : (
                            <DocumentToolResult
                              isReadonly={isReadonly}
                              result={part.output}
                              type="request-suggestions"
                            />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type.startsWith("tool-") && type.includes("generateImage")) {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-generateImage" />
                  <ToolContent>
                    {state === "input-available" && toolPart.input && (
                      <ToolInput input={toolPart.input} />
                    )}
                    {state === "output-available" && toolPart.output && (
                      <div className="space-y-3 p-4">
                        <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                          Generated Image
                        </h4>
                        {toolPart.output.success ? (
                          <div className="space-y-2">
                            <div className="overflow-hidden rounded-lg border border-border bg-muted/50">
                              {/* biome-ignore lint/nursery/useImageSize: Generated image without explicit size */}
                              {/* biome-ignore lint/performance/noImgElement: Generated image display */}
                              <img
                                alt={
                                  toolPart.input?.prompt || "Generated image"
                                }
                                className="w-full"
                                src={`data:${toolPart.output.image.mediaType};base64,${toolPart.output.image.base64}`}
                              />
                            </div>
                            {toolPart.input?.prompt && (
                              <div className="text-muted-foreground text-xs">
                                <span className="font-medium">Prompt:</span>{" "}
                                {toolPart.input.prompt}
                              </div>
                            )}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-3 text-muted-foreground text-xs">
                                {toolPart.output.model && (
                                  <span>
                                    <span className="font-medium">Model:</span>{" "}
                                    {toolPart.output.model}
                                  </span>
                                )}
                                {toolPart.output.size && (
                                  <span>
                                    <span className="font-medium">Size:</span>{" "}
                                    {toolPart.output.size}
                                  </span>
                                )}
                              </div>
                              <a
                                className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 font-medium text-primary-foreground text-xs transition-colors hover:bg-primary/90"
                                download={`bedda-image-${Date.now()}.png`}
                                href={`data:${toolPart.output.image.mediaType};base64,${toolPart.output.image.base64}`}
                              >
                                Download
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                            {toolPart.output.error ||
                              "Failed to generate image"}
                          </div>
                        )}
                      </div>
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type.startsWith("tool-") && type.includes("analyzeData")) {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-analyzeData" />
                  <ToolContent>
                    {state === "input-available" && toolPart.input && (
                      <ToolInput input={toolPart.input} />
                    )}
                    {state === "output-available" && toolPart.output && (
                      <div className="space-y-4 p-4">
                        <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                          Analysis Results
                        </h4>
                        {toolPart.output.success && toolPart.output.analysis ? (
                          <div className="space-y-4">
                            {/* Summary */}
                            {toolPart.output.analysis.summary && (
                              <div className="rounded-lg border border-border bg-muted/30 p-3">
                                <div className="mb-2 font-medium text-sm">
                                  Summary
                                </div>
                                <div className="text-foreground/80 text-sm">
                                  {toolPart.output.analysis.summary}
                                </div>
                              </div>
                            )}

                            {/* Findings */}
                            {toolPart.output.analysis.findings &&
                              toolPart.output.analysis.findings.length > 0 && (
                                <div className="space-y-2">
                                  <div className="font-medium text-sm">
                                    Key Findings
                                  </div>
                                  {toolPart.output.analysis.findings.map(
                                    (finding: any) => (
                                      <div
                                        className="rounded-lg border border-border bg-muted/30 p-3"
                                        key={`${finding.title}-${finding.confidence}`}
                                      >
                                        <div className="mb-1 flex items-center justify-between">
                                          <div className="font-medium text-sm">
                                            {finding.title}
                                          </div>
                                          <div className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary text-xs">
                                            {finding.confidence}% confidence
                                          </div>
                                        </div>
                                        <div className="text-foreground/70 text-sm">
                                          {finding.description}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}

                            {/* Recommendations */}
                            {toolPart.output.analysis.recommendations &&
                              toolPart.output.analysis.recommendations.length >
                                0 && (
                                <div className="space-y-2">
                                  <div className="font-medium text-sm">
                                    Recommendations
                                  </div>
                                  <ul className="space-y-1.5 text-foreground/80 text-sm">
                                    {toolPart.output.analysis.recommendations.map(
                                      (rec: string) => (
                                        <li className="flex gap-2" key={rec}>
                                          <span className="text-primary">
                                            •
                                          </span>
                                          {rec}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                            {/* Metadata */}
                            {toolPart.output.analysis.metadata && (
                              <div className="flex gap-4 text-muted-foreground text-xs">
                                {toolPart.output.analysis.metadata
                                  .processingTime && (
                                  <div>
                                    Processing time:{" "}
                                    {
                                      toolPart.output.analysis.metadata
                                        .processingTime
                                    }
                                  </div>
                                )}
                                {toolPart.output.analysis.metadata
                                  .dataLength !== undefined && (
                                  <div>
                                    Data length:{" "}
                                    {
                                      toolPart.output.analysis.metadata
                                        .dataLength
                                    }{" "}
                                    chars
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                            {toolPart.output.error || "Failed to analyze data"}
                          </div>
                        )}
                      </div>
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === "tool-executeCode") {
              const { toolCallId, state } = part;

              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-executeCode" />
                  <ToolContent>
                    {state === "input-available" && (
                      <ToolInput input={part.input} />
                    )}
                    {state === "output-available" &&
                      (() => {
                        const output = part.output as any;

                        if (!output) return null;

                        const {
                          success,
                          language,
                          stdout,
                          stderr,
                          error,
                          executionTime,
                          results,
                        } = output;

                        return (
                          <div className="space-y-3 p-4">
                            {/* Stdout */}
                            {stdout && (
                              <div>
                                <div className="mb-1 flex items-center justify-between">
                                  <span className="font-mono text-muted-foreground text-xs uppercase tracking-wide">
                                    Output
                                  </span>
                                  {executionTime && (
                                    <span className="text-muted-foreground text-xs">
                                      {executionTime}
                                    </span>
                                  )}
                                </div>
                                <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-muted/50 p-3 font-mono text-xs leading-relaxed">
                                  {stdout}
                                </pre>
                              </div>
                            )}

                            {/* Stderr (non-error warnings) */}
                            {stderr && !error && (
                              <div>
                                <span className="font-mono text-muted-foreground text-xs uppercase tracking-wide">
                                  Warnings
                                </span>
                                <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded-md bg-yellow-500/10 p-3 font-mono text-xs text-yellow-700 dark:text-yellow-400">
                                  {stderr}
                                </pre>
                              </div>
                            )}

                            {/* Rich results (charts, tables, etc.) */}
                            {results &&
                              results.length > 0 &&
                              results.map((r: { png?: string; svg?: string; html?: string; json?: unknown; text?: string }, i: number) => (
                                <div key={i}>
                                  {r.png && (
                                    <img
                                      alt="Code output"
                                      className="max-w-full rounded-md border border-border"
                                      src={`data:image/png;base64,${r.png}`}
                                    />
                                  )}
                                  {r.svg && (
                                    <div
                                      className="rounded-md border border-border p-2"
                                      dangerouslySetInnerHTML={{
                                        __html: r.svg,
                                      }}
                                    />
                                  )}
                                  {r.html && (
                                    <div
                                      className="overflow-x-auto rounded-md border border-border p-2 text-sm"
                                      dangerouslySetInnerHTML={{
                                        __html: r.html,
                                      }}
                                    />
                                  )}
                                  {r.json !== undefined &&
                                    !r.html &&
                                    !r.png &&
                                    !r.svg && (
                                      <pre className="overflow-x-auto rounded-md bg-muted/50 p-3 font-mono text-xs">
                                        {JSON.stringify(r.json, null, 2)}
                                      </pre>
                                    )}
                                  {r.text &&
                                    !r.html &&
                                    !r.png &&
                                    !r.svg &&
                                    r.json === undefined && (
                                      <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-muted/50 p-3 font-mono text-xs">
                                        {r.text}
                                      </pre>
                                    )}
                                </div>
                              ))}

                            {/* Error */}
                            {error && (
                              <div className="rounded-md bg-destructive/10 p-3">
                                <span className="mb-1 block font-mono font-semibold text-destructive text-xs uppercase">
                                  Error
                                </span>
                                <pre className="whitespace-pre-wrap font-mono text-destructive text-xs">
                                  {error}
                                </pre>
                              </div>
                            )}

                            {/* Empty success */}
                            {success &&
                              !stdout &&
                              !stderr &&
                              !error &&
                              (!results || results.length === 0) && (
                                <div className="text-muted-foreground text-xs">
                                  (no output)
                                </div>
                              )}
                          </div>
                        );
                      })()}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === "tool-queryKnowledgeBase") {
              const { toolCallId, state } = part;

              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-queryKnowledgeBase" />
                  <ToolContent>
                    {state === "input-available" && (
                      <ToolInput input={part.input} />
                    )}
                    {state === "output-available" &&
                      (() => {
                        const output = part.output as any;

                        if (!output?.success) {
                          return (
                            <ToolOutput
                              errorText={
                                output?.error || "Knowledge base search failed"
                              }
                              output={null}
                            />
                          );
                        }

                        if (!output?.found) {
                          return (
                            <div className="p-4 text-muted-foreground text-sm">
                              {output.message || "No relevant documents found."}
                            </div>
                          );
                        }

                        const results = output.results as Array<{
                          content: string;
                          source: string;
                          similarity: number;
                        }>;

                        return (
                          <div className="space-y-3 p-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                                Knowledge Base Results
                              </h4>
                              <span className="text-muted-foreground text-xs">
                                {results.length} passage
                                {results.length !== 1 ? "s" : ""} for &ldquo;
                                {output.query}&rdquo;
                              </span>
                            </div>
                            <div className="space-y-2">
                              {results.map((result, i) => (
                                <div
                                  className="rounded-lg border border-border bg-muted/30 p-3"
                                  key={i}
                                >
                                  <div className="mb-1 flex items-center justify-between gap-2">
                                    <span className="font-medium text-primary text-sm">
                                      {result.source}
                                    </span>
                                    <span className="shrink-0 text-muted-foreground text-xs">
                                      {Math.round(result.similarity * 100)}%
                                      match
                                    </span>
                                  </div>
                                  <p className="line-clamp-3 text-foreground/70 text-xs leading-relaxed">
                                    {result.content}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === "tool-webSearch") {
              const { toolCallId, state } = part;

              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-webSearch" />
                  <ToolContent>
                    {state === "input-available" && (
                      <ToolInput input={part.input} />
                    )}
                    {state === "output-available" &&
                      (() => {
                        const output = part.output as any;

                        if (output?.status === "error") {
                          return (
                            <ToolOutput
                              errorText={
                                output.error ||
                                output.message ||
                                "Search failed"
                              }
                              output={null}
                            />
                          );
                        }

                        if (output?.status === "loading") {
                          return (
                            <div className="flex items-center gap-2 p-4 text-muted-foreground text-sm">
                              <div className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              {output.message}
                            </div>
                          );
                        }

                        if (output?.status === "success" && output?.data) {
                          const { query, results, source } = output.data as {
                            query: string;
                            results: Array<{
                              title: string;
                              url: string;
                              snippet: string;
                            }>;
                            source: string;
                          };

                          return (
                            <div className="space-y-3 p-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                                  Search Results
                                </h4>
                                <span className="text-muted-foreground text-xs">
                                  via {source} · {results.length} results for
                                  &ldquo;{query}&rdquo;
                                </span>
                              </div>
                              <div className="space-y-2">
                                {results.map((result, i) => (
                                  <div
                                    className="rounded-lg border border-border bg-muted/30 p-3"
                                    key={`${result.url}-${i}`}
                                  >
                                    <div className="mb-1 flex items-start justify-between gap-2">
                                      {result.url ? (
                                        <a
                                          className="font-medium text-primary text-sm hover:underline"
                                          href={result.url}
                                          rel="noopener noreferrer"
                                          target="_blank"
                                        >
                                          {result.title}
                                        </a>
                                      ) : (
                                        <span className="font-medium text-sm">
                                          {result.title}
                                        </span>
                                      )}
                                      {result.url && (
                                        <span className="shrink-0 text-muted-foreground text-xs">
                                          {(() => {
                                            try {
                                              return new URL(
                                                result.url
                                              ).hostname.replace("www.", "");
                                            } catch {
                                              return "";
                                            }
                                          })()}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-foreground/70 text-xs leading-relaxed">
                                      {result.snippet}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }

                        return null;
                      })()}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === "tool-transcribeAudio") {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-transcribeAudio" />
                  <ToolContent>
                    {state === "input-available" && toolPart.input && (
                      <ToolInput input={toolPart.input} />
                    )}
                    {state === "output-available" && toolPart.output && (
                      <div className="space-y-3 p-4">
                        {toolPart.output.success ? (
                          <>
                            <div className="flex items-center gap-4 text-muted-foreground text-xs">
                              <span>{toolPart.output.wordCount} words</span>
                              {toolPart.output.language &&
                                toolPart.output.language !==
                                  "auto-detected" && (
                                  <span>
                                    Language: {toolPart.output.language}
                                  </span>
                                )}
                            </div>
                            <div className="rounded-md bg-muted/50 p-3">
                              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                {toolPart.output.transcript}
                              </p>
                            </div>
                          </>
                        ) : (
                          <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                            {toolPart.output.error ||
                              "Failed to transcribe audio"}
                          </div>
                        )}
                      </div>
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === "tool-generateStructuredData") {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader
                    state={state}
                    type="tool-generateStructuredData"
                  />
                  <ToolContent>
                    {state === "input-available" && toolPart.input && (
                      <ToolInput input={toolPart.input} />
                    )}
                    {state === "output-available" && toolPart.output && (
                      <div className="space-y-3 p-4">
                        {toolPart.output.success ? (
                          <>
                            <div className="flex items-center gap-3 text-muted-foreground text-xs">
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                                {toolPart.output.dataType}
                              </span>
                              {toolPart.output.count > 1 && (
                                <span>{toolPart.output.count} items</span>
                              )}
                            </div>
                            <div className="rounded-md bg-muted/50">
                              <CodeBlock
                                code={JSON.stringify(
                                  toolPart.output.data,
                                  null,
                                  2
                                )}
                                language="json"
                              />
                            </div>
                          </>
                        ) : (
                          <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                            {toolPart.output.error ||
                              "Failed to generate structured data"}
                          </div>
                        )}
                      </div>
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === "tool-generateTextEmbeddings") {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool defaultOpen={false} key={toolCallId}>
                  <ToolHeader
                    state={state}
                    type="tool-generateTextEmbeddings"
                  />
                  <ToolContent>
                    {state === "input-available" && toolPart.input && (
                      <ToolInput input={{ texts: toolPart.input.texts }} />
                    )}
                    {state === "output-available" && toolPart.output && (
                      <div className="space-y-2 p-4">
                        {toolPart.output.success ? (
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                              <div className="text-muted-foreground text-xs">
                                Texts embedded
                              </div>
                              <div className="font-medium">
                                {toolPart.output.count}
                              </div>
                            </div>
                            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                              <div className="text-muted-foreground text-xs">
                                Dimensions
                              </div>
                              <div className="font-medium">
                                {toolPart.output.dimensions}
                              </div>
                            </div>
                            {toolPart.output.usage?.tokens && (
                              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                                <div className="text-muted-foreground text-xs">
                                  Tokens used
                                </div>
                                <div className="font-medium">
                                  {toolPart.output.usage.tokens}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                            {toolPart.output.error ||
                              "Failed to generate embeddings"}
                          </div>
                        )}
                      </div>
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === "tool-compareTextSimilarity") {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-compareTextSimilarity" />
                  <ToolContent>
                    {state === "input-available" && toolPart.input && (
                      <ToolInput input={toolPart.input} />
                    )}
                    {state === "output-available" && toolPart.output && (
                      <div className="space-y-4 p-4">
                        {toolPart.output.success ? (
                          <>
                            {toolPart.output.summary && (
                              <div className="flex flex-wrap gap-3 text-sm">
                                <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                                  <div className="text-muted-foreground text-xs">
                                    Avg similarity
                                  </div>
                                  <div className="font-medium">
                                    {Math.round(
                                      toolPart.output.summary
                                        .averageSimilarity * 100
                                    )}
                                    %
                                  </div>
                                </div>
                                <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                                  <div className="text-muted-foreground text-xs">
                                    Threshold
                                  </div>
                                  <div className="font-medium">
                                    {toolPart.output.threshold}
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="space-y-2">
                              {toolPart.output.comparisons?.map(
                                (c: any, i: number) => (
                                  <div
                                    className="rounded-lg border border-border bg-muted/30 p-3"
                                    key={i}
                                  >
                                    <div className="mb-1 flex items-center justify-between gap-2">
                                      <div
                                        className={`rounded-full px-2 py-0.5 font-medium text-xs ${
                                          c.isSimilar
                                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                            : "bg-muted text-muted-foreground"
                                        }`}
                                      >
                                        {Math.round(c.similarity * 100)}%{" "}
                                        {c.isSimilar ? "similar" : "different"}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-foreground/70 text-xs">
                                      <div className="truncate rounded bg-background/50 px-2 py-1">
                                        {c.text1}
                                      </div>
                                      <div className="truncate rounded bg-background/50 px-2 py-1">
                                        {c.text2}
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                            {toolPart.output.error ||
                              "Failed to compare text similarity"}
                          </div>
                        )}
                      </div>
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === "tool-googleDrive") {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-googleDrive" />
                  <ToolContent>
                    {state === "input-available" && toolPart.input && (
                      <ToolInput input={toolPart.input} />
                    )}
                    {state === "output-available" &&
                      toolPart.output &&
                      (() => {
                        const output = toolPart.output as any;

                        if (!output?.success) {
                          return (
                            <ToolOutput
                              errorText={
                                output?.error || "Google Drive request failed"
                              }
                              output={null}
                            />
                          );
                        }

                        // list action
                        if (output.files) {
                          const files = output.files as Array<{
                            id: string;
                            name: string;
                            type: string;
                            modified: string;
                          }>;
                          return (
                            <div className="space-y-2 p-4">
                              <div className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                                {files.length} file
                                {files.length !== 1 ? "s" : ""} found
                              </div>
                              {files.map((f) => (
                                <div
                                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
                                  key={f.id}
                                >
                                  <div className="flex min-w-0 flex-col gap-0.5">
                                    <span className="truncate font-medium text-sm">
                                      {f.name}
                                    </span>
                                    <span className="text-muted-foreground text-xs">
                                      {f.type}
                                    </span>
                                  </div>
                                  <span className="ml-4 shrink-0 text-muted-foreground text-xs">
                                    {new Date(f.modified).toLocaleDateString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        }

                        // read action
                        return (
                          <div className="space-y-3 p-4">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">
                                {output.fileName}
                              </span>
                              {output.truncated && (
                                <span className="text-muted-foreground text-xs">
                                  Truncated to 20,000 chars
                                </span>
                              )}
                            </div>
                            <pre className="max-h-60 overflow-auto whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-foreground/80 text-xs">
                              {output.content}
                            </pre>
                          </div>
                        );
                      })()}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === "tool-notion") {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-notion" />
                  <ToolContent>
                    {state === "input-available" && toolPart.input && (
                      <ToolInput input={toolPart.input} />
                    )}
                    {state === "output-available" &&
                      toolPart.output &&
                      (() => {
                        const output = toolPart.output as any;

                        if (!output?.success) {
                          return (
                            <ToolOutput
                              errorText={
                                output?.error || "Notion request failed"
                              }
                              output={null}
                            />
                          );
                        }

                        // search action
                        if (output.pages) {
                          const pages = output.pages as Array<{
                            id: string;
                            title: string;
                            lastEdited: string;
                            url: string;
                          }>;
                          return (
                            <div className="space-y-2 p-4">
                              <div className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                                {pages.length} page
                                {pages.length !== 1 ? "s" : ""} found
                              </div>
                              {pages.map((p) => (
                                <div
                                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
                                  key={p.id}
                                >
                                  <div className="flex min-w-0 flex-col gap-0.5">
                                    <a
                                      className="truncate font-medium text-sm hover:underline"
                                      href={p.url}
                                      rel="noreferrer"
                                      target="_blank"
                                    >
                                      {p.title}
                                    </a>
                                  </div>
                                  <span className="ml-4 shrink-0 text-muted-foreground text-xs">
                                    {new Date(
                                      p.lastEdited
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        }

                        // read action
                        return (
                          <div className="space-y-3 p-4">
                            <div className="flex items-center justify-between">
                              <a
                                className="font-medium text-sm hover:underline"
                                href={output.url}
                                rel="noreferrer"
                                target="_blank"
                              >
                                {output.title}
                              </a>
                              {output.truncated && (
                                <span className="text-muted-foreground text-xs">
                                  Truncated to 20,000 chars
                                </span>
                              )}
                            </div>
                            <pre className="max-h-60 overflow-auto whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-foreground/80 text-xs">
                              {output.content}
                            </pre>
                          </div>
                        );
                      })()}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === "tool-generateChart") {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-generateChart" />
                  <ToolContent>
                    {state === "input-available" && toolPart.input && (
                      <ToolInput input={toolPart.input} />
                    )}
                    {state === "output-available" && toolPart.output && (
                      <div className="p-4">
                        {toolPart.output.success ? (
                          <Chart config={toolPart.output.chart} />
                        ) : (
                          <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                            {toolPart.output.error ||
                              "Failed to generate chart"}
                          </div>
                        )}
                      </div>
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === "tool-generateSpeech") {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-generateSpeech" />
                  <ToolContent>
                    {state === "input-available" && toolPart.input && (
                      <ToolInput input={toolPart.input} />
                    )}
                    {state === "output-available" && toolPart.output && (
                      <div className="p-4">
                        {toolPart.output.success ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 text-muted-foreground text-xs">
                              <span className="capitalize">
                                {toolPart.output.voice} voice
                              </span>
                              <span>
                                {toolPart.output.characterCount} characters
                              </span>
                            </div>
                            <audio
                              className="h-10 w-full rounded-md"
                              controls
                              src={`data:audio/mp3;base64,${toolPart.output.audio?.base64}`}
                            />
                          </div>
                        ) : (
                          <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                            {toolPart.output.error ||
                              "Failed to generate speech"}
                          </div>
                        )}
                      </div>
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === "tool-saveMemory") {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool key={toolCallId}>
                  <ToolHeader state={state} type="tool-saveMemory" />
                  <ToolContent>
                    {state === "output-available" && toolPart.output && (
                      <div className="p-3 text-sm">
                        {toolPart.output.success ? (
                          <span className="text-muted-foreground">
                            Remembered: {toolPart.output.saved}
                          </span>
                        ) : (
                          <span className="text-destructive">
                            {toolPart.output.error || "Failed to save memory"}
                          </span>
                        )}
                      </div>
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === "tool-renderUI") {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-renderUI" />
                  <ToolContent>
                    {state === "output-available" &&
                      toolPart.output?.component && (
                        <div className="p-3">
                          <GenerativeUIRenderer
                            component={toolPart.output.component}
                          />
                        </div>
                      )}
                  </ToolContent>
                </Tool>
              );
            }

            return null;
          })}

          {!isReadonly && (
            <MessageActions
              chatId={chatId}
              isLoading={isLoading}
              key={`action-${message.id}`}
              message={message}
              setMode={setMode}
              usage={usage}
              vote={vote}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) {
      return false;
    }
    if (prevProps.message.id !== nextProps.message.id) {
      return false;
    }
    if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding) {
      return false;
    }
    if (!equal(prevProps.message.parts, nextProps.message.parts)) {
      return false;
    }
    if (!equal(prevProps.vote, nextProps.vote)) {
      return false;
    }

    return false;
  }
);

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="group/message w-full"
      data-role={role}
      data-testid="message-assistant-loading"
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-start gap-3">
        <div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex w-full flex-col gap-2 md:gap-4">
          <div className="p-0 text-muted-foreground text-sm">Thinking...</div>
        </div>
      </div>
    </motion.div>
  );
};
