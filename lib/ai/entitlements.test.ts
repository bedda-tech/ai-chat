import assert from "node:assert/strict";
import { isModelAllowedForTier, FREE_TIER_MODEL_IDS } from "./entitlements";

function testPaidTiersAllowAnyModel() {
  for (const tier of ["pro", "premium", "enterprise"] as const) {
    assert.equal(
      isModelAllowedForTier("anthropic-claude-opus-4-1", tier),
      true,
      `${tier} should allow a non-free-tier model`
    );
    assert.equal(
      isModelAllowedForTier("totally-made-up-model-id", tier),
      true,
      `${tier} should allow even an unrecognized model id`
    );
  }
}

function testFreeTierAllowsOnlyListedModels() {
  assert.equal(
    isModelAllowedForTier(FREE_TIER_MODEL_IDS[0], "free"),
    true,
    "free tier should allow a model on FREE_TIER_MODEL_IDS"
  );
  assert.equal(
    isModelAllowedForTier("anthropic-claude-opus-4-1", "free"),
    false,
    "free tier should reject a paid-only model"
  );
  assert.equal(
    isModelAllowedForTier("totally-made-up-model-id", "free"),
    false,
    "free tier should reject an unrecognized model id"
  );
}

function testEveryFreeTierIdIsAllowedForFreeTier() {
  for (const modelId of FREE_TIER_MODEL_IDS) {
    assert.equal(
      isModelAllowedForTier(modelId, "free"),
      true,
      `expected ${modelId} to be allowed for free tier`
    );
  }
}

function main() {
  const tests: Array<[string, () => void]> = [
    ["paid tiers (pro/premium/enterprise) allow any model", testPaidTiersAllowAnyModel],
    ["free tier allows only FREE_TIER_MODEL_IDS", testFreeTierAllowsOnlyListedModels],
    ["every FREE_TIER_MODEL_IDS entry is allowed for free tier", testEveryFreeTierIdIsAllowedForFreeTier],
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
