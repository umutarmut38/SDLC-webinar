# Repository operating instructions

## Mission

This repository supports a live webinar demonstrating Codex as an agentic SDLC orchestrator. It contains a safe, reviewable scaffold for a client-side 3D Cloud Deployment Visualizer and the automation needed to build, test, review, and deploy it through a pull request.

The checked-in placeholder is intentional. Do not build the final visualizer unless the user explicitly starts the feature-build phase. Keep preparation work separate from live feature work.

## Sources of truth

- `AGENTS.md` defines durable safety and working rules.
- `Plan.md` is the living execution plan. Read it at the start of substantial work and update its checkboxes only when supported by evidence.
- `docs/live-demo-runbook.md` contains presenter sequencing and recovery procedures.
- `docs/aws-demo-setup.md` and `docs/mcp-setup.md` own AWS and MCP setup details.
- Repo-local skills define bounded workflows. Read the relevant `SKILL.md` completely before using a skill.

If a supporting document conflicts with this file, follow this file and correct the stale document in the same reviewable change when it is in scope.

## Start every substantial task this way

1. Inspect `git status`, the current branch, relevant files, and `Plan.md`.
2. Preserve unrelated user changes and never assume a dirty file belongs to the current task.
3. Check whether an active PR already exists before creating another branch or PR.
4. State a concise, bounded plan before broad edits.
5. Identify actions that require explicit authorization before performing them.

Use `rg` or `rg --files` for search. Prefix every agent-run shell command with `rtk`; in a shell chain, prefix every segment.

## Change discipline

- Keep changes small, coherent, demonstrable, and easy to review live.
- Implement one feature slice at a time: scene foundation, deployment graph, interaction, status animation, then polish.
- Do not mix application features with CI, MCP, AWS, or deployment-infrastructure changes.
- Prefer existing project conventions and dependencies. Do not introduce a new framework or package manager without a concrete need.
- Use `apply_patch` for hand-edited files. Formatting tools may perform mechanical rewrites.
- Do not delete, reset, overwrite, or reformat unrelated work.

## Application contract

- Keep the application entirely client-side.
- Use React, TypeScript, React Three Fiber/Three.js, and Drei.
- Keep application state deterministic enough for unit and browser tests.
- Preserve accessible DOM controls even when the primary visualization is WebGL.
- Preserve the browser-test contracts for the main heading, `visualization-root`, canvas/visualization surface, and deployment-stage controls unless tests and documentation are intentionally updated together.
- Treat accessibility, responsive layout, reduced-motion behavior, loading states, and browser console errors as completion concerns.
- Do not change deployment infrastructure while implementing the visualizer.

## MCP policy

All demo MCP configuration must be project-local. Never add demo MCPs to the user-global Codex configuration. The live `.codex/` directory is git-excluded because it may contain credentials; the reviewable credential-free template is `demo-config/.codex/config.toml`.

Never print raw MCP configuration or `codex mcp list` output when a local MCP may contain secret command arguments. Use `./scripts/check-demo-environment.sh` for redacted configuration and scope checks.

### Context7

- Use Context7 before implementing or changing library-specific APIs.
- Resolve documentation for the installed versions where possible.
- If Context7 is unavailable, report the gap and use official primary documentation rather than guessing.

### Playwright

- Use Playwright MCP for interactive browser inspection of local and remote applications.
- Exercise user-visible controls, desktop and narrow viewports, accessibility-relevant behavior, and console errors.
- Keep the checked-in Playwright suite as the repeatable validation source; MCP inspection complements it.

### AWS

- The project-local `aws_mcp` uses the managed AWS MCP Server through profile `NTT` and the Frankfurt endpoint.
- It is intentionally configured with `--read-only`; the generic `call_aws` tool is unavailable in this safety mode.
- Use AWS MCP for current AWS documentation, skills, architecture, and deployment guidance.
- Use the local AWS CLI only for explicitly requested, read-only identity/configuration checks with `--profile NTT`.
- Never deploy, upload assets, invalidate CloudFront, or mutate AWS from a workstation.
- Actual deployment and AWS validation occur only in the approved GitHub Actions workflow using OIDC.

### graphify

- When `graphify-out/graph.json` exists, query graphify before broad codebase or impact analysis.
- Prefer `graphify query`, `graphify path`, and `graphify explain`; use the wiki index for broad navigation when present.
- After modifying code, run `graphify update .` when a graph has already been generated.
- Dirty generated graph files are expected and are not a reason to skip graphify.
- If no graph exists, use `docs/architecture.md` as the declared Mermaid fallback. Do not generate a graph or incur extraction/API usage without explicit approval.
- When the user types `/graphify`, read and follow the graphify skill before anything else.

## Secrets and sensitive output

