import { streamObject } from "ai";
import { z } from "zod";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";
import { slidesPrompt, updateDocumentPrompt } from "@/lib/ai/prompts";

export const slidesDocumentHandler = createDocumentHandler<"slides">({
  kind: "slides",
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: slidesPrompt,
      prompt: title,
      schema: z.object({
        markdown: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      if (delta.type === "object") {
        const { markdown } = delta.object;
        if (markdown) {
          dataStream.write({
            type: "data-slidesDelta",
            data: markdown,
            transient: true,
          });
          draftContent = markdown;
        }
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: updateDocumentPrompt(document.content, "slides"),
      prompt: description,
      schema: z.object({
        markdown: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      if (delta.type === "object") {
        const { markdown } = delta.object;
        if (markdown) {
          dataStream.write({
            type: "data-slidesDelta",
            data: markdown,
            transient: true,
          });
          draftContent = markdown;
        }
      }
    }

    return draftContent;
  },
});
