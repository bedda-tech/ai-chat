import assert from "node:assert/strict";
import { applyOrgModelPolicy } from "./model-config";

const ALL_MODELS = [
  "openai-gpt-5",
  "anthropic-claude-opus-4-1",
  "google-gemini-2.5-pro",
];

function testNullPolicyReturnsAllModels() {
  assert.deepEqual(
    applyOrgModelPolicy(ALL_MODELS, null),
    ALL_MODELS,
    "null policy should be a no-op"
  );
}

function testAllowedModelIdsFiltersToAllowlist() {
  assert.deepEqual(
    applyOrgModelPolicy(ALL_MODELS, { allowedModelIds: ["openai-gpt-5"] }),
    ["openai-gpt-5"],
    "should keep only models on the allowlist"
  );
}

function testEmptyAllowedModelIdsIsTreatedAsNoRestriction() {
  assert.deepEqual(
    applyOrgModelPolicy(ALL_MODELS, { allowedModelIds: [] }),
    ALL_MODELS,
    "an empty allowlist array should not filter anything out"
  );
}

function testDeniedModelIdsRemovesDeniedEntries() {
  assert.deepEqual(
    applyOrgModelPolicy(ALL_MODELS, {
      deniedModelIds: ["anthropic-claude-opus-4-1"],
    }),
    ["openai-gpt-5", "google-gemini-2.5-pro"],
    "should drop models on the denylist"
  );
}

function testEmptyDeniedModelIdsIsTreatedAsNoRestriction() {
  assert.deepEqual(
    applyOrgModelPolicy(ALL_MODELS, { deniedModelIds: [] }),
    ALL_MODELS,
    "an empty denylist array should not filter anything out"
  );
}

function testAllowedAndDeniedComposeTogether() {
  assert.deepEqual(
    applyOrgModelPolicy(ALL_MODELS, {
      allowedModelIds: ["openai-gpt-5", "anthropic-claude-opus-4-1"],
      deniedModelIds: ["anthropic-claude-opus-4-1"],
    }),
    ["openai-gpt-5"],
    "denylist should apply on top of an already-filtered allowlist result"
  );
}

function testDeniedModelIdNotInListIsANoOp() {
  assert.deepEqual(
    applyOrgModelPolicy(ALL_MODELS, {
      deniedModelIds: ["some-model-nobody-uses"],
    }),
    ALL_MODELS,
    "denying a model id that isn't present should not change the result"
  );
}

function main() {
  const tests: [string, () => void][] = [
    [
      "null policy returns all models unchanged",
      testNullPolicyReturnsAllModels,
    ],
    [
      "allowedModelIds filters down to the allowlist",
      testAllowedModelIdsFiltersToAllowlist,
    ],
    [
      "empty allowedModelIds array is treated as no restriction",
      testEmptyAllowedModelIdsIsTreatedAsNoRestriction,
    ],
    [
      "deniedModelIds removes denied entries",
      testDeniedModelIdsRemovesDeniedEntries,
    ],
    [
      "empty deniedModelIds array is treated as no restriction",
      testEmptyDeniedModelIdsIsTreatedAsNoRestriction,
    ],
    [
      "allowedModelIds and deniedModelIds compose together",
      testAllowedAndDeniedComposeTogether,
    ],
    [
      "a denied id absent from the input list is a no-op",
      testDeniedModelIdNotInListIsANoOp,
    ],
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
