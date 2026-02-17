import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

/**
 * Simple agent that connects to MCP servers and orchestrates tool calls.
 *
 * This is a minimal example showing how to:
 * 1. Connect to one or more MCP servers
 * 2. Discover available tools
 * 3. Call tools based on simple decision logic
 *
 * In a real agent, you'd integrate an LLM to decide which tools to call.
 */

interface AgentConfig {
  mcpServers: {
    name: string;
    command: string;
    args: string[];
    env?: Record<string, string>;
  }[];
}

class Agent {
  private clients: Map<string, Client> = new Map();
  private tools: Map<string, { client: Client; schema: unknown }> = new Map();

  constructor(private config: AgentConfig) {}

  async connect(): Promise<void> {
    for (const server of this.config.mcpServers) {
      const client = new Client({ name: "agent", version: "0.1.0" });
      const transport = new StdioClientTransport({
        command: server.command,
        args: server.args,
        env: { ...process.env, ...server.env } as Record<string, string>,
      });

      await client.connect(transport);
      this.clients.set(server.name, client);

      // Discover tools
      const { tools } = await client.listTools();
      for (const tool of tools) {
        this.tools.set(tool.name, { client, schema: tool.inputSchema });
        console.log(`  📦 ${server.name}/${tool.name}: ${tool.description}`);
      }
    }
    console.log(`\n✅ Connected to ${this.clients.size} server(s), ${this.tools.size} tool(s) available\n`);
  }

  async callTool(name: string, args: Record<string, unknown> = {}): Promise<string> {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Unknown tool: ${name}`);

    const result = await tool.client.callTool({ name, arguments: args });
    const text = result.content
      ?.filter((c: { type: string }) => c.type === "text")
      .map((c: { text: string }) => c.text)
      .join("\n");

    return text || "(no output)";
  }

  async listTools(): Promise<string[]> {
    return Array.from(this.tools.keys());
  }

  async disconnect(): Promise<void> {
    for (const [name, client] of this.clients) {
      await client.close();
      console.log(`Disconnected from ${name}`);
    }
  }
}

// --- Example usage ---

async function main() {
  const agent = new Agent({
    mcpServers: [
      {
        name: "repo-tools",
        command: "node",
        args: ["./mcp-server/dist/index.js"],
        env: {
          GITHUB_TOKEN: process.env.GITHUB_TOKEN || "",
          GITHUB_REPOSITORY: process.env.GITHUB_REPOSITORY || "",
        },
      },
    ],
  });

  console.log("🤖 Agent starting...\n");
  await agent.connect();

  // Example: Run a simple workflow
  const tools = await agent.listTools();
  console.log("Available tools:", tools);

  // Get repo stats
  console.log("\n📊 Repository Stats:");
  console.log(await agent.callTool("get_repo_stats"));

  // Get recent commits
  console.log("\n📝 Recent Commits:");
  console.log(await agent.callTool("get_recent_commits", { count: 5 }));

  await agent.disconnect();
}

main().catch(console.error);
