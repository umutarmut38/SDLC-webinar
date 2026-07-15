# Copilot review instructions

- Treat this repository as a webinar demo scaffold for a client-side React + TypeScript application.
- Prioritize correctness, security, accessibility, deterministic tests, and live-demo reliability.
- Flag any secret, long-lived AWS credential, production resource reference, or overly broad GitHub Actions permission.
- The only approved deployment path is the guarded `/deploy` workflow targeting the `demo` GitHub environment with AWS OIDC.
- Pay special attention to `issue_comment` trust boundaries, same-repository checkout, exact commit selection, and shell injection.
- Expect `npm run validate` to pass before changes are considered ready.
- Do not request expansion of the placeholder into the final 3D experience in environment-preparation reviews.
