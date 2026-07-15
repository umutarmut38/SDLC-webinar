# Codex agentic SDLC webinar plan

## Objective

Demonstrate Codex orchestrating a complete, reviewable software-delivery lifecycle for a moderately complex 3D Cloud Deployment Visualizer:

1. inspect and plan;
2. use current documentation;
3. implement a client-side 3D feature;
4. validate locally in code and a browser;
5. push a feature branch and open a PR;
6. request and address Copilot review;
7. deploy only after explicit authorization through `/deploy`;
8. wait for GitHub Actions, validate the remote app, and report the result on the PR.

This is a living plan. Check an item only after its evidence exists. Add dated notes to the decision/progress log instead of silently changing historical facts.

## Current state — 2026-07-15

- [x] Vite, React, TypeScript, React Three Fiber, Three.js, and Drei scaffold exists.
- [x] Placeholder UI preserves the future visualizer test contract.
- [x] Vitest and Playwright test layers exist.
- [x] `npm run validate` covers formatting, linting, unit tests, E2E tests, type checking, and build.
- [x] Pull-request CI exists and passes on the environment-preparation branch.
- [x] Trusted `/deploy` comment workflow exists.
- [x] Dedicated demo S3, CloudFront, GitHub OIDC role, repository variables, and `demo` environment are configured.
- [x] Context7, Playwright, OpenAI developer docs, AWS MCP, and graphify configurations are project-local.
- [x] AWS MCP documentation search completed successfully.
- [x] AWS profile `NTT` exists, targets `eu-central-1`, and passes a read-only identity check.
- [x] Reusable `feature-build`, `pr-review`, `deploy`, and `demo-dry-run` skills exist.
- [x] Environment-preparation draft PR is open: <https://github.com/umutarmut38/SDLC-webinar/pull/1>.
- [ ] Rotate the Context7 token that appeared in prior terminal output, then update only the ignored local configuration.
- [ ] Reconcile remaining stale “AWS Knowledge” and raw `codex mcp list` references in supporting runbook/skill documentation.
- [ ] Merge environment-preparation PR #1 to `main` after human review; never merge automatically.
- [ ] Verify one actual GitHub Copilot PR review or prepare the documented manual fallback.
- [ ] Decide whether to generate graphify output or deliberately use the Mermaid fallback.
- [ ] Complete a final `demo-dry-run` after the preparation PR is merged.

No application deployment has been executed from this plan.

## Non-negotiable gates

| Gate                          | Required evidence                                                        | If missing                                        |
| ----------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------- |
| Secret safety                 | Intended tracked diff contains no credentials; `.codex/` remains ignored | Stop, remove exposure, rotate if necessary        |
| Preparation on default branch | CI and `/deploy` workflows exist on `main`                               | Do not begin the deployable live PR               |
| Local quality                 | `npm run validate` passes                                                | Fix or reduce scope; do not push as ready         |
| Browser behavior              | Playwright MCP inspection and checked-in E2E tests pass                  | Diagnose before PR-ready claim                    |
| Current library guidance      | Context7 or official primary docs consulted                              | Do not guess library APIs                         |
| Review                        | Requested rounds completed or manual limitation recorded                 | Do not claim review complete                      |
| Deployment authorization      | Explicit present-tense approval for active PR and `demo`                 | Stop before posting `/deploy`                     |
| AWS authentication            | GitHub OIDC and `demo` environment configured                            | Never fall back to long-lived credentials         |
| Remote quality                | Workflow validation plus independent remote Playwright pass              | Report failure; do not call deployment successful |

## Phase 0 — finalize environment preparation

- [ ] Review the full environment-preparation PR diff.
- [ ] Confirm CI is green at the current head SHA.
- [ ] Rotate the previously exposed Context7 token.
- [ ] Run `./scripts/check-demo-environment.sh` and retain all warnings.
- [ ] Run `npm run validate`.
- [ ] Confirm demo MCP names are absent from user-global Codex configuration.
- [ ] Confirm the AWS MCP remains project-local, pinned, Frankfurt-based, profile `NTT`, and `--read-only`.
- [ ] Update stale supporting docs and the dry-run skill to use `aws_mcp` and redacted MCP checks.
- [ ] Confirm the AWS bucket, distribution, and role are dedicated to the demo.
- [ ] Confirm repository variables by name only.
- [ ] Human-review and explicitly merge PR #1.
- [ ] Pull updated `main` and confirm the two workflows are present on the default branch.

Exit criterion: updated `main` passes validation and contains the preparation workflows, documentation, skills, and sanitized MCP templates.

## Phase 1 — final rehearsal without deployment

- [ ] Start a fresh Codex session so project-local MCP changes are loaded.
- [ ] Run the `demo-dry-run` skill.
- [ ] Make one harmless Context7 documentation call.
- [ ] Use Playwright MCP against the local placeholder.
- [ ] Make one AWS MCP documentation-search call; do not call AWS service APIs.
- [ ] If graphify output exists, run a harmless graph query. Otherwise explicitly select `docs/architecture.md` as the fallback.
- [ ] Verify GitHub CLI authentication and the intended repository.
- [ ] Confirm the prepared feature branch name is unused or choose a deterministic alternative.
- [ ] Confirm the presenter knows the stop/recovery points in `docs/live-demo-runbook.md`.
- [ ] Do not request review, comment `/deploy`, or mutate AWS during rehearsal unless separately authorized.

