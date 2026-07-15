# Codex Agentic SDLC Webinar Scaffold

This repository is the safe, reviewable starting point for a live Codex CLI + VS Code demo. The future feature is a **3D Cloud Deployment Visualizer**; the current UI is intentionally only a placeholder.

## Quick start

Requirements: Node.js 24 or newer and npm.

```bash
npm ci
npm run dev
```

Open <http://127.0.0.1:5173>. Before claiming a change is ready, run:

```bash
npm run validate
```

Agents should use the configured Playwright MCP for interactive browser work. Local Playwright tests use the existing system Chrome; CI provisions an isolated Chromium binary on its runner.

Useful commands:

| Command                                   | Purpose                                              |
| ----------------------------------------- | ---------------------------------------------------- |
| `npm run dev`                             | Start the Vite development server                    |
| `npm run build`                           | Type-check and build production assets               |
| `npm test`                                | Run Vitest component tests                           |
| `npm run test:e2e`                        | Run Playwright against a managed local server        |
| `npm run test:remote -- --base-url <url>` | Validate a deployed app                              |
| `npm run validate`                        | Format check, lint, unit tests, E2E tests, and build |
| `./scripts/check-demo-environment.sh`     | Run read-only webinar readiness checks               |

## Automation

- `.github/workflows/ci.yml` validates pull requests and pushes to `main`; it never deploys.
- `.github/workflows/deploy-on-comment.yml` accepts `/deploy` only from trusted collaborators on same-repository PRs and deploys through the protected `demo` environment using AWS OIDC.
- Deployment configuration, MCP setup, and live recovery steps are under `docs/`.

The `issue_comment` workflow must already exist on the default branch before it can react to PR comments. Merge the environment-preparation change before opening the live feature PR.

## Repo-local skills

Sanitized reusable skills live under `skills/`. Install them into the local `.codex/skills/` directory, then restart Codex. The live `.codex/` directory is intentionally excluded from git because it may contain credentials; use `demo-config/.codex/config.toml` as the reviewed, credential-free MCP template.

## Safety

No AWS resources are created by this scaffold. Never configure production buckets, distributions, roles, or domains. Do not add AWS access keys: the deployment workflow requires GitHub Actions OIDC and a dedicated demo role.
