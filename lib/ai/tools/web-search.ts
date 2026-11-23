import { generateText, tool } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { z } from "zod";

type SearchResult = {
  title: string;
  url: string;
  snippet: string;
};

type DuckDuckGoResponse = {
  Abstract: string;
  AbstractURL: string;
  AbstractSource: string;
  Heading: string;
  Answer: string;
  AnswerType: string;
  RelatedTopics: Array<{
    Text?: string;
    FirstURL?: string;
    Topics?: Array<{ Text: string; FirstURL: string }>;
  }>;
  Results: Array<{ Text: string; FirstURL: string }>;
};

async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
  const response = await fetch(url, {
    headers: { "User-Agent": "bedda-chat/1.0" },
  });

  if (!response.ok) {
    throw new Error(`DuckDuckGo API error: ${response.status}`);
  }

  const data: DuckDuckGoResponse = await response.json();
  const results: SearchResult[] = [];

  // Instant answer (calculator, conversions, etc.)
  if (data.Answer) {
    results.push({
      title: data.AnswerType || "Instant Answer",
      url: "",
      snippet: data.Answer,
    });
  }

  // Wikipedia abstract
  if (data.Abstract && data.AbstractURL) {
    results.push({
      title: data.Heading || data.AbstractSource,
      url: data.AbstractURL,
      snippet: data.Abstract,
    });
  }

  // Related topics
  for (const topic of data.RelatedTopics.slice(0, 5)) {
    if (topic.Text && topic.FirstURL) {
      results.push({
        title:
          topic.FirstURL.split("/").pop()?.replace(/_/g, " ") || topic.FirstURL,
        url: topic.FirstURL,
        snippet: topic.Text,
      });
    }
  }

  return results;
}

async function searchBrave(
  query: string,
  apiKey: string
): Promise<SearchResult[]> {
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=8`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Brave Search API error: ${response.status}`);
  }

  const data = await response.json();
  return (data.web?.results || []).map(
    (r: { title: string; url: string; description?: string }) => ({
      title: r.title,
      url: r.url,
      snippet: r.description || "",
    })
  );
}

/**
 * Real web search through the Vercel AI Gateway (Perplexity Sonar), so no
 * separate search account is needed. Returns cited source links.
 */
async function searchGatewaySonar(query: string): Promise<SearchResult[]> {
  const { text, sources } = await generateText({
    model: gateway.languageModel("perplexity/sonar"),
    prompt: query,
    abortSignal: AbortSignal.timeout(25_000),
  });
  const snippet = text.trim().slice(0, 600);
  const seen = new Set<string>();
  const results: SearchResult[] = [];
  for (const s of sources ?? []) {
    if (s.sourceType !== "url" || seen.has(s.url)) {
      continue;
    }
    seen.add(s.url);
    results.push({
      title: s.title || new URL(s.url).hostname,
      url: s.url,
      snippet: results.length === 0 ? snippet : "",
    });
  }
  if (results.length === 0 && snippet) {
    results.push({ title: "Summary", url: "", snippet });
  }
  return results;
}

export const webSearchTool = tool({
  description:
    "Search the web for current information, news, facts, or any topic. Use this when the user asks about recent events, real-time data, or anything that may have changed after your training cutoff.",
  inputSchema: z.object({
    query: z.string().describe("The search query to look up on the web"),
  }),
  async *execute({ query }) {
    yield {
      status: "loading" as const,
      message: `Searching the web for "${query}"...`,
    };

    try {
      let results: SearchResult[];
      const braveKey = process.env.BRAVE_SEARCH_API_KEY;

      let source = "Brave Search";
      if (braveKey) {
        results = await searchBrave(query, braveKey);
      } else {
        try {
          results = await searchGatewaySonar(query);
          source = "Perplexity Sonar";
        } catch {
          results = await searchDuckDuckGo(query);
          source = "DuckDuckGo";
        }
      }

      if (results.length === 0) {
        yield {
          status: "error" as const,
          message: "No results found",
          error: `No web results found for "${query}". Try rephrasing your query.`,
        };
        return;
      }

      yield {
        status: "success" as const,
        message: `Found ${results.length} results for "${query}"`,
        data: {
          query,
          results,
          source,
        },
      };
    } catch (err) {
      yield {
        status: "error" as const,
        message: "Search failed",
        error: `Web search failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      };
    }
  },
});