Exit criterion: readiness is “ready” or “ready with explicitly accepted warnings,” with zero unexplained failures.

## Phase 2 — live feature build

Target branch: `demo/cloud-deployment-visualizer`.

Suggested implementation slices:

1. Scene foundation: Canvas, camera, lighting, environment, deterministic layout.
2. Deployment model: typed stages, statuses, transitions, and testable state.
3. 3D pipeline: nodes, connections, labels, active-stage emphasis.
4. Interaction: stage controls, selection, advance/reset/failure simulation.
5. Operational storytelling: commit, CI, build, S3, CloudFront, validation, result.
6. Polish: responsive composition, accessible DOM summary, reduced motion, error/loading states.

For every slice:

- [ ] Inspect and state the bounded plan.
- [ ] Use Context7 before library-specific implementation.
- [ ] Implement only one coherent slice.
- [ ] Add or update Vitest coverage.
- [ ] Add or update Playwright coverage.
- [ ] Inspect the app with Playwright MCP at desktop and narrow viewport sizes.
- [ ] Check interactions and browser console errors.
- [ ] Run the smallest relevant tests.
- [ ] Keep the diff free of workflow and infrastructure changes.

### Live build launch instruction

Fire this from a fresh Codex session on updated `main`:

```text
Use the feature-build skill and follow AGENTS.md and Plan.md.

Start the live implementation of the 3D Cloud Deployment Visualizer. Inspect the repository and readiness state first. If the preparation workflows are not on main, stop and report that blocker. Otherwise create the feature branch demo/cloud-deployment-visualizer and state a concise slice-by-slice plan before editing.

Build a polished, moderately complex, entirely client-side visualization with React, TypeScript, React Three Fiber, Three.js, and Drei. Visualize a deployment progressing through source commit, CI validation, artifact build, S3 upload, CloudFront invalidation, remote validation, and success/failure. Include accessible DOM controls, deterministic state, pending/active/success/failure presentation, responsive behavior, and reduced-motion support. Preserve the documented browser-test contracts.

Use Context7 before library-specific APIs. Use Playwright MCP to inspect desktop and narrow viewports, exercise every control, and check console errors. Use the read-only AWS MCP only for current AWS documentation and architecture guidance. If a graphify graph exists, use it for impact analysis and update it after code changes; otherwise use the Mermaid fallback.

Add meaningful Vitest and Playwright tests, run npm run validate, and fix all failures. Review the diff for scope, accessibility, performance, secrets, and accidental infrastructure changes. Commit and push the feature branch, open a draft PR, and wait for CI. Then use the pr-review skill for two rounds, addressing every actionable finding and never ignoring security findings.

Do not merge and do not deploy. Stop with the PR URL, commit SHA, CI result, review result, validation evidence, and whether the PR is ready for separately authorized deployment.
```

## Phase 3 — PR creation and CI

- [ ] Confirm `npm run validate` passes immediately before commit.
- [ ] Review `git diff --check`, the intended file list, and secret scan results.
- [ ] Commit only application/test/documentation changes needed for the feature.
- [ ] Push the feature branch without force.
- [ ] Open a draft PR containing scope, screenshots/evidence, test results, risks, and a deployment checklist.
- [ ] Confirm CI is running for the exact PR head SHA.
- [ ] Wait for CI and record its conclusion.
- [ ] Keep the PR unmerged.

Exit criterion: open same-repository draft PR, clean local worktree, green CI, and exact head SHA recorded.

## Phase 4 — review loop

- [ ] Invoke the `pr-review` skill with two rounds unless the presenter chooses another positive count.
- [ ] Confirm whether `@copilot` is actually accepted for this repository/account.
- [ ] Wait for a new review each round; do not reuse an old review as evidence.
- [ ] Collect unresolved thread-level findings.
- [ ] Address findings with code or a posted technical rationale.
- [ ] Treat security findings as blocking.
- [ ] Validate, commit, push, and wait for CI after fixes.
- [ ] Record findings addressed, intentionally not addressed, and remaining manual items.

Exit criterion: requested review rounds completed or a clearly documented manual-review limitation, with no unresolved security findings and green validation/CI.

## Phase 5 — deployment approval checkpoint

Before deployment, report:

- active PR URL and number;
- current head SHA;
- CI and review status;
- target GitHub environment (`demo`);
- configured demo URL;
- confirmation that no merge will occur;
- any warnings or manual approvals still required.

Then stop. Do not infer approval from earlier preparation or from the PR being ready.

### Deployment authorization instruction

The presenter may fire this only when a real demo deployment is intended:

