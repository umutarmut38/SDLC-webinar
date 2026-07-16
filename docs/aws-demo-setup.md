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

The default-branch `destroy-demo.yml` workflow is the approved mechanism for deleting the dedicated S3 bucket and CloudFront distribution. It uses a separate `demo-destroy` GitHub environment and a separate OIDC role so the ordinary deployment role never receives infrastructure-deletion permission.

Create `GitHubActions-SDLC-Webinar-Destroy` with the same GitHub OIDC provider, but trust only the protected `demo-destroy` environment. When GitHub emits ID-qualified subjects for the account, use the exact owner and repository form observed in CloudTrail:

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
          "token.actions.githubusercontent.com:sub": "repo:OWNER/REPOSITORY:environment:demo-destroy"
        }
      }
    }
  ]
}
```

Give that destroy role only these resource-scoped permissions. Keep the account ID, bucket, and distribution placeholders exact; do not use wildcards for the bucket or distribution.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EmptyAndDeleteOnlyDemoBucket",
      "Effect": "Allow",
      "Action": [
        "s3:DeleteBucket",
        "s3:DeleteObject",
        "s3:DeleteObjectVersion",
        "s3:GetBucketLocation",
        "s3:ListBucket",
        "s3:ListBucketVersions"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR-DEMO-BUCKET",
        "arn:aws:s3:::YOUR-DEMO-BUCKET/*"
      ]
    },
    {
      "Sid": "DisableAndDeleteOnlyDemoDistribution",
      "Effect": "Allow",
      "Action": [
        "cloudfront:DeleteDistribution",
        "cloudfront:GetDistribution",
        "cloudfront:GetDistributionConfig",
        "cloudfront:UpdateDistribution"
      ],
      "Resource": "arn:aws:cloudfront::<ACCOUNT_ID>:distribution/YOUR_DEMO_DISTRIBUTION_ID"
    }
  ]
}
```

Create the protected GitHub environment `demo-destroy`, add a required reviewer, and configure these environment variables:

- `AWS_DESTROY_ROLE_TO_ASSUME`
- `AWS_REGION`
- `DEMO_S3_BUCKET`
- `DEMO_CLOUDFRONT_DISTRIBUTION_ID`, optional

To destroy the configured resources, open **Actions → Destroy demo AWS resources → Run workflow** on the default branch. Enter `destroy-demo`, re-enter the exact bucket name, and re-enter the exact distribution ID (or `none`). The workflow checks that the distribution origin is the configured bucket before deleting anything.

After the workflow succeeds, finish the non-automated cleanup deliberately:

1. Verify the dedicated distribution and bucket are absent.
2. Delete any now-unused Origin Access Control reported by the workflow only after confirming no distribution references it.
3. Delete only the dedicated destroy role and its policies. Retain the deployment role if the demo will be reused; otherwise delete it separately.
4. Remove stale resource values from the `demo` and `demo-destroy` GitHub environments.
5. Remove the account OIDC provider only if it was created solely for this repository and no other repository trusts it.

The workflow intentionally cannot delete the role whose credentials it is using, the account-level OIDC provider, GitHub environments, or GitHub variables. Never grant infrastructure-deletion actions to the ordinary deployment role and never use wildcard cleanup scripts.
