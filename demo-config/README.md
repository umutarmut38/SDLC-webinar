# Sanitized local Codex configuration

The live `.codex/` directory is ignored because it may contain credentials. Never stage it.

`demo-config/.codex/config.toml` is the credential-free review copy for the project-local Context7, Playwright, and optional graphify servers. Apply only the required sections to the local `.codex/config.toml`; do not overwrite unrelated settings or expose existing values.

Install graphify locally only when it will be used:

```bash
graphify install --project --platform codex
```

Keep its MCP entry disabled until a graph has been generated intentionally. Repository-authenticated GitHub MCP is supplied by the Codex environment rather than a token-bearing tracked file.
