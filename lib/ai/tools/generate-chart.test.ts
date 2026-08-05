/**
 * Unit tests for lib/ai/tools/generate-chart.ts.
 * Run with: npx tsx lib/ai/tools/generate-chart.test.ts
 */
import assert from "node:assert/strict";
import { generateChartTool } from "./generate-chart";

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err: unknown) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }
}

// biome-ignore lint/suspicious/noExplicitAny: exercising the tool's execute() directly, not through the AI SDK's typed call path
const execute = generateChartTool().execute as any;

async function main() {
  console.log("generateChartTool");

  await test("rejects empty data with a success:false error", async () => {
    const result = await execute({
      chartType: "line",
      title: "Empty",
      data: [],
    });
    assert.equal(result.success, false);
    assert.equal(result.error, "No data provided to chart");
  });

  await test("line chart infers xKey/yKeys when not provided", async () => {
    const result = await execute({
      chartType: "line",
      title: "Revenue",
      data: [
        { month: "Jan", revenue: 100, cost: 40 },
        { month: "Feb", revenue: 120, cost: 45 },
      ],
    });
    assert.equal(result.success, true);
    assert.equal(result.chart.xKey, "month");
    assert.deepEqual(result.chart.yKeys, ["revenue", "cost"]);
    assert.equal(result.chart.nameKey, undefined);
    assert.equal(result.chart.valueKey, undefined);
  });

  await test("bar chart honors explicit xKey/yKeys instead of inferring", async () => {
    const result = await execute({
      chartType: "bar",
      title: "Revenue",
      xKey: "month",
      yKeys: ["cost"],
      data: [{ month: "Jan", revenue: 100, cost: 40 }],
    });
    assert.equal(result.chart.xKey, "month");
    assert.deepEqual(result.chart.yKeys, ["cost"]);
  });

  await test("pie chart infers nameKey/valueKey when not provided", async () => {
    const result = await execute({
      chartType: "pie",
      title: "Share",
      data: [
        { label: "A", share: 30 },
        { label: "B", share: 70 },
      ],
    });
    assert.equal(result.success, true);
    assert.equal(result.chart.nameKey, "label");
    assert.equal(result.chart.valueKey, "share");
    assert.equal(result.chart.xKey, undefined);
    assert.equal(result.chart.yKeys, undefined);
  });

  await test("pie chart honors explicit nameKey/valueKey instead of inferring", async () => {
    const result = await execute({
      chartType: "pie",
      title: "Share",
      nameKey: "share",
      valueKey: "label",
      data: [{ label: "A", share: 30 }],
    });
    assert.equal(result.chart.nameKey, "share");
    assert.equal(result.chart.valueKey, "label");
  });

  await test("passes through title, description, colors, and unit unchanged", async () => {
    const result = await execute({
      chartType: "area",
      title: "Growth",
      description: "MoM growth",
      colors: ["#111111"],
      unit: "%",
      data: [{ month: "Jan", growth: 5 }],
    });
    assert.equal(result.chart.title, "Growth");
    assert.equal(result.chart.description, "MoM growth");
    assert.deepEqual(result.chart.colors, ["#111111"]);
    assert.equal(result.chart.unit, "%");
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
