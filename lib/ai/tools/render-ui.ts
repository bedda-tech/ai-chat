import { tool } from "ai";
import { z } from "zod";

const columnSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(["text", "number", "badge", "url"]).optional().default("text"),
});

const rowSchema = z.record(z.string(), z.union([z.string(), z.number(), z.null()]));

const checklistItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  checked: z.boolean().default(false),
  description: z.string().optional(),
});

const statSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  unit: z.string().optional(),
  change: z.string().optional(),
  trend: z.enum(["up", "down", "neutral"]).optional(),
  icon: z.string().optional(),
});

const timelineItemSchema = z.object({
  date: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(["completed", "current", "upcoming"]).optional().default("upcoming"),
});

const comparisonRowSchema = z.object({
  feature: z.string(),
  values: z.array(z.union([z.string(), z.boolean(), z.number()])),
});

export const renderUITool = tool({
  description: `Render interactive UI components inline in chat. Use this to present structured data as rich interactive components instead of plain text lists or tables.

Available component types:
- table: Sortable data table for any structured data (spreadsheet-style)
- checklist: Interactive to-do/task list users can check off
- stats: KPI/metric cards showing numbers, percentages, or values with optional trends
- timeline: Chronological sequence of events or steps
- comparison: Side-by-side feature/product/option comparison grid

Use these when the data would be clearer or more useful as an interactive visual component than as text. Examples: comparing product specs → comparison, showing project tasks → checklist, displaying performance metrics → stats, showing a project roadmap → timeline, presenting data with multiple columns → table.`,
  inputSchema: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("table"),
      title: z.string().describe("Table title"),
      description: z.string().optional().describe("Optional description"),
      columns: z.array(columnSchema).describe("Column definitions"),
      rows: z.array(rowSchema).describe("Data rows as objects keyed by column key"),
    }),
    z.object({
      type: z.literal("checklist"),
      title: z.string().describe("Checklist title"),
      description: z.string().optional(),
      items: z.array(checklistItemSchema),
    }),
    z.object({
      type: z.literal("stats"),
      title: z.string().describe("Stats section title"),
      description: z.string().optional(),
      items: z.array(statSchema),
    }),
    z.object({
      type: z.literal("timeline"),
      title: z.string().describe("Timeline title"),
      description: z.string().optional(),
      items: z.array(timelineItemSchema),
    }),
    z.object({
      type: z.literal("comparison"),
      title: z.string().describe("Comparison title"),
      description: z.string().optional(),
      columns: z.array(z.string()).describe("Column headers (option names)"),
      rows: z.array(comparisonRowSchema).describe("Feature rows"),
    }),
  ]),
  execute: async (input) => {
    return { success: true, component: input };
  },
});
