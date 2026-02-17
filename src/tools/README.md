# Tool Definitions

This directory contains example MCP tool definitions organized by domain:

| File | Tools | Description |
|------|-------|-------------|
| [`github-api.ts`](github-api.ts) | `list_issues`, `get_pull_request`, `create_issue_comment` | GitHub REST API operations |
| [`web-search.ts`](web-search.ts) | `web_search` | Web search via Brave Search API |
| [`file-analysis.ts`](file-analysis.ts) | `read_file`, `list_directory`, `count_lines` | Local file reading and analysis |

## Adding New Tools

1. Create a new file in this directory (e.g., `my-tools.ts`)
2. Export a registration function:

```typescript
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerMyTools(server: McpServer) {
  server.tool(
    "my_tool_name",
    "Description of what this tool does",
    {
      param1: z.string().describe("Parameter description"),
    },
    async ({ param1 }) => {
      // Your tool logic here
      return {
        content: [{ type: "text", text: "result" }],
      };
    }
  );
}
```

3. Import and register in your MCP server's `index.ts`:

```typescript
import { registerMyTools } from "../tools/my-tools.js";
registerMyTools(server);
```

## Best Practices

- **Keep tools focused** — one tool per operation, not one tool that does everything
- **Validate inputs** — use Zod schemas to catch bad inputs early
- **Return structured data** — JSON is easier for agents to parse than prose
- **Handle errors gracefully** — return error info, don't throw
- **Document parameters** — use `.describe()` on every Zod field
