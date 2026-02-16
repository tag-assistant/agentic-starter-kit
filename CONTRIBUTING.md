# Contributing to Agentic Workflow Starter Kit

Thanks for your interest in contributing! 🎉

## How to Contribute

1. **Fork** this repository
2. **Create a branch** for your feature or fix
3. **Make your changes** and test them
4. **Open a PR** with a clear description

## Adding Example Workflows

Example workflows go in `examples/` as Markdown files with YAML frontmatter:

```markdown
---
on:
  issues:
    types: [opened]

permissions:
  contents: read

safe-outputs:
  add-labels:
    max-labels: 3
---

# Your Workflow Name

Description of what the workflow does...
```

### Requirements for examples:
- Must have valid YAML frontmatter with `on:`, `permissions:`, and `safe-outputs:`
- Should follow the security-first principle (read-only by default)
- Include clear documentation of what the workflow does
- Keep safe outputs minimal

## Code Style

- TypeScript for MCP server code
- Use `npm run typecheck` to verify types

## Questions?

Open an issue or join the [GitHub Next Discord](https://gh.io/next-discord).
