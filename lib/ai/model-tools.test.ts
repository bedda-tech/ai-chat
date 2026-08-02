import assert from "node:assert/strict";
import {
  getModelTools,
  getToolDisplayName,
  getToolIcon,
  modelSupportsTools,
  type ModelTool,
} from "./model-tools";

function testReasoningModelsGetNoTools() {
  assert.deepEqual(
    getModelTools("chat-model-reasoning"),
    [],
    "chat-model-reasoning should have no tools"
  );
  assert.deepEqual(
    getModelTools("deepseek-reasoner"),
    [],
    "any model id containing 'reasoner' should have no tools"
  );
}

function testBaseModelGetsBaseToolsWithoutImages() {
  const tools = getModelTools("anthropic-claude-sonnet-4-6");
  assert.equal(
    tools.includes("images"),
    false,
    "non-Gemini-2.5 model should not get image generation"
  );
  for (const expected of [
    "weather",
    "documents",
    "suggestions",
    "analysis",
    "structured-data",
    "audio-transcription",
    "embeddings",
    "similarity",
  ] as const) {
    assert.equal(
      tools.includes(expected),
      true,
      `base tools should include ${expected}`
    );
  }
}

function testGemini25ModelsGetImageGeneration() {
  assert.equal(
    getModelTools("google-gemini-2.5-flash").includes("images"),
    true,
    "google-gemini-2.5-flash should support image generation"
  );
  assert.equal(
    getModelTools("gemini-2.5-pro").includes("images"),
    true,
    "gemini-2.5-pro should support image generation"
  );
  assert.equal(
    getModelTools("google-gemini-2.0-flash").includes("images"),
    false,
    "gemini 2.0 should not support image generation"
  );
}

function testModelSupportsTools() {
  assert.equal(
    modelSupportsTools("chat-model-reasoning"),
    false,
    "reasoning model should report no tool support"
  );
  assert.equal(
    modelSupportsTools("anthropic-claude-sonnet-4-6"),
    true,
    "standard model should report tool support"
  );
}

function testGetToolDisplayNameCoversEveryTool() {
  const expected: Record<ModelTool, string> = {
    weather: "Weather",
    documents: "Documents",
    suggestions: "Suggestions",
    images: "Images",
    analysis: "Analysis",
    "structured-data": "Structured Data",
    "audio-transcription": "Audio",
    embeddings: "Embeddings",
    similarity: "Similarity",
  };
  for (const [tool, name] of Object.entries(expected) as Array<
    [ModelTool, string]
  >) {
    assert.equal(getToolDisplayName(tool), name);
  }
}

function testGetToolIconCoversEveryTool() {
  const tools: ModelTool[] = [
    "weather",
    "documents",
    "suggestions",
    "images",
    "analysis",
    "structured-data",
    "audio-transcription",
    "embeddings",
    "similarity",
  ];
  for (const tool of tools) {
    assert.notEqual(
      getToolIcon(tool),
      undefined,
      `${tool} should map to a defined icon`
    );
  }
}

function main() {
  const tests: Array<[string, () => void]> = [
    ["reasoning models get no tools", testReasoningModelsGetNoTools],
    [
      "base model gets base tools without images",
      testBaseModelGetsBaseToolsWithoutImages,
    ],
    [
      "gemini-2.5 models get image generation",
      testGemini25ModelsGetImageGeneration,
    ],
    ["modelSupportsTools reflects getModelTools", testModelSupportsTools],
    [
      "getToolDisplayName covers every tool",
      testGetToolDisplayNameCoversEveryTool,
    ],
    ["getToolIcon covers every tool", testGetToolIconCoversEveryTool],
  ];

  let failures = 0;
  for (const [name, fn] of tests) {
    try {
      fn();
      console.log(`PASS: ${name}`);
    } catch (err) {
      failures++;
      console.error(`FAIL: ${name}`);
      console.error(err);
    }
  }

  if (failures > 0) {
    console.error(`${failures}/${tests.length} tests failed`);
    process.exit(1);
  }
  console.log(`All ${tests.length} tests passed`);
}

main();
