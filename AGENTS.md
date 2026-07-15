# Repository instructions

- Inspect the repository and state a concise plan before broad changes.
- Keep live-demo changes small, coherent, and easy to review.
- Use Context7 before implementing or changing library-specific APIs.
- Use Playwright for browser validation; do not rely only on unit tests.
- Keep the app client-side. Use React, TypeScript, and React Three Fiber/Three.js for the visualizer.
- Never store, print, or commit secrets. Treat `.env` files and credential output as sensitive.
- Do not create, modify, or target production infrastructure.
- Use AWS deployment only through the approved `demo` GitHub environment and `/deploy` workflow.
- Do not use long-lived AWS credentials. If OIDC is unavailable, stop and report the setup gap.
- Run `npm run validate` before claiming implementation completion.
- For PR work, use a feature branch and open or update a pull request; never merge without explicit instruction.
- For deployment, use the `deploy` skill and the active PR's `/deploy` workflow. Never deploy directly from a workstation.
- Prefix agent-run shell commands with `rtk`; in chains, prefix every command segment.
- Do not claim GitHub Copilot PR review is enabled until a request to `@copilot` succeeds for this repository/account.
- If graphify is available and a graph has been explicitly generated, use it to inspect architecture and change impact. Otherwise use the documented Mermaid fallback.

Sanitized reusable workflows are in `skills/`. Read the relevant `SKILL.md` completely before using a skill.

## graphify

This project uses graphify. When `graphify-out/graph.json` exists, it provides god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