```text
Deployment of the active pull request to the dedicated demo environment is explicitly approved now.

Use the deploy skill. Re-run preflight and local validation, post exactly one /deploy comment on the active same-repository PR, watch the matching GitHub Actions run to completion, verify the deployed SHA, read the workflow result comment, and run independent remote Playwright validation against the returned URL.

If deployment fails, inspect only the failed workflow logs and summarize the root cause without exposing sensitive values. Do not deploy from the workstation, bypass OIDC, target production, merge the PR, or silently retry with different credentials.
```

## Phase 6 — deployment and remote validation

- [ ] Confirm explicit deployment authorization exists in the current conversation.
- [ ] Read the `deploy` skill completely.
- [ ] Confirm the active PR, branch, repository ownership, and exact head SHA.
- [ ] Confirm `/deploy` workflow exists on default branch.
- [ ] Confirm required repository variable names and `demo` environment.
- [ ] Run `npm run validate`.
- [ ] Post exactly one `/deploy` comment.
- [ ] Identify and watch the matching `issue_comment` workflow run.
- [ ] Confirm OIDC authentication, S3 sync, optional CloudFront invalidation, and workflow remote validation outcomes.
- [ ] Confirm the PR result comment reports URL, SHA, status, and workflow link.
- [ ] Confirm deployed SHA equals the authorized PR head.
- [ ] Run independent `npm run test:remote -- --base-url <url>`.
- [ ] Report the PR URL, workflow URL, deployed URL, SHA, and both validation results.
- [ ] Do not merge.

Exit criterion: workflow success and independent remote Playwright success for the authorized SHA, or an honest failed-deployment report with root cause.

## Recovery paths

### Build takes too long

- Stop at the last passing commit.
- Reduce scope to a deterministic scene with four to seven nodes, fixed connections, stage selection, and status controls.
- Preserve accessible controls and automated test contracts.
- Move optional animation/polish into PR follow-ups.

### Local validation fails

- Run the smallest failing layer first.
- Use Playwright artifacts and MCP inspection for browser failures.
- Preserve deterministic DOM behavior if WebGL is flaky.
- Never claim skipped or failing validation passed.

### Copilot review is unavailable

- Record that programmatic Copilot review is unverified.
- Use the PR Reviewers UI as the manual trigger if available.
- Continue with human comments/review threads without fabricating Copilot evidence.

### AWS deployment fails

- Let the workflow report failure.
- Inspect the failed step only.
- Check variable names, OIDC trust, environment selection, bucket naming, and role scope.
- Fix through a reviewed commit and post a new `/deploy` only after renewed authorization if scope materially changed.
- Never deploy locally or use long-lived credentials.

### Manual presentation fallback

- Show the validated local app.
- Show the PR, CI, review evidence, and prepared workflow.
- Show the known dedicated demo URL only if clearly labeled as a prior rehearsal deployment.
- Use `docs/architecture.md` when graphify is unavailable.

## Phase 7 — post-webinar cleanup

- [ ] Decide explicitly whether to merge, retain, or close the feature PR.
- [ ] Record the final deployed SHA and URL if deployment occurred.
- [ ] Follow `docs/aws-demo-setup.md` for demo-resource cleanup.
- [ ] Remove or disable GitHub variables and the `demo` environment when no longer needed.
- [ ] Remove generated reports, build output, and graphify output as appropriate.
- [ ] Confirm no credentials or `.env` files entered git history.
- [ ] Preserve reusable sanitized skills and documentation.

## Definition of webinar-ready

The environment is ready only when:

- preparation is merged to `main`;
- local validation and CI pass;
- redacted environment checks have zero failures;
- project-local Context7, Playwright, and AWS documentation calls are verified;
- graphify is verified or the Mermaid fallback is explicitly selected;
- GitHub auth, repository variables, OIDC trust, and `demo` environment are confirmed;
- the exposed Context7 token has been rotated;
- Copilot review has a verified trigger or a rehearsed manual fallback;
- deployment requires and visibly waits for explicit authorization;
- recovery and cleanup paths have an owner.

## Decision and progress log

| Date       | Decision/evidence                                                                        | Status           |
| ---------- | ---------------------------------------------------------------------------------------- | ---------------- |
| 2026-07-15 | Keep the checked-in application as a placeholder until the live feature-build phase      | Accepted         |
| 2026-07-15 | Keep all demo MCPs project-local; preserve only unrelated user-global MCPs               | Implemented      |
| 2026-07-15 | Use managed AWS MCP through `NTT`, Frankfurt, and `--read-only`                          | Implemented      |
| 2026-07-15 | AWS MCP documentation handshake succeeded; generic AWS API calls remain disabled locally | Verified         |
| 2026-07-15 | Deploy only through the protected `demo` GitHub environment and `/deploy`                | Enforced         |
| 2026-07-15 | Require separate present-tense deployment authorization                                  | Enforced         |
| 2026-07-15 | Context7 token exposed in prior terminal output must be rotated                          | Open             |
| 2026-07-15 | graphify extraction is optional; Mermaid architecture is the fallback                    | Pending decision |
