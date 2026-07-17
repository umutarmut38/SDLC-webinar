---
name: pr-review
description: Run a bounded GitHub Copilot review loop on the active branch's pull request, collect actionable review threads, implement or explain each finding, validate and push fixes, and wait for CI. Use whenever a PR needs one or more repeatable Copilot review rounds; default to two rounds.
---

# Review the active pull request

## Parameters

Use the first positive integer supplied by the user as the round count. Default to `2`; reject zero or negative values.

## Preflight

1. Preserve unrelated work and identify the current branch.
2. Prefer GitHub MCP to find the open PR for that branch, its exact head SHA, current reviews, unresolved threads, and check runs. Use authenticated `gh` only for unavailable operations.
3. Stop if the PR is missing, closed, from a fork when writes are required, or does not match the current branch.
4. Discover the repository-defined full validation command from `AGENTS.md`, package scripts, or CI. Stop and report the gap if no credible validation command exists.

## Each round

1. Record the head SHA and existing Copilot review IDs and timestamps.
2. Request Copilot through GitHub's supported reviewer mechanism. Prefer GitHub MCP; fall back to `gh pr edit <number> --add-reviewer @copilot` when needed.
3. Poll with a bounded wait for a newly completed Copilot review. Never reuse an older review as evidence for the current round.
4. If programmatic review cannot be requested, ask for the manual Reviewers-panel action and continue only after a new review is observable.
5. Read unresolved thread-level feedback. Include human findings that are part of the active review state.
6. Address every actionable finding with the smallest coherent code change. For a rejected finding, post a concrete technical rationale before resolving it. Never ignore or waive a security finding.
7. Run the full repository validation command after changes.
8. Commit only intended fixes, push without force, and wait for CI on the new SHA. Never merge.
9. Reply to and resolve threads only after the corresponding fix or rationale exists.
10. Stop early when a completed round has no actionable findings; otherwise continue until the requested round count is reached.

## Result

Report rounds completed, findings fixed with commit references, findings intentionally not changed with thread links and rationale, remaining manual items, validation result, current head SHA, and CI state.
