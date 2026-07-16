# AWS demo setup

> **Danger:** use a dedicated, disposable demo account or clearly isolated demo resources. Never point this workflow at production buckets, distributions, roles, domains, or credentials. Nothing in this repository creates AWS resources automatically.

## Required resources

1. **S3 bucket** dedicated to this webinar's static assets. Its name must contain `demo` because the workflow enforces that guard. Enable block public access when using CloudFront with Origin Access Control (OAC).
2. **CloudFront distribution** dedicated to the demo (optional but recommended). Use the S3 bucket as its origin, configure OAC, set `index.html` as the default root object, and map SPA 403/404 responses to `/index.html` if client-side routing is added.
3. **IAM OIDC provider and role** trusted only for this repository's protected `demo` GitHub environment. Reuse the account-level `token.actions.githubusercontent.com` provider if it already exists; do not modify unrelated roles.

CloudFront provides the preferred `DEMO_BASE_URL`. If CloudFront is omitted, the bucket needs a deliberately configured public website endpoint; review that exposure before enabling it.

## GitHub OIDC trust

GitHub Actions requests short-lived credentials. Do not create repository access keys. The deployment job needs `id-token: write`, which is already scoped in the workflow.

Replace `OWNER`, `REPOSITORY`, and the AWS account ID in this trust policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:OWNER/REPOSITORY:environment:demo"
        }
      }
    }
  ]
}
```

The `sub` restriction means changing the GitHub environment name also requires an intentional trust-policy change. GitHub's OIDC setup guide is at <https://docs.github.com/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services>.

## Least-privilege deployment policy

Replace placeholders with only the dedicated demo bucket and distribution. Remove the CloudFront statement if no distribution is used.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListOnlyDemoBucket",
      "Effect": "Allow",
      "Action": ["s3:GetBucketLocation", "s3:ListBucket"],
      "Resource": "arn:aws:s3:::YOUR-DEMO-BUCKET"
    },
    {
      "Sid": "ManageOnlyDemoObjects",
      "Effect": "Allow",
      "Action": ["s3:DeleteObject", "s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::YOUR-DEMO-BUCKET/*"
    },
    {
      "Sid": "InvalidateOnlyDemoDistribution",
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation"],
      "Resource": "arn:aws:cloudfront::<ACCOUNT_ID>:distribution/YOUR_DEMO_DISTRIBUTION_ID"
    }
  ]
}
```

The workflow uses `aws s3 sync --delete`, so deletion permission is necessary but must remain restricted to the demo bucket.

## Configure GitHub

Create the `demo` environment, then add the repository variables listed in `docs/demo-setup.md`. Recommended values:

- `AWS_ROLE_TO_ASSUME`: dedicated role ARN from above.
- `AWS_REGION`: the bucket's region, for example `eu-central-1`.
- `DEMO_S3_BUCKET`: dedicated name containing `demo`.
- `DEMO_CLOUDFRONT_DISTRIBUTION_ID`: dedicated distribution ID, if used.
- `DEMO_BASE_URL`: `https://...cloudfront.net` or the reviewed demo URL.

Use environment protection rules and a required reviewer as the human deployment gate. Do not put AWS access keys in GitHub secrets.

## Test access locally without deploying

Select only a known demo or read-only profile. The environment check calls STS only when `AWS_PROFILE` is explicitly set and suppresses identity output:

```bash
AWS_PROFILE=<dedicated-demo-readonly-profile> ./scripts/check-demo-environment.sh
```

For a direct read-only check, run `aws sts get-caller-identity --profile <profile>` yourself and verify the account and role before any other command. Do not use one of the production-looking profiles found on this workstation.

OIDC itself can only be validated in GitHub Actions. A safe preflight is to temporarily run a workflow step that calls STS and reports only success, account ID, and role ARN; it must not run S3 sync. This repository does not add that workflow automatically.

## Cleanup after the webinar

The default-branch `destroy-demo.yml` workflow removes all currently visible keys from the bucket dedicated exclusively to `/deploy` output. It uses the same protected `demo` environment, OIDC role, and resource-scoped permissions as deployment. Do not place unrelated objects in this bucket. Historical versions are outside this application-cleanup scope if bucket versioning is enabled.

The cleanup workflow:

1. requires the exact confirmation phrase `destroy-demo-assets`;
2. runs only from `main`;
3. requires the operator to re-enter the configured bucket and distribution identifiers;
4. deletes currently visible keys from the dedicated demo bucket;
5. confirms the bucket contains no current keys;
6. invalidates CloudFront and waits for completion; and
7. confirms the configured demo URL no longer returns a successful response.

Open **Actions → Destroy deployed demo assets → Run workflow** on the default branch. Enter `destroy-demo-assets`, the exact bucket name, and the exact distribution ID (or `none`).

This cleanup deliberately retains the S3 bucket, CloudFront distribution, Origin Access Control, deployment role and policy, GitHub OIDC provider, GitHub environments, and repository variables so the isolated demo environment can be reused. It never deletes infrastructure and requires no additional AWS role or permissions beyond the documented deployment policy.
