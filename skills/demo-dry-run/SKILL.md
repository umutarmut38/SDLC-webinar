---
name: demo-dry-run
description: Verify that the Codex agentic SDLC webinar repository, local tests, MCP setup, GitHub integration, AWS configuration documentation, deployment workflow, and recovery notes are ready. Use before a rehearsal or webinar without performing a real deployment.
---

# Run a safe webinar dry run

1. Run `rtk ./scripts/check-demo-environment.sh` and retain all warnings.
2. Run `rtk npm run validate`.
3. Run `rtk codex mcp list` and confirm Context7, Playwright, and AWS Knowledge are enabled. Treat graphify as ready only if it is enabled, `graphify-out/graph.json` exists, and a harmless graph query succeeds.
4. Verify GitHub auth with `rtk gh api user --hostname github.com --jq .login`.
5. If a remote exists, detect the active PR and inspect CI. Do not create, edit, comment on, or merge a PR during dry-run mode.
6. Inspect only the names of GitHub repository variables; confirm `AWS_ROLE_TO_ASSUME`, `AWS_REGION`, `DEMO_S3_BUCKET`, and `DEMO_BASE_URL` are documented or configured. `DEMO_CLOUDFRONT_DISTRIBUTION_ID` is optional.
7. Confirm `.github/workflows/deploy-on-comment.yml` exists on the default branch and uses the `demo` environment, OIDC, same-repository PR checks, exact SHA checkout, concurrency, remote validation, and a result comment.
8. Confirm `docs/aws-demo-setup.md` and `docs/live-demo-runbook.md` contain rollback/cleanup and failure-recovery notes.
9. Confirm Copilot review support is labeled unverified unless an actual review completed for this repository/account.
10. Summarize readiness as ready, ready with warnings, or blocked. Give exact remediation commands for blockers.

Never post `/deploy`, request a Copilot review, push, create AWS resources, or run a real deployment from this skill unless the user separately and explicitly authorizes that action.
