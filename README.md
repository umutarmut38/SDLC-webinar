# Codex Agentic SDLC Webinar

This repository intentionally contains **no application yet**. It is the starting point for a live demonstration in which Codex creates a functioning 3D web application, adds tests and CI, opens a pull request, and drives a repeatable review loop.

The baseline retains only:

- durable agent rules in `AGENTS.md`;
- the presenter instruction in `DEMO_PROMPT.md`;
- project-local MCP templates and setup notes;
- reusable `web-qa-loop` and `pr-review-loop` skills under `.agents/skills/`.

Before the webinar, follow `docs/live-demo-runbook.md`. To begin the live build, start a fresh Codex session on clean `main` and paste `DEMO_PROMPT.md`.

There is deliberately no package manager lockfile, source tree, test configuration, CI workflow, deployment workflow, or cloud environment in the baseline. Codex creates the development and review lifecycle live.
