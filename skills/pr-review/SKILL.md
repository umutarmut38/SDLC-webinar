---
name: pr-review
description: Request GitHub Copilot review on the active pull request, wait for findings, address them, push fixes, and repeat for a bounded number of rounds. Use when reviewing the current branch's PR with Copilot or iterating on PR review feedback.
---

# Review the active PR

## Parameters

Interpret the first positive integer supplied by the user as the number of rounds. Default to `2`. Reject zero or negative values.

## Preconditions

1. Run `rtk gh api user --hostname github.com --jq .login` and stop if GitHub authentication fails.
2. Detect the current branch with `rtk git branch --show-current`.
3. Detect the active PR with `rtk gh pr view --json number,url,state,headRefName,headRefOid`. Stop if no open PR matches the branch.
4. Run `rtk git status --short` and preserve unrelated user changes.

## Each review round

1. Record the current PR head SHA and existing review IDs/timestamps.
2. Request Copilot using GitHub's official reviewer mechanism:

   ```bash
   rtk gh pr edit <pr-number> --add-reviewer @copilot
   ```

3. Poll the PR's reviews and review requests until a new Copilot review completes. Use `rtk gh pr view <pr-number> --json reviews,reviewRequests,statusCheckRollup` and bounded waits. Do not mistake an old review for the new round.
4. If the CLI request is rejected, unavailable, or does not start a new review, tell the user that programmatic Copilot review is unverified for this repository/account. Ask them to request Copilot in the PR Reviewers panel (or use the re-review icon), then continue collecting any available PR reviews and comments.
5. Fetch inline review threads with GitHub GraphQL when resolution state matters; flat PR comments alone are insufficient. Collect all unresolved, actionable findings from Copilot and human reviewers.
6. Triage every finding:
   - Fix correct findings with the smallest coherent code change.
   - Never ignore security findings; address them or stop and escalate.
   - For a finding that should not change code, add a clear technical rationale to the thread.
   - Do not resolve a thread until code changed or the rationale was posted.
7. Run `rtk npm run validate` after fixes.
8. Commit only intended changes, push the current feature branch, and wait for CI. Never force-push and never merge.
9. Reply to or resolve addressed threads through GitHub only after the corresponding commit or rationale exists.
10. Repeat until the requested round count is reached or a completed round has no actionable findings.

## Completion summary

Report review rounds completed, findings addressed with commit references, findings intentionally not addressed with rationale and thread links, remaining manual review items, and the current validation/CI state.

Do not claim Copilot automation works unless an actual Copilot review completed in this repository.
