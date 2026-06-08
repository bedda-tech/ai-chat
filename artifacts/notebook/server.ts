import { streamObject } from "ai";
import { z } from "zod";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";
import { notebookPrompt, updateDocumentPrompt } from "@/lib/ai/prompts";

const cellSchema = z.object({
  type: z.enum(["markdown", "code"]),
  language: z.string().optional(),
  content: z.string(),
});

const notebookSchema = z.object({
  cells: z.array(cellSchema),
});

export const notebookDocumentHandler = createDocumentHandler<"notebook">({
  kind: "notebook",
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: notebookPrompt,
      prompt: title,
      schema: z.object({
        notebook: notebookSchema,
      }),
    });

    for await (const delta of fullStream) {
      if (delta.type === "object") {
        const { notebook } = delta.object;
        if (notebook?.cells?.length) {
          const serialized = JSON.stringify(notebook);
          dataStream.write({
            type: "data-notebookDelta",
            data: serialized,
            transient: true,
          });
          draftContent = serialized;
        }
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: updateDocumentPrompt(document.content, "notebook"),
      prompt: description,
      schema: z.object({
        notebook: notebookSchema,
      }),
    });

    for await (const delta of fullStream) {
      if (delta.type === "object") {
        const { notebook } = delta.object;
        if (notebook?.cells?.length) {
          const serialized = JSON.stringify(notebook);
          dataStream.write({
            type: "data-notebookDelta",
            data: serialized,
            transient: true,
          });
          draftContent = serialized;
        }
      }
    }

    return draftContent;
  },
});
