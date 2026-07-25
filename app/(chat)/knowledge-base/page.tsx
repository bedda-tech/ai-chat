"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface KBDocument {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  chunkCount: number;
  createdAt: string;
}

interface DriveFile {
  id: string;
  name: string;
  type: string;
  modified: string;
  size: number | null;
}

interface NotionPage {
  id: string;
  title: string;
  lastEdited?: string;
  url?: string;
}

const SUPPORTED_TYPES = [
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "application/pdf",
];
const MAX_FILE_SIZE_MB = 25;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type CloudPanel = "drive" | "notion" | null;

export default function KnowledgeBasePage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") ?? null;
  const [projectName, setProjectName] = useState<string | null>(null);

  const [isPaidUser, setIsPaidUser] = useState<boolean | null>(null);
  const [documents, setDocuments] = useState<KBDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cloud import state
  const [openPanel, setOpenPanel] = useState<CloudPanel>(null);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [driveConnected, setDriveConnected] = useState<boolean | null>(null);
  const [driveQuery, setDriveQuery] = useState("");
  const [driveLoading, setDriveLoading] = useState(false);
  const [notionPages, setNotionPages] = useState<NotionPage[]>([]);
  const [notionConnected, setNotionConnected] = useState<boolean | null>(null);
  const [notionQuery, setNotionQuery] = useState("");
  const [notionLoading, setNotionLoading] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);

  // Fetch project name when scoped to a project
  useEffect(() => {
    if (!projectId) return;
    fetch("/api/projects")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const p = (data.projects ?? []).find(
          (proj: { id: string; name: string }) => proj.id === projectId
        );
        if (p) setProjectName(p.name);
      })
      .catch(() => {});
  }, [projectId]);

  const fetchDocuments = useCallback(async () => {
    try {
      const url = projectId
        ? `/api/knowledge-base?projectId=${encodeURIComponent(projectId)}`
        : "/api/knowledge-base";
      const res = await fetch(url);
      if (res.status === 403) {
        setIsPaidUser(false);
        return;
      }
      if (res.ok) {
        setIsPaidUser(true);
        const data = await res.json();
        setDocuments(data.documents ?? []);
      }
    } catch {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!SUPPORTED_TYPES.includes(file.type)) {
        toast.error(
          `Unsupported file type: ${file.type || "unknown"}. Use .pdf, .txt, .md, .csv, or .json`
        );
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`File too large. Max ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }

      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      if (projectId) formData.append("projectId", projectId);

      try {
        const res = await fetch("/api/knowledge-base", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          toast.success(
            `"${data.document.title}" uploaded (${data.document.chunkCount} chunks)`
          );
          fetchDocuments();
        } else {
          toast.error(data.error ?? "Upload failed");
        }
      } catch {
        toast.error("Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [fetchDocuments, projectId]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
      e.target.value = "";
    },
    [uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const deleteDocument = useCallback(async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/knowledge-base?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        toast.success(`"${title}" deleted`);
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    }
  }, []);

  // ── Google Drive helpers ──────────────────────────────────────────────────

  const loadDriveFiles = useCallback(async (q: string) => {
    setDriveLoading(true);
    try {
      const res = await fetch(
        `/api/knowledge-base/import/drive?q=${encodeURIComponent(q)}`
      );
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setDriveConnected(data.connected ?? false);
      setDriveFiles(data.files ?? []);
    } catch {
      toast.error("Failed to load Drive files");
    } finally {
      setDriveLoading(false);
    }
  }, []);

  const importDriveFile = useCallback(
    async (file: DriveFile) => {
      setImportingId(file.id);
      try {
        const res = await fetch("/api/knowledge-base/import/drive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileId: file.id,
            title: file.name,
            projectId,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success(
            `"${data.document.title}" imported (${data.document.chunkCount} chunks)`
          );
          fetchDocuments();
        } else {
          toast.error(data.error ?? "Import failed");
        }
      } catch {
        toast.error("Import failed");
      } finally {
        setImportingId(null);
      }
    },
    [fetchDocuments, projectId]
  );

  // ── Notion helpers ────────────────────────────────────────────────────────

  const loadNotionPages = useCallback(async (q: string) => {
    setNotionLoading(true);
    try {
      const res = await fetch(
        `/api/knowledge-base/import/notion?q=${encodeURIComponent(q)}`
      );
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setNotionConnected(data.connected ?? false);
      setNotionPages(data.pages ?? []);
    } catch {
      toast.error("Failed to load Notion pages");
    } finally {
      setNotionLoading(false);
    }
  }, []);

  const importNotionPage = useCallback(
    async (page: NotionPage) => {
      setImportingId(page.id);
      try {
        const res = await fetch("/api/knowledge-base/import/notion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageId: page.id,
            title: page.title,
            projectId,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success(
            `"${data.document.title}" imported (${data.document.chunkCount} chunks)`
          );
          fetchDocuments();
        } else {
          toast.error(data.error ?? "Import failed");
        }
      } catch {
        toast.error("Import failed");
      } finally {
        setImportingId(null);
      }
    },
    [fetchDocuments, projectId]
  );

  const togglePanel = useCallback(
    (panel: CloudPanel) => {
      if (openPanel === panel) {
        setOpenPanel(null);
        return;
      }
      setOpenPanel(panel);
      if (panel === "drive" && driveConnected === null) {
        loadDriveFiles("");
      }
      if (panel === "notion" && notionConnected === null) {
        loadNotionPages("");
      }
    },
    [
      openPanel,
      driveConnected,
      notionConnected,
      loadDriveFiles,
      loadNotionPages,
    ]
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        {projectId && (
          <div className="mb-3 flex items-center gap-2 text-muted-foreground text-sm">
            <Link className="hover:text-foreground" href="/projects">
              Projects
            </Link>
            <span>/</span>
            <span className="font-medium text-foreground">
              {projectName ?? "Project"}
            </span>
            <span>/</span>
            <span>Knowledge Base</span>
          </div>
        )}
        <h1 className="font-bold text-2xl tracking-tight">
          {projectId ? "Project Knowledge Base" : "Knowledge Base"}
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          {projectId
            ? "Documents here are only used in chats belonging to this project."
            : "Upload documents and chat with them. The AI will search your files when answering questions."}
        </p>
        <p className="mt-1 text-muted-foreground text-xs">
          Supported: .pdf, .txt, .md, .csv, .json &nbsp;&middot;&nbsp; Max{" "}
          {MAX_FILE_SIZE_MB}MB per file
        </p>
      </div>

      {/* Premium gate */}
      {!loading && isPaidUser === false && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-50 p-6 dark:bg-amber-950/20">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
              <svg
                className="size-5 text-amber-700 dark:text-amber-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-amber-800 text-sm dark:text-amber-300">
                Knowledge Base is a Plus feature
              </p>
              <p className="mt-1 text-amber-700 text-xs dark:text-amber-400">
                Upload documents, PDFs, and more — the AI will search your files
                when answering questions. Available on Plus, Pro, and Max plans.
              </p>
              <div className="mt-4 flex gap-3">
                <a
                  className="inline-flex items-center rounded-md bg-amber-600 px-4 py-2 font-medium text-white text-xs hover:bg-amber-700"
                  href="/upgrade"
                >
                  Start free trial — $12/mo
                </a>
                <a
                  className="inline-flex items-center rounded-md border border-amber-400 px-4 py-2 font-medium text-amber-700 text-xs hover:bg-amber-100 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-900/30"
                  href="/pricing"
                >
                  View plans
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload zone — hidden for free tier */}
      {isPaidUser !== false && (
        <>
          <div
            className={`mb-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/40"
            } ${uploading ? "pointer-events-none opacity-60" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragLeave={() => setDragOver(false)}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="size-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="text-sm">Processing document...</span>
              </div>
            ) : (
              <>
                <svg
                  className="mb-3 size-10 text-muted-foreground/60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="font-medium text-sm">
                  Drop a file here, or click to upload
                </span>
                <span className="text-muted-foreground text-xs">
                  .pdf &nbsp;&middot;&nbsp; .txt &nbsp;&middot;&nbsp; .md
                  &nbsp;&middot;&nbsp; .csv &nbsp;&middot;&nbsp; .json
                </span>
              </>
            )}
          </div>
          <input
            accept=".txt,.md,.csv,.json,.pdf,text/plain,text/markdown,text/csv,application/json,application/pdf"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />
        </>
      )}

      {/* Cloud import buttons — hidden for free tier */}
      {isPaidUser !== false && <>
      {/* Cloud import buttons */}
      <div className="mb-8 flex gap-2">
        <Button
          className="flex items-center gap-2"
          onClick={() => togglePanel("drive")}
          size="sm"
          variant={openPanel === "drive" ? "secondary" : "outline"}
        >
          <svg
            className="size-4"
            viewBox="0 0 87.3 78"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 50H0c0 1.55.4 3.1 1.2 4.5z"
              fill="#0066da"
            />
            <path
              d="M43.65 25L29.9 0c-1.35.8-2.5 1.9-3.3 3.3L1.2 45.5c-.8 1.4-1.2 2.95-1.2 4.5h27.5z"
              fill="#00ac47"
            />
            <path
              d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L86.1 54.5c.8-1.4 1.2-2.95 1.2-4.5H59.8L73.55 76.8z"
              fill="#ea4335"
            />
            <path d="M43.65 25L57.4 0H29.9l13.75 25z" fill="#00832d" />
            <path
              d="M59.8 50H87.3c0-1.55-.4-3.1-1.2-4.5L60.5 3.3c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 25z"
              fill="#2684fc"
            />
            <path
              d="M27.5 50L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2H69.1c1.6 0 3.1-.45 4.45-1.2L59.8 50H27.5z"
              fill="#ffba00"
            />
          </svg>
          Import from Google Drive
        </Button>
        <Button
          className="flex items-center gap-2"
          onClick={() => togglePanel("notion")}
          size="sm"
          variant={openPanel === "notion" ? "secondary" : "outline"}
        >
          <svg
            className="size-4"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.212-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.047.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
          </svg>
          Import from Notion
        </Button>
      </div>

      {/* Google Drive panel */}
      {openPanel === "drive" && (
        <div className="mb-8 rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 font-semibold text-sm">Google Drive</h3>
          {driveConnected === false ? (
            <p className="text-muted-foreground text-sm">
              Google Drive is not connected.{" "}
              <a className="text-primary underline" href="/drive">
                Connect your Drive
              </a>{" "}
              to import files.
            </p>
          ) : (
            <>
              <div className="mb-3 flex gap-2">
                <input
                  className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
                  onChange={(e) => setDriveQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") loadDriveFiles(driveQuery);
                  }}
                  placeholder="Search files..."
                  value={driveQuery}
                />
                <Button
                  disabled={driveLoading}
                  onClick={() => loadDriveFiles(driveQuery)}
                  size="sm"
                  variant="outline"
                >
                  {driveLoading ? (
                    <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
              {driveLoading ? (
                <div className="flex items-center gap-2 py-4 text-muted-foreground text-sm">
                  <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Loading files...
                </div>
              ) : driveFiles.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground text-sm">
                  No files found.
                </p>
              ) : (
                <ul className="max-h-64 space-y-1.5 overflow-y-auto">
                  {driveFiles.map((file) => (
                    <li
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                      key={file.id}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-sm">
                          {file.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {file.type}
                          {file.size ? ` · ${formatBytes(file.size)}` : ""}
                        </p>
                      </div>
                      <Button
                        disabled={importingId === file.id}
                        onClick={() => importDriveFile(file)}
                        size="sm"
                        variant="outline"
                      >
                        {importingId === file.id ? (
                          <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          "Import"
                        )}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}

      {/* Notion panel */}
      {openPanel === "notion" && (
        <div className="mb-8 rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 font-semibold text-sm">Notion</h3>
          {notionConnected === false ? (
            <p className="text-muted-foreground text-sm">
              Notion is not connected.{" "}
              <a className="text-primary underline" href="/notion">
                Connect your Notion workspace
              </a>{" "}
              to import pages.
            </p>
          ) : (
            <>
              <div className="mb-3 flex gap-2">
                <input
                  className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
                  onChange={(e) => setNotionQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") loadNotionPages(notionQuery);
                  }}
                  placeholder="Search pages..."
                  value={notionQuery}
                />
                <Button
                  disabled={notionLoading}
                  onClick={() => loadNotionPages(notionQuery)}
                  size="sm"
                  variant="outline"
                >
                  {notionLoading ? (
                    <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
              {notionLoading ? (
                <div className="flex items-center gap-2 py-4 text-muted-foreground text-sm">
                  <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Loading pages...
                </div>
              ) : notionPages.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground text-sm">
                  No pages found.
                </p>
              ) : (
                <ul className="max-h-64 space-y-1.5 overflow-y-auto">
                  {notionPages.map((page) => (
                    <li
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                      key={page.id}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-sm">
                          {page.title}
                        </p>
                        {page.lastEdited && (
                          <p className="text-muted-foreground text-xs">
                            Edited{" "}
                            {formatDistanceToNow(new Date(page.lastEdited), {
                              addSuffix: true,
                            })}
                          </p>
                        )}
                      </div>
                      <Button
                        disabled={importingId === page.id}
                        onClick={() => importNotionPage(page)}
                        size="sm"
                        variant="outline"
                      >
                        {importingId === page.id ? (
                          <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          "Import"
                        )}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
      </>}

      {/* Documents list — hidden for free tier */}
      {isPaidUser !== false && <div>
        <h2 className="mb-3 font-semibold text-muted-foreground text-sm uppercase tracking-wide">
          {projectId ? "Project Documents" : "Your Documents"}
        </h2>

        {loading ? (
          <div className="flex items-center gap-2 py-6 text-muted-foreground text-sm">
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Loading...
          </div>
        ) : documents.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            {projectId
              ? "No documents in this project yet. Upload a file or import from Drive/Notion above."
              : "No documents yet. Upload your first file above."}
          </div>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
                key={doc.id}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm">{doc.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {doc.fileName} &nbsp;&middot;&nbsp;{" "}
                    {formatBytes(doc.fileSize)} &nbsp;&middot;&nbsp;{" "}
                    {doc.chunkCount} chunk{doc.chunkCount !== 1 ? "s" : ""}
                    &nbsp;&middot;&nbsp;{" "}
                    {formatDistanceToNow(new Date(doc.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <Button
                  className="shrink-0 text-destructive hover:text-destructive"
                  onClick={() => deleteDocument(doc.id, doc.title)}
                  size="sm"
                  variant="ghost"
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>}
    </div>
  );
}
