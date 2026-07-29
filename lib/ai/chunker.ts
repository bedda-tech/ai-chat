/**
 * Simple text chunker for RAG ingestion.
 * Splits text into overlapping chunks suitable for embedding.
 */

const CHUNK_SIZE = 1000; // characters
const CHUNK_OVERLAP = 200; // characters

/**
 * Split text into overlapping chunks.
 * Tries to split on paragraph boundaries first, then sentences.
 */
export function chunkText(text: string): string[] {
  // Normalize whitespace
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (normalized.length === 0) return [];

  // Split into paragraphs first
  const paragraphs = normalized.split(/\n{2,}/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    if (currentChunk.length + trimmedPara.length + 2 <= CHUNK_SIZE) {
      currentChunk = currentChunk
        ? `${currentChunk}\n\n${trimmedPara}`
        : trimmedPara;
    } else if (currentChunk) {
      chunks.push(currentChunk);
      // Create overlap by keeping the tail of the current chunk
      const overlapStart = Math.max(0, currentChunk.length - CHUNK_OVERLAP);
      currentChunk = currentChunk.slice(overlapStart) + "\n\n" + trimmedPara;
    } else {
      // Paragraph itself is too large — split by sentence
      const sentences = trimmedPara.split(/(?<=[.!?])\s+/);
      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length + 1 <= CHUNK_SIZE) {
          currentChunk = currentChunk
            ? `${currentChunk} ${sentence}`
            : sentence;
        } else {
          if (currentChunk) chunks.push(currentChunk);
          currentChunk = sentence.slice(0, CHUNK_SIZE);
        }
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter((c) => c.length >= 20); // drop very short fragments
}

/**
 * Extract plain text from a supported file.
 */
export async function extractText(
  buffer: ArrayBuffer,
  mimeType: string
): Promise<string> {
  const decoder = new TextDecoder("utf-8");

  switch (mimeType) {
    case "text/plain":
    case "text/markdown":
    case "text/csv":
      return decoder.decode(buffer);

    case "application/json": {
      try {
        const text = decoder.decode(buffer);
        const parsed = JSON.parse(text);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return decoder.decode(buffer);
      }
    }

    case "application/pdf": {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const result = await parser.getText();
      if (!result.text || result.text.trim().length === 0) {
        throw new Error(
          "Could not extract text from PDF. The file may be scanned or image-based."
        );
      }
      return result.text;
    }

    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    case "application/msword": {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
      if (!result.value || result.value.trim().length === 0) {
        throw new Error("Could not extract text from Word document.");
      }
      return result.value;
    }

    default:
      throw new Error(
        `Unsupported file type for text extraction: ${mimeType}. Supported: text/plain, text/markdown, text/csv, application/json, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document`
      );
  }
}
