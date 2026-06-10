import { embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { chunkText } from "@/lib/ai/chunker";
import {
  createKBDocument,
  getNotionConnection,
  saveKBChunks,
} from "@/lib/db/queries";

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

function blockToText(block: {
  type: string;
  [key: string]: unknown;
}): string {
  const type = block.type;
  const data = block[type] as {
    rich_text?: Array<{ plain_text: string }>;
    checked?: boolean;
    language?: string;
  };
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

/** GET /api/knowledge-base/import/notion?q=<query> — search Notion pages */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conn = await getNotionConnection(session.user.id);
  if (!conn) {
    return NextResponse.json({ connected: false, pages: [] });
  }

  const headers = notionHeaders(conn.accessToken);
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  const body: Record<string, unknown> = {
    filter: { value: "page", property: "object" },
    page_size: 20,
  };
  if (q) body.query = q;

  const res = await fetch(`${NOTION_API}/search`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Notion API error" }, { status: 502 });
  }

  const data = await res.json();
  const pages = (data.results ?? []).map(
    (page: {
      id: string;
      properties?: Record<
        string,
        {
          title?: Array<{ plain_text: string }>;
          rich_text?: Array<{ plain_text: string }>;
        }
      >;
      last_edited_time?: string;
      url?: string;
    }) => {
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
    }
  );

  return NextResponse.json({ connected: true, pages });
}

/** POST /api/knowledge-base/import/notion — import a Notion page into the KB */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { pageId?: string; title?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { pageId, title: providedTitle } = body;
  if (!pageId) {
    return NextResponse.json({ error: "Missing pageId" }, { status: 400 });
  }

  const conn = await getNotionConnection(session.user.id);
  if (!conn) {
    return NextResponse.json(
      { error: "Notion not connected. Connect at /notion first." },
      { status: 400 }
    );
  }

  const headers = notionHeaders(conn.accessToken);

  // Get page metadata
  const pageRes = await fetch(`${NOTION_API}/pages/${pageId}`, { headers });
  if (!pageRes.ok) {
    return NextResponse.json(
      { error: "Page not found or access denied." },
      { status: 404 }
    );
  }
  const page = await pageRes.json();

  const titleProp =
    page.properties?.title ??
    page.properties?.Name ??
    page.properties?.name;
  const inferredTitle = titleProp?.title
    ? extractPlainText(titleProp.title)
    : titleProp?.rich_text
      ? extractPlainText(titleProp.rich_text)
      : "Untitled";

  // Fetch all blocks, paginating if needed
  let allBlocks: Array<{ type: string; [key: string]: unknown }> = [];
  let cursor: string | undefined;

  do {
    const params = new URLSearchParams({ page_size: "100" });
    if (cursor) params.set("start_cursor", cursor);
    const blocksRes = await fetch(
      `${NOTION_API}/blocks/${pageId}/children?${params}`,
      { headers }
    );
    if (!blocksRes.ok) break;
    const blocksData = await blocksRes.json();
    allBlocks = allBlocks.concat(blocksData.results ?? []);
    cursor = blocksData.has_more ? blocksData.next_cursor : undefined;
  } while (cursor);

  const lines = allBlocks
    .map(blockToText)
    .filter((l) => l.length > 0);
  const content = lines.join("\n\n");

  if (content.trim().length < 20) {
    return NextResponse.json(
      { error: "Page appears to be empty or contains no readable text." },
      { status: 400 }
    );
  }

  try {
    const title = providedTitle ?? inferredTitle;
    const doc = await createKBDocument({
      userId: session.user.id,
      title,
      fileName: `${title}.md`,
      fileType: "text/markdown",
      fileSize: content.length,
    });

    const textChunks = chunkText(content);
    if (textChunks.length === 0) {
      return NextResponse.json(
        { error: "Could not extract any text from the page." },
        { status: 400 }
      );
    }

    const BATCH_SIZE = 100;
    const allEmbeddings: number[][] = [];
    for (let i = 0; i < textChunks.length; i += BATCH_SIZE) {
      const batch = textChunks.slice(i, i + BATCH_SIZE);
      const { embeddings } = await embedMany({
        model: openai.textEmbeddingModel("text-embedding-3-small"),
        values: batch,
      });
      allEmbeddings.push(...embeddings);
    }

    await saveKBChunks({
      documentId: doc.id,
      userId: session.user.id,
      chunks: textChunks.map((c, idx) => ({
        content: c,
        chunkIndex: idx,
        embedding: allEmbeddings[idx],
      })),
    });

    return NextResponse.json({
      success: true,
      document: { id: doc.id, title: doc.title, chunkCount: textChunks.length },
    });
  } catch (error) {
    console.error("Notion KB import error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to import page",
      },
      { status: 500 }
    );
  }
}
