---
name: pr-review-loop
description: Wait for CI and run bounded GitHub Copilot review/fix rounds on the active branch's pull request, validating fixes and observing replacement CI. Supports a shared deadline and an explicit request-only mode; the live demo requests up to two rounds.
---

# Review the active pull request

## Parameters

- Mode: `request-only` or `review-and-fix` (default).
- Rounds: use an explicitly requested positive round count; default to `1`. Reject zero or negative values. Do not mistake a PR number or time limit for the round count.
- Total budget in `review-and-fix`: use the caller's budget, defaulting to ten minutes. Record one deadline at invocation, capped by any earlier session deadline. Initial CI, review requests/waits, repairs, local validation, commits/pushes, and replacement CI all consume this same budget. Never reset it per round or after a push.
- Wait budget: at most five minutes per review or CI wait, checking no more often than every 30 seconds and never beyond the total deadline. At a wait limit or the total deadline, stop starting new work/polls and report unfinished states. Preserve in-flight/local work; do not push unvalidated changes or silently claim it passed.
- `request-only` performs no polling, fixes, commits, or pushes; it requests one review and returns.
- The live demo explicitly selects `review-and-fix`, up to `2` rounds, and a shared ten-minute budget. A second round follows first-round code fixes only if sufficient time remains for review and any required validation/CI.

## Preflight

1. Preserve unrelated work and identify the current branch.
2. Prefer GitHub MCP to find the open PR for that branch, its exact head SHA, current reviews, unresolved threads, and check runs. Use authenticated `gh` only for unavailable operations.
3. Stop if the PR is missing, closed, from a fork when writes are required, or does not match the current branch.
4. For `review-and-fix`, discover the repository-defined full validation command from `AGENTS.md`, package scripts, or CI. Stop and report the gap if no credible validation command exists.

## CI gate (`review-and-fix`)

Before requesting the first review or another round, wait within the shared budget for successful repository validation CI associated with the exact current PR head SHA. Check the expected validation workflow, not just an aggregate check count or an unrelated older run. Missing, queued, running, failed, cancelled, skipped, or unavailable validation is not success.

If CI fails, inspect the failing job/logs and fix the cause when sufficient budget remains. Run full local validation before committing/pushing intended fixes, then observe replacement CI on the new head. Do not request the next review while this gate is unmet; at timeout, report the run and SHA as pending/failed rather than declaring the round complete.

## Request-only handoff

1. Record the PR URL, head SHA, existing Copilot review IDs/timestamps, and pending reviewer state.
2. If an equivalent request is already pending, reuse it rather than issuing another. If a completed Copilot review already covers this head, report it and its unresolved findings; do not request another without an explicit additional round.
3. Otherwise request Copilot once through the supported reviewer mechanism. Prefer GitHub MCP; use `gh pr edit <number> --add-reviewer @copilot` only when the equivalent MCP operation is unavailable.
4. Observe whether the request was accepted and check CI state once for the exact head SHA. Acceptance is not evidence that a review completed.
5. Return immediately with request evidence and pending/completed/unavailable states. If the request fails, report the manual Reviewers-panel action; do not wait for it during the live handoff.

This mode is only for an explicitly requested non-blocking handoff; it is not the live webinar completion path. Resume later with the recorded request evidence; do not create a duplicate review merely because a new session starts.

## Each round

1. Confirm the CI gate, remaining shared budget, head SHA, and existing Copilot review IDs/timestamps. When resuming, use the previously recorded request/review baseline; do not count an already-handled review as another round.
2. Reuse the pending request or its resulting review for this head. Otherwise request Copilot once through the mechanism above.
3. Poll within the wait budget for the requested review to complete. Match it to the recorded request and reviewed commit; never count an unrelated older review as a new round. If the head changes, reassess rather than claiming coverage of the new commit.
4. If programmatic review cannot be requested, report the failure and ask for the manual Reviewers-panel action. Continue only if the request becomes observable within the original deadline; otherwise stop as unavailable. Do not fabricate completion or restart the budget.
5. Read the completed review summary, comments, and all unresolved review threads, including pagination. Include human findings that are part of the active review state. Present a concise finding-to-fix summary so the live audience can follow the changes.
6. Address every actionable finding with the smallest coherent code change and meaningful regression coverage. For a rejected finding, post a concrete technical rationale before resolving it. Never ignore or waive a security finding. If the remaining budget cannot accommodate a safe fix and validation, leave it explicitly unresolved and report incomplete work.
7. Recheck changed browser behavior with Playwright MCP when applicable, then run the full repository validation command after changes. Preserve the established subagent file ownership and browser ownership; the coordinator retains GitHub/Git operations.
8. If fixes changed files, commit only intended fixes, push without force, and wait within the budget for CI on the new SHA. If no files changed, do not create an empty commit or push; still observe CI on the current SHA. Never merge.
9. Reply to threads with commit/test evidence or rationale. Resolve fixed threads only after the fix is pushed and validated; leave unfinished or unvalidated work unresolved. If a CI wait times out, still report which fixes were pushed and which CI evidence remains outstanding.
10. Stop early when a completed review has no actionable findings. After code fixes, request a fresh review of the updated head only if another round is allowed and enough total budget remains; reuse an already-pending equivalent request. If no code changed, do not manufacture an empty commit or re-review just for the demo. The live demo permits at most two rounds. Never start another round while replacement CI is failed or pending.

## Completion

Count completed Copilot reviews separately from fully handled rounds. A request acknowledgment is not a completed review, and a completed review with unresolved findings is not a finished repair round. Re-read the current PR head and its validation CI before reporting success. Final CI must be green and all observed actionable findings must be fixed or addressed with a posted technical rationale.

Report the commit each review actually covered. When the final round produces fixes, the final head can have green CI without having been re-reviewed; state that explicitly rather than claiming review coverage of a newer commit. At a deadline or service failure, hand off evidence and outstanding work without claiming the full live goal was achieved.

## Result

Report the mode, elapsed time/shared deadline, request evidence, completed reviews and fully handled rounds, review links/IDs and reviewed SHAs, findings fixed with commit references, findings intentionally not changed with thread links and rationale, remaining manual items, local/MCP validation results, final head SHA, and CI run links/results. Distinguish pending, failed, unavailable, and not-run work from completed checks. A local subagent review is not a GitHub Copilot review.
