import { tool } from "ai";
import { z } from "zod";
import { getDriveConnection, saveDriveConnection } from "@/lib/db/queries";

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

async function refreshToken(
  userId: string,
  refreshTok: string
): Promise<string | null> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      refresh_token: refreshTok,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  await saveDriveConnection(userId, {
    accessToken: data.access_token,
    refreshToken: refreshTok,
    expiresAt: data.expires_in
      ? Math.floor(Date.now() / 1000) + data.expires_in
      : null,
    scope: null,
  });
  return data.access_token;
}

async function getValidToken(userId: string): Promise<string | null> {
  const conn = await getDriveConnection(userId);
  if (!conn) return null;
  // Refresh if expired (60s buffer)
  if (conn.expiresAt && conn.expiresAt < Math.floor(Date.now() / 1000) + 60) {
    if (!conn.refreshToken) return null;
    return refreshToken(userId, conn.refreshToken);
  }
  return conn.accessToken;
}

export const googleDriveTool = (userId: string) =>
  tool({
    description:
      "Search and read files from the user's connected Google Drive. Use this when the user asks about their Drive files, wants to find a document, or needs to read content from a file they have in Google Drive.",
    inputSchema: z.object({
      action: z
        .enum(["list", "read"])
        .describe(
          "list: search/list Drive files. read: read a specific file's content."
        ),
      query: z
        .string()
        .optional()
        .describe(
          "Search query to find files (for list action). Empty = recent files."
        ),
      fileId: z
        .string()
        .optional()
        .describe("Google Drive file ID to read (for read action)."),
      fileName: z
        .string()
        .optional()
        .describe(
          "File name to search for and read (alternative to fileId for read action)."
        ),
    }),
    execute: async ({ action, query, fileId, fileName }) => {
      const token = await getValidToken(userId);
      if (!token) {
        return {
          success: false,
          error:
            "Google Drive is not connected. Please connect your Drive at /drive before using this feature.",
        };
      }

      if (action === "list") {
        const q = query
          ? `name contains '${query.replace(/'/g, "\\'")}' and trashed=false`
          : "trashed=false";
        const params = new URLSearchParams({
          q,
          orderBy: "modifiedTime desc",
          pageSize: "10",
          fields: "files(id,name,mimeType,modifiedTime)",
        });

        const res = await fetch(`${DRIVE_API}/files?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const err = await res.text();
          return { success: false, error: `Drive API error: ${err}` };
        }

        const data = await res.json();
        const files = data.files as Array<{
          id: string;
          name: string;
          mimeType: string;
          modifiedTime: string;
        }>;

        return {
          success: true,
          files: files.map((f) => ({
            id: f.id,
            name: f.name,
            type: f.mimeType
              .replace("application/vnd.google-apps.", "Google ")
              .replace("application/", ""),
            modified: f.modifiedTime,
          })),
          count: files.length,
        };
      }

      // read action — resolve fileId from fileName if needed
      let targetId = fileId;
      if (!targetId && fileName) {
        const q = `name = '${fileName.replace(/'/g, "\\'")}' and trashed=false`;
        const params = new URLSearchParams({
          q,
          pageSize: "1",
          fields: "files(id,name,mimeType)",
        });
        const searchRes = await fetch(`${DRIVE_API}/files?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (searchRes.ok) {
          const { files } = await searchRes.json();
          if (files?.length > 0) targetId = files[0].id;
        }
      }

      if (!targetId) {
        return {
          success: false,
          error:
            "No file ID provided. Use the list action first to find the file, then pass its ID.",
        };
      }

      // Get file metadata
      const metaRes = await fetch(
        `${DRIVE_API}/files/${targetId}?fields=name,mimeType`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!metaRes.ok) {
        return { success: false, error: "File not found or access denied." };
      }
      const meta = await metaRes.json();

      let content: string;

      // Google Workspace files must be exported to plain text
      if (meta.mimeType?.startsWith("application/vnd.google-apps.")) {
        const exportMime =
          meta.mimeType === "application/vnd.google-apps.spreadsheet"
            ? "text/csv"
            : "text/plain";
        const exportRes = await fetch(
          `${DRIVE_API}/files/${targetId}/export?mimeType=${encodeURIComponent(exportMime)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!exportRes.ok) {
          return { success: false, error: "Failed to export file content." };
        }
        content = await exportRes.text();
      } else {
        // Binary/text files — download media
        const dlRes = await fetch(`${DRIVE_API}/files/${targetId}?alt=media`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!dlRes.ok) {
          return { success: false, error: "Failed to download file content." };
        }
        content = await dlRes.text();
      }

      const MAX_CHARS = 20_000;
      const truncated = content.length > MAX_CHARS;
      if (truncated) content = content.slice(0, MAX_CHARS);

      return {
        success: true,
        fileName: meta.name,
        mimeType: meta.mimeType,
        content,
        truncated,
        charCount: content.length,
      };
    },
  });
