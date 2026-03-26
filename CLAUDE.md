# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **VS Code Extension** ("Git Metrics Dashboard") that analyzes Git repository history and displays commit statistics, author metrics, and achievement badges in an interactive webview dashboard. It is published to the VS Code Marketplace under publisher `jiwan-dev`.

## Common Commands

```bash
# Build
npm run compile          # TypeScript → ./out/
npm run watch            # Watch mode

# Test
npm run test             # Jest unit tests with coverage
npm run test:unit:watch  # Jest watch mode
npm run test:integration # VS Code integration tests (requires display)

# Lint
npm run lint             # ESLint on src/

# Package
npm run package          # Create .vsix file
npm run publish          # Publish to Marketplace
```

Run a single test file:
```bash
npx jest src/__tests__/unit/gitAnalyzer.test.ts
```

Coverage thresholds are set at 25% (branches, functions, lines, statements) in `jest.config.js`.

## Architecture

```
extension.ts                   ← Activation, command registration, event wiring
│
├── GitAnalyzer                ← Git log parsing via child_process.exec, metrics calculation
├── DashboardProvider          ← Webview lifecycle, HTML generation, real-time updates
├── DashboardDataFormatter     ← Transforms GitAnalyzer output for webview consumption
├── DashboardStyles            ← CSS for the webview (injected as string)
├── ReportGenerator            ← HTML / JSON / CSV / Markdown export
├── BadgeSystem                ← Achievement badges computed from metrics
├── GitMetricsTreeProvider     ← VS Code sidebar TreeView (Explorer panel)
├── GitChangeDetector          ← Watches .git directory for changes (auto-refresh)
├── GitStatusIndicator         ← Reads git status for real-time change detection
├── CacheManager               ← In-memory cache for analysis results
└── i18n (i18next)             ← 4 languages: en / ko / ja / zh-CN (src/locales/)
```

**Data flow:** `GitAnalyzer` parses `git log` output → `DashboardDataFormatter` shapes the data → `DashboardProvider` injects it into the webview HTML as a serialized JSON object in a `<script>` tag → The webview's inline JavaScript renders charts and tables.

**Git integration:** `simple-git` is listed as a dependency but the actual log parsing was migrated to `child_process.exec` calls (see commit history). `simple-git` is still imported in some paths.

## Key Extension Details

- **Minimum VS Code version:** 1.102.0
- **Entry point:** `./out/extension.js` (compiled from `src/extension.ts`)
- **Activation event:** `onCommand` for all `gitMetrics.*` commands
- **Webview content security:** inline scripts are used; the CSP `nonce` pattern is applied for each panel

**Registered commands** (prefix `gitMetrics.`):
`showDashboard`, `quickExport`, `customExport`, `openReportsFolder`, `toggleTheme`, `refreshTreeView`, `changeLanguage`, `windowsTroubleshoot`

**Key configuration settings** (namespace `gitMetrics`):
`defaultPeriod` (days, 1–365), `autoRefresh`, `autoRefreshInterval`, `theme` (auto/light/dark), `language` (auto/en/ko/ja/zh-CN), `export.*`

## TypeScript Config Notes

- Strict mode with `noImplicitAny`, `noImplicitReturns`, `noUnusedLocals`
- Module: `Node16` — use explicit `.js` extensions in relative imports when needed
- Output dir: `./out/`, source map and declaration files are emitted

## Testing Notes

Unit tests live in `src/__tests__/unit/` and cover `GitAnalyzer`, `BadgeSystem`, and `ReportGenerator`. They run in a plain Node environment (no VS Code API available). Mock the VS Code API via `src/__mocks__/vscode.ts` when needed.

Integration tests in `src/__tests__/integration/` and `src/test/` require `@vscode/test-electron` and a real VS Code host — they are not run in CI by default.
