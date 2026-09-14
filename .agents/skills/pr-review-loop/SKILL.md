---
name: pr-review-loop
description: Request or resume a bounded GitHub Copilot review on the active branch's pull request. Use request-only mode for a non-blocking handoff, or run one review/fix round by default with bounded waits, validation, and observed CI.
---

# Review the active pull request

## Parameters

- Mode: `request-only` or `review-and-fix` (default).
- Rounds: use an explicitly requested positive round count; default to `1`. Reject zero or negative values. Do not mistake a PR number or time limit for the round count.
- Wait budget in `review-and-fix`: at most five minutes per review wait or CI wait, checking no more often than every 30 seconds. Use a shorter remaining session budget if applicable. On expiry, hand off as pending instead of restarting the loop.
- `request-only` performs no polling, fixes, commits, or pushes; it requests one review and returns.

## Preflight

1. Preserve unrelated work and identify the current branch.
2. Prefer GitHub MCP to find the open PR for that branch, its exact head SHA, current reviews, unresolved threads, and check runs. Use authenticated `gh` only for unavailable operations.
3. Stop if the PR is missing, closed, from a fork when writes are required, or does not match the current branch.
4. For `review-and-fix`, discover the repository-defined full validation command from `AGENTS.md`, package scripts, or CI. Stop and report the gap if no credible validation command exists.

## Request-only handoff

1. Record the PR URL, head SHA, existing Copilot review IDs/timestamps, and pending reviewer state.
2. If an equivalent request is already pending, reuse it rather than issuing another. If a completed Copilot review already covers this head, report it and its unresolved findings; do not request another without an explicit additional round.
3. Otherwise request Copilot once through the supported reviewer mechanism. Prefer GitHub MCP; use `gh pr edit <number> --add-reviewer @copilot` only when the equivalent MCP operation is unavailable.
4. Observe whether the request was accepted and check CI state once for the exact head SHA. Acceptance is not evidence that a review completed.
5. Return immediately with request evidence and pending/completed/unavailable states. If the request fails, report the manual Reviewers-panel action; do not wait for it during the live handoff.

This mode is the live webinar default when requested by the demo prompt. Resume later with the recorded request evidence; do not create a second review merely because a new session starts.

## Each round

1. Record the head SHA and existing Copilot review IDs and timestamps. When resuming, use the previously recorded request/review baseline.
2. Reuse the pending request or its resulting review for this head. Otherwise request Copilot once through the mechanism above.
3. Poll within the wait budget for the requested review to complete. Match it to the recorded request and reviewed commit; never count an unrelated older review as a new round. If the head changes, reassess rather than claiming coverage of the new commit.
4. If programmatic review cannot be requested, report the manual Reviewers-panel action and stop as unavailable. Do not fabricate completion.
5. Read unresolved thread-level feedback. Include human findings that are part of the active review state.
6. Address every actionable finding with the smallest coherent code change. For a rejected finding, post a concrete technical rationale before resolving it. Never ignore or waive a security finding.
7. Run the full repository validation command after changes.
8. If fixes changed files, commit only intended fixes, push without force, and wait within the budget for CI on the new SHA. If no files changed, do not create an empty commit or push; still observe CI on the current SHA. Never merge.
9. Reply to and resolve threads only after the corresponding fix or rationale exists.
10. Stop early when a completed round has no actionable findings; otherwise continue only up to the requested count and remaining time budget. Do not start another round while replacement CI is failed or pending.

## Result

Report the mode, request evidence, rounds actually completed, findings fixed with commit references, findings intentionally not changed with thread links and rationale, remaining manual items, validation result, current head SHA, and CI state. Distinguish pending, failed, unavailable, and not-run work from completed checks. A local subagent review is not a GitHub Copilot review.
