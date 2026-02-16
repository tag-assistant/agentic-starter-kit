# 🔧 Repository Tools MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server that exposes repository-specific tools for use with GitHub Agentic Workflows.

## Tools

| Tool | Description |
|------|-------------|
| `get_repo_stats` | Repository statistics (stars, forks, issues, PRs) |
| `search_code` | Search for code patterns in the repository |
| `get_recent_commits` | Recent commit history with messages and authors |
| `analyze_dependencies` | Analyze dependencies from package files |

## Setup

```bash
npm install
npm run build
```

## Usage

### Standalone

```bash
GITHUB_TOKEN=ghp_xxx GITHUB_REPOSITORY=owner/repo npm start
```

### In an Agentic Workflow

Reference this server in your workflow's frontmatter:

```yaml
tools:
  mcp-servers:
    repo-tools:
      command: "node"
      args: ["src/mcp-server/dist/index.js"]
```

## Environment Variables

- `GITHUB_TOKEN` — GitHub personal access token (provided automatically in Actions)
- `GITHUB_REPOSITORY` — Repository in `owner/repo` format (provided automatically in Actions)
