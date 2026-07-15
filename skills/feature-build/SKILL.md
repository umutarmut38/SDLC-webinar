---
name: feature-build
description: Build a small, reviewable feature slice of the client-side 3D Cloud Deployment Visualizer with React, TypeScript, React Three Fiber or Three.js, current Context7 documentation, tests, and browser validation. Use during the live webinar feature implementation.
---

# Build a visualizer feature slice

1. Inspect the current app, tests, git status, and active branch. State a bounded plan before editing.
2. Use Context7 before implementing library-specific APIs. Resolve documentation for the installed versions of React, React Three Fiber, Drei, Three.js, Vite, Vitest, and Playwright as relevant. If Context7 is unavailable, report the setup gap and use official primary documentation rather than guessing.
3. Keep the app entirely client-side with React and TypeScript.
4. Use React Three Fiber/Three.js for the 3D scene. Preserve accessible DOM controls and a deterministic `visualization-root` contract for browser testing.
5. Implement one coherent slice at a time: scene foundation, deployment graph, interaction, or status animation. Avoid bundling unrelated polish.
6. Add or update Vitest tests for state/components and Playwright tests for user-visible behavior.
7. Start the app and use Playwright MCP to inspect the rendered result, exercise controls, check narrow and desktop viewports, and diagnose console errors.
8. Run `rtk npm run validate` and fix failures.
9. Review the diff for scope, accessibility, performance, and accidental infrastructure changes.
10. Summarize the feature, Context7 decisions, browser checks, tests, and remaining follow-ups.

Do not change workflows, AWS configuration, deployment infrastructure, or production resources. Do not store secrets or deploy from this skill.
