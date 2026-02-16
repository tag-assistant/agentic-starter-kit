import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

function getRepoInfo() {
  const repo = process.env.GITHUB_REPOSITORY ?? "owner/repo";
  const [owner, name] = repo.split("/");
  return { owner, repo: name };
}

const server = new McpServer({
  name: "repo-tools",
  version: "0.1.0",
});

// Tool: Get repository statistics
server.tool(
  "get_repo_stats",
  "Get repository statistics including stars, forks, open issues, and pull requests",
  {},
  async () => {
    const { owner, repo } = getRepoInfo();

    const [repoData, issues, pulls] = await Promise.all([
      octokit.repos.get({ owner, repo }),
      octokit.issues.listForRepo({ owner, repo, state: "open", per_page: 1 }),
      octokit.pulls.list({ owner, repo, state: "open", per_page: 1 }),
    ]);

    const stats = {
      name: repoData.data.full_name,
      description: repoData.data.description,
      stars: repoData.data.stargazers_count,
      forks: repoData.data.forks_count,
      open_issues: repoData.data.open_issues_count,
      watchers: repoData.data.watchers_count,
      language: repoData.data.language,
      default_branch: repoData.data.default_branch,
      created_at: repoData.data.created_at,
      updated_at: repoData.data.updated_at,
    };

    return { content: [{ type: "text", text: JSON.stringify(stats, null, 2) }] };
  }
);

// Tool: Search code in the repository
server.tool(
  "search_code",
  "Search for code patterns in the repository",
  {
    query: z.string().describe("Search query (code pattern, function name, etc.)"),
    file_extension: z.string().optional().describe("Filter by file extension (e.g., 'ts', 'py')"),
  },
  async ({ query, file_extension }) => {
    const { owner, repo } = getRepoInfo();

    let q = `${query} repo:${owner}/${repo}`;
    if (file_extension) q += ` extension:${file_extension}`;

    const results = await octokit.search.code({ q, per_page: 10 });

    const matches = results.data.items.map((item) => ({
      file: item.path,
      url: item.html_url,
      score: item.score,
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ total: results.data.total_count, matches }, null, 2),
        },
      ],
    };
  }
);

// Tool: Get recent commits
server.tool(
  "get_recent_commits",
  "Get recent commit history with messages and authors",
  {
    count: z.number().min(1).max(50).default(10).describe("Number of commits to retrieve"),
    branch: z.string().optional().describe("Branch name (defaults to default branch)"),
  },
  async ({ count, branch }) => {
    const { owner, repo } = getRepoInfo();

    const commits = await octokit.repos.listCommits({
      owner,
      repo,
      sha: branch,
      per_page: count,
    });

    const history = commits.data.map((c) => ({
      sha: c.sha.substring(0, 7),
      message: c.commit.message.split("\n")[0],
      author: c.commit.author?.name ?? "unknown",
      date: c.commit.author?.date,
      url: c.html_url,
    }));

    return { content: [{ type: "text", text: JSON.stringify(history, null, 2) }] };
  }
);

// Tool: Analyze dependencies
server.tool(
  "analyze_dependencies",
  "Analyze project dependencies from package.json, requirements.txt, or similar files",
  {
    file_path: z
      .string()
      .default("package.json")
      .describe("Path to the dependency file (e.g., package.json, requirements.txt)"),
  },
  async ({ file_path }) => {
    const { owner, repo } = getRepoInfo();

    try {
      const { data } = await octokit.repos.getContent({ owner, repo, path: file_path });

      if ("content" in data) {
        const content = Buffer.from(data.content, "base64").toString("utf-8");

        let analysis: Record<string, unknown>;
        if (file_path.endsWith(".json")) {
          const pkg = JSON.parse(content);
          analysis = {
            file: file_path,
            dependencies: Object.keys(pkg.dependencies ?? {}),
            devDependencies: Object.keys(pkg.devDependencies ?? {}),
            total: Object.keys(pkg.dependencies ?? {}).length + Object.keys(pkg.devDependencies ?? {}).length,
          };
        } else {
          const lines = content.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
          analysis = { file: file_path, dependencies: lines, total: lines.length };
        }

        return { content: [{ type: "text", text: JSON.stringify(analysis, null, 2) }] };
      }

      return { content: [{ type: "text", text: "File is a directory, not a file." }] };
    } catch {
      return { content: [{ type: "text", text: `File not found: ${file_path}` }] };
    }
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🔧 repo-tools MCP server running on stdio");
}

main().catch(console.error);
