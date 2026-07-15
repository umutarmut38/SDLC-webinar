# MCP setup and verification

## Verified state on 2026-07-15

The redacted project configuration check detects:

| Server                | State                             | Source                     |
| --------------------- | --------------------------------- | -------------------------- |
| `context7`            | Enabled                           | Local `.codex/config.toml` |
| `openaiDeveloperDocs` | Enabled                           | Local `.codex/config.toml` |
| `playwright`          | Enabled                           | Local `.codex/config.toml` |
| `aws_mcp`             | Docs verified, API calls disabled | Local `.codex/config.toml` |
| `graphify`            | Disabled pending graph generation | Local `.codex/config.toml` |

The live `.codex/` is excluded from git because it may contain credentials. Never stage it. `demo-config/.codex/config.toml` is the sanitized, reviewable template; inspect and manually apply it locally. VS Code receives the same project-scoped servers from `.vscode/mcp.json`. Restart Codex CLI and reload VS Code after changing MCP configuration. Trust this repository when prompted; project-local Codex configuration is only applied to trusted projects.

Demo MCPs must not be registered in `~/.codex/config.toml`. The workstation may contain unrelated user-level MCPs, which this repository does not manage. `scripts/check-demo-environment.sh` verifies that the demo MCP names are present locally and absent globally without printing configuration values.

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

Do not use `codex mcp add` for the demo because it writes user-level configuration. Copy the sanitized stanza into the repository's `.codex/config.toml` instead.

Source: <https://github.com/upstash/context7>

## OpenAI developer docs

Purpose: provide current OpenAI and Codex development documentation without adding a user-global MCP entry.

Repository-local Codex configuration:

```toml
[mcp_servers.openaiDeveloperDocs]
url = "https://developers.openai.com/mcp"
```

This server is intentionally project-scoped even though it is useful beyond this repository. Do not add it with `codex mcp add` for this demo.

## Playwright

Purpose: inspect the running local app through the browser, exercise controls, capture failures, and validate `DEMO_BASE_URL` after deployment. Playwright MCP complements—not replaces—the checked-in Playwright test suite.

Repository-local Codex configuration:

```toml
[mcp_servers.playwright]
command = "npx"
args = ["-y", "@playwright/mcp@latest"]
```

If the server is missing, restore this stanza from `demo-config/.codex/config.toml`; do not add it globally.

Use `npm run test:e2e` for repeatable local assertions and `npm run test:remote -- --base-url <url>` for deployment validation. Use MCP interactively to navigate, inspect accessibility snapshots, and diagnose visual/browser behavior.

Source: <https://github.com/microsoft/playwright-mcp>

## AWS MCP Server

Purpose: use the generally available managed AWS MCP Server for current documentation and deployment guidance. The older AWS Knowledge MCP entry was removed as AWS recommends, avoiding overlapping tools.

Repository-local Codex configuration:

```toml
[mcp_servers.aws_mcp]
command = "uvx"
args = [
  "mcp-proxy-for-aws==1.6.2",
  "https://aws-mcp.eu-central-1.api.aws/mcp",
  "--profile", "NTT",
  "--region", "eu-central-1",
  "--metadata", "AWS_REGION=eu-central-1",
  "--read-only",
]
startup_timeout_sec = 60
```

The local `mcp-proxy-for-aws` bridge is configured to sign authenticated requests with the named `NTT` profile and sends them to the Frankfurt managed endpoint. `--metadata AWS_REGION=eu-central-1` sets the default Region for AWS operations. `--read-only` prevents workstation-driven mutations; deployment remains exclusively in the least-privilege GitHub Actions OIDC workflow.

The configuration stores only the profile name, never credentials. If the profile uses SSO and has expired, refresh it outside Codex with `aws sso login --profile NTT`, then restart Codex. Do not remove `--read-only` for the webinar.

Safe checks:

```bash
aws sts get-caller-identity --profile NTT
```

On first use, `uvx` may download and cache the pinned proxy package. No repository installation is required. A fresh ephemeral Codex session successfully called `aws___search_documentation` on 2026-07-15.

The proxy's `--read-only` mode intentionally removes the generic `call_aws` tool, so this workstation configuration cannot inspect or mutate CloudFront, S3, IAM, or other service resources through MCP. Validate the `NTT` credential chain separately with the read-only STS command above; deployment and remote validation remain in GitHub Actions and Playwright. If future MCP-based resource inspection is essential, first create and review a dedicated least-privilege read-only profile, then change this safeguard in a separate approved task.

Sources: <https://aws.amazon.com/blogs/aws/the-aws-mcp-server-is-now-generally-available/>, <https://docs.aws.amazon.com/agent-toolkit/latest/userguide/getting-started-aws-mcp-server.html>, and <https://github.com/aws/mcp-proxy-for-aws>

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
5. Verify with `./scripts/check-demo-environment.sh`, then ask graphify to inspect the PR/deployment workflow or change impact.

Useful read-only inspection after generation:

```bash
graphify query "show the pull request deployment workflow" --graph graphify-out/graph.json
graphify tree --graph graphify-out/graph.json --output graphify-out/GRAPH_TREE.html --root . --label sdlc-webinar
```

Until then, use the checked-in Mermaid fallback in `docs/architecture.md`. Do not claim graphify MCP calls were verified merely because the CLI and MCP entry are present.

Sources: <https://graphify.com/docs/mcp-tools> and <https://github.com/safishamsi/graphify>

## Safe verification

```bash
./scripts/check-demo-environment.sh
```

For each enabled server, make one harmless read/inspection call in a fresh Codex session. The environment script detects configuration and scope but cannot prove remote tool calls succeed. Avoid printing raw MCP configuration or `codex mcp list` output when any local server uses secret command arguments.
