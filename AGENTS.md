# Repository operating instructions

## Purpose

This repository is the intentionally empty application baseline for a live Codex webinar. During the demo, Codex creates a tested, client-side 3D web application from scratch and drives it through CI and pull-request review. There is no prepared application, package manifest, test suite, CI workflow, deployment workflow, or cloud integration.

`AGENTS.md` contains durable operating rules. `DEMO_PROMPT.md` is presenter input, not a skill or a source of reusable repository behavior.

## Start every substantial task

1. Inspect `git status`, the current branch, and relevant tracked files.
2. Preserve unrelated user work and identify external actions before taking them.
3. Present a bounded implementation plan in the session before broad edits and keep it current as work progresses.
4. Work on a feature branch; never build the application directly on `main`.
5. Prefix every shell command with `rtk`; prefix every segment in a command chain.

Use `rg` or `rg --files` for repository search and `apply_patch` for hand-edited files.

## Project boundaries

- Build an entirely client-side 3D web application with React and TypeScript.
- Provide accessible DOM controls and status summaries alongside canvas or WebGL content.
- Preserve essential information and interactions when reduced motion is requested or WebGL content is unavailable.
- Treat responsive layout, reduced motion, loading/error states, accessibility, and browser-console errors as completion concerns.
- Keep state deterministic enough for unit and browser tests.
- Do not add a backend, deployment workflows, cloud credentials, infrastructure, hosting, or production integrations.

## Tool policy

### Context7

Use Context7 before implementing library-specific APIs. Resolve documentation for the versions being installed. If Context7 is unavailable, use official primary documentation and report the limitation instead of guessing.

### Playwright

Use the `web-qa-loop` skill for repeatable browser QA. Playwright MCP complements the checked-in Playwright suite that will be created during the live build; it does not replace automated tests.

### GitHub

Prefer GitHub MCP for pull-request metadata, reviews, review threads, comments, and check state. Use `gh` only when the MCP lacks the required operation. Never claim a review or check completed without observing its actual result.

### graphify

graphify is optional and becomes useful only after code exists. If `graphify-out/graph.json` exists, query it before broad architecture or impact analysis. Do not generate a graph, incur extraction usage, or make graphify a completion gate unless the user explicitly requests it.

## Reusable skills

- Keep repository-local skills under `.agents/skills/<name>/SKILL.md` so Codex discovers them from a fresh clone.
- `web-qa-loop` is for recurring local browser inspection, defect fixing, and regression validation.
- `pr-review-loop` is for recurring bounded Copilot review loops on an active PR.

Product briefs, webinar preflight, and feature implementation instructions are prompts or runbook steps, not skills.

## Validation contract

The live implementation must establish one repository-level validation command, preferably `npm run validate`, that covers formatting/linting, unit tests, browser tests, type checking, and production build. Run the smallest relevant checks while iterating and the full validation command before claiming completion or pushing review fixes.

Create GitHub Actions CI as part of the live application work. CI must install locked dependencies and run the same validation command with minimal permissions.

## Secrets and safety

- Never store, commit, print, or paste tokens, credentials, `.env` contents, private keys, or credential-bearing MCP arguments.
- `.codex/` is ignored because the live local configuration may contain credentials. The credential-free template is `demo-config/.codex/config.toml`.
- Inspect sensitive configuration structurally: report names and presence, never values.
- Before committing, verify `.codex/` is ignored and scan only intended changes for common secret patterns.
- Do not add AWS, deployment, hosting, or remote-environment configuration to this demo.

## Pull-request workflow

- Commit only intended application, test, CI, and documentation changes.
- Push without force and open a draft PR with scope and validation evidence.
- Wait for CI on the exact head SHA.
- Use `pr-review-loop` for two rounds unless the user chooses another positive count.
- Address every actionable finding or post a clear technical rationale; never ignore security findings.
- Do not merge unless the user explicitly requests it.

## Completion handoff

Report the user-visible result, files changed, commands and checks run, MCP evidence, branch/commit/PR/CI state, review findings, remaining risks, and confirmation that no secrets or deployment configuration were committed.
