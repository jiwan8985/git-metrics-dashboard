# Security Notes

Git Metrics Dashboard analyzes local Git repositories and generates local reports. It is built to avoid shell injection and accidental data exfiltration.

## Security Model

- Git commands are executed with argument arrays rather than shell-concatenated commands.
- Analysis periods are validated before Git history is queried.
- CSV output escapes formula-leading characters to reduce spreadsheet formula injection risk.
- Generated reports are stored locally and are not uploaded by the extension.

## Reporting a Vulnerability

Please report security issues through GitHub Issues or by contacting the publisher listed in `package.json`.

Include:

- VS Code version
- Extension version
- Operating system
- Minimal reproduction steps
- Whether a workspace path, branch name, author name, or commit message is involved

Avoid posting private repository data in public issue bodies. Use redacted examples where possible.

## Scope

In scope:

- Command injection risks
- Unsafe report generation
- Data exposure caused by the extension
- Incorrect handling of untrusted Git metadata

Out of scope:

- Issues caused by manually sharing generated reports
- Marketplace account or GitHub account compromise
- Vulnerabilities in unrelated VS Code extensions
