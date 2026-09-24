# Credential-free Codex webinar setup

The live `.codex/` directory is ignored because it may contain credentials. Never stage it or print its raw contents. This directory is the tracked, credential-free source for the demo configuration and agent definitions.

## Supported setup

Prepared against Codex CLI `0.154.0`. Current Codex supports standalone project agents under `.codex/agents/`, with `name`, `description`, and `developer_instructions` plus model/configuration overrides. See the official [subagent documentation](https://developers.openai.com/codex/subagents) and [configuration reference](https://developers.openai.com/codex/config-reference).

The template selects a Terra coordinator at medium effort and caps open subagents at two. Each of the four agents selects its own model explicitly and disables further delegation. Browser verification and local review are read-only roles. Existing parent permission overrides can take precedence over agent sandbox defaults; these definitions do not grant broader permissions.

| Definition | Model | Role |
| --- | --- | --- |
| [.codex/agents/ui-builder.toml](.codex/agents/ui-builder.toml) | `gpt-5.6-luna` | UI implementation |
| [.codex/agents/test-engineer.toml](.codex/agents/test-engineer.toml) | `gpt-5.6-luna` | Behavioral tests |
| [.codex/agents/browser-verifier.toml](.codex/agents/browser-verifier.toml) | `gpt-5.6-terra` | Browser inspection |
| [.codex/agents/reviewer.toml](.codex/agents/reviewer.toml) | `gpt-5.6-sol` | Local correctness review |

Model catalog presence is not proof of account access. Smoke-test the agents in a fresh Codex session before rehearsal. Do not silently substitute models if access fails.

## Install in a fresh clone

Run from the repository root. If `.codex/config.toml` does not exist:

```bash
rtk proxy mkdir -p .codex
rtk proxy cp -n demo-config/.codex/config.toml .codex/config.toml
```

The no-clobber copy must not replace an existing configuration. If one already exists, merge only the desired top-level model/reasoning settings and `[agents]` table from the template. Root keys belong before the first TOML table. Preserve existing MCP, auth, permission, and unrelated settings; do not duplicate tables. Review the pinned Playwright entry separately rather than replacing private MCP arguments wholesale.

If `.codex/agents` does not exist, link it to the tracked definitions on macOS/Linux:

```bash
rtk proxy ln -s ../demo-config/.codex/agents .codex/agents
```

The relative link keeps definitions synchronized with this branch. If the directory or link already exists, inspect it first; do not overwrite unrelated agents. Merge only these four definitions, or copy them individually on systems without symlink support. If using copies, refresh them after changing a template.

Do not create user-global profiles or register global MCP servers for this demo. Project configuration is applied only to a trusted workspace. Restart Codex after installation or agent changes; running threads do not automatically rediscover agent definitions.

## Check and start

```bash
rtk proxy codex --version
rtk proxy codex doctor --summary --ascii --no-color
rtk git check-ignore .codex/config.toml .codex/agents
```

Investigate any warnings before rehearsal. Do not print raw config, environment files, MCP command arguments, or authentication data. With the repository trusted, launch:

```bash
rtk proxy codex
```

Check the coordinator model/effort and perform the smoke prompt in the [runbook](../docs/live-demo-runbook.md). In an IDE, open a fresh Codex thread and verify the same effective configuration instead of assuming another extension's subagent settings apply.

## MCP and reproducibility

The template provides Context7, Playwright MCP pinned to `0.0.80` with an isolated in-memory browser profile, and disabled optional graphify. Page reload retains storage within that browser session; restarting the isolated browser does not. Existing authenticated GitHub MCP comes from the Codex environment; no token belongs in this template.

Warm tools and browser binaries during preparation, not application code. Keep versions unchanged between successful rehearsal and the webinar. See [MCP setup](../docs/mcp-setup.md) for probes and [the runbook](../docs/live-demo-runbook.md) for the live budget.
