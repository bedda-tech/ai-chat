import assert from "node:assert/strict";
import {
  MARKETPLACE_CATEGORIES,
  MARKETPLACE_PLUGINS,
} from "./marketplace-data";

function testPluginIdsAreUnique() {
  const ids = MARKETPLACE_PLUGINS.map((p) => p.id);
  assert.equal(
    new Set(ids).size,
    ids.length,
    "plugin ids should all be unique"
  );
}

function testEveryPluginCategoryIsRegistered() {
  const registered = new Set(MARKETPLACE_CATEGORIES);
  for (const plugin of MARKETPLACE_PLUGINS) {
    assert.ok(
      registered.has(plugin.category),
      `plugin ${plugin.id} references unregistered category "${plugin.category}"`
    );
  }
}

function testEveryCategoryHasAtLeastOnePlugin() {
  for (const category of MARKETPLACE_CATEGORIES) {
    const count = MARKETPLACE_PLUGINS.filter(
      (p) => p.category === category
    ).length;
    assert.ok(count > 0, `category "${category}" should have >=1 plugin`);
  }
}

function testWebhookUrlTemplatesAreHttps() {
  for (const plugin of MARKETPLACE_PLUGINS) {
    assert.ok(
      plugin.webhookUrlTemplate.startsWith("https://"),
      `plugin ${plugin.id} webhookUrlTemplate should be an https:// URL, got "${plugin.webhookUrlTemplate}"`
    );
  }
}

function testParametersSchemaRequiredFieldsExistInProperties() {
  for (const plugin of MARKETPLACE_PLUGINS) {
    const schema = plugin.parametersSchema as {
      properties?: Record<string, unknown>;
      required?: string[];
    };
    const propertyKeys = new Set(Object.keys(schema.properties ?? {}));
    for (const requiredKey of schema.required ?? []) {
      assert.ok(
        propertyKeys.has(requiredKey),
        `plugin ${plugin.id} parametersSchema.required references undefined property "${requiredKey}"`
      );
    }
  }
}

function testSecretParamsAreMarkedRequired() {
  for (const plugin of MARKETPLACE_PLUGINS) {
    for (const param of plugin.params) {
      if (param.secret) {
        assert.ok(
          param.required,
          `plugin ${plugin.id} param "${param.name}" is marked secret but not required`
        );
      }
    }
  }
}

function testEveryPluginHasNonEmptyNameAndDescription() {
  for (const plugin of MARKETPLACE_PLUGINS) {
    assert.ok(
      plugin.name.trim().length > 0,
      `plugin ${plugin.id} should have a non-empty name`
    );
    assert.ok(
      plugin.description.trim().length > 0,
      `plugin ${plugin.id} should have a non-empty description`
    );
  }
}

function main() {
  const tests: [string, () => void][] = [
    ["plugin ids are all unique", testPluginIdsAreUnique],
    [
      "every plugin's category is a registered marketplace category",
      testEveryPluginCategoryIsRegistered,
    ],
    [
      "every registered category has at least one plugin",
      testEveryCategoryHasAtLeastOnePlugin,
    ],
    [
      "every webhookUrlTemplate is an https:// URL",
      testWebhookUrlTemplatesAreHttps,
    ],
    [
      "every parametersSchema.required key exists in its properties",
      testParametersSchemaRequiredFieldsExistInProperties,
    ],
    [
      "every secret param is also marked required",
      testSecretParamsAreMarkedRequired,
    ],
    [
      "every plugin has a non-empty name and description",
      testEveryPluginHasNonEmptyNameAndDescription,
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
