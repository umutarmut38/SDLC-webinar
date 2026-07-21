# Live demo runbook

## Pre-demo checklist

- [ ] Local `main` is clean and matches GitHub.
- [ ] The repository contains no application, package manifest, tests, or CI workflow.
- [ ] Node.js, npm, git, and `gh` are available.
- [ ] `gh` and GitHub MCP authenticate as the intended account.
- [ ] Context7 completes a harmless library lookup in a fresh Codex session.
- [ ] Playwright MCP exposes browser tools.
- [ ] `pr-review` and `web-qa` are installed project-locally and validate structurally.
- [ ] Copilot review remains enabled for this repository/account.
- [ ] Internet access is available for the intentionally cold npm installation.
- [ ] No deployment, hosting, AWS, or production integration is configured.

## Exact preflight commands

Run from the repository root:

```bash
rtk node --version
rtk npm --version
rtk git status --short --branch
rtk gh api user --hostname github.com --jq .login
rtk gh pr list --state open
rtk rg --files --hidden -g '!.git/**'
```

Then make the harmless MCP calls described in `docs/mcp-setup.md`. Do not create application files during preflight.

## Start the live demo

1. Open a fresh Codex session on clean `main`.
2. Paste the instruction in `DEMO_PROMPT.md`.
3. Let Codex inspect the repository, present its in-session plan, and keep that plan updated during implementation.
4. Narrate the visible Context7, browser QA, CI, and review transitions.
5. End with an open, green, reviewed PR. Do not merge it.

## Recovery: implementation takes too long

Reduce the application to six fixed architecture nodes with search, selection, and a dependency detail panel. Remove animated dependency signals and advanced camera transitions first. Preserve accessible controls, meaningful tests, CI, and the review loop; move extra visual polish into PR follow-up notes.

## Recovery: dependency installation fails

Retry the failed npm command once after checking connectivity. If the registry remains unavailable, explain the cold-install tradeoff and switch to a previously rehearsed local branch only if its origin is disclosed to the audience.

## Recovery: local tests fail

Run the smallest failing test or build command, inspect Playwright artifacts and console output, and reduce nondeterministic animation. Do not skip failures or weaken assertions to manufacture a pass.

## Recovery: CI fails

Use GitHub MCP or `gh` to inspect the exact failing check and head SHA. Reproduce locally, fix on the feature branch, push, and wait for the replacement run. Do not merge with failing CI.

## Recovery: Copilot review is unavailable

Request it manually from the PR Reviewers panel. If no review completes, report the limitation and inspect available human review threads without fabricating Copilot evidence.

## After the webinar

- Decide explicitly whether to keep, close, or merge the live feature PR.
- Remove local build output, browser artifacts, and optional graphify output.
- Confirm no credentials or `.env` files entered git history.
- Keep the two reusable skills and the sanitized MCP template for future development demos.
