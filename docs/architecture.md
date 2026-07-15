# Demo workflow architecture

This Mermaid diagram is the deterministic fallback until the local graphify graph is generated and its MCP server is enabled.

```mermaid
flowchart LR
    Dev[Codex CLI + VS Code] --> Context7[Context7 docs]
    Dev --> Local[Vite React TypeScript app]
    Dev --> PW[Playwright MCP + tests]
    Dev --> Graph[graphify architecture graph]
    Local --> Branch[Feature branch]
    Branch --> PR[GitHub pull request]
    PR --> CI[CI validation]
    PR --> Review[GitHub Copilot review]
    PR --> Command[/deploy comment]
    Command --> Guard[Trust + same-repo + exact SHA guards]
    Guard --> Validate[npm run validate]
    Validate --> OIDC[GitHub OIDC]
    OIDC --> S3[Dedicated demo S3 bucket]
    S3 --> CDN[Optional demo CloudFront]
    CDN --> Remote[Remote Playwright validation]
    Remote --> Result[PR result comment]
    AWSMCP[AWS Knowledge MCP] --> Dev
```

The only mutating AWS path is the protected GitHub Actions job. MCP servers provide documentation, inspection, and browser validation; they do not bypass the workflow.
