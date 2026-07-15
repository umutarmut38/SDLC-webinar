# Demo environment setup

This file is the single checklist for configuration that cannot be safely committed. The repository currently has no git remote, so repository variables and the `demo` environment cannot yet be inspected or configured.

## GitHub repository

1. Create or select a dedicated demo repository on `github.com`.
2. Set `origin` to that repository.
3. Ensure `main` is the default branch.
4. Merge the environment-preparation PR before the live feature PR. GitHub only runs an `issue_comment` workflow when its workflow file exists on the default branch.
5. Create a GitHub environment named `demo`. Add a required reviewer if practical and restrict deployment branches to protected branches or selected patterns.

Configure these as GitHub **repository variables** (preferred because they are identifiers, not credentials). The workflow also accepts same-named secrets if organizational policy requires that:

| Name                              | Required | Meaning                                                           |
| --------------------------------- | -------- | ----------------------------------------------------------------- |
| `AWS_ROLE_TO_ASSUME`              | Yes      | ARN of the dedicated GitHub OIDC deployment role                  |
| `AWS_REGION`                      | Yes      | Region containing the demo S3 bucket                              |
| `DEMO_S3_BUCKET`                  | Yes      | Dedicated bucket name; the workflow requires it to contain `demo` |
| `DEMO_CLOUDFRONT_DISTRIBUTION_ID` | No       | Dedicated CloudFront distribution to invalidate                   |
| `DEMO_BASE_URL`                   | Yes      | Public HTTP(S) URL used by remote Playwright validation           |

Do not configure `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, or session credentials. If OIDC is not ready, deployment must fail visibly.

## GitHub Copilot review

Copilot CLI is installed locally, but account/repository support for Copilot PR review cannot be verified until a remote and active PR exist. After the repository is ready, verify with:

```bash
gh pr edit <pr-number> --add-reviewer @copilot
```

If GitHub rejects the reviewer, enable the applicable Copilot code-review policy or request the review manually in the PR Reviewers panel. Do not describe review automation as working until one review completes. See `skills/pr-review/SKILL.md`.

## Local readiness

```bash
npm ci
./scripts/check-demo-environment.sh
npm run validate
```

Then complete the MCP checks in `docs/mcp-setup.md` and the AWS controls in `docs/aws-demo-setup.md`.
