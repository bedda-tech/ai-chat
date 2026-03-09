import { tool } from "ai";
import { z } from "zod";

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface DuckDuckGoResponse {
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
}

async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
  const response = await fetch(url, {
    headers: { "User-Agent": "bedda-chat/1.0" },
  });

  if (!response.ok) throw new Error(`DuckDuckGo API error: ${response.status}`);

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
        title: topic.FirstURL.split("/").pop()?.replace(/_/g, " ") || topic.FirstURL,
        url: topic.FirstURL,
        snippet: topic.Text,
      });
    }
  }

  return results;
}

async function searchBrave(query: string, apiKey: string): Promise<SearchResult[]> {
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=8`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": apiKey,
    },
  });

  if (!response.ok) throw new Error(`Brave Search API error: ${response.status}`);

  const data = await response.json();
  return (data.web?.results || []).map((r: { title: string; url: string; description?: string }) => ({
    title: r.title,
    url: r.url,
    snippet: r.description || "",
  }));
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

      if (braveKey) {
        results = await searchBrave(query, braveKey);
      } else {
        results = await searchDuckDuckGo(query);
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
        data: { query, results, source: braveKey ? "Brave Search" : "DuckDuckGo" },
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
