import { tool } from "ai";
import { z } from "zod";

const E2B_API_KEY = process.env.E2B_API_KEY;

export type CodeExecutionResult = {
  success: boolean;
  language: string;
  code: string;
  stdout: string;
  stderr: string;
  error?: string;
  executionTime?: string;
  results?: Array<{
    type: string;
    text?: string;
    html?: string;
    png?: string; // base64
    svg?: string;
    json?: unknown;
  }>;
};

export const executeCodeTool = () =>
  tool({
    description:
      "Execute Python or JavaScript code in a secure sandboxed environment. Use this when users want to run, test, calculate, visualize, or analyze data with code. Supports matplotlib charts, pandas DataFrames, and standard libraries.",
    inputSchema: z.object({
      code: z.string().describe("The code to execute."),
      language: z
        .enum(["python", "javascript"])
        .default("python")
        .describe("The programming language to use (python or javascript)."),
    }),
    execute: async ({ code, language }): Promise<CodeExecutionResult> => {
      if (!E2B_API_KEY) {
        return {
          success: false,
          language,
          code,
          stdout: "",
          stderr: "",
          error:
            "Code execution is not configured. Please add E2B_API_KEY to enable sandboxed execution.",
        };
      }

      const start = Date.now();

      try {
        // Dynamic import to avoid bundling issues
        const { Sandbox } = await import("@e2b/code-interpreter");

        const sbx = await Sandbox.create({
          apiKey: E2B_API_KEY,
        });

        try {
          const execution = await sbx.runCode(code, {
            language: language === "javascript" ? "js" : "python",
          });

          const elapsedMs = Date.now() - start;

          const results: NonNullable<CodeExecutionResult["results"]> = (
            execution.results ?? []
          ).map((r) => {
            const type = r.png
              ? "image/png"
              : r.svg
                ? "image/svg+xml"
                : r.html
                  ? "text/html"
                  : r.json
                    ? "application/json"
                    : "text/plain";
            return {
              type,
              ...(r.text !== undefined && { text: r.text }),
              ...(r.html !== undefined && { html: r.html }),
              ...(r.png !== undefined && { png: r.png }),
              ...(r.svg !== undefined && { svg: r.svg }),
              ...(r.json !== undefined && { json: r.json }),
            };
          });

          return {
            success: !execution.error,
            language,
            code,
            stdout: execution.logs.stdout.join("\n"),
            stderr: execution.logs.stderr.join("\n"),
            error: execution.error
              ? `${execution.error.name}: ${execution.error.value}`
              : undefined,
            executionTime: `${elapsedMs}ms`,
            results,
          };
        } finally {
          await sbx.kill();
        }
      } catch (error) {
        return {
          success: false,
          language,
          code,
          stdout: "",
          stderr: "",
          error:
            error instanceof Error ? error.message : "Failed to execute code.",
          executionTime: `${Date.now() - start}ms`,
        };
      }
    },
  });
