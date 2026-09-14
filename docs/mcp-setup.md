# MCP setup

All demo MCP configuration is project-local. Never register demo servers in the user-global Codex configuration and never print raw local configuration that may contain credentials.

## Required use by role

| Role | MCP responsibility | Evidence |
| --- | --- | --- |
| Coordinator | Context7 for shared library APIs; GitHub for PR/review/check operations | Documentation references; actual GitHub response and head SHA |
| `ui-builder` | Context7 for UI library APIs | Library ID, version, query result used |
| `test-engineer` | Context7 for test-library APIs | Library ID, version, query result used |
| `browser-verifier` | Playwright for real browser verification | Actual navigation, snapshot, interaction, resize, console/network calls and outcomes |
| `reviewer` | Context7 when a finding depends on library behavior | Version-specific documentation supporting the finding |

Agents inherit the parent MCP configuration rather than storing duplicate server credentials. This is a responsibility contract, not a tool-permission sandbox: verify actual child-session tool availability during preflight. Workers must not alter MCP/auth/approval settings. GitHub operations stay with the coordinator, and only the browser-verifier owns interactive Playwright MCP during inspection.

Context7 unavailability permits an explicitly reported official-primary-documentation fallback. Playwright MCP unavailability blocks browser verification; neither source inspection nor a passing automated suite proves that the MCP browser pass happened.

## Context7

Use Context7 before installing or implementing Vite, React, Vitest, Testing Library, or Playwright APIs. Batch related questions and use the versions verified during rehearsal. Do not add 3D dependencies. The credential-free project entry is:

```toml
[mcp_servers.context7]
url = "https://mcp.context7.com/mcp"
```

Before the webinar, make one harmless library-resolution call in a fresh Codex session.

## Playwright

Use Playwright MCP for one interactive browser inspection and the checked-in Playwright suite, created during the live build, for repeatable validation. Only the browser-verifier owns the interactive browser during its pass; other agents must not navigate the same session.

```toml
[mcp_servers.playwright]
command = "npx"
args = ["-y", "@playwright/mcp@0.0.80", "--isolated"]
```

The pin is intentional. Warm this exact server version and its browser binaries before rehearsal, and avoid last-minute upgrades. The test runner has its own browser installation requirements; do not assume MCP's cached browser satisfies it.

Before the webinar, confirm the MCP exposes browser tools and can open and close a harmless page. During the build, the coordinator starts the app and delegates `web-qa-loop` in `inspect-only` mode. Use an isolated browser context for QA so tests do not replace an unrelated saved plan. Reload within that context to verify persistence; a new isolated context intentionally starts fresh.

## GitHub

Use the GitHub MCP integration provided by the Codex environment for PR metadata, comments, reviews, threads, and check state. Confirm it returns the intended `github.com` identity before the webinar. Use authenticated `gh` only for operations the MCP does not expose; do not add a token to tracked MCP configuration.

At live handoff, observe CI for the exact PR head SHA and use `pr-review-loop` in `request-only` mode. Do not wait for green CI or a completed remote review inside the 30-minute budget. Distinguish a local Sol review from GitHub Copilot feedback.

## graphify

graphify is optional because the application does not exist at baseline. Its local installer is:

```bash
rtk proxy graphify install --project --platform codex
```

Do not generate a graph before the live code exists. After code is created, generate or update `graphify-out/graph.json` only on explicit request, then enable the local MCP entry and restart Codex. graphify availability is not a demo success gate.

## Safe preflight

In a fresh Codex session:

1. resolve one library through Context7;
2. confirm the pinned Playwright MCP can open a harmless page and close its own tab;
3. ask GitHub MCP for the authenticated user;
4. report graphify as optional unless a graph already exists.

Also run the [agent smoke prompt](live-demo-runbook.md#agent-smoke-prompt) and the [subagent MCP smoke prompt](live-demo-runbook.md#subagent-mcp-smoke-prompt). The first checks model/role startup; only the second checks real tool calls inside the children. A successful parent-session probe is not proof that a subagent has access. A subagent definition is not an MCP server, and `.agents/skills/` contains reusable workflows rather than model routing.

Do not use raw `codex mcp list` output when local command arguments may be sensitive. Preserve existing private MCP/auth/approval settings when installing the template.
