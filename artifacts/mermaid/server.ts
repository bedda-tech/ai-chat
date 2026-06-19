import { streamObject } from "ai";
import { z } from "zod";
import { mermaidPrompt, updateDocumentPrompt } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";

export const mermaidDocumentHandler = createDocumentHandler<"mermaid">({
  kind: "mermaid",
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: mermaidPrompt,
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
            type: "data-mermaidDelta",
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
      system: updateDocumentPrompt(document.content, "mermaid"),
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
            type: "data-mermaidDelta",
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
