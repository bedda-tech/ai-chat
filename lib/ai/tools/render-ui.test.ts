/**
 * Unit tests for lib/ai/tools/render-ui.ts.
 * Run with: npx tsx lib/ai/tools/render-ui.test.ts
 */
import assert from "node:assert/strict";
import { renderUITool } from "./render-ui";

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

const schema = renderUITool.inputSchema;

async function main() {
  console.log("renderUITool.inputSchema");

  await test("table: column type defaults to 'text' when omitted", () => {
    const parsed = schema.parse({
      type: "table",
      title: "Users",
      columns: [{ key: "name", label: "Name" }],
      rows: [{ name: "Ada" }],
    });
    assert.equal(parsed.type, "table");
    assert.equal(parsed.columns[0].type, "text");
  });

  await test("table: explicit column type is preserved", () => {
    const parsed = schema.parse({
      type: "table",
      title: "Users",
      columns: [{ key: "status", label: "Status", type: "badge" }],
      rows: [{ status: "active" }],
    });
    assert.equal(parsed.columns[0].type, "badge");
  });

  await test("table: rejects a row value that is not string/number/null", () => {
    assert.throws(() => {
      schema.parse({
        type: "table",
        title: "Users",
        columns: [{ key: "active", label: "Active" }],
        rows: [{ active: true }],
      });
    });
  });

  await test("checklist: item.checked defaults to false when omitted", () => {
    const parsed = schema.parse({
      type: "checklist",
      title: "Todo",
      items: [{ id: "1", label: "Ship it" }],
    });
    assert.equal(parsed.type, "checklist");
    assert.equal(parsed.items[0].checked, false);
  });

  await test("timeline: item.status defaults to 'upcoming' when omitted", () => {
    const parsed = schema.parse({
      type: "timeline",
      title: "Roadmap",
      items: [{ date: "2026-01-01", title: "Kickoff" }],
    });
    assert.equal(parsed.items[0].status, "upcoming");
  });

  await test("stats: accepts string or number value with optional trend", () => {
    const parsed = schema.parse({
      type: "stats",
      title: "KPIs",
      items: [
        { label: "Revenue", value: 1000, trend: "up" },
        { label: "Plan", value: "Pro" },
      ],
    });
    assert.equal(parsed.items[0].trend, "up");
    assert.equal(parsed.items[1].value, "Pro");
  });

  await test("comparison: values accept mixed string/boolean/number", () => {
    const parsed = schema.parse({
      type: "comparison",
      title: "Plans",
      columns: ["Free", "Pro"],
      rows: [{ feature: "API access", values: [false, true] }],
    });
    assert.deepEqual(parsed.rows[0].values, [false, true]);
  });

  await test("rejects an unknown discriminant type", () => {
    assert.throws(() => {
      schema.parse({
        type: "graph",
        title: "Unsupported",
      });
    });
  });

  await test("execute() passes the parsed input through unchanged", async () => {
    const input = {
      type: "checklist" as const,
      title: "Todo",
      items: [{ id: "1", label: "Ship it", checked: true }],
    };
    // biome-ignore lint/suspicious/noExplicitAny: exercising execute() directly, not through the AI SDK's typed call path
    const result = await (renderUITool.execute as any)(input);
    assert.equal(result.success, true);
    assert.deepEqual(result.component, input);
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
