# WeekPlan

WeekPlan is a client-side weekly workload planner built during the Codex agentic SDLC webinar. It helps organize tasks across Monday through Friday, keep unscheduled work in a backlog, and compare scheduled effort with each day's capacity.

## Product behavior

- Add, edit, assign, complete, reopen, and delete tasks.
- Store effort and capacity as whole minutes.
- Show scheduled work, remaining work, available capacity, and overloads.
- Persist a validated, versioned plan in browser-local storage.
- Preserve unreadable saved data until the user retries or explicitly discards it.
- Load a deterministic example with an overloaded Wednesday.

No backend, accounts, calendar integration, 3D, deployment, or production services.

## Local development

Requires Node.js 22.12 or newer.

```bash
npm ci
npx playwright install chromium
npm run dev
```

Run the complete local validation pipeline with:

```bash
npm run validate
```

This checks formatting, linting, unit/component tests, Chromium browser tests, TypeScript, and the production build.

## Webinar material

The reusable agent setup and presenter runbook remain in `demo-config/`, `docs/`, and `DEMO_PROMPT.md`.
