import type { AssistantModelMessage, ModelMessage, UserModelMessage } from "ai";
import { getModelConfig } from "./model-config";

export interface SanitizeResult {
  messages: ModelMessage[];
  warnings: string[];
}

function isAnthropicModel(modelId: string): boolean {
  return (
    modelId.startsWith("anthropic-") ||
    modelId.startsWith("anthropic/") ||
    modelId === "chat-model"
  );
}

/**
 * Sanitize ModelMessages for cross-provider compatibility.
 *
 * When users switch models mid-conversation, prior messages may contain
 * parts that the new provider cannot accept:
 * - Reasoning/thinking blocks (Anthropic-specific) must be stripped for OpenAI/Google
 * - Image parts must be stripped for text-only models
 *
 * Returns sanitized messages and human-readable warnings for each change made.
 * Empty assistant messages (e.g. a thinking-only turn) are dropped to avoid
 * provider rejections on empty content arrays.
 */
export function sanitizeMessagesForProvider(
  messages: ModelMessage[],
  targetModelId: string
): SanitizeResult {
  const config = getModelConfig(targetModelId);
  const isAnthropic = isAnthropicModel(targetModelId);

  let didStripReasoning = false;
  let didStripImages = false;

  const result: ModelMessage[] = [];

  for (const msg of messages) {
    if (msg.role === "assistant") {
      const rawContent = msg.content;
      if (typeof rawContent === "string") {
        result.push(msg);
        continue;
      }

      const filtered = rawContent.filter((part) => {
        if (
          (part.type === "reasoning" ||
            (part as { type: string }).type === "redacted-reasoning") &&
          !isAnthropic
        ) {
          didStripReasoning = true;
          return false;
        }
        return true;
      });

      if (filtered.length === 0) {
        // Drop thinking-only assistant turns — they cause empty content errors
        continue;
      }

      result.push({
        ...msg,
        content: filtered,
      } as AssistantModelMessage);
    } else if (msg.role === "user") {
      const rawContent = msg.content;
      if (typeof rawContent === "string") {
        result.push(msg);
        continue;
      }

      const filtered = rawContent.filter((part) => {
        if (part.type === "image" && !config.supportsVision) {
          didStripImages = true;
          return false;
        }
        return true;
      });

      if (filtered.length === 0) {
        // Replace image-only messages with a text placeholder
        result.push({
          ...msg,
          content: [
            {
              type: "text",
              text: "[Image removed: this model does not support vision input]",
            },
          ],
        } as UserModelMessage);
      } else {
        result.push({ ...msg, content: filtered } as UserModelMessage);
      }
    } else {
      result.push(msg);
    }
  }

  const warnings: string[] = [];
  if (didStripReasoning) {
    warnings.push(
      "Reasoning blocks from a previous model were removed — they are not supported by this provider."
    );
  }
  if (didStripImages) {
    warnings.push(
      "Images were removed from earlier messages — this model does not support vision input."
    );
  }

  return { messages: result, warnings };
}
