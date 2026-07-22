# Live demo instruction

Paste the following into a fresh Codex session on clean, updated `main`:

```text
Follow AGENTS.md.

Build System Atlas, a polished 3D architecture and dependency explorer, from this intentionally empty application baseline. First inspect the repository, GitHub authentication, available MCP tools, and current branch. Before modifying files, present a concise, slice-by-slice implementation plan in the session and keep it updated as work progresses. Then create and switch to the feature branch demo/system-atlas. Do not edit directly on main.

Use Context7 before choosing or implementing library-specific APIs. Create a Vite + React + TypeScript project at the repository root without deleting the existing instructions, prompts, MCP templates, or skills. Install current compatible versions of React, React Three Fiber, Three.js, Drei, Vitest, Testing Library, Playwright, and the minimal code-quality tooling needed for a single npm run validate command.

Create an entirely client-side sample architecture with 8–10 typed nodes and directed dependencies. Each node must have an id, name, category, summary, health status, and fixed 3D position; each dependency must have a source, target, and relationship label. Represent frontend, API/service, auth, data, and observability components across healthy, warning, and critical states. Keep the data deterministic and checked into the application—do not add editing, JSON import, persistence, a backend, or force-directed physics.

Style the experience as a refined dark observatory: luminous category-colored nodes, depth fog, a restrained star field, and animated signals flowing along dependencies. Let users search components by name, filter by category, select a component from either the canvas or an accessible DOM list, focus it, and inspect its status, dependencies, and dependents in a detail panel. Clearly highlight inbound and outbound relationships. Provide one reset action that restores search, filter, selection, and camera state. Reduced-motion mode must retain the same information without relying on animation. Include responsive desktop/mobile layouts, loading and error handling, readable status summaries, keyboard-operable DOM controls, and intentional visual polish.

Add meaningful unit/component coverage for search, category filtering, selection, dependency lookup, reset behavior, and sample-data integrity. Add Playwright coverage for initial load, searching and selecting a component, filtering, reading dependency details, resetting, a narrow viewport, and browser console errors. Create npm scripts for dev, build, test, test:e2e, and validate. Use the web-qa-loop skill to inspect the running application at desktop and narrow viewports, exercise every control, check accessibility-relevant behavior and browser console errors, fix defects, and add regression coverage. Run npm run validate until it passes.

Create a minimal-permission GitHub Actions CI workflow that installs locked dependencies and runs npm run validate only for `pull_request` events. Do not add a `push` trigger, push commits to `main`, or let the workflow modify or merge `main`. Review the intended diff and secret safety, commit it, push only the feature branch, and open a draft PR with scope and validation evidence. Use GitHub MCP to watch CI on the exact head SHA.

After CI succeeds, use the pr-review-loop skill for two rounds. Address every actionable finding with code or a posted technical rationale, never ignore security findings, rerun validation, push fixes, and wait for CI after each changed round.

graphify is optional after code exists: use it for architecture or impact analysis only if its local graph is available or the user explicitly requests generation. Do not let it block the demo.

Do not add deployment, hosting, AWS, or production integration. Do not merge the PR. Finish with the PR URL, head SHA, CI result, review-round summary, validation evidence, and remaining manual items.
```
