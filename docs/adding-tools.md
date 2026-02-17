# How to Add New Tools

MCP tools are the building blocks of agentic workflows. This guide shows how to create, register, and test new tools.

## Anatomy of an MCP Tool

Every tool has three parts:

1. **Name** — unique identifier (snake_case)
2. **Schema** — Zod schema defining inputs
3. **Handler** — async function that does the work

```typescript
server.tool(
  "tool_name",                          // 1. Name
  "What this tool does",                // Description
  { input: z.string() },               // 2. Schema
  async ({ input }) => {                // 3. Handler
    return {
      content: [{ type: "text", text: "result" }],
    };
  }
);
```

## Step-by-Step

### 1. Create the tool file

```bash
touch src/tools/my-integration.ts
```

### 2. Write the tool

```typescript
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerMyTools(server: McpServer) {
  server.tool(
    "get_weather",
    "Get current weather for a location",
    {
      city: z.string().describe("City name"),
      units: z.enum(["metric", "imperial"]).default("metric"),
    },
    async ({ city, units }) => {
      const apiKey = process.env.WEATHER_API_KEY;
      if (!apiKey) {
        return {
          content: [{ type: "text", text: "WEATHER_API_KEY not set" }],
          isError: true,
        };
      }

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`
      );
      const data = await res.json();

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            city: data.name,
            temp: data.main.temp,
            description: data.weather[0].description,
          }),
        }],
      };
    }
  );
}
```

### 3. Register in the MCP server

Edit `src/mcp-server/src/index.ts`:

```typescript
import { registerMyTools } from "../../tools/my-integration.js";

// After existing tool registrations:
registerMyTools(server);
```

### 4. Test locally

```bash
cd src/mcp-server
npm run build
WEATHER_API_KEY=xxx npm start
```

Then use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector) to test interactively:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## Tool Design Guidelines

| Do | Don't |
|----|-------|
| Return structured JSON | Return unstructured prose |
| Handle errors in the handler | Let exceptions propagate |
| Use `.describe()` on all params | Leave params undocumented |
| Keep tools focused (one job) | Build Swiss Army knife tools |
| Validate inputs with Zod | Trust input blindly |
| Set reasonable defaults | Require every parameter |

## Tool Categories to Consider

- **Data retrieval** — fetch from APIs, databases, files
- **Analysis** — parse, summarize, compare data
- **Actions** — create issues, post comments, send notifications
- **Search** — code search, web search, log search
- **Monitoring** — check status pages, CI runs, deployments
