# Live demo runbook

## Success boundary

Target roughly 30 minutes for a working WeekPlan app, passing local validation, and an open draft PR. Check remote CI once and request one Copilot review without waiting. Pending remote work is an explicit follow-up, not a passed check. Never merge during the demo.

This is a rehearsal budget, not a promise that remote services or repairs fit the clock. Aim to finish rehearsal in 22-25 minutes to leave live narration and recovery margin.

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

## Start the live demo

1. Open a fresh Codex session on the clean prepared baseline.
2. Paste [DEMO_PROMPT.md](../DEMO_PROMPT.md).
3. Let Codex inspect, create its feature branch, establish file ownership, and delegate UI/tests while the coordinator implements shared logic.
4. Show the actual agent activity, then the browser acceptance journey: move 2h off overloaded Wednesday, complete it on Thursday, and reload.
5. Narrate one Terra browser pass, one Sol local review, and the resulting fixes. They are not substitutes for the checked-in tests or remote Copilot review.
6. End with local validation evidence and a draft PR. Report the exact head SHA, observed CI state, and whether remote review was requested/completed/pending/unavailable. Do not merge.

## Live checkpoints

| Elapsed | Expected checkpoint | If behind |
| --- | --- | --- |
| 0-3 min | Plan, branch, scaffold, shared contract | Avoid framework/design exploration |
| 3-14 min | UI/tests in parallel; coordinator integrates domain/storage/config | Stop optional styling, retain native controls |
| 14-21 min | Runnable app, one browser pass and local review, one repair phase | Fix blockers only; no extra review cycle |
| 21-26 min | Full local validation | Diagnose the smallest failure; never skip or weaken checks |
| 26-30 min | Draft PR, one remote review request, evidence | Report pending/unavailable remote work and hand off |

## Recovery: implementation takes too long

Keep one workweek, native selectors, task CRUD/completion, capacity warnings, persistence, and meaningful tests. Remove decorative polish, not the acceptance journey or accessibility. Stop after the planned repair phase and report any unresolved blockers; do not claim completion if local validation or the draft-PR milestone is missing.

## Recovery: dependency installation fails

Retry the failed npm command once after checking connectivity and the warmed cache. If the registry remains unavailable, report the blocker. Switch to a rehearsed branch only with presenter approval and an explicit disclosure to the audience.

## Recovery: agent/model smoke test fails

A parsed configuration, bundled model listing, or healthy credential-presence check does not prove inference access. If the no-op turn returns HTTP 401, stop retries and reauthenticate the intended Codex account, or privately correct the intended provider authentication. Do not paste credentials into chat or tracked files. Restart Codex and repeat the smoke test before rehearsal. For model-access errors, verify the account's current model catalog; do not silently replace Luna, Terra, or Sol.

## Recovery: local tests fail

Run the smallest failing test or build command, inspect Playwright artifacts and console output, and reduce nondeterministic animation. Do not skip failures or weaken assertions to manufacture a pass.

## Recovery: CI fails

Record the exact failing check and head SHA, and hand off a follow-up if the live budget is exhausted. After the demo, reproduce locally, fix on the feature branch, run full validation, push, and observe replacement CI. Never label a failed or pending run green.

## Recovery: Copilot review is unavailable

Make one supported request attempt. If unavailable, record the manual Reviewers-panel action for later; do not spend the remaining live window polling. The local Sol review can still be shown, but must not be described as a completed GitHub Copilot review.

## After the webinar

- Observe CI and the requested Copilot review on the exact head SHA.
- If requested, resume `pr-review-loop` for one round, reusing the recorded pending request. Fix or explain every actionable finding, validate, push, and observe replacement CI.
- Decide explicitly whether to keep, close, or merge the live feature PR; never merge automatically.
- Stop only servers owned by the demo. Clean up only identified demo artifacts; preserve unrelated work and the baseline.
- Confirm no credentials or `.env` files entered git history.
- Keep the agent templates, two reusable skills, and credential-free MCP template for future demos.
