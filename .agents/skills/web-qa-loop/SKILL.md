---
name: web-qa-loop
description: Inspect and validate a local web application in real browsers, exercise user-visible workflows across desktop and mobile viewports, diagnose console and accessibility problems, fix defects, add regression tests, and run the repository's validation command. Use after implementing or changing web UI behavior, or whenever browser-visible quality must be verified.
---

# Validate a web change

## Preflight

1. Inspect repository instructions, package-manager files, available scripts, and existing browser tests.
2. Preserve unrelated work and record the current diff.
3. Discover the development command and expected local URL. Reuse a healthy server; otherwise start one and remember to stop only the process created by this run.
4. Stop and report the gap if the application cannot start or Playwright MCP is unavailable.

## Browser QA

1. Open the application with Playwright MCP at a representative desktop viewport, then at approximately `390x844`.
2. Exercise every changed primary workflow through visible controls, including success, reset, empty/loading, and relevant failure behavior.
3. Inspect headings, labels, focusable controls, keyboard behavior, status announcements, responsive layout, and reduced-motion behavior.
4. Inspect browser console errors and warnings plus failed application requests. Treat unexplained errors as defects.
5. Capture concise evidence for material visual or interaction findings.

## Fix and regress

1. Fix confirmed defects with the smallest coherent change.
2. Add or update unit/component tests for deterministic logic and Playwright tests for user-visible regressions. Avoid assertions on incidental implementation details.
3. Run the smallest affected tests while iterating, then the repository-defined full validation command.
4. Repeat browser inspection for every corrected workflow and viewport.
5. Do not claim skipped, flaky, or unavailable checks passed.

## Result

Report workflows and viewports exercised, defects fixed, regression tests added, console/network state, full validation result, remaining limitations, and whether the server was stopped.
