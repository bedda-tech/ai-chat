import type {
  UIMessage,
  UIMessagePart,
} from 'ai';
import { type ClassValue, clsx } from 'clsx';
import { formatISO } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import type { DBMessage, Document } from '@/lib/db/schema';
import { ChatSDKError, type ErrorCode } from './errors';
import type { ChatMessage, ChatTools, CustomUIDataTypes } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    const { code, cause } = await response.json();
    throw new ChatSDKError(code as ErrorCode, cause);
  }

  return response.json();
};

/**
 * Wraps fetch with structured error handling. On a non-OK response, parses
 * `{ code, cause, upgrade, upgradeUrl }` from the JSON body and throws a
 * ChatSDKError. On any network failure, detects offline state via
 * `navigator.onLine` and throws `offline:chat` instead of the raw error.
 */
export async function fetchWithErrorHandlers(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  try {
    const response = await fetch(input, init);

    if (!response.ok) {
      const { code, cause, upgrade, upgradeUrl } = await response.json();
      throw new ChatSDKError(code as ErrorCode, cause, upgrade, upgradeUrl);
    }

    return response;
  } catch (error: unknown) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new ChatSDKError('offline:chat');
    }

    throw error;
  }
}

export function getLocalStorage(key: string) {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
  return [];
}

/** Generates a random RFC 4122 v4 UUID without relying on `crypto.randomUUID` (SSR/browser compatibility). */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type ResponseMessage = { id: string; role: string };

/** Returns the last message in the array where `role === 'user'`, or `undefined` if none exists. */
export function getMostRecentUserMessage(messages: UIMessage[]) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1);
}

/** Returns `documents[index].createdAt`, or the current date when the array is falsy or the index is out of range. */
export function getDocumentTimestampByIndex(
  documents: Document[],
  index: number,
) {
  if (!documents) { return new Date(); }
  if (index > documents.length) { return new Date(); }

  return documents[index].createdAt;
}

export function getTrailingMessageId({
  messages,
}: {
  messages: ResponseMessage[];
}): string | null {
  const trailingMessage = messages.at(-1);

  if (!trailingMessage) { return null; }

  return trailingMessage.id;
}

/** Strips the literal `<has_function_call>` marker that some models leak into streamed text output. */
export function sanitizeText(text: string) {
  return text.replace('<has_function_call>', '');
}

export function convertToUIMessages(messages: DBMessage[]): ChatMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role as 'user' | 'assistant' | 'system',
    parts: message.parts as UIMessagePart<CustomUIDataTypes, ChatTools>[],
    metadata: {
      createdAt: formatISO(message.createdAt),
      ...(message.modelId && { modelId: message.modelId }),
    },
  }));
}

export function getTextFromMessage(message: ChatMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

/**
 * Rough token estimate for a message: 4 characters ≈ 1 token.
 */
function estimateMessageTokens(message: ChatMessage): number {
  return Math.ceil(getTextFromMessage(message).length / 4);
}

/**
 * Trim conversation history to fit within a token budget.
 * Always keeps the last message (the current user turn).
 * Walks backwards through older messages, dropping the oldest first.
 *
 * @param messages - Full UI message history (newest last)
 * @param maxTokens - Token budget (e.g. 80% of model context window)
 */
export function pruneUIMessages(
  messages: ChatMessage[],
  maxTokens: number,
): ChatMessage[] {
  if (messages.length <= 1) return messages;

  const lastMessage = messages[messages.length - 1];
  const history = messages.slice(0, -1);

  let budget = maxTokens - estimateMessageTokens(lastMessage);
  const kept: ChatMessage[] = [];

  for (let i = history.length - 1; i >= 0; i--) {
    const tokens = estimateMessageTokens(history[i]);
    if (budget - tokens < 0) break;
    budget -= tokens;
    kept.unshift(history[i]);
  }

  return [...kept, lastMessage];
}
