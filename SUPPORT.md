# Support Guide

## Before Opening an Issue

1. Confirm the workspace contains a Git repository: `git status`.
2. Run `Git Metrics: Open Dashboard`.
3. Try a wider analysis period if the dashboard has little data.
4. Run `Git Metrics: Quick Export Report` and check whether report generation succeeds.

## Useful Details to Include

- Extension version
- VS Code version
- Operating system
- Repository size or approximate commit count
- Selected analysis period
- Error message, if any
- Whether the issue appears in dashboard, export, sidebar, or auto-refresh

## Common Fixes

- Reload VS Code with `Developer: Reload Window`.
- Disable and re-enable `gitMetrics.autoRefresh` if live updates appear stale.
- Set `gitMetrics.export.customReportsPath` if the workspace is read-only.
- Increase `gitMetrics.defaultPeriod` if there are no recent commits.

## Commercial Evaluation

For team adoption, evaluate the extension with:

- One active product repository
- One larger historical repository
- HTML and Markdown report exports
- Privacy review of generated report contents
- The Repository Command Center health score and recommended actions
