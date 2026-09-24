---
name: web-qa-loop
description: Inspect a local web application in real browsers across desktop and mobile viewports. Use inspect-only mode for a read-only verifier, or one bounded repair/recheck cycle with regression tests and repository validation after UI changes.
---

# Validate a web change

## Modes and budget

- `inspect-only`: perform one browser pass and return evidence. Do not edit source, add tests, run full validation, or start/stop a server owned by the coordinator.
- `repair` (default): perform one initial pass, one coordinated repair phase, and targeted rechecks of the corrected workflows. Run full validation afterward.
- Respect the caller's remaining budget. Do not start repeated polish/repair cycles; report outstanding blockers rather than manufacturing a pass.

## Preflight

1. Inspect repository instructions, package-manager files, available scripts, and existing browser tests.
2. Preserve unrelated work and record the current diff.
3. Discover the development command and expected local URL. Reuse a healthy server. In `inspect-only`, ask the coordinator to start it if necessary; in `repair`, start one only if needed and remember its process ID for cleanup.
4. Discover Playwright MCP tools in the session performing the inspection, including when it is a subagent. Stop and report browser verification as blocked if the application cannot start or the required tools are unavailable/denied. Do not change permissions or private configuration to force access.
5. Agree on one owner of the interactive browser and freeze source edits during inspection. Use an isolated browser context and deterministic demo data; do not clear an unrelated saved plan.

## Browser QA

1. Open the application with Playwright MCP at a representative desktop viewport, then at approximately `390x844`.
2. Exercise every changed primary workflow through visible controls, including success, empty/error states, persistence/reload, and confirmation before destructive replacement where applicable.
3. Inspect headings, labels, focusable controls, keyboard behavior, status announcements, responsive layout, and reduced-motion behavior.
4. Inspect browser console errors and warnings plus failed application requests. Treat unexplained errors as defects.
5. Capture concise evidence for material visual or interaction findings.

Perform this pass with actual Playwright MCP calls, using the tool names exposed by the client. Source inspection, screenshots alone, HTTP probes, shell-driven browser automation, and passing checked-in Playwright tests are not substitutes for MCP verification.

## Fix and regress

In `inspect-only`, skip this section and return findings to the coordinator. A read-only verifier must not independently edit the same source files as a worker.

1. Fix confirmed defects with the smallest coherent change.
2. Add or update unit/component tests for deterministic logic and Playwright tests for user-visible regressions. Avoid assertions on incidental implementation details.
3. Run the smallest affected tests while iterating, then the repository-defined full validation command.
4. Recheck each corrected workflow and affected viewport once. If blockers remain, stop and hand them off explicitly instead of starting another repair loop.
5. Do not claim skipped, flaky, or unavailable checks passed.

## Cleanup

In `repair` mode, stop only the server process started by this run unless the caller requested that it remain available. Never stop a reused or coordinator-owned server. Close only browser tabs owned by this inspection.

## Result

Report the mode, URL, workflows and viewports exercised, MCP tool names actually called and observed outcomes, expected/actual behavior and reproduction for defects, fixes/regressions if performed, console/network state, full validation result (or not run in inspect-only), remaining limitations, and server ownership/cleanup state. Never imply inspection alone constitutes full validation or report configured tools as successful calls.
