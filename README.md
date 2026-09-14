# Codex Agentic SDLC Webinar

This repository intentionally contains **no application yet**. It prepares a roughly 30-minute live demonstration in which Codex builds **WeekPlan**, a useful weekly workload planner, with a small team of specialized agents.

The live finish line is a working app, passing local validation, and an open draft PR. Remote CI and one Copilot review may finish afterward; pending checks are never presented as passed.

## The product

Plan tasks against Monday-Friday capacity, keep unscheduled work in a backlog, spot overloaded days, and save the plan in the browser. The key demonstration moves two hours of work off an overloaded Wednesday, verifies the updated totals, and reloads the saved plan. Completed work remains part of scheduled workload.

No backend, accounts, calendar integration, 3D, deployment, or production services.

## The agent team

| Agent | Model | Ownership |
| --- | --- | --- |
| Coordinator | GPT Terra, medium | Contract, domain/storage logic, configuration, integration, CI, Git |
| `ui-builder` | GPT Luna, medium | Interface and responsive layout |
| `test-engineer` | GPT Luna, medium | Unit/component and browser tests |
| `browser-verifier` | GPT Terra, medium | One read-only browser inspection |
| `reviewer` | GPT Sol, medium | One read-only correctness/test review |

At most two subagents are open at a time, with no nested delegation. Model access and timing must be verified in rehearsal, not assumed from the configuration.

## Prepare and run

1. Install the credential-free project agent setup using [demo-config/README.md](demo-config/README.md), preserving any private local configuration.
2. Complete the [live demo runbook](docs/live-demo-runbook.md), including fresh-session agent/model and MCP checks.
3. Start from a clean prepared baseline: `main` after this setup has landed, or an explicitly agreed setup branch.
4. Start a fresh Codex session and paste [DEMO_PROMPT.md](DEMO_PROMPT.md). The prompt creates a separate `demo/weekplan` feature branch.

Do not paste the live prompt during setup unless you intend to build the application.

The baseline retains only:

- durable agent rules in [AGENTS.md](AGENTS.md);
- the presenter instruction in [DEMO_PROMPT.md](DEMO_PROMPT.md);
- credential-free [agent and MCP templates](demo-config/.codex/) and [setup notes](docs/mcp-setup.md);
- reusable `web-qa-loop` and `pr-review-loop` skills under [.agents/skills/](.agents/skills/).

There is deliberately no package manifest, lockfile, source tree, application test configuration, CI workflow, or cloud environment in the baseline. Tooling/browser caches may be warmed beforehand; application code and its validation/CI are created live.
