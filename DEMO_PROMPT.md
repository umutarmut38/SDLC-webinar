# Live demo instruction

Paste the following into a fresh Codex session on the clean, prepared baseline after completing [preflight](docs/live-demo-runbook.md). Use `main` after the setup changes have landed, or an explicitly agreed clean setup branch. Do not start from the old baseline without the new agent definitions.

```text
Follow AGENTS.md.

Build WeekPlan, a practical weekly workload planner, from this intentionally empty application baseline. Target roughly 30 minutes: about 20 minutes to build, validate locally, and open a draft PR, then about 10 minutes to observe green CI and run up to two GitHub Copilot review/fix rounds live. A review request alone is not completion.

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

LIVE CI AND GITHUB COPILOT REVIEW
Create a GitHub Actions workflow with read-only contents permission, locked dependency installation, Chromium installation, and npm run validate. Use pull_request events only, not push. The workflow must not modify or merge main.

After local validation passes, inspect the intended diff and secret safety, commit only intended files, push the feature branch without force, and open a draft PR with scope and validation evidence. The coordinator must use the pr-review-loop skill in review-and-fix mode for up to two rounds, with one shared ten-minute budget capped by the remaining live session time. Do not select request-only mode or stop merely because the PR was opened.

First wait for the repository validation CI run associated with the exact PR head SHA to complete successfully. Missing, queued, cancelled, skipped, or failed checks are not green. If CI fails, inspect logs, fix the cause, run full local validation, push only intended fixes, and observe replacement CI within the same budget.

Once CI is green, explicitly request GitHub Copilot to review the PR on GitHub. Record request evidence and reviewed head SHA; reuse an equivalent pending request rather than duplicating it. Wait for the actual completed review, read its summary and all actionable threads/comments, and show a concise finding-to-fix summary. Do not substitute the local Sol review for this remote review.

Fix actionable findings with regression tests, or post a concrete technical rationale for findings that do not require a code change. Never ignore security findings or resolve unfinished work. After code changes, recheck affected browser behavior with Playwright MCP when applicable, run npm run validate, commit/push the fixes, and wait for CI on the new head SHA. Reply to the review threads with fix references or rationale.

If the first round changed code and enough budget remains, request a second Copilot review of the updated head, wait for its result, and handle findings with the same validation/push/CI process. Stop early after a completed review with no actionable findings; do not manufacture changes just to show another round. Never start a third round. If the last round introduces fixes, report which SHA was reviewed and which final SHA passed CI; do not claim the new SHA was re-reviewed unless it actually was.

Use one shared deadline across initial CI, review waits, fixes, local validation, pushes, replacement CI, and any second round. Poll no more often than every 30 seconds and wait at most five minutes for any individual CI/review result, always bounded by the remaining total budget. At a deadline or service blocker, stop starting new work and report exactly what is pending, failed, unavailable, or unvalidated; preserve local changes and do not push unvalidated fixes. Pending remote work means the full live goal was not met, not that review completed successfully.

Budget: 0-3 min plan/scaffold/contracts; 3-12 min parallel build/tests; 12-17 min local browser inspection/review and repairs; 17-20 min full validation and draft PR; 20-30 min initial CI plus up to two remote Copilot review/fix rounds and evidence. Cut optional polish first to protect the remote-review window. Timing is a rehearsal target, not a guarantee about GitHub queues.

No backend, accounts, collaboration, calendar integration, recurring tasks, AI scheduling, 3D, deployment, hosting, or production integration. Do not generate a graph or make graphify a completion gate. Do not merge. Finish with the app result, local validation and MCP evidence, branch/head SHA/PR URL, CI run links/results for the final head, completed remote review count and reviewed SHAs, findings/fixes/rationales, and any remaining follow-up.
```
