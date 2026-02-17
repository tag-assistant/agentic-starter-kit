import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * GitHub API tools — wraps common GitHub REST API operations
 * for use as MCP tools in agentic workflows.
 */

export function registerGitHubTools(server: McpServer, octokit: any, owner: string, repo: string) {
  server.tool(
    "list_issues",
    "List open issues with optional label filter",
    {
      label: z.string().optional().describe("Filter by label name"),
      state: z.enum(["open", "closed", "all"]).default("open"),
      limit: z.number().min(1).max(100).default(10),
    },
    async ({ label, state, limit }) => {
      const params: any = { owner, repo, state, per_page: limit };
      if (label) params.labels = label;

      const { data } = await octokit.issues.listForRepo(params);
      const issues = data
        .filter((i: any) => !i.pull_request) // exclude PRs
        .map((i: any) => ({
          number: i.number,
          title: i.title,
          state: i.state,
          labels: i.labels.map((l: any) => l.name),
          author: i.user?.login,
          created: i.created_at,
        }));

      return { content: [{ type: "text", text: JSON.stringify(issues, null, 2) }] };
    }
  );

  server.tool(
    "get_pull_request",
    "Get details of a specific pull request including diff stats",
    {
      pr_number: z.number().describe("Pull request number"),
    },
    async ({ pr_number }) => {
      const [{ data: pr }, { data: files }] = await Promise.all([
        octokit.pulls.get({ owner, repo, pull_number: pr_number }),
        octokit.pulls.listFiles({ owner, repo, pull_number: pr_number }),
      ]);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            number: pr.number,
            title: pr.title,
            state: pr.state,
            merged: pr.merged,
            author: pr.user?.login,
            additions: pr.additions,
            deletions: pr.deletions,
            changed_files: pr.changed_files,
            files: files.map((f: any) => ({
              filename: f.filename,
              status: f.status,
              additions: f.additions,
              deletions: f.deletions,
            })),
          }, null, 2),
        }],
      };
    }
  );

  server.tool(
    "create_issue_comment",
    "Add a comment to an issue or pull request",
    {
      issue_number: z.number().describe("Issue or PR number"),
      body: z.string().describe("Comment body (Markdown)"),
    },
    async ({ issue_number, body }) => {
      const { data } = await octokit.issues.createComment({
        owner, repo, issue_number, body,
      });
      return {
        content: [{ type: "text", text: `Comment created: ${data.html_url}` }],
      };
    }
  );
}
