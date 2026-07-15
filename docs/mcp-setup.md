# MCP setup and verification

## Verified state on 2026-07-15

Running `codex mcp list` from this workstation detects:

| Server          | State                             | Source                     |
| --------------- | --------------------------------- | -------------------------- |
| `context7`      | Enabled                           | Local `.codex/config.toml` |
| `playwright`    | Enabled                           | Local `.codex/config.toml` |
| `aws-knowledge` | Enabled                           | Local `.codex/config.toml` |
| `graphify`      | Disabled pending graph generation | Local `.codex/config.toml` |

The live `.codex/` is excluded from git because it may contain credentials. Never stage it. `demo-config/.codex/config.toml` is the sanitized, reviewable template; inspect and manually apply it locally. VS Code receives the first three servers from `.vscode/mcp.json`. Restart Codex CLI and reload VS Code after changing MCP configuration. Trust this repository when prompted; project-local Codex configuration is only applied to trusted projects.

No secret is stored in the checked-in template or VS Code config. Context7 may offer higher limits with an API key, but the demo starts with its unauthenticated remote endpoint. Add a key only through a supported secret/environment mechanism—never commit it.

## Context7

Purpose: resolve current, version-aware documentation before implementing React, React Three Fiber, Drei, Three.js, Vite, Vitest, or Playwright APIs.

During the live build, explicitly ask Codex to use Context7 before library-specific work and confirm a Context7 tool call appears. A good prompt is:

> Use Context7 to check the current React Three Fiber Canvas, lighting, and camera APIs for the installed versions, then implement only the first scene slice.

Repository-local Codex configuration:

```toml
[mcp_servers.context7]
url = "https://mcp.context7.com/mcp"
```

Manual Codex fallback:

```bash
codex mcp add context7 --url https://mcp.context7.com/mcp
```

Source: <https://github.com/upstash/context7>

## Playwright

Purpose: inspect the running local app through the browser, exercise controls, capture failures, and validate `DEMO_BASE_URL` after deployment. Playwright MCP complements—not replaces—the checked-in Playwright test suite.

Repository-local Codex configuration:

```toml
[mcp_servers.playwright]
command = "npx"
args = ["-y", "@playwright/mcp@latest"]
```

Manual Codex fallback:

```bash
codex mcp add playwright -- npx -y @playwright/mcp@latest
```

Use `npm run test:e2e` for repeatable local assertions and `npm run test:remote -- --base-url <url>` for deployment validation. Use MCP interactively to navigate, inspect accessibility snapshots, and diagnose visual/browser behavior.

Source: <https://github.com/microsoft/playwright-mcp>

## AWS Knowledge

Purpose: obtain current AWS documentation, CloudFormation/CDK examples, and deployment guidance without granting a broad AWS mutation tool access.

Repository-local Codex configuration:

```toml
[mcp_servers.aws-knowledge]
url = "https://knowledge-mcp.global.api.aws"
```

Manual Codex fallback:

```bash
codex mcp add aws-knowledge --url https://knowledge-mcp.global.api.aws
```

This is intentionally the remote AWS Knowledge MCP, not the AWS API MCP. Actual deployment validation remains in the least-privilege GitHub Actions OIDC workflow. If a local AWS API MCP is ever added, configure it read-only and with a dedicated demo/read-only profile; do not connect production credentials.

Sources: <https://awslabs.github.io/mcp/servers/aws-knowledge-mcp-server> and <https://github.com/awslabs/mcp>

## graphify

`graphify 0.9.2` and `graphify-mcp` are installed locally. The official project-local Codex installer was run successfully:

```bash
graphify install --project --platform codex
```

It installed `.codex/skills/graphify/`, its references, and `.codex/hooks.json` with a pre-tool `graphify hook-check`. It did not generate `graphify-out/` or call an extraction backend. The MCP command was discovered as:

```bash
graphify-mcp graphify-out/graph.json
```

The sanitized template contains the server but keeps `enabled = false` because no graph exists yet. Initial extraction may use a configured LLM backend, incur usage, and write `graphify-out/`; do not run it implicitly. Before the webinar:

1. Review available backends with `graphify --help` and intentionally select a non-production, approved backend.
2. Generate the graph with the Graphify-supported `/graphify .` workflow or an explicitly reviewed `graphify extract . --backend <backend> --no-cluster` command.
3. Confirm `graphify-out/graph.json` exists.
4. Change `enabled = false` to `enabled = true` in `.codex/config.toml` and restart Codex.
5. Verify with `codex mcp list`, then ask graphify to inspect the PR/deployment workflow or change impact.

Useful read-only inspection after generation:

```bash
graphify query "show the pull request deployment workflow" --graph graphify-out/graph.json
graphify tree --graph graphify-out/graph.json --output graphify-out/GRAPH_TREE.html --root . --label sdlc-webinar
```

Until then, use the checked-in Mermaid fallback in `docs/architecture.md`. Do not claim graphify MCP calls were verified merely because the CLI and MCP entry are present.

Sources: <https://graphify.com/docs/mcp-tools> and <https://github.com/safishamsi/graphify>

## Safe verification

```bash
codex mcp list
./scripts/check-demo-environment.sh
```

For each enabled server, make one harmless read/inspection call in a fresh Codex session. The environment script detects configuration but cannot prove remote tool calls succeed.
