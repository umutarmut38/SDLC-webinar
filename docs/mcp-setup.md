# MCP setup

All demo MCP configuration is project-local. Never register demo servers in the user-global Codex configuration and never print raw local configuration that may contain credentials.

## Context7

Use Context7 before installing or implementing Vite, React, React Three Fiber, Drei, Three.js, Vitest, Testing Library, or Playwright APIs. The credential-free project entry is:

```toml
[mcp_servers.context7]
url = "https://mcp.context7.com/mcp"
```

Before the webinar, make one harmless library-resolution call in a fresh Codex session.

## Playwright

Use Playwright MCP for interactive browser inspection and the checked-in Playwright suite—created during the live build—for repeatable validation.

```toml
[mcp_servers.playwright]
command = "npx"
args = ["-y", "@playwright/mcp@latest"]
```

Before the webinar, confirm the MCP exposes browser tools. During the build, use the `web-qa-loop` skill after the application can run locally.

## GitHub

Use the GitHub MCP integration provided by the Codex environment for PR metadata, comments, reviews, threads, and check state. Confirm it returns the intended `github.com` identity before the webinar. Use authenticated `gh` only for operations the MCP does not expose; do not add a token to tracked MCP configuration.

## graphify

graphify is optional because the application does not exist at baseline. Its local installer is:

```bash
graphify install --project --platform codex
```

Do not generate a graph before the live code exists. After code is created, generate or update `graphify-out/graph.json` only on explicit request, then enable the local MCP entry and restart Codex. graphify availability is not a demo success gate.

## Safe preflight

In a fresh Codex session:

1. resolve one library through Context7;
2. confirm Playwright browser tools are exposed;
3. ask GitHub MCP for the authenticated user;
4. report graphify as optional unless a graph already exists.

Do not use raw `codex mcp list` output when local command arguments may be sensitive.
