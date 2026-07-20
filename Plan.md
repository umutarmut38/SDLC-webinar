# Live build plan

## Goal

Create a polished, interactive 3D SDLC Visualizer from this intentionally empty application baseline, test it locally and in CI, and complete a bounded pull-request review loop.

## Success criteria

- [x] A Vite, React, and TypeScript application exists at the repository root.
- [x] The 3D experience communicates Plan, Code, Test, CI, and Review states.
- [x] User-visible interactions are accessible, responsive, and deterministic.
- [x] Unit/component tests and Playwright browser tests cover meaningful behavior.
- [x] One validation command covers code quality, tests, type checking, and build.
- [ ] GitHub Actions CI runs that validation command on the feature PR.
- [ ] A draft PR is open with green CI and recorded evidence.
- [ ] Two Copilot review rounds complete with every actionable finding addressed.

## Decisions

- Application dependencies are installed live from a cold npm cache.
- Context7 is consulted before library-specific implementation.
- `web-qa` handles recurring browser validation; `pr-review` handles the review loop.
- graphify is optional after code exists and is not a success gate.
- Deployment, hosting, AWS, and PR merging are out of scope.

## Implementation plan

1. **Foundation:** create the feature branch; use Context7 and package metadata to choose compatible Vite/React/Three/Test tooling; scaffold the locked client-only project and the single validation pipeline.
2. **Deterministic core:** model the five SDLC stages and success/failure/reset transitions as pure typed state, then cover the state machine with focused unit tests.
3. **Accessible experience:** build the responsive DOM shell, stage controls, live status summary, loading/error boundary, and reduced-motion behavior with component interaction coverage.
4. **3D scene:** render visually distinct Plan, Code, Test, CI, and Review nodes with React Three Fiber/Drei, selection/progress states, resilient WebGL fallback, and intentional lighting/camera polish.
5. **Browser contract:** add Playwright coverage for the primary success, failure, selection, reset, keyboard, mobile, and reduced-motion journeys.
6. **Quality and CI:** run `web-qa` at desktop and `390x844`, fix console/accessibility/responsive defects, make `npm run validate` green, and add pull-request-only least-privilege CI.
7. **Delivery and review:** audit the intended diff and secret safety, commit and push only `demo/3d-sdlc-visualizer`, open a draft PR, wait for exact-SHA CI, and complete two bounded `pr-review` rounds without merging.

## Progress and evidence

- Preflight complete: clean `main`; baseline instructions preserved; no local graphify graph; Context7, Playwright, and GitHub MCP available.
- GitHub MCP authenticated as `umutarmut38`; local `gh` credentials are invalid, so GitHub MCP is the authoritative metadata/review path and SSH/git remains to be verified for branch push.
- Foundation uses React 19.2, Vite 8.1, R3F 9.6, Drei 10.7, Three 0.182, Vitest 4.1, and Playwright 1.61. TypeScript is pinned to 6.0.2 because the current `typescript-eslint` peer range does not yet support TypeScript 7; Three 0.182 is the newest line before `Clock` was deprecated in r183, while current R3F still instantiates that API.
- Slices 1–5 complete: deterministic reducer; accessible UI and status; lazy 3D scene with five distinct gates; renderer loading/error states; 8 passing unit/component tests; 4 passing desktop/mobile Playwright journeys.
- `web-qa` complete at 1440px and 390×844: exercised selection, advance, success, failure/recovery, completion, reset, skip-link focus, keyboard activation, and reduced motion. Fixed explicit control names, a missing favicon, dependency warnings, and narrow-camera clipping. Final browser console has 0 errors/0 warnings and no failed application requests; the owned server was stopped.
- Pull-request-only CI is defined with read-only contents permission, locked installation, Chromium setup, and the repository `npm run validate` command. Delivery and review evidence remain pending.
- Final local `npm run validate` passed: Prettier, ESLint, 8 Vitest tests, 4 serial Playwright journeys, TypeScript, and Vite production build. Serial browser workers avoid a Vite dev-transform race observed only under four concurrent WebGL page loads.
