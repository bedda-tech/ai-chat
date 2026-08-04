/**
 * Unit tests for prompts.ts system-prompt assembly logic.
 * Run with: npx tsx lib/ai/prompts.test.ts
 */
import assert from "node:assert/strict";
import type { ArtifactKind } from "@/components/artifact";
import {
  getCacheableSystemPrompt,
  getRequestPromptFromHints,
  systemPrompt,
  updateDocumentPrompt,
} from "./prompts";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err: unknown) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }
}

const baseHints = {
  latitude: "37.7749",
  longitude: "-122.4194",
  city: "San Francisco",
  country: "US",
};

console.log("getRequestPromptFromHints");

test("interpolates all four location fields", () => {
  const prompt = getRequestPromptFromHints(baseHints);
  assert.match(prompt, /lat: 37\.7749/);
  assert.match(prompt, /lon: -122\.4194/);
  assert.match(prompt, /city: San Francisco/);
  assert.match(prompt, /country: US/);
});

console.log("\nsystemPrompt");

test("reasoning model omits the artifacts prompt", () => {
  const prompt = systemPrompt({
    selectedChatModel: "chat-model-reasoning",
    requestHints: baseHints,
  });
  assert.doesNotMatch(prompt, /Artifacts is a special user interface mode/);
});

test("non-reasoning model includes the artifacts prompt", () => {
  const prompt = systemPrompt({
    selectedChatModel: "openai-gpt-5",
    requestHints: baseHints,
  });
  assert.match(prompt, /Artifacts is a special user interface mode/);
});

test("omits custom_instructions block when not provided", () => {
  const prompt = systemPrompt({
    selectedChatModel: "openai-gpt-5",
    requestHints: baseHints,
  });
  assert.doesNotMatch(prompt, /<custom_instructions>/);
});

test("includes trimmed custom_instructions block when provided", () => {
  const prompt = systemPrompt({
    selectedChatModel: "openai-gpt-5",
    requestHints: baseHints,
    customInstructions: "  Always answer in French.  ",
  });
  assert.match(
    prompt,
    /<custom_instructions>\nAlways answer in French\.\n<\/custom_instructions>/
  );
});

test("blank custom_instructions (whitespace only) is omitted", () => {
  const prompt = systemPrompt({
    selectedChatModel: "openai-gpt-5",
    requestHints: baseHints,
    customInstructions: "   ",
  });
  assert.doesNotMatch(prompt, /<custom_instructions>/);
});

test("includes knowledge_base_context block when kbContext provided", () => {
  const prompt = systemPrompt({
    selectedChatModel: "openai-gpt-5",
    requestHints: baseHints,
    kbContext: "The sky is blue.",
  });
  assert.match(prompt, /<knowledge_base_context>/);
  assert.match(prompt, /The sky is blue\./);
});

test("includes agent research prompt only when agentMode is true", () => {
  const withAgent = systemPrompt({
    selectedChatModel: "openai-gpt-5",
    requestHints: baseHints,
    agentMode: true,
  });
  const withoutAgent = systemPrompt({
    selectedChatModel: "openai-gpt-5",
    requestHints: baseHints,
    agentMode: false,
  });
  assert.match(withAgent, /Deep Research mode/);
  assert.doesNotMatch(withoutAgent, /Deep Research mode/);
});

test("formats user_memory block with category-tagged bullets", () => {
  const prompt = systemPrompt({
    selectedChatModel: "openai-gpt-5",
    requestHints: baseHints,
    userMemories: [
      { content: "Prefers dark mode", category: "preferences" },
      { content: "Works at Acme", category: "profile" },
    ],
  });
  assert.match(prompt, /<user_memory>/);
  assert.match(prompt, /- \[preferences\] Prefers dark mode/);
  assert.match(prompt, /- \[profile\] Works at Acme/);
});

test("empty userMemories array omits the user_memory block", () => {
  const prompt = systemPrompt({
    selectedChatModel: "openai-gpt-5",
    requestHints: baseHints,
    userMemories: [],
  });
  assert.doesNotMatch(prompt, /<user_memory>/);
});

test("gemini 2.5 flash image model gets native image-gen guidance", () => {
  const prompt = systemPrompt({
    selectedChatModel: "google-gemini-2.5-flash-image-preview",
    requestHints: baseHints,
  });
  assert.match(prompt, /can generate images directly in responses/);
});

test("other models get the generateImage tool guidance", () => {
  const prompt = systemPrompt({
    selectedChatModel: "openai-gpt-5",
    requestHints: baseHints,
  });
  assert.match(prompt, /generateImage tool/);
});

console.log("\ngetCacheableSystemPrompt");

test("anthropic models get an ephemeral cache-control system message object", () => {
  const result = getCacheableSystemPrompt({
    selectedChatModel: "anthropic-claude-sonnet-4-6",
    requestHints: baseHints,
  });
  assert.equal(typeof result, "object");
  if (typeof result === "object") {
    assert.equal(result.role, "system");
    assert.deepEqual(result.providerOptions, {
      anthropic: { cacheControl: { type: "ephemeral" } },
    });
  }
});

test("claude-named models also get cache control (id check is substring-based)", () => {
  const result = getCacheableSystemPrompt({
    selectedChatModel: "claude-3-7-sonnet",
    requestHints: baseHints,
  });
  assert.equal(typeof result, "object");
});

test("non-anthropic models get back a plain string", () => {
  const result = getCacheableSystemPrompt({
    selectedChatModel: "openai-gpt-5",
    requestHints: baseHints,
  });
  assert.equal(typeof result, "string");
});

console.log("\nupdateDocumentPrompt");

test("maps each artifact kind to its expected media-type phrasing", () => {
  const cases: Array<[ArtifactKind, string]> = [
    ["code", "code snippet"],
    ["sheet", "spreadsheet"],
    ["mermaid", "Mermaid diagram"],
    ["html", "HTML document"],
    ["slides", "slide deck (Reveal.js markdown)"],
    ["notebook", "Jupyter notebook (JSON format)"],
  ];
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  for (const [kind, expectedPhrase] of cases) {
    const prompt = updateDocumentPrompt("old content", kind);
    assert.match(
      prompt,
      new RegExp(
        `Improve the following contents of the ${escapeRegExp(expectedPhrase)}`
      )
    );
  }
});

test("unrecognized/text kind falls back to generic 'document'", () => {
  const prompt = updateDocumentPrompt("old content", "text" as ArtifactKind);
  assert.match(prompt, /Improve the following contents of the document/);
});

test("appends the current content verbatim", () => {
  const prompt = updateDocumentPrompt("SELECT * FROM users;", "code");
  assert.match(prompt, /SELECT \* FROM users;$/);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
