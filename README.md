# SDLC Loop Visualizer

An interactive, entirely client-side 3D map of the software delivery loop: Plan, Code, Test, CI, and Review. Each stage can be inspected independently while a deterministic simulation advances, fails, recovers, completes, and resets the active cycle.

The WebGL scene is paired with accessible DOM controls and live status, responsive desktop/mobile layouts, reduced-motion behavior, and a resilient renderer fallback.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npx playwright install chromium
npm run dev
```

## Validation

```bash
npm run validate
```

The validation command checks formatting and linting, runs Vitest unit/component coverage, exercises the primary journey in desktop and mobile Chromium with Playwright, type-checks the project, and creates the production build. Pull requests run the same locked command in GitHub Actions.

Durable webinar instructions remain in `AGENTS.md`, the live implementation record is in `Plan.md`, and the presenter prompt remains in `DEMO_PROMPT.md`. This project deliberately contains no deployment, hosting, cloud, or production integration.
