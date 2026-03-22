"use client";
import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { motion } from "framer-motion";
import { memo, useState } from "react";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import { cn, sanitizeText } from "@/lib/utils";
import { useDataStream } from "./data-stream-provider";
import { DocumentToolResult } from "./document";
import { DocumentPreview } from "./document-preview";
import { MessageContent } from "./elements/message";
import { Response } from "./elements/response";
import { CodeBlock } from "./elements/code-block";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "./elements/tool";
import { chatModels } from "@/lib/ai/models";
import { SparklesIcon } from "./icons";
import { MessageActions } from "./message-actions";
import { MessageEditor } from "./message-editor";
import { MessageReasoning } from "./message-reasoning";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  regenerate,
  isReadonly,
  requiresScrollPadding,
}: {
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  requiresScrollPadding: boolean;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");

  // Only show attachment previews for user uploads, not AI-generated images
  const attachmentsFromMessage = message.parts.filter(
    (part) => part.type === "file" && 
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
            {message.metadata?.modelId && (() => {
              const model = chatModels.find(m => m.id === message.metadata?.modelId);
              const displayName = model?.name ?? message.metadata.modelId;
              return (
                <span className="max-w-[4.5rem] text-center font-medium text-muted-foreground text-[10px] leading-tight">
                  {displayName}
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
              const imageSrc = imagePart.url || 
                (imagePart.data ? `data:${imagePart.mediaType};base64,${imagePart.data}` : null) ||
                (imagePart.base64 ? `data:${imagePart.mediaType};base64,${imagePart.base64}` : null);
              
              if (!imageSrc) {
                return null;
              }
              
              return (
                <div key={key} className="overflow-hidden rounded-lg border border-border bg-muted/30 p-2">
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
                    {state === "output-available" && (() => {
                      const output = part.output as any;
                      
                      return (
                        <ToolOutput
                          errorText={output?.error || output?.status === "error" ? output.error : undefined}
                          output={
                            output?.data ? (
                              <Weather weatherAtLocation={output.data} />
                            ) : output?.status === "loading" ? (
                              <div className="text-muted-foreground text-sm p-4">
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
                                alt={toolPart.input?.prompt || "Generated image"}
                                className="w-full"
                                src={`data:${toolPart.output.image.mediaType};base64,${toolPart.output.image.base64}`}
                              />
                            </div>
                            {toolPart.input?.prompt && (
                              <div className="text-muted-foreground text-xs">
                                <span className="font-medium">Prompt:</span> {toolPart.input.prompt}
                              </div>
                            )}
                            {toolPart.output.size && (
                              <div className="text-muted-foreground text-xs">
                                <span className="font-medium">Size:</span> {toolPart.output.size}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                            {toolPart.output.error || "Failed to generate image"}
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
                                <div className="mb-2 font-medium text-sm">Summary</div>
                                <div className="text-foreground/80 text-sm">
                                  {toolPart.output.analysis.summary}
                                </div>
                              </div>
                            )}

                            {/* Findings */}
                            {toolPart.output.analysis.findings && toolPart.output.analysis.findings.length > 0 && (
                              <div className="space-y-2">
                                <div className="font-medium text-sm">Key Findings</div>
                                {toolPart.output.analysis.findings.map((finding: any) => (
                                  <div
                                    key={`${finding.title}-${finding.confidence}`}
                                    className="rounded-lg border border-border bg-muted/30 p-3"
                                  >
                                    <div className="mb-1 flex items-center justify-between">
                                      <div className="font-medium text-sm">{finding.title}</div>
                                      <div className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary text-xs">
                                        {finding.confidence}% confidence
                                      </div>
                                    </div>
                                    <div className="text-foreground/70 text-sm">
                                      {finding.description}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Recommendations */}
                            {toolPart.output.analysis.recommendations && toolPart.output.analysis.recommendations.length > 0 && (
                              <div className="space-y-2">
                                <div className="font-medium text-sm">Recommendations</div>
                                <ul className="space-y-1.5 text-foreground/80 text-sm">
                                  {toolPart.output.analysis.recommendations.map(
                                    (rec: string) => (
                                      <li key={rec} className="flex gap-2">
                                        <span className="text-primary">•</span>
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
                                {toolPart.output.analysis.metadata.processingTime && (
                                  <div>
                                    Processing time: {toolPart.output.analysis.metadata.processingTime}
                                  </div>
                                )}
                                {toolPart.output.analysis.metadata.dataLength !== undefined && (
                                  <div>
                                    Data length: {toolPart.output.analysis.metadata.dataLength} chars
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
                    {state === "output-available" && (() => {
                      const output = part.output as any;

                      if (!output) return null;

                      const { success, language, stdout, stderr, error, executionTime, results } = output;

                      return (
                        <div className="space-y-3 p-4">
                          {/* Stdout */}
                          {stdout && (
                            <div>
                              <div className="mb-1 flex items-center justify-between">
                                <span className="font-mono text-muted-foreground text-xs uppercase tracking-wide">Output</span>
                                {executionTime && (
                                  <span className="text-muted-foreground text-xs">{executionTime}</span>
                                )}
                              </div>
                              <pre className="overflow-x-auto rounded-md bg-muted/50 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                                {stdout}
                              </pre>
                            </div>
                          )}

                          {/* Stderr (non-error warnings) */}
                          {stderr && !error && (
                            <div>
                              <span className="font-mono text-muted-foreground text-xs uppercase tracking-wide">Warnings</span>
                              <pre className="mt-1 overflow-x-auto rounded-md bg-yellow-500/10 p-3 font-mono text-xs text-yellow-700 dark:text-yellow-400 whitespace-pre-wrap">
                                {stderr}
                              </pre>
                            </div>
                          )}

                          {/* Rich results (charts, tables, etc.) */}
                          {results && results.length > 0 && results.map((r: any, i: number) => (
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
                                  dangerouslySetInnerHTML={{ __html: r.svg }}
                                />
                              )}
                              {r.html && (
                                <div
                                  className="overflow-x-auto rounded-md border border-border p-2 text-sm"
                                  dangerouslySetInnerHTML={{ __html: r.html }}
                                />
                              )}
                              {r.json !== undefined && !r.html && !r.png && !r.svg && (
                                <pre className="overflow-x-auto rounded-md bg-muted/50 p-3 font-mono text-xs">
                                  {JSON.stringify(r.json, null, 2)}
                                </pre>
                              )}
                              {r.text && !r.html && !r.png && !r.svg && r.json === undefined && (
                                <pre className="overflow-x-auto rounded-md bg-muted/50 p-3 font-mono text-xs whitespace-pre-wrap">
                                  {r.text}
                                </pre>
                              )}
                            </div>
                          ))}

                          {/* Error */}
                          {error && (
                            <div className="rounded-md bg-destructive/10 p-3">
                              <span className="mb-1 block font-mono text-destructive text-xs font-semibold uppercase">Error</span>
                              <pre className="font-mono text-destructive text-xs whitespace-pre-wrap">{error}</pre>
                            </div>
                          )}

                          {/* Empty success */}
                          {success && !stdout && !stderr && !error && (!results || results.length === 0) && (
                            <div className="text-muted-foreground text-xs">(no output)</div>
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
                    {state === "output-available" && (() => {
                      const output = part.output as any;

                      if (!output?.success) {
                        return (
                          <ToolOutput
                            errorText={output?.error || "Knowledge base search failed"}
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
                              {results.length} passage{results.length !== 1 ? "s" : ""} for &ldquo;{output.query}&rdquo;
                            </span>
                          </div>
                          <div className="space-y-2">
                            {results.map((result, i) => (
                              <div
                                key={i}
                                className="rounded-lg border border-border bg-muted/30 p-3"
                              >
                                <div className="mb-1 flex items-center justify-between gap-2">
                                  <span className="font-medium text-primary text-sm">
                                    {result.source}
                                  </span>
                                  <span className="shrink-0 text-muted-foreground text-xs">
                                    {Math.round(result.similarity * 100)}% match
                                  </span>
                                </div>
                                <p className="text-foreground/70 text-xs leading-relaxed line-clamp-3">
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
                    {state === "output-available" && (() => {
                      const output = part.output as any;

                      if (output?.status === "error") {
                        return (
                          <ToolOutput
                            errorText={output.error || output.message || "Search failed"}
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
                          results: Array<{ title: string; url: string; snippet: string }>;
                          source: string;
                        };

                        return (
                          <div className="space-y-3 p-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                                Search Results
                              </h4>
                              <span className="text-muted-foreground text-xs">
                                via {source} · {results.length} results for &ldquo;{query}&rdquo;
                              </span>
                            </div>
                            <div className="space-y-2">
                              {results.map((result, i) => (
                                <div
                                  key={`${result.url}-${i}`}
                                  className="rounded-lg border border-border bg-muted/30 p-3"
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
                                      <span className="font-medium text-sm">{result.title}</span>
                                    )}
                                    {result.url && (
                                      <span className="shrink-0 text-muted-foreground text-xs">
                                        {(() => {
                                          try {
                                            return new URL(result.url).hostname.replace("www.", "");
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
                              {toolPart.output.language && toolPart.output.language !== "auto-detected" && (
                                <span>Language: {toolPart.output.language}</span>
                              )}
                            </div>
                            <div className="rounded-md bg-muted/50 p-3">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {toolPart.output.transcript}
                              </p>
                            </div>
                          </>
                        ) : (
                          <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                            {toolPart.output.error || "Failed to transcribe audio"}
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
                  <ToolHeader state={state} type="tool-generateStructuredData" />
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
                                code={JSON.stringify(toolPart.output.data, null, 2)}
                                language="json"
                              />
                            </div>
                          </>
                        ) : (
                          <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                            {toolPart.output.error || "Failed to generate structured data"}
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
                  <ToolHeader state={state} type="tool-generateTextEmbeddings" />
                  <ToolContent>
                    {state === "input-available" && toolPart.input && (
                      <ToolInput input={{ texts: toolPart.input.texts }} />
                    )}
                    {state === "output-available" && toolPart.output && (
                      <div className="space-y-2 p-4">
                        {toolPart.output.success ? (
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                              <div className="text-muted-foreground text-xs">Texts embedded</div>
                              <div className="font-medium">{toolPart.output.count}</div>
                            </div>
                            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                              <div className="text-muted-foreground text-xs">Dimensions</div>
                              <div className="font-medium">{toolPart.output.dimensions}</div>
                            </div>
                            {toolPart.output.usage?.tokens && (
                              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                                <div className="text-muted-foreground text-xs">Tokens used</div>
                                <div className="font-medium">{toolPart.output.usage.tokens}</div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                            {toolPart.output.error || "Failed to generate embeddings"}
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
                                  <div className="text-muted-foreground text-xs">Avg similarity</div>
                                  <div className="font-medium">
                                    {Math.round(toolPart.output.summary.averageSimilarity * 100)}%
                                  </div>
                                </div>
                                <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                                  <div className="text-muted-foreground text-xs">Threshold</div>
                                  <div className="font-medium">{toolPart.output.threshold}</div>
                                </div>
                              </div>
                            )}
                            <div className="space-y-2">
                              {toolPart.output.comparisons?.map((c: any, i: number) => (
                                <div
                                  key={i}
                                  className="rounded-lg border border-border bg-muted/30 p-3"
                                >
                                  <div className="mb-1 flex items-center justify-between gap-2">
                                    <div
                                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                        c.isSimilar
                                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                          : "bg-muted text-muted-foreground"
                                      }`}
                                    >
                                      {Math.round(c.similarity * 100)}% {c.isSimilar ? "similar" : "different"}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs text-foreground/70">
                                    <div className="truncate rounded bg-background/50 px-2 py-1">
                                      {c.text1}
                                    </div>
                                    <div className="truncate rounded bg-background/50 px-2 py-1">
                                      {c.text2}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                            {toolPart.output.error || "Failed to compare text similarity"}
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
                    {state === "output-available" && toolPart.output && (() => {
                      const output = toolPart.output as any;

                      if (!output?.success) {
                        return (
                          <ToolOutput
                            errorText={output?.error || "Google Drive request failed"}
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
                            <div className="text-muted-foreground text-xs uppercase tracking-wide font-medium mb-3">
                              {files.length} file{files.length !== 1 ? "s" : ""} found
                            </div>
                            {files.map((f) => (
                              <div
                                key={f.id}
                                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
                              >
                                <div className="flex flex-col gap-0.5 min-w-0">
                                  <span className="text-sm font-medium truncate">{f.name}</span>
                                  <span className="text-xs text-muted-foreground">{f.type}</span>
                                </div>
                                <span className="shrink-0 text-xs text-muted-foreground ml-4">
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
                            <span className="text-sm font-medium">{output.fileName}</span>
                            {output.truncated && (
                              <span className="text-xs text-muted-foreground">Truncated to 20,000 chars</span>
                            )}
                          </div>
                          <pre className="rounded-lg bg-muted/50 p-3 text-xs text-foreground/80 overflow-auto max-h-60 whitespace-pre-wrap">
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
                    {state === "output-available" && toolPart.output && (() => {
                      const output = toolPart.output as any;

                      if (!output?.success) {
                        return (
                          <ToolOutput
                            errorText={output?.error || "Notion request failed"}
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
                            <div className="text-muted-foreground text-xs uppercase tracking-wide font-medium mb-3">
                              {pages.length} page{pages.length !== 1 ? "s" : ""} found
                            </div>
                            {pages.map((p) => (
                              <div
                                key={p.id}
                                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
                              >
                                <div className="flex flex-col gap-0.5 min-w-0">
                                  <a
                                    className="text-sm font-medium truncate hover:underline"
                                    href={p.url}
                                    rel="noreferrer"
                                    target="_blank"
                                  >
                                    {p.title}
                                  </a>
                                </div>
                                <span className="shrink-0 text-xs text-muted-foreground ml-4">
                                  {new Date(p.lastEdited).toLocaleDateString()}
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
                              className="text-sm font-medium hover:underline"
                              href={output.url}
                              rel="noreferrer"
                              target="_blank"
                            >
                              {output.title}
                            </a>
                            {output.truncated && (
                              <span className="text-xs text-muted-foreground">Truncated to 20,000 chars</span>
                            )}
                          </div>
                          <pre className="rounded-lg bg-muted/50 p-3 text-xs text-foreground/80 overflow-auto max-h-60 whitespace-pre-wrap">
                            {output.content}
                          </pre>
                        </div>
                      );
                    })()}
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
                              <span className="capitalize">{toolPart.output.voice} voice</span>
                              <span>{toolPart.output.characterCount} characters</span>
                            </div>
                            <audio
                              controls
                              className="w-full h-10 rounded-md"
                              src={`data:audio/mp3;base64,${toolPart.output.audio?.base64}`}
                            />
                          </div>
                        ) : (
                          <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                            {toolPart.output.error || "Failed to generate speech"}
                          </div>
                        )}
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
