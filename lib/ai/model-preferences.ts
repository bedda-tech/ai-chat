export const MODEL_PREFERENCE_CATEGORIES = [
  "general",
  "coding",
  "writing",
  "analysis",
  "casual",
] as const;

export type ModelPreferenceCategory =
  (typeof MODEL_PREFERENCE_CATEGORIES)[number];
