import assert from "node:assert/strict";
import {
  PROMPT_CATEGORIES,
  PROMPT_TEMPLATES,
  getPromptsByCategory,
} from "./prompt-library";

function testGetPromptsByCategoryReturnsOnlyMatchingCategory() {
  const results = getPromptsByCategory("coding");
  assert.ok(results.length > 0, "coding category should have templates");
  for (const template of results) {
    assert.equal(
      template.category,
      "coding",
      `expected template ${template.id} to be category "coding"`
    );
  }
}

function testGetPromptsByCategoryCoversEveryDefinedCategory() {
  for (const { id } of PROMPT_CATEGORIES) {
    const results = getPromptsByCategory(id);
    assert.ok(
      results.length > 0,
      `category "${id}" should have at least one template`
    );
  }
}

function testGetPromptsByCategoryFilteringIsExhaustive() {
  const total = PROMPT_CATEGORIES.reduce(
    (sum, { id }) => sum + getPromptsByCategory(id).length,
    0
  );
  assert.equal(
    total,
    PROMPT_TEMPLATES.length,
    "every template should belong to exactly one of the defined categories"
  );
}

function testTemplateIdsAreUnique() {
  const ids = PROMPT_TEMPLATES.map((t) => t.id);
  assert.equal(
    new Set(ids).size,
    ids.length,
    "template ids should all be unique"
  );
}

function testEveryTemplateCategoryIsRegistered() {
  const registeredCategories = new Set(PROMPT_CATEGORIES.map((c) => c.id));
  for (const template of PROMPT_TEMPLATES) {
    assert.ok(
      registeredCategories.has(template.category),
      `template ${template.id} references unregistered category "${template.category}"`
    );
  }
}

function main() {
  const tests: [string, () => void][] = [
    [
      "getPromptsByCategory returns only templates matching the requested category",
      testGetPromptsByCategoryReturnsOnlyMatchingCategory,
    ],
    [
      "getPromptsByCategory returns at least one template for every defined category",
      testGetPromptsByCategoryCoversEveryDefinedCategory,
    ],
    [
      "getPromptsByCategory filtering across all categories accounts for every template",
      testGetPromptsByCategoryFilteringIsExhaustive,
    ],
    ["template ids are all unique", testTemplateIdsAreUnique],
    [
      "every template's category is a registered category",
      testEveryTemplateCategoryIsRegistered,
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
