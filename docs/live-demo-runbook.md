# Live demo runbook

## Success boundary

Target roughly 30 minutes for a working WeekPlan app, passing local validation, and an open draft PR with green CI and at least one completed GitHub Copilot review whose actionable findings have been handled. Reserve about 20 minutes for the build/local checks/PR and 10 minutes for initial CI plus up to two live Copilot review/fix rounds. Stop early after a clean review; request the second review after code fixes when time permits. Never merge during the demo.

The ten-minute remote phase uses one deadline shared by CI, reviews, repairs, validation, and pushes, capped by the 30-minute session. This is a rehearsal target, not a promise about GitHub queue times. If remote work does not finish, explicitly report that the full live goal was not met. A request-only handoff is not the planned finish line.

## Pre-demo checklist

- [ ] The WeekPlan setup has landed on `main`, or an agreed clean setup branch will be the disclosed baseline. Do not switch to the old unprepared `main`.
- [ ] The baseline contains no application, package manifest, application tests, or CI workflow.
- [ ] Install the [local agent templates](../demo-config/README.md); the live `.codex/` configuration remains ignored.
- [ ] Codex trusts the project and a fresh session discovers all four custom agents and both repository skills.
- [ ] Luna, Terra, and Sol work for the intended account at medium effort. Verify two concurrent workers and no worker delegation.
- [ ] Node.js, npm, git, `gh`, and RTK are available. Resolve any RTK outdated-hook warning before rehearsal.
- [ ] `gh` and GitHub MCP authenticate as the intended account.
- [ ] Context7 completes a harmless library lookup.
- [ ] The pinned Playwright MCP starts and exposes browser tools; required browser binaries are already installed.
- [ ] The subagent MCP smoke test shows real Context7 calls from both Luna workers and Playwright calls from the Terra browser-verifier, not only parent-session probes.
- [ ] Copilot review remains enabled for this repository/account; missing access is disclosed rather than discovered at the last minute.
- [ ] During rehearsal, measure initial CI, Copilot review, fix validation, and replacement CI duration. Confirm review and re-review can be requested on the draft PR; a model/tool smoke test does not prove this.
- [ ] Tool/package caches are warmed and internet access is available. A cold install is not a demo requirement.
- [ ] No deployment, hosting, cloud credentials, or production integration is configured.

## Exact preflight commands

Run from the repository root:

```bash
rtk node --version
rtk npm --version
rtk --version
rtk proxy codex --version
rtk proxy codex doctor --summary --ascii --no-color
rtk git status --short --branch
rtk gh api user --hostname github.com --jq .login
rtk gh pr list --state open
rtk git check-ignore .codex/config.toml .codex/agents
rtk rg --files --hidden -g '!.git/**' -g '!.codex/**' -g '!node_modules/**'
```

Then make the harmless MCP calls described in [MCP setup](mcp-setup.md). Do not print raw private configuration or create application files during preflight.

### Agent smoke prompt

Run in a fresh Codex session, not the live build session:

```text
This is a configuration smoke test, not application implementation. Do not
modify files, inspect private configuration, install packages, or access GitHub.
Spawn ui-builder and test-engineer together with a no-tools task: each returns
its role name and the file ownership specified in its instructions. Wait for
both, then close them. Next do the same for browser-verifier and reviewer.
Do not exceed two open subagents or delegate recursively. Report which roles
actually started and any model/access errors; do not substitute another model.
```

Observe the actual agent threads/model metadata; self-reported model names are not proof of routing. Use `/agent` in Codex CLI or the IDE's subagent thread view. Confirm the effective coordinator is Terra at medium effort. The smoke test incurs small model usage; catalog/config checks alone do not prove execution.

### Subagent MCP smoke prompt

After model access succeeds, run this separate tool-access check before rehearsal. It does not require application code:

```text
This is an MCP access smoke test, not application implementation. Do not edit
files, install packages, read private configuration, or change permissions.
Spawn ui-builder and test-engineer together. Each must use its own Context7 MCP
tools to resolve a public library and query its documentation: React labeled
form inputs for ui-builder, and Playwright accessible-role locators for
test-engineer. Return actual tool names, the library ID, and a short result.
Wait for both and close them.

Then spawn browser-verifier with this preflight-only task: use Playwright MCP
to create its own tab at about:blank in the isolated browser, take an
accessibility snapshot, resize to 390x844, inspect console messages and network
requests, and close only that tab. Do not inspect an app or start a server.
Return actual tool names and outcomes. Stop and report missing/denied tools;
do not substitute shell automation, screenshots, or test-runner output.
Wait for it and close it. Do not exceed two open subagents or nest delegation.
The coordinator should use GitHub MCP only to check the authenticated user;
do not create or modify a PR. Do not expose credentials.
```

Inspect the child tool-call records rather than accepting an unsupported "MCP available" summary. An empty snapshot/console/network result on `about:blank` is expected; it proves tool access only, not application correctness. Any required tool failure remains a preflight blocker.

### Rehearse without changing the baseline

