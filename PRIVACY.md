# Privacy Notes

Git Metrics Dashboard is designed for local repository analysis.

## Data Handling

- The extension reads Git history from the currently opened workspace.
- Analysis is performed locally inside VS Code.
- The extension does not send repository data, author names, commit messages, file paths, or generated reports to an external service.
- Reports are written only to the configured local export path. By default this is `<workspace>/git-metrics-reports/`.

## Network Use

The extension does not require a backend service for repository analysis. Dashboard charts may use bundled or webview-rendered assets depending on the installed version, but Git metrics are not uploaded.

## User-Controlled Data

Generated HTML, JSON, CSV, and Markdown reports can contain repository metadata such as author names, file paths, commit counts, branch names, and churn indicators. Review reports before sharing them outside your team.

## Configuration

Relevant settings:

- `gitMetrics.export.customReportsPath`: changes where local reports are saved.
- `gitMetrics.autoRefresh`: enables local Git change detection.
- `gitMetrics.showChangeNotification`: controls local notifications for detected Git changes.

## Security Model

- Git commands are executed with argument arrays rather than shell-concatenated commands.
- Analysis periods are validated before Git history is queried.
- CSV output escapes formula-leading characters to reduce spreadsheet formula injection risk.
- Generated reports are stored locally and are not uploaded by the extension.

## Reporting a Vulnerability

Report security issues through [GitHub Issues](https://github.com/jiwan8985/git-metrics-dashboard/issues). Include the VS Code version, extension version, OS, and minimal reproduction steps. Avoid posting private repository data in public issue bodies — use redacted examples where possible.

In scope: command injection risks, unsafe report generation, data exposure caused by the extension, incorrect handling of untrusted Git metadata.
Out of scope: issues caused by manually sharing generated reports, Marketplace/GitHub account compromise, vulnerabilities in unrelated VS Code extensions.

## Contact

Use GitHub Issues for privacy or security questions, or removal requests related to published screenshots, documentation, or Marketplace assets.
