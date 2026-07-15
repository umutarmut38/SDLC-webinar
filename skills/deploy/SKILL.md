---
name: deploy
description: Trigger the active pull request's protected demo deployment with a /deploy comment, watch the matching GitHub Actions run, validate the remote app, and report its URL. Use only for explicitly authorized deployments of the current branch to the dedicated demo environment.
---

# Deploy the active demo PR

## Safety gate

Never deploy implicitly. Confirm the user explicitly authorizes a real deployment now and that the target is the protected `demo` GitHub environment. If not, stop after preflight. Never merge the PR or deploy from the workstation.

## Preflight

1. Verify GitHub auth with `rtk gh api user --hostname github.com --jq .login`.
2. Detect the active PR with `rtk gh pr view --json number,url,state,headRefName,headRefOid,headRepositoryOwner`.
3. Confirm the PR is open, belongs to the current branch, and is from the same repository rather than a fork.
4. Confirm `.github/workflows/deploy-on-comment.yml` exists on the default branch. An `issue_comment` workflow present only in the PR branch cannot run.
5. Confirm required repository variable names and the `demo` environment are configured. Never print secret values.
6. Run `rtk npm run validate`. Stop on failure.

## Trigger and watch

1. Record the UTC time and PR head SHA.
2. Post exactly one comment with `rtk gh pr comment <pr-number> --body /deploy`.
3. Poll `rtk gh run list --workflow deploy-on-comment.yml --event issue_comment --json databaseId,displayTitle,status,conclusion,createdAt,url` for a run created after the comment whose title starts with `Deploy PR #<number>`.
4. Watch that exact run with `rtk gh run watch <run-id> --exit-status`.
5. If it fails, run `rtk gh run view <run-id> --log-failed`, inspect the failing step, and summarize the root cause without exposing credentials or sensitive output. Do not bypass OIDC or deploy manually.
6. If it succeeds, read the workflow's PR result comment and extract the deployed URL, commit SHA, and remote validation status. Confirm the SHA equals the recorded PR head.
7. Independently run `rtk npm run test:remote -- --base-url <deployed-url>`.

## Completion

Return the PR URL, workflow URL, deployed URL, deployed SHA, workflow validation result, and independent Playwright result. State explicitly that the target was `demo` and the PR was not merged.
