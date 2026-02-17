# Setup Guide

Get up and running with the Agentic Starter Kit in 5 minutes.

## Prerequisites

- **GitHub account** with Actions enabled
- **Node.js 20+** (for the MCP server and agent)
- **GitHub CLI** (`gh`) — [install](https://cli.github.com/)

## Quick Start

### 1. Use this template

Click **"Use this template"** on GitHub, or:

```bash
gh repo create my-agentic-repo --template tag-assistant/agentic-starter-kit --public
cd my-agentic-repo
```

### 2. Install dependencies

```bash
cd src/mcp-server
npm install
```

### 3. Configure secrets

Add these repository secrets in **Settings → Secrets and variables → Actions**:

| Secret | Required | Description |
|--------|----------|-------------|
| `GITHUB_TOKEN` | Auto | Built-in token (already available) |
| `SEARCH_API_KEY` | Optional | Brave Search API key for web search tool |

### 4. Enable workflows

The included workflows activate automatically on:
- **Issue Handler** — new issues and comments
- **PR Reviewer** — new and updated PRs
- **Release Notes** — new releases

### 5. Test it

Create an issue in your repo — the issue handler should triage and label it within a minute.

## MCP Server Setup

The MCP server at `src/mcp-server/` provides custom tools to agents:

```bash
cd src/mcp-server
npm install
npm run build
npm start
```

Set environment variables:
```bash
export GITHUB_TOKEN="ghp_your_token"
export GITHUB_REPOSITORY="owner/repo"
```

## Using with Agentic Workflows (gh-aw)

If you have access to the [GitHub Agentic Workflows](https://github.github.com/gh-aw/) tech preview:

```bash
# Install the CLI extension
gh extension install github/gh-aw

# Compile Markdown workflows to Actions YAML
gh aw compile

# The compiled .lock.yml files are standard Actions workflows
git add .github/workflows/
git commit -m "Add compiled workflows"
git push
```

## Local Development

Run the agent locally to test tool integrations:

```bash
cd src
npx tsx agent.ts
```

This connects to the MCP server and runs a simple demo workflow.
