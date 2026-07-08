import { tool } from "ai";
import { z } from "zod";
import { getNotionConnection } from "@/lib/db/queries";

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

function notionHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

function extractPlainText(richText: Array<{ plain_text: string }>): string {
  return richText?.map((t) => t.plain_text).join("") ?? "";
}

type NotionBlockData = {
  rich_text?: Array<{ plain_text: string }>;
  checked?: boolean;
  language?: string;
};

function blockToText(block: { type: string; [key: string]: unknown }): string {
  const type = block.type;
  const data = block[type] as NotionBlockData | undefined;
  if (!data) return "";

  const textContent = data.rich_text ? extractPlainText(data.rich_text) : "";

  switch (type) {
    case "paragraph":
      return textContent;
    case "heading_1":
      return `# ${textContent}`;
    case "heading_2":
      return `## ${textContent}`;
    case "heading_3":
      return `### ${textContent}`;
    case "bulleted_list_item":
      return `• ${textContent}`;
    case "numbered_list_item":
      return `1. ${textContent}`;
    case "to_do":
      return `[${data.checked ? "x" : " "}] ${textContent}`;
    case "toggle":
      return textContent;
    case "quote":
      return `> ${textContent}`;
    case "code":
      return `\`\`\`${data.language ?? ""}\n${textContent}\n\`\`\``;
    case "divider":
      return "---";
    default:
      return textContent;
  }
}

export const notionTool = (userId: string) =>
  tool({
    description:
      "Search and read pages from the user's connected Notion workspace. Use this when the user asks about their Notion notes, pages, or databases.",
    inputSchema: z.object({
      action: z
        .enum(["search", "read"])
        .describe(
          "search: find pages by query. read: get full content of a specific page."
        ),
      query: z
        .string()
        .optional()
        .describe("Search query to find pages (for search action)."),
      pageId: z
        .string()
        .optional()
        .describe(
          "Notion page ID to read (for read action). Get from a prior search."
        ),
    }),
    execute: async ({ action, query, pageId }) => {
      const conn = await getNotionConnection(userId);
      if (!conn) {
        return {
          success: false,
          error:
            "Notion is not connected. Please connect your Notion workspace at /notion before using this feature.",
        };
      }

      const headers = notionHeaders(conn.accessToken);

      if (action === "search") {
        const body: Record<string, any> = {
          filter: { value: "page", property: "object" },
          page_size: 10,
        };
        if (query) body.query = query;

        const res = await fetch(`${NOTION_API}/search`, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const err = await res.text();
          return { success: false, error: `Notion API error: ${err}` };
        }

        const data = await res.json();
        const pages = (data.results ?? []).map((page: any) => {
          const titleProp =
            page.properties?.title ??
            page.properties?.Name ??
            page.properties?.name;
          const title = titleProp?.title
            ? extractPlainText(titleProp.title)
            : titleProp?.rich_text
              ? extractPlainText(titleProp.rich_text)
              : "Untitled";
          return {
            id: page.id,
            title: title || "Untitled",
            lastEdited: page.last_edited_time,
            url: page.url,
          };
        });

        return { success: true, pages, count: pages.length };
      }

      // read action
      if (!pageId) {
        return {
          success: false,
          error:
            "No page ID provided. Use the search action first to find a page, then pass its ID.",
        };
      }

      // Fetch page metadata
      const pageRes = await fetch(`${NOTION_API}/pages/${pageId}`, { headers });
      if (!pageRes.ok) {
        return { success: false, error: "Page not found or access denied." };
      }
      const page = await pageRes.json();
      const titleProp =
        page.properties?.title ??
        page.properties?.Name ??
        page.properties?.name;
      const title = titleProp?.title
        ? extractPlainText(titleProp.title)
        : titleProp?.rich_text
          ? extractPlainText(titleProp.rich_text)
          : "Untitled";

      // Fetch page blocks (content)
      const blocksRes = await fetch(
        `${NOTION_API}/blocks/${pageId}/children?page_size=100`,
        {
          headers,
        }
      );
      if (!blocksRes.ok) {
        return { success: false, error: "Failed to read page content." };
      }

      const blocksData = await blocksRes.json();
      const lines = (blocksData.results ?? [])
        .map(blockToText)
        .filter((l: string) => l.length > 0);
      let content = lines.join("\n\n");

      const MAX_CHARS = 20_000;
      const truncated = content.length > MAX_CHARS;
      if (truncated) content = content.slice(0, MAX_CHARS);

      return {
        success: true,
        title,
        url: page.url,
        content,
        truncated,
        charCount: content.length,
      };
    },
  });
