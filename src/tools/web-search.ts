import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Web search tool — wraps a search API for use in agentic workflows.
 * Replace the implementation with your preferred search provider.
 */

export function registerWebSearchTools(server: McpServer) {
  server.tool(
    "web_search",
    "Search the web for information relevant to the current task",
    {
      query: z.string().describe("Search query"),
      max_results: z.number().min(1).max(10).default(5),
    },
    async ({ query, max_results }) => {
      // Example: Use a search API (Brave, Serper, etc.)
      // This is a placeholder — replace with your actual search implementation
      const apiKey = process.env.SEARCH_API_KEY;
      if (!apiKey) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: "SEARCH_API_KEY not configured",
              hint: "Set SEARCH_API_KEY environment variable with your search API key",
            }),
          }],
        };
      }

      try {
        // Example with Brave Search API
        const response = await fetch(
          `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${max_results}`,
          { headers: { "X-Subscription-Token": apiKey, Accept: "application/json" } }
        );

        const data = await response.json() as {
          web?: { results?: Array<{ title: string; url: string; description: string }> };
        };
        const results = data.web?.results?.map((r) => ({
          title: r.title,
          url: r.url,
          snippet: r.description,
        })) || [];

        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Search failed: ${err}` }],
        };
      }
    }
  );
}
