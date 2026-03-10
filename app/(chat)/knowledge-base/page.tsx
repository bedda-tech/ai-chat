"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
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

const SUPPORTED_TYPES = [
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
];
const MAX_FILE_SIZE_MB = 10;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<KBDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/knowledge-base");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents ?? []);
      }
    } catch {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!SUPPORTED_TYPES.includes(file.type)) {
        toast.error(
          `Unsupported file type: ${file.type || "unknown"}. Use .txt, .md, .csv, or .json`
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

      try {
        const res = await fetch("/api/knowledge-base", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "Upload failed");
        } else {
          toast.success(
            `"${data.document.title}" uploaded (${data.document.chunkCount} chunks)`
          );
          fetchDocuments();
        }
      } catch {
        toast.error("Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [fetchDocuments]
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Upload documents and chat with them. The AI will search your files
          when answering questions.
        </p>
        <p className="mt-1 text-muted-foreground text-xs">
          Supported: .txt, .md, .csv, .json &nbsp;&middot;&nbsp; Max{" "}
          {MAX_FILE_SIZE_MB}MB per file
        </p>
      </div>

      {/* Upload zone */}
      <div
        className={`mb-8 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors ${
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
              .txt &nbsp;&middot;&nbsp; .md &nbsp;&middot;&nbsp; .csv
              &nbsp;&middot;&nbsp; .json
            </span>
          </>
        )}
      </div>
      <input
        accept=".txt,.md,.csv,.json,text/plain,text/markdown,text/csv,application/json"
        className="hidden"
        onChange={handleFileChange}
        ref={fileInputRef}
        type="file"
      />

      {/* Documents list */}
      <div>
        <h2 className="mb-3 font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Your Documents
        </h2>

        {loading ? (
          <div className="flex items-center gap-2 py-6 text-muted-foreground text-sm">
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Loading...
          </div>
        ) : documents.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            No documents yet. Upload your first file above.
          </div>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
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
      </div>
    </div>
  );
}
