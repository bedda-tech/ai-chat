import type { PluginTool } from "@/lib/db/schema";
import { decryptValue } from "./plugin-encrypt";

export async function dispatchPluginTool(
  pt: PluginTool,
  args: Record<string, unknown>
): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (pt.authHeaderName && pt.authHeaderValueEncrypted) {
    headers[pt.authHeaderName] = decryptValue(pt.authHeaderValueEncrypted);
  }

  try {
    const res = await fetch(pt.webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(args),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return { error: `Webhook returned HTTP ${res.status}` };
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return await res.json();
    }
    return { result: await res.text() };
  } catch (err: any) {
    clearTimeout(timeout);
    if (err?.name === "AbortError") {
      return { error: "Webhook timed out after 5 seconds" };
    }
    return { error: `Webhook error: ${err?.message ?? "unknown"}` };
  }
}
