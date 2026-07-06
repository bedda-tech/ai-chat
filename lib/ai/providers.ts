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
 * KRAIN protocol inference source (HIDDEN / experimental — 2026-07-06).
 *
 * Routes to the KRAIN/axon `inference-router`, an OpenAI-compatible endpoint that
 * serves self-hosted Gemma on our GB10 / Strix Halo nodes. This makes bedda-ai the
 * protocol's first real inference consumer (see memory: bedda-ai-krain-convergence).
 *
 * Deliberately NOT added to models-data.json or entitlements, so it does NOT appear
 * in the model picker for ANY tier (guest/free/paid) — it exists only as a routable
 * model id. To EXPOSE it later: add a models-data.json entry + list its id in
 * entitlements. Until KRAIN_BASE_URL is set it is inert (created lazily; only fails
 * at request time, which cannot happen while it is unlisted).
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
    "title-model": gateway.languageModel("xai/grok-2-1212"),
    "artifact-model": gateway.languageModel("xai/grok-2-1212"),

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
