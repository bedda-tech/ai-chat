"use server";

import { generateText, type UIMessage } from "ai";
import { cookies } from "next/headers";
import type { VisibilityType } from "@/components/visibility-selector";
import { myProvider } from "@/lib/ai/providers";
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
} from "@/lib/db/queries";

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set("chat-model", model);
}

function fallbackTitle(message: UIMessage): string {
  const text = (message.parts ?? [])
    .map((part) => (part.type === "text" ? part.text : ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.slice(0, 80) : "New chat";
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  // A title is cosmetic. If the title model is unavailable the chat must still answer,
  // so fall back to the start of the message instead of failing the whole request.
  try {
    const { text: title } = await generateText({
      model: myProvider.languageModel("title-model"),
      system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
      prompt: JSON.stringify(message),
    });

    return title.trim() || fallbackTitle(message);
  } catch (error) {
    console.error("[title] generation failed, using fallback:", error);
    return fallbackTitle(message);
  }
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}