1. Start from the prepared clean baseline and let the live prompt create a separate rehearsal feature branch (replace `demo/weekplan` with `rehearsal/weekplan` in that run). If using a separate worktree, install the local agent/MCP setup there too; ignored `.codex/` files are not carried into a new worktree automatically.
2. Record Node, package, browser, and MCP versions, actual elapsed time, and any blockers in presenter notes outside the baseline. Keep the rehearsal branch and its lockfile as reproducibility evidence.
3. Warm npm/tool caches and browser binaries. Playwright MCP `0.0.80` and Playwright test runner `1.63.0` were available during setup; confirm compatible browser installation in rehearsal rather than assuming their browser revisions are interchangeable.
4. Before the live run, return to the clean prepared baseline. Do not carry generated app files, node_modules, test output, or a rehearsal lockfile into it. Prefer a separate worktree for rehearsal so there is no destructive cleanup or accidental application scaffold on the baseline.
5. Disclose any use of a rehearsed application branch as recovery. Do not present prebuilt code as newly generated.
6. Rehearse the actual `pr-review-loop` in `review-and-fix` mode for up to two rounds. Keep review IDs, reviewed SHAs, CI links, and elapsed times. If Copilot reports no actionable findings, show that result; do not deliberately add defects to force a fix demonstration.

## Start the live demo

1. Open a fresh Codex session on the clean prepared baseline.
2. Paste [DEMO_PROMPT.md](../DEMO_PROMPT.md).
3. Let Codex inspect, create its feature branch, establish file ownership, and delegate UI/tests while the coordinator implements shared logic.
4. Show the actual agent activity, then the browser acceptance journey: move 2h off overloaded Wednesday, complete it on Thursday, and reload.
5. Narrate one Terra browser pass, one Sol local review, and the resulting fixes. They are not substitutes for the checked-in tests or remote Copilot review.
6. Aim to open the draft PR by minute 20. Invoke `pr-review-loop` in `review-and-fix` mode for up to two rounds with one shared ten-minute budget, capped by the remaining live time.
7. Show initial CI succeeding on the PR head, request GitHub Copilot review, and wait for its actual result. Summarize findings, fix them or explain why no change is needed, add regression tests, validate, push, and show replacement CI.
8. If first-round code fixes and the remaining budget warrant it, request a second review on the updated head and handle its feedback the same way. Stop early after a clean review; never start a third round.
9. End with review/fix evidence, final head SHA and CI result. Report reviewed SHAs separately from any later fixes, and disclose unresolved, pending, failed, or unavailable work. Do not merge.

## Live checkpoints

| Elapsed | Expected checkpoint | If behind |
| --- | --- | --- |
| 0-3 min | Plan, branch, scaffold, shared contract | Avoid framework/design exploration |
| 3-12 min | UI/tests in parallel; coordinator integrates domain/storage/config | Stop optional styling, retain native controls |
| 12-17 min | Runnable app, one browser pass and local review, one repair phase | Fix blockers only; no extra local review cycle |
| 17-20 min | Full local validation, commit/push, draft PR | Diagnose failures; never skip checks to start CI early |
| 20-30 min | Initial green CI; Copilot review, fixes, validation/push, replacement CI; second review if time permits | Use one deadline; report the unfinished goal if the budget expires |

Within the remote phase, check at most every 30 seconds and wait no more than five minutes per CI/review result, always bounded by the remaining shared budget. Do not restart the clock after a fix or use a successful older workflow run as evidence for the new head.

## Recovery: implementation takes too long

Keep one workweek, native selectors, task CRUD/completion, capacity warnings, persistence, and meaningful tests. Remove decorative polish, not the acceptance journey or accessibility, to protect the remote-review window. Do not silently revert to request-only mode. If there is not enough time to finish CI/review, preserve work and report the unfinished goal rather than skipping validation or claiming success.

## Recovery: dependency installation fails

Retry the failed npm command once after checking connectivity and the warmed cache. If the registry remains unavailable, report the blocker. Switch to a rehearsed branch only with presenter approval and an explicit disclosure to the audience.

## Recovery: agent/model smoke test fails

A parsed configuration, bundled model listing, or healthy credential-presence check does not prove inference access. If the no-op turn returns HTTP 401, stop retries and reauthenticate the intended Codex account, or privately correct the intended provider authentication. Do not paste credentials into chat or tracked files. Restart Codex and repeat the smoke test before rehearsal. For model-access errors, verify the account's current model catalog; do not silently replace Luna, Terra, or Sol.

## Recovery: local tests fail

Run the smallest failing test or build command, inspect Playwright artifacts and console output, and reduce nondeterministic animation. Do not skip failures or weaken assertions to manufacture a pass.

## Recovery: CI fails

Inspect the failing check/logs and exact head SHA. Within the remaining shared budget, reproduce locally, fix on the feature branch, run full validation, push, and wait for replacement CI before requesting the next review. If time expires, preserve work and report the unfinished CI/review milestone. Never label missing, skipped, cancelled, failed, or pending validation green.

## Recovery: Copilot review is unavailable

Make one supported request attempt. If it fails, report the failure and ask the presenter to use the Reviewers panel when possible. Continue only after the request is observable and within the original deadline; otherwise stop as unavailable. If accepted but delayed, poll within the wait/total limits. The local Sol review is not a completed GitHub Copilot review, and missing remote feedback means the full live goal was not met.

## After the webinar

- If the live loop timed out, retain its request/review IDs, reviewed SHAs, pending CI links, unfinished findings, and any unvalidated local changes.
- Resume outstanding CI/review/fix work only when requested, using an explicit follow-up budget and the recorded pending request rather than creating duplicates. Further rounds beyond the live cap require a new request.
- Decide explicitly whether to keep, close, or merge the live feature PR; never merge automatically.
- Stop only servers owned by the demo. Clean up only identified demo artifacts; preserve unrelated work and the baseline.
- Confirm no credentials or `.env` files entered git history.
- Keep the agent templates, two reusable skills, and credential-free MCP template for future demos.
