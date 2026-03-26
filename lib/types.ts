import type { InferUITool, UIMessage } from "ai";
import { z } from "zod";
import type { ArtifactKind } from "@/components/artifact";
import type { createDocument } from "./ai/tools/create-document";
import type { getWeather } from "./ai/tools/get-weather";
import type { requestSuggestions } from "./ai/tools/request-suggestions";
import type { updateDocument } from "./ai/tools/update-document";
import type { executeCodeTool } from "./ai/tools/execute-code";
import type { webSearchTool } from "./ai/tools/web-search";
import type { queryKnowledgeBaseTool } from "./ai/tools/knowledge-base";
import type { analyzeDataTool } from "./ai/tools/analyze-data";
import type { generateStructuredDataTool } from "./ai/tools/generate-structured-data";
import type { transcribeAudioTool } from "./ai/tools/transcribe-audio";
import type { generateImageTool } from "./ai/tools/generate-image";
import type {
  generateTextEmbeddingsTool,
  compareTextSimilarityTool,
} from "./ai/tools/text-embeddings";
import type { googleDriveTool } from "./ai/tools/google-drive";
import type { notionTool } from "./ai/tools/notion";
import type { generateSpeechTool } from "./ai/tools/generate-speech";
import type { generateChartTool } from "./ai/tools/generate-chart";
import type { Suggestion } from "./db/schema";
import type { AppUsage } from "./usage";

export type DataPart = { type: "append-message"; message: string };

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
  modelId: z.string().optional(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

type weatherTool = InferUITool<typeof getWeather>;
type webSearchToolType = InferUITool<typeof webSearchTool>;
type executeCodeToolType = InferUITool<ReturnType<typeof executeCodeTool>>;
type queryKnowledgeBaseToolType = InferUITool<ReturnType<typeof queryKnowledgeBaseTool>>;
type createDocumentTool = InferUITool<ReturnType<typeof createDocument>>;
type updateDocumentTool = InferUITool<ReturnType<typeof updateDocument>>;
type requestSuggestionsTool = InferUITool<ReturnType<typeof requestSuggestions>>;
type analyzeDataToolType = InferUITool<ReturnType<typeof analyzeDataTool>>;
type generateStructuredDataToolType = InferUITool<ReturnType<typeof generateStructuredDataTool>>;
type transcribeAudioToolType = InferUITool<ReturnType<typeof transcribeAudioTool>>;
type generateImageToolType = InferUITool<ReturnType<typeof generateImageTool>>;
type generateTextEmbeddingsToolType = InferUITool<ReturnType<typeof generateTextEmbeddingsTool>>;
type compareTextSimilarityToolType = InferUITool<ReturnType<typeof compareTextSimilarityTool>>;
type googleDriveToolType = InferUITool<ReturnType<typeof googleDriveTool>>;
type notionToolType = InferUITool<ReturnType<typeof notionTool>>;
type generateSpeechToolType = InferUITool<ReturnType<typeof generateSpeechTool>>;
type generateChartToolType = InferUITool<ReturnType<typeof generateChartTool>>;

export type ChatTools = {
  getWeather: weatherTool;
  webSearch: webSearchToolType;
  executeCode: executeCodeToolType;
  queryKnowledgeBase: queryKnowledgeBaseToolType;
  createDocument: createDocumentTool;
  updateDocument: updateDocumentTool;
  requestSuggestions: requestSuggestionsTool;
  analyzeData: analyzeDataToolType;
  generateStructuredData: generateStructuredDataToolType;
  transcribeAudio: transcribeAudioToolType;
  generateImage: generateImageToolType;
  generateTextEmbeddings: generateTextEmbeddingsToolType;
  compareTextSimilarity: compareTextSimilarityToolType;
  googleDrive: googleDriveToolType;
  notion: notionToolType;
  generateSpeech: generateSpeechToolType;
  generateChart: generateChartToolType;
};

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  suggestion: Suggestion;
  appendMessage: string;
  id: string;
  title: string;
  kind: ArtifactKind;
  clear: null;
  finish: null;
  usage: AppUsage;
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;

export type Attachment = {
  name: string;
  url: string;
  contentType: string;
};
