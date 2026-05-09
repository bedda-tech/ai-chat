import { streamObject } from "ai";
import { z } from "zod";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";
import { htmlPrompt, updateDocumentPrompt } from "@/lib/ai/prompts";

export const htmlDocumentHandler = createDocumentHandler<"html">({
  kind: "html",
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: htmlPrompt,
      prompt: title,
      schema: z.object({
        code: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      if (delta.type === "object") {
        const { code } = delta.object;
        if (code) {
          dataStream.write({
            type: "data-htmlDelta",
            data: code,
            transient: true,
          });
          draftContent = code;
        }
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: updateDocumentPrompt(document.content, "html"),
      prompt: description,
      schema: z.object({
        code: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      if (delta.type === "object") {
        const { code } = delta.object;
        if (code) {
          dataStream.write({
            type: "data-htmlDelta",
            data: code,
            transient: true,
          });
          draftContent = code;
        }
      }
    }

    return draftContent;
  },
});
