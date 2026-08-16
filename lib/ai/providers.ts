import { gateway } from "@ai-sdk/gateway";
import { createOpenAI } from "@ai-sdk/openai";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
  wrapProvider,
} from "ai";
import { isTestEnvironment } from "../constants";
import {
  cachingMiddleware,
  guardrailsMiddleware,
  loggingMiddleware,
  performanceMiddleware,
} from "./middleware";
import modelsData from "./models-data.json" with { type: "json" };

/**
 * KRAIN protocol inference source (experimental — 2026-07-10).
 *
 * Routes to the KRAIN/axon `inference-router`, an OpenAI-compatible endpoint that
 * serves self-hosted Gemma on our GB10 / Strix Halo nodes.
 *
 * Visible to Pro+ users in the model picker as "Bedda Local (KRAIN)".
 * Disabled in the UI when KRAIN_BASE_URL is unset (checked at API request time).
 * The explicit override below ensures gateway.languageModel("krain/…") is never
 * called — the local krain() client is always used for this model ID.
 */
const krain = createOpenAI({
  baseURL: process.env.KRAIN_BASE_URL ?? "http://localhost:4000/v1",
  apiKey: process.env.KRAIN_API_KEY ?? "unset",
  name: "krain",
});

const productionProvider = customProvider({
  languageModels: {
    // Dynamically register all models from JSON data
    ...Object.fromEntries(
      modelsData.models.map((model) => [
        model.id,
        gateway.languageModel(model.gatewayId),
      ])
    ),

    // Legacy/Default Models (keeping for backward compatibility)
    "chat-model": gateway.languageModel("xai/grok-2-vision-1212"),
    "chat-model-reasoning": wrapLanguageModel({
      model: gateway.languageModel("xai/grok-3-mini"),
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    }),
    "title-model": gateway.languageModel("xai/grok-4.1-fast-non-reasoning"),
    "artifact-model": gateway.languageModel("xai/grok-4.1-fast-non-reasoning"),

    // KRAIN protocol source (hidden — see note above). Routable id only.
    "krain-gemma": krain(process.env.KRAIN_MODEL ?? "gemma-2-9b-it"),
  },
});

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : wrapProvider({
      provider: productionProvider,
      languageModelMiddleware: [
        cachingMiddleware,
        loggingMiddleware,
        performanceMiddleware,
        guardrailsMiddleware,
      ],
    });
