# Repository operating instructions

## Purpose

This repository is the intentionally empty application baseline for a roughly 30-minute Codex webinar. During the demo, Codex builds WeekPlan, a client-side weekly workload planner, validates it locally, and opens a draft pull request. Remote CI and Copilot review may finish afterward. There is no prepared application, package manifest, test suite, CI workflow, deployment workflow, or cloud integration.

`AGENTS.md` contains durable operating rules. `DEMO_PROMPT.md` is presenter input, not a skill or a source of reusable repository behavior.

## Start every substantial task

1. Inspect `git status`, the current branch, and relevant tracked files.
2. Preserve unrelated user work and identify external actions before taking them.
3. Present a bounded implementation plan in the session before broad edits and keep it current as work progresses.
4. Work on a feature branch; never build the application directly on `main`.
5. Prefix every shell command with `rtk`; prefix every segment in a command chain.

Use `rg` or `rg --files` for repository search and `apply_patch` for hand-edited files.

## Project boundaries

- Build an entirely client-side web application with React and TypeScript. The live product scope and acceptance journey are in `DEMO_PROMPT.md`.
- Use semantic, keyboard-operable DOM controls. Communicate workload and errors through text, not color alone.
- Treat responsive layout, reduced motion, empty/error states, accessibility, and browser-console errors as completion concerns.
- Keep domain state deterministic and store effort as integer minutes. Derive totals rather than persisting redundant totals.
- Validate persisted data and surface storage failures. Never silently overwrite unreadable user data or claim an unsaved change was saved.
- Do not add 3D, a backend, accounts, external calendar integrations, deployment workflows, cloud credentials, infrastructure, or hosting.

## Bounded subagent workflow

- The coordinator owns the shared data/state contract, domain and storage logic, package manifests, lockfile, configuration, integration, CI, and Git operations.
- Use the project agents installed from `demo-config/.codex/agents/`: `ui-builder` (Luna), `test-engineer` (Luna), `browser-verifier` (Terra), and `reviewer` (Sol).
- Establish file ownership, exported interfaces, and observable acceptance criteria before parallel edits. The UI worker owns UI files; the test worker owns test files. Neither changes shared contracts or dependencies without coordinating.
- Keep at most two subagents open concurrently. Close completed workers before starting the next pair. Subagents must not spawn more agents, commit, push, or open PRs.
- Run the UI and test workers in parallel after scaffolding. The coordinator continues with its own independent implementation work.
- Once the app is runnable, freeze edits while the browser verifier and reviewer inspect the same version. They report findings without editing source; the coordinator assigns fixes afterward.
- Prefer medium reasoning and compact handoffs: files changed or inspected, checks actually run, concrete findings, and blockers. Do not launch extra agents for trivial lookups.
- Use one initial browser pass and one local Sol review, followed by one repair phase and targeted rechecks. Do not start repeated polish or review cycles.
- The 30-minute target is a planning budget, not permission to skip checks. Cut optional polish first; report unresolved failures and an incomplete demo if necessary.

## Tool policy

### Subagent MCP responsibilities

- Subagents inherit the parent's MCP configuration; verify the relevant tools are actually exposed in each child session. Do not duplicate credentials or change permissions/configuration inside agent definitions to force access.
- `ui-builder` and `test-engineer` must use Context7 MCP for library-specific implementation. `reviewer` uses it when a finding depends on library behavior.
- `browser-verifier` must use Playwright MCP for real browser interactions, snapshots, viewport changes, and console/network inspection. Checked-in Playwright tests and source review do not satisfy this separate requirement.
- The coordinator owns GitHub MCP operations. Implementation/test/review workers must not use GitHub MCP or take over the verifier's interactive browser.
- Handoffs must identify MCP tools actually called and observed results, not merely list configured servers. Missing/denied Playwright tools block browser verification; disclose Context7 fallback to official primary documentation.

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

Create GitHub Actions CI as part of the live application work, not during setup. CI must install locked dependencies and required browser binaries, then run the same validation command with minimal permissions. Trigger it only on `pull_request`, never on `push`; it must not modify or merge `main`.

For setup-only documentation/configuration changes, do not scaffold the application or install its dependencies. Validate configuration and cross-file consistency instead of inventing an application test suite.

## Secrets and safety

- Never store, commit, print, or paste tokens, credentials, `.env` contents, private keys, or credential-bearing MCP arguments.
- `.codex/` is ignored because the live local configuration may contain credentials. Track only credential-free templates under `demo-config/`; never force-add the local directory.
- Preserve unrelated local MCP, authentication, and approval settings. Do not change user-global Codex configuration for this demo.
- Inspect sensitive configuration structurally: report names and presence, never values.
- Before committing, verify `.codex/` is ignored and scan only intended changes for common secret patterns.
- Do not add AWS, deployment, hosting, or remote-environment configuration to this demo.

## Pull-request workflow

- During the live build, commit only intended application, test, CI, and documentation changes.
- Push without force and open a draft PR with scope and validation evidence.
- Check CI on the exact head SHA and report its observed state. A green remote run is not a prerequisite for the live handoff.
- During the live window, invoke `pr-review-loop` in `request-only` mode to request one Copilot review and hand off without polling. Resume its default single round after the demo if requested; do not create a duplicate request.
- Address every actionable finding or post a clear technical rationale; never ignore security findings.
- Pending remote feedback remains an explicit follow-up, not a completed review. After review fixes, run full validation and observe replacement CI before claiming the review work complete.
- Do not merge unless the user explicitly requests it.

## Completion handoff

Report the user-visible result, files changed, commands and checks run, MCP evidence, branch/commit/PR/CI state, local review findings, pending remote feedback, remaining risks, and secret/deployment safety. Distinguish passed, failed, pending, and not-run checks. For setup-only work, also report which fresh-session preflight checks remain.
