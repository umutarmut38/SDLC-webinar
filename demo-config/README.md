# Sanitized Codex demo configuration

The live `.codex/` directory is local-only and excluded through `.git/info/exclude` because it may contain credentials. Never stage it.

`demo-config/.codex/config.toml` is a deliberately authored, credential-free template for the webinar MCP servers. Review it before manually applying its settings to a local Codex project configuration. Do not overwrite an existing `.codex/config.toml` without preserving safe settings and removing literal credentials.

Install the sanitized repository skills from `skills/` into the local `.codex/skills/` directory using the normal Codex skill installation process. Install graphify's project integration with:

```bash
graphify install --project --platform codex
```

Keep graphify MCP disabled until `graphify-out/graph.json` has been intentionally generated and verified.
