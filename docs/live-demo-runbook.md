# Live demo runbook

## Pre-demo checklist

Complete this at least one day before the webinar:

- [ ] Environment-preparation changes are merged to `main`; the `issue_comment` workflow must be on the default branch.
- [ ] A new feature branch and active PR exist for the live build.
- [ ] `gh` authenticates to the intended `github.com` repository.
- [ ] The `demo` GitHub environment has required reviewers and dedicated demo variables.
- [ ] AWS OIDC trust is restricted to this repository and `environment:demo`.
- [ ] The S3 bucket and optional CloudFront distribution are dedicated to the demo.
- [ ] Copilot review was successfully requested once in a rehearsal, or its manual fallback is prepared.
- [ ] Context7, Playwright, and AWS Knowledge each complete a harmless MCP call in a fresh session.
- [ ] graphify is either generated/enabled and tested or `docs/architecture.md` is ready as the declared fallback.
- [ ] A known-good `DEMO_BASE_URL` is available for the manual fallback.
- [ ] Cleanup owners and resource IDs are recorded.

## Exact preflight commands

Run from the repository root:

```bash
node --version
npm --version
git status --short --branch
gh api user --hostname github.com --jq .login
npm ci
./scripts/check-demo-environment.sh
npm run validate
codex mcp list
gh pr view --json number,url,headRefName,state
gh workflow view ci.yml
gh workflow view deploy-on-comment.yml
gh workflow view destroy-demo.yml
```

Inspect only repository variable names, never values:

```bash
gh variable list --json name --jq '.[].name'
```

Do not post `/deploy` during preflight unless the presenter explicitly authorizes a real demo deployment.

## Suggested live sequence and Codex prompts

1. **Inspect and plan**

   > Inspect the placeholder and propose a small, reviewable first slice for the 3D Cloud Deployment Visualizer. Do not edit yet. Include tests and identify the current MCP status.

2. **Use current documentation**

   > Use Context7 to verify the installed React Three Fiber, Drei, and Three.js APIs needed for a Canvas, camera, lights, and interactive deployment nodes. Summarize the API choices before coding.

3. **Build the feature**

   > Use the feature-build skill to implement a clear but bounded 3D deployment pipeline: stages, connections, selection, and status controls. Keep it client-side and preserve the deployment infrastructure.

4. **Browser validation**

   > Start the local app, use Playwright MCP to inspect it at desktop and narrow viewport sizes, exercise every stage control, fix console errors, then run npm run validate.

5. **Architecture inspection**

   > If graphify is enabled, query the graph for the path from UI controls to rendered scene state and inspect change impact. Otherwise show docs/architecture.md and state that graphify extraction was intentionally deferred.

6. **PR lifecycle**

   > Summarize the diff, commit it on the feature branch, push it, and update the active PR. Do not merge.

7. **Review**

   > Use the pr-review skill for two rounds. Do not ignore security findings and do not mark threads resolved without a code change or recorded rationale.

8. **Deployment**

   > Use the deploy skill for this active PR. Confirm it targets only the demo environment, then post /deploy, watch the matching workflow, validate the returned URL, and do not merge.

## Recovery: Codex implementation takes too long

1. Stop at the last passing commit; do not expand scope.
2. Reduce to one scene with four deployment nodes, fixed connections, and one selected-state interaction.
3. Keep the prewritten placeholder contract (`visualization-root`, heading, and deployment-stage controls) so tests remain useful.
4. Show the remaining feature plan in the PR description instead of implementing it live.
5. Use a rehearsed backup branch only if its origin and commit are clearly disclosed to the audience.

## Recovery: local tests fail

1. Run the smallest failing layer: `npm test`, `npm run test:e2e`, or `npm run build`.
2. Open `playwright-report/index.html` after an E2E failure and inspect traces/screenshots.
3. Check whether port 4173 is occupied; Playwright normally reuses a healthy local server outside CI.
4. Confirm Playwright MCP can open the app and that system Chrome is available for local CLI tests; do not download a browser during the live session.
5. If the 3D/WebGL path is flaky, preserve deterministic DOM controls and mark WebGL-specific validation as a follow-up; never claim the full validation passed.

## Recovery: AWS deployment fails

1. Let the workflow post its failure comment; do not deploy manually from the laptop.
2. Inspect only the failed step with `gh run view <run-id> --log-failed`.
3. Check names/availability—not values—of required repository variables.
4. Confirm OIDC trust uses `repo:OWNER/REPOSITORY:environment:demo` and the job declares `environment: demo`.
5. Confirm the bucket name contains `demo`, region matches, role policy is scoped to the exact bucket/distribution, and the PR is from the same repository.
6. Fix configuration or code in a reviewable change, then issue a new `/deploy`. Never fall back to long-lived keys.

## Manual presentation fallback

If deployment cannot be repaired within the session:

1. Show the local app with `npm run dev`.
2. Show the active PR, Copilot review findings, and CI checks.
3. Open the latest `/deploy` workflow and explain its trust/OIDC/validation stages.
4. Open the previously prepared `DEMO_BASE_URL` only if it is known to be the dedicated demo app; clearly state that it is a rehearsal deployment, not the just-built commit.
5. Show `docs/architecture.md` if graphify is unavailable.

## Cleanup after the webinar

1. Close or retain the feature PR according to the teaching plan; do not merge automatically.
2. Obtain separate present-tense authorization for deployed-asset cleanup.
3. Run the default-branch **Destroy deployed demo assets** workflow through the protected `demo` environment, entering `destroy-demo-assets` and the exact resource identifiers.
4. Verify the bucket has no current objects and the demo URL no longer serves the app; retain the bucket, distribution, OAC, IAM, OIDC, environments, and variables for reuse.
5. Remove generated `graphify-out/`, Playwright reports, and local build artifacts.
6. Remove any temporary global MCP entries only if they were created solely for this webinar. Keep the checked-in local config for reproducibility.
7. Verify no credentials or `.env` files were added to git history.
