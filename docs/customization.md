# How to Customize

This guide covers common customization patterns.

## Customizing Workflows

### Modify triage labels

Edit `.github/workflows/agentic-issue-handler.yml` to change the keyword-to-label mapping:

```javascript
// Add your own patterns
if (text.match(/deploy|release|ship/)) labels.push('deployment');
if (text.match(/perf|slow|latency/)) labels.push('performance');
```

### Change PR review checks

Edit `.github/workflows/agentic-pr-reviewer.yml` to add domain-specific checks:

```javascript
// Example: Require migration files for model changes
const hasModelChange = files.some(f => f.filename.match(/models\//));
const hasMigration = files.some(f => f.filename.match(/migrations\//));
if (hasModelChange && !hasMigration) {
  reviewChecks.push('📋 Model changed without migration');
}
```

### Customize release note categories

Edit `.github/workflows/agentic-release-notes.yml` to match your label scheme:

```javascript
const categories = {
  '💥 Breaking Changes': [],  // label: breaking-change
  '🚀 Features': [],          // label: enhancement
  '🐛 Bug Fixes': [],         // label: bug
  '📖 Documentation': [],     // label: docs
};
```

## Customizing the MCP Server

### Add a new tool

1. Create a tool file in `src/tools/`
2. Register it in `src/mcp-server/src/index.ts`

See [`src/tools/README.md`](../src/tools/README.md) for the full pattern.

### Connect to external APIs

```typescript
server.tool(
  "check_status_page",
  "Check your service's status page",
  {},
  async () => {
    const res = await fetch("https://status.example.com/api/v2/status.json");
    const data = await res.json();
    return { content: [{ type: "text", text: JSON.stringify(data) }] };
  }
);
```

## Customizing for Your Stack

### Python projects

Replace the Node.js MCP server with a Python one using the [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk):

```python
from mcp.server import Server
app = Server("my-tools")

@app.tool()
async def run_tests(test_path: str = "tests/") -> str:
    """Run project tests and return results."""
    import subprocess
    result = subprocess.run(["pytest", test_path, "--tb=short"], capture_output=True, text=True)
    return result.stdout + result.stderr
```

### Monorepos

Duplicate workflows per package, or add path filters:

```yaml
on:
  pull_request:
    paths:
      - 'packages/api/**'
```

## Environment Variables

| Variable | Used By | Description |
|----------|---------|-------------|
| `GITHUB_TOKEN` | All workflows | GitHub API access |
| `GITHUB_REPOSITORY` | MCP server | `owner/repo` format |
| `SEARCH_API_KEY` | Web search tool | Brave Search API key |
