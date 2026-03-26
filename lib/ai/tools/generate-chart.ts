import { tool } from "ai";
import { z } from "zod";

const dataPointSchema = z.record(z.string(), z.union([z.string(), z.number()]));

export const generateChartTool = () =>
  tool({
    description:
      "Generate an interactive chart to visualize data. Use this when the user asks to chart, graph, plot, or visualize data. Supports line, bar, area, and pie charts.",
    inputSchema: z.object({
      chartType: z
        .enum(["line", "bar", "area", "pie"])
        .describe("Type of chart to generate"),
      title: z.string().describe("Chart title"),
      description: z
        .string()
        .optional()
        .describe("Brief description of what the chart shows"),
      data: z
        .array(dataPointSchema)
        .describe(
          "Array of data objects. Each object should have consistent keys. Example: [{name:'Jan',value:100},{name:'Feb',value:120}]"
        ),
      xKey: z
        .string()
        .optional()
        .describe(
          "Key to use for the X axis (for line/bar/area charts). Should be a string field like 'name', 'date', 'category'."
        ),
      yKeys: z
        .array(z.string())
        .optional()
        .describe(
          "Keys to use for Y axis values (for line/bar/area charts). Multiple keys create multi-series charts."
        ),
      nameKey: z
        .string()
        .optional()
        .describe("Key for slice labels in pie charts"),
      valueKey: z
        .string()
        .optional()
        .describe("Key for slice values in pie charts"),
      colors: z
        .array(z.string())
        .optional()
        .describe("Custom hex colors for each series or slice"),
      unit: z
        .string()
        .optional()
        .describe("Unit label for values (e.g. '$', '%', 'ms')"),
    }),
    execute: async (input) => {
      // Validate data is non-empty
      if (!input.data || input.data.length === 0) {
        return {
          success: false,
          error: "No data provided to chart",
        };
      }

      // For pie charts, infer nameKey/valueKey if not provided
      const firstRow = input.data[0];
      const keys = Object.keys(firstRow);

      let nameKey = input.nameKey;
      let valueKey = input.valueKey;

      if (input.chartType === "pie") {
        if (!nameKey) {
          nameKey = keys.find((k) => typeof firstRow[k] === "string") ?? keys[0];
        }
        if (!valueKey) {
          valueKey =
            keys.find((k) => typeof firstRow[k] === "number") ?? keys[1];
        }
      }

      // For line/bar/area, infer xKey/yKeys if not provided
      let xKey = input.xKey;
      let yKeys = input.yKeys;

      if (input.chartType !== "pie") {
        if (!xKey) {
          xKey = keys.find((k) => typeof firstRow[k] === "string") ?? keys[0];
        }
        if (!yKeys || yKeys.length === 0) {
          yKeys = keys.filter(
            (k) => k !== xKey && typeof firstRow[k] === "number"
          );
        }
      }

      return {
        success: true,
        chart: {
          chartType: input.chartType,
          title: input.title,
          description: input.description,
          data: input.data,
          xKey,
          yKeys,
          nameKey,
          valueKey,
          colors: input.colors,
          unit: input.unit,
        },
      };
    },
  });
