# Live build plan

## Goal

Create System Atlas, a polished, interactive 3D architecture and dependency explorer, from this intentionally empty application baseline; test it locally and in CI, then complete a bounded pull-request review loop.

## Success criteria

- [ ] A Vite, React, and TypeScript application exists at the repository root.
- [ ] Typed, deterministic sample data describes 8–10 architecture components and their directed dependencies.
- [ ] Search, category filtering, selection, focus, dependency details, and full reset work from accessible controls.
- [ ] The responsive 3D experience presents a polished dark-observatory System Atlas without hiding information behind motion or WebGL.
- [ ] Unit/component tests and Playwright browser tests cover meaningful behavior.
- [ ] One validation command covers code quality, tests, type checking, and build.
- [ ] GitHub Actions CI runs that validation command on the feature PR.
- [ ] A draft PR is open with green CI and recorded evidence.
- [ ] Two Copilot review rounds complete with every actionable finding addressed.

## Decisions

- Application dependencies are installed live from a cold npm cache.
- Context7 is consulted before library-specific implementation.
- The product uses checked-in sample data, fixed node positions, and no force-directed layout, editing, import, persistence, or backend.
- The live scope targets 20–30 minutes: the architecture explorer and its core interactions matter more than extra simulation features.
- `web-qa` handles recurring browser validation; `pr-review` handles the review loop.
- graphify is optional after code exists and is not a success gate.
- Deployment, hosting, AWS, and PR merging are out of scope.

## Implementation plan

Codex must replace this sentence with a bounded, ordered plan after inspecting the repository and current documentation, before creating application files.

## Progress and evidence

Not started. Record completed slices, validation results, PR state, and review outcomes here during the live build.
