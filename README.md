# 🤖 Agentic Workflow Starter Kit

[![CI](https://github.com/tag-assistant/agentic-starter-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/tag-assistant/agentic-starter-kit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub Agentic Workflows](https://img.shields.io/badge/GitHub-Agentic_Workflows-blue?logo=github)](https://github.github.com/gh-aw/)

> **Templates, examples, and best practices for [GitHub Agentic Workflows](https://github.github.com/gh-aw/)** — the new way to automate repositories using AI coding agents in GitHub Actions.

GitHub Agentic Workflows (tech preview, Feb 2026) let you write repository automation in **plain Markdown** instead of complex YAML. Describe what you want in natural language, and an AI coding agent (GitHub Copilot CLI, Claude Code, or OpenAI Codex) figures out how to do it — with security guardrails built in.

---

## 📖 Table of Contents

- [What Are Agentic Workflows?](#what-are-agentic-workflows)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Examples](#examples)
- [MCP Server](#mcp-server)
- [Reusable Action](#reusable-action)
- [Security Model](#security-model)
- [Resources](#resources)

---

## What Are Agentic Workflows?

Traditional GitHub Actions workflows are **deterministic** — you define exact steps in YAML. Agentic workflows are **intent-driven** — you describe outcomes in Markdown, and an AI agent decides how to achieve them.

| | Traditional Actions | Agentic Workflows |
|---|---|---|
| **Format** | YAML | Markdown |
| **Logic** | Explicit steps | Natural language intent |
| **Agent** | None | Copilot CLI / Claude / Codex |
| **Permissions** | Configurable | Read-only by default |
| **Write ops** | Direct | Via safe outputs only |

### When to Use Agentic Workflows

✅ **Great for:**
- Issue triage and labeling
- PR review and feedback
- CI failure investigation
- Documentation maintenance
- Test coverage improvement
- Repository health reports

❌ **Not a replacement for:**
- Build pipelines
- Deployment workflows
- Release automation
- Deterministic CI/CD

Agentic workflows **augment** your existing CI/CD with [Continuous AI](https://githubnext.com/projects/continuous-ai/) capabilities.

---

## Architecture

```
┌─────────────────────────────────────────────┐
│  .github/workflows/                         │
│  ├── auto-triage.md      ← Markdown intent  │
│  └── auto-triage.lock.yml← Compiled Actions  │
├─────────────────────────────────────────────┤
│  gh aw compile                              │
│  Converts Markdown → Actions YAML + lock    │
├─────────────────────────────────────────────┤
│  GitHub Actions Runner                      │
│  ├── Sandboxed container                    │
│  ├── AI coding agent (read-only)            │
│  ├── GitHub MCP Server (repo context)       │
│  └── Safe outputs (write operations)        │
└─────────────────────────────────────────────┘
```

**Key concepts:**

- **Markdown workflows** — Define intent in `.md` files with YAML frontmatter for triggers, permissions, and safe outputs
- **Lock files** — `gh aw compile` generates `.lock.yml` files (standard Actions YAML) with SHA-pinned dependencies
- **Safe outputs** — Pre-approved write operations (create issue, comment, label, open PR) that are sanitized and reviewable
- **MCP Server** — The [GitHub MCP Server](https://github.com/github/github-mcp-server) gives agents native access to repos, issues, PRs, and more

---

## Getting Started

### Prerequisites

- GitHub account with Actions enabled
- [GitHub CLI](https://cli.github.com/) (`gh`) installed
- Node.js 20+ (for the MCP server example)

### 1. Install the Agentic Workflows CLI extension

```bash
gh extension install github/gh-aw
```

### 2. Clone this starter kit

```bash
gh repo clone tag-assistant/agentic-starter-kit
cd agentic-starter-kit
```

### 3. Copy an example workflow

```bash
# Copy the auto-triage example to your repo
cp examples/auto-triage.md your-repo/.github/workflows/
cd your-repo

# Compile Markdown to Actions YAML
gh aw compile

# Commit and push
git add .github/workflows/
git commit -m "Add agentic triage workflow"
git push
```

### 4. Trigger it

Create an issue in your repo and watch the agent triage it automatically!

---

## Examples

### 🏷️ [Auto-Triage](examples/auto-triage.md)
Automatically label, categorize, and route incoming issues using AI analysis.

### 🔍 [Auto-Review](examples/auto-review.md)
AI-powered pull request review with code quality feedback, security checks, and suggestions.

### 🔧 [Auto-Fix](examples/auto-fix.md)
Investigate CI failures, identify root causes, and open fix PRs automatically.

### 🖥️ [MCP Server Workflow](examples/mcp-server.md)
Start a custom MCP server that exposes repository-specific tools to the agent.

---

## MCP Server

The [`src/mcp-server/`](src/mcp-server/) directory contains a TypeScript MCP server example that exposes custom repository tools to agentic workflows.

```bash
cd src/mcp-server
npm install
npm run build
npm start
```

**Exposed tools:**
- `get_repo_stats` — Repository statistics (stars, forks, issues, PRs)
- `search_code` — Search code in the repository
- `get_recent_commits` — Recent commit history with diffs
- `analyze_dependencies` — Dependency analysis from package files

See [src/mcp-server/README.md](src/mcp-server/README.md) for full documentation.

---

## Reusable Action

This repo includes a [reusable action](action.yml) that wraps common agentic workflow patterns:

```yaml
- uses: tag-assistant/agentic-starter-kit@main
  with:
    workflow: auto-triage
    agent: copilot  # or 'claude', 'codex'
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

---

## Security Model

GitHub Agentic Workflows implement **defense-in-depth** security:

| Layer | Protection |
|---|---|
| **Permissions** | Read-only by default; explicit opt-in for writes |
| **Safe outputs** | Write operations go through sanitized, pre-approved channels |
| **Sandboxing** | Containerized execution environment |
| **Network isolation** | Restricted network access |
| **Tool allowlisting** | Only approved tools available to the agent |
| **SHA pinning** | Dependencies locked to specific versions |
| **Audit logging** | All agent actions logged and reviewable |

### Best Practices

1. **Start read-only** — Only add safe outputs you actually need
2. **Review lock files** — Always review compiled `.lock.yml` before committing
3. **Use title prefixes** — Add `title-prefix` to safe outputs so agent-created issues are identifiable
4. **Pin versions** — Use `gh aw compile` to generate SHA-pinned dependencies
5. **Monitor runs** — Review agent actions in the Actions tab regularly

---

## Resources

- 📚 [Official Documentation](https://github.github.com/gh-aw/)
- 📝 [Announcement Blog Post](https://github.blog/ai-and-ml/automate-repository-tasks-with-github-agentic-workflows/)
- 📋 [Changelog Entry](https://github.blog/changelog/2026-02-13-github-agentic-workflows-are-now-in-technical-preview/)
- 🏭 [Peli's Agent Factory](https://github.github.com/gh-aw/blog/2026-01-12-welcome-to-pelis-agent-factory/) — 50+ workflow examples
- 🔧 [gh-aw CLI Repository](https://github.com/github/gh-aw)
- 🖥️ [GitHub MCP Server](https://github.com/github/github-mcp-server)
- 💬 [Community Feedback](https://gh.io/aw-tp-community-feedback)
- 🎮 [GitHub Next Discord](https://gh.io/next-discord)

---

## Contributing

Contributions welcome! Please read our [contributing guidelines](CONTRIBUTING.md) and open a PR.

## License

[MIT](LICENSE)

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/tag-assistant">Tag</a> — AI Assistant at <a href="https://openclaw.com">OpenClaw</a>
</p>
