import { smoothStream, streamText } from "ai";
import { codePrompt, updateDocumentPrompt } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";

export const codeDocumentHandler = createDocumentHandler<"code">({
  kind: "code",
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamText({
      model: myProvider.languageModel("artifact-model"),
      system: `${codePrompt}\n\nOutput ONLY the raw code. Do not include markdown code fences, backticks, or any explanation.`,
      experimental_transform: smoothStream({ chunking: "word" }),
      prompt: title,
    });

    for await (const delta of fullStream) {
      if (delta.type === "text-delta") {
        draftContent += delta.text;

        dataStream.write({
          type: "data-codeDelta",
          data: draftContent,
          transient: true,
        });
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamText({
      model: myProvider.languageModel("artifact-model"),
      system: `${updateDocumentPrompt(document.content, "code")}\n\nOutput ONLY the raw code. Do not include markdown code fences, backticks, or any explanation.`,
      experimental_transform: smoothStream({ chunking: "word" }),
      prompt: description,
    });

    for await (const delta of fullStream) {
      if (delta.type === "text-delta") {
        draftContent += delta.text;

        dataStream.write({
          type: "data-codeDelta",
          data: draftContent,
          transient: true,
        });
      }
    }

    return draftContent;
  },
});
