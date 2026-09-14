# Live demo instruction

Paste the following into a fresh Codex session on the clean, prepared baseline after completing [preflight](docs/live-demo-runbook.md). Use `main` after the setup changes have landed, or an explicitly agreed clean setup branch. Do not start from the old baseline without the new agent definitions.

```text
Follow AGENTS.md.

Build WeekPlan, a practical weekly workload planner, from this intentionally empty application baseline. Target roughly 30 minutes for a working app, passing local validation, and an open draft PR. Remote CI and Copilot review may finish afterward.

START AND DELEGATE
Inspect the repository, current branch, available MCP tools, and GitHub authentication without printing private configuration. Confirm the four custom agents are available. Present a short timed plan, then create and switch to demo/weekplan. If that branch already exists, choose a fresh suffix rather than resetting it. Never build on main.

Use Context7 before library-specific APIs and prefer the compatible versions verified in rehearsal. Scaffold Vite + React + TypeScript without deleting repository instructions, templates, or skills. Add Vitest, Testing Library, Playwright, and minimal formatting/lint tooling; no 3D dependencies or UI framework is required.

As coordinator, establish the task/state types, exported domain/storage interfaces, accessible UI contract, and file ownership first. Own domain/storage implementation, shared configuration, manifests, lockfile, integration, CI, and Git. Delegate UI files to ui-builder (GPT Luna) and test files to test-engineer (GPT Luna) in parallel. Do not edit each other's files or let agents change dependencies independently. Keep at most two subagent threads open, close them when finished, and do not delegate recursively.

Include MCP responsibilities in each delegation: ui-builder and test-engineer must use Context7 MCP to resolve libraries and query version-specific documentation; reviewer uses it to verify library-dependent findings. browser-verifier must use actual Playwright MCP tools, not just the checked-in Playwright suite. The coordinator alone owns GitHub MCP operations. Each agent must verify its own relevant tool access and report tool calls/results; inherited configuration is not proof of access. Do not copy credentials into agent files or change permissions. Disclose official-documentation fallback if Context7 is unavailable; unavailable Playwright MCP blocks browser verification.

PRODUCT CONTRACT
Show one reusable Monday-Friday workweek plus an unscheduled backlog; no calendar dates or week history.
- Add, edit, delete, complete, and reopen tasks. A task has a stable unique ID, nonblank title, positive estimated effort, optional assigned weekday, and completion state.
- Enter effort in minutes and store it as integer minutes. Reject blank titles, non-finite/fractional estimates, and non-positive estimates with inline messages.
- Move a task to another day or the backlog using labeled native controls. Do not implement drag-and-drop.
- Each weekday has editable capacity, initially 360 minutes (6 hours). Accept whole minutes from 0 through 1440; zero represents an unavailable day.
- Show each day's scheduled effort, remaining effort, capacity, and over-capacity amount. Scheduled effort includes completed tasks; remaining effort excludes them. Over-capacity is max(0, scheduled effort - capacity). Backlog tasks do not consume any day's capacity.
- Persist tasks and capacities locally in the browser with a versioned, validated payload. Restore state on reload; do not store redundant totals. A missing saved plan is an ordinary empty state. For malformed/unsupported data or unavailable/full storage, show a clear warning, preserve existing saved data, and do not claim changes were saved. Offer an explicit recovery action rather than silently overwriting unreadable data.
- Start empty and offer "Load example week". Confirm replacement when a plan already contains user changes. Use deterministic sample data: Wednesday has 480 scheduled minutes against 360 capacity, including a 120-minute task that can move to an otherwise empty Thursday.

Use a clean, readable weekly layout: day panels and backlog on desktop, stacked sections on mobile. Keep forms, edit/cancel actions, workload summaries, empty states, and keyboard focus usable. Errors and overload warnings must use text, not color alone. No essential animation; respect reduced motion if transitions are added. Explain that data is saved only in this browser.

ACCEPTANCE JOURNEY
Load the example week. Wednesday shows 8h scheduled / 6h capacity and 2h over capacity. Move the 2h task to Thursday: Wednesday now fits, Thursday shows 2h scheduled, and its remaining capacity is 4h. Complete that task: Thursday still has 2h scheduled but 0h remaining work. Reload: assignments, completion, and capacities persist. Also demonstrate adding/editing a task, returning it to the backlog, deleting it, and changing a day's capacity.

VALIDATE AND REVIEW
Test meaningful behavior: task lifecycle and input validation; scheduling/backlog; capacity boundaries; scheduled versus remaining totals; overload calculations; persistence and visible storage failure handling; safe sample replacement. Add a compact Chromium Playwright suite for the acceptance journey, a narrow viewport, keyboard-operable controls, and unexpected browser-console errors. Keep test data and storage isolated.

Create dev, build, test, test:e2e, and validate scripts. npm run validate must run formatting/lint checks, unit/component tests, browser tests, type checking, and the production build without watch mode.

Once the app runs and the two workers are closed, freeze source edits for one inspection phase. Delegate the web-qa-loop skill's inspect-only mode to browser-verifier (GPT Terra), using desktop and 390x844 viewports. Require Playwright MCP navigation, accessibility snapshots, visible-control interactions, viewport changes, and console/network inspection, with the actual tool names and observed outcomes in its report. Do not accept source inspection, screenshots alone, or passing automated tests as a substitute. In parallel, ask reviewer (GPT Sol) for one read-only pass over correctness and test gaps. Both return concise evidence; neither fixes files or launches extra reviewers.

Then perform one coordinated repair phase, add regression coverage, recheck corrected workflows, and run npm run validate. Use targeted checks while iterating. Do not weaken assertions, ignore security findings, or claim failed/unavailable checks passed. Cut optional styling first if time runs short; report an incomplete outcome if blockers remain.

HANDOFF
Create a GitHub Actions workflow with read-only contents permission, locked dependency installation, Chromium installation, and npm run validate. Use pull_request events only, not push. The workflow must not modify or merge main.

After local validation passes, inspect the intended diff and secret safety, commit only intended files, push the feature branch without force, and open a draft PR with scope and validation evidence. Use pr-review-loop in request-only mode to request one Copilot review; do not wait for it or start remote repair rounds during the live window. Observe CI/check state for the exact head SHA once and report pending states honestly. If GitHub is unavailable, preserve local work and state that the draft-PR milestone was not met.

Budget: 0-3 min plan/scaffold/contracts; 3-14 min parallel build/tests; 14-21 min inspection and repairs; 21-26 min full validation; 26-30 min draft PR and evidence. Do not trade correctness for the clock or extend into repeated polish/review loops.

No backend, accounts, collaboration, calendar integration, recurring tasks, AI scheduling, 3D, deployment, hosting, or production integration. Do not generate a graph or make graphify a completion gate. Do not merge. Finish with the app result, validation evidence, local findings and fixes, branch/head SHA/PR URL, observed CI and remote-review states, and remaining follow-up.
```