- Never store, commit, echo, log, or paste secrets, tokens, AWS credential material, `.env` contents, or private keys.
- Treat `.codex/`, `.env*`, AWS configuration, credential helpers, command arguments, workflow logs, and MCP diagnostics as potentially sensitive.
- Inspect secret-bearing configuration structurally: report key names and presence, never values.
- Before committing, verify `.codex/` is ignored and scan only intended tracked changes for common secret patterns.
- If a secret appears in terminal or tool output, stop exposing it, report the incident, and recommend rotation. Never repeat the value.
- Do not add long-lived AWS credentials to GitHub. If OIDC is unavailable, stop and report the setup gap.

## Validation and evidence

Run the smallest relevant checks while iterating. Before claiming implementation completion, run:

```bash
rtk npm run validate
```

This must cover formatting, linting, Vitest, Playwright, type checking, and the production build. If sandboxing prevents Playwright from binding its local port, rerun with the required scoped permission; do not weaken the tests.

For a deployed build, also run:

```bash
rtk npm run test:remote -- --base-url <demo-url>
```

Never say a check passed unless it completed successfully. Report warnings, skipped checks, environment limitations, and the distinction between local validation, CI, workflow validation, and independent remote validation.

## Git and pull requests

- Use a feature branch for application work. Do not develop directly on `main`.
- The environment-preparation workflow must be merged to the default branch before relying on `/deploy`.
- Commit only intended files. Never force-push, rewrite shared history, or merge without explicit user instruction.
- Push or create/update a PR only when the user's request authorizes that external action.
- Prefer a draft PR until validation and review gates are satisfied.
- Keep the PR description current with scope, evidence, risks, screenshots where useful, and remaining manual steps.
- Wait for CI and report its actual conclusion.

## Review workflow

- Use the `pr-review` skill for bounded Copilot review rounds; default to two rounds.
- Do not claim GitHub Copilot review works until a request to `@copilot` produces an actual review in this repository/account.
- Collect thread-level findings when resolution state matters.
- Address every actionable finding or add a clear technical rationale.
- Never ignore security findings or mark a thread resolved without a code change or posted rationale.
- Validate, commit, push, and wait for CI after review fixes.

## Deployment authorization gate

Deployment is never implied by “finish,” “ready,” “run the demo,” a passing PR, or prior preparation permission. A real deployment requires explicit, present-tense user authorization for the active PR and the dedicated `demo` environment.

After authorization:

1. Read and use the `deploy` skill.
2. Confirm the active PR is open, same-repository, and points at the current branch/SHA.
3. Confirm the `/deploy` workflow exists on the default branch.
4. Run local validation.
5. Post exactly one `/deploy` comment.
6. Watch the matching workflow run to completion.
7. Confirm the deployed SHA, workflow result comment, URL, and remote validation.
8. Run independent remote Playwright validation.

Never merge as part of deployment. Never bypass OIDC, GitHub environment controls, trusted-comment checks, or the workflow by deploying locally.

## Deployed-asset cleanup authorization gate

Deleting deployed demo assets requires separate, explicit, present-tense authorization. Deployment approval does not authorize cleanup.

After authorization:

1. Confirm `destroy-demo.yml` exists on the default branch.
2. Confirm the protected `demo` environment and `AWS_ROLE_TO_ASSUME` are configured.
3. Confirm the re-entered bucket and distribution identifiers exactly match the configured demo resources.
4. Trigger the workflow with confirmation phrase `destroy-demo-assets` and watch it to completion.
5. Verify the bucket remains but has no current keys, CloudFront remains, and the demo URL no longer serves the application.
6. Confirm the IAM roles, OIDC provider, GitHub environments, and variables were retained.

Never delete the S3 bucket, CloudFront distribution, Origin Access Control, IAM roles, OIDC provider, GitHub environments, or variables as part of application cleanup. Never destroy from the workstation or use wildcard resource policies.

## Stop conditions

Stop and report the blocker if any of these occurs:

- a command or proposed change could expose a secret;
- the target appears to be production or is not clearly the dedicated demo environment;
- AWS OIDC, the demo environment, or required variables are missing;
- the active branch, PR, or SHA cannot be established reliably;
- validation or CI fails and cannot be repaired within scope;
- a security finding remains unresolved;
- a requested destructive, history-rewriting, merge, or deployment action lacks explicit authorization;
- library-specific implementation would require guessing because current documentation is unavailable.

## Completion handoff

End substantial work with:

- outcome and user-visible behavior;
- files changed;
- commands/checks run and their results;
- MCP evidence used;
- current branch, commit, PR, and CI status when relevant;
- deployment status and deployed URL only when a real deployment occurred;
- remaining manual configuration, risks, warnings, and recovery steps;
- explicit confirmation that no secrets were committed and whether any AWS mutation or deployment occurred.
