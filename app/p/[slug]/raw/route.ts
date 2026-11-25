import { getPublishedPageBySlug } from "@/lib/db/published-pages";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * Serves the published artifact as a standalone document. It is only ever
 * loaded inside a sandboxed iframe, and carries its own CSP + sandbox so that
 * even a direct visit has an opaque origin: no cookies, no same-origin fetches,
 * no network access from the generated code.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);
  if (!page) {
    return new Response("Not found", { status: 404 });
  }

  let body: string;
  let scriptSrc = "'unsafe-inline'";
  if (page.kind === "html") {
    body = page.content;
  } else if (page.kind === "mermaid") {
    scriptSrc = "'unsafe-inline' https://cdn.jsdelivr.net";
    body = `<!doctype html><meta charset="utf-8"><body style="margin:16px;font-family:system-ui"><pre class="mermaid">${escapeHtml(page.content)}</pre><script type="module">import m from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";m.initialize({startOnLoad:true,securityLevel:"strict"});</script>`;
  } else {
    body = `<!doctype html><meta charset="utf-8"><body style="margin:16px;font-family:system-ui"><pre style="white-space:pre-wrap;word-break:break-word;font:14px/1.5 ui-monospace,monospace">${escapeHtml(page.content)}</pre>`;
  }

  const csp = [
    "default-src 'none'",
    `script-src ${scriptSrc}`,
    "style-src 'unsafe-inline' https://fonts.googleapis.com",
    "img-src data: blob: https:",
    "font-src data: https://fonts.gstatic.com",
    "media-src data: blob:",
    "connect-src 'none'",
    "form-action 'none'",
    "base-uri 'none'",
    "frame-ancestors 'self'",
    "sandbox allow-scripts",
  ].join("; ");

  return new Response(body, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": csp,
      "X-Robots-Tag": "noindex, nofollow",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Cache-Control": "public, max-age=0, s-maxage=60",
    },
  });
}
