# Live demo instruction

Paste the following into a fresh Codex session on clean, updated `main`:

```text
Follow AGENTS.md and use Plan.md as the live planning artifact.

Build a polished 3D SDLC Visualizer from this intentionally empty application baseline. First inspect the repository, GitHub authentication, available MCP tools, and current branch. Update Plan.md with a concise, slice-by-slice implementation plan, then create and switch to the feature branch demo/3d-sdlc-visualizer. Do not edit directly on main.

Use Context7 before choosing or implementing library-specific APIs. Create a Vite + React + TypeScript project at the repository root without deleting the existing instructions, prompts, MCP templates, or skills. Install current compatible versions of React, React Three Fiber, Three.js, Drei, Vitest, Testing Library, Playwright, and the minimal code-quality tooling needed for a single npm run validate command.

Create an interactive, entirely client-side visualization of the software-development loop: Plan, Code, Test, CI, and Review. Make the stages visually distinct in 3D and let the user select stages, advance/reset the loop, and simulate success and failure. Include accessible DOM controls and a readable status summary, deterministic state, responsive desktop/mobile layouts, reduced-motion behavior, loading/error handling, and intentional visual polish.

Add meaningful unit/component coverage for state and interactions plus Playwright coverage for the primary user journey. Create npm scripts for dev, build, test, test:e2e, and validate. Use the web-qa skill to inspect the running application at desktop and narrow viewports, exercise every control, check accessibility-relevant behavior and browser console errors, fix defects, and add regression coverage. Run npm run validate until it passes.

Create a minimal-permission GitHub Actions CI workflow that installs locked dependencies and runs npm run validate only for `pull_request` events. Do not add a `push` trigger, push commits to `main`, or let the workflow modify or merge `main`. Review the intended diff and secret safety, commit it, push only the feature branch, and open a draft PR with scope and validation evidence. Use GitHub MCP to watch CI on the exact head SHA.

After CI succeeds, use the pr-review skill for two rounds. Address every actionable finding with code or a posted technical rationale, never ignore security findings, rerun validation, push fixes, and wait for CI after each changed round.

graphify is optional after code exists: use it for architecture or impact analysis only if its local graph is available or the user explicitly requests generation. Do not let it block the demo.

Do not add deployment, hosting, AWS, or production integration. Do not merge the PR. Finish with the PR URL, head SHA, CI result, review-round summary, validation evidence, and remaining manual items.
```
