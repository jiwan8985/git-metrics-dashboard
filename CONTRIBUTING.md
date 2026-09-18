# Contributing to Git Metrics Dashboard

Thanks for taking the time to contribute! This is a VS Code extension published to the
Marketplace under `jiwan-dev.git-metrics-dashboard`.

## Getting started

```bash
git clone https://github.com/jiwan8985/git-metrics-dashboard.git
cd git-metrics-dashboard
npm install
npm run compile
```

Press `F5` in VS Code to launch an Extension Development Host with the extension loaded, then
open any Git repository and run **Git Metrics: Open Dashboard** from the Command Palette.

## Development workflow

```bash
npm run watch             # recompile on save
npm run lint               # ESLint on src/
npm run test:unit          # Jest unit tests with coverage
npm run test:unit:watch    # Jest watch mode
npm run test:integration   # VS Code integration tests (requires a display)
```

Run a single test file:

```bash
npx jest src/__tests__/unit/gitAnalyzer.test.ts
```

Before opening a PR, make sure `npm run compile`, `npm run lint`, and `npm run test:unit` all
pass. There is no CI pipeline for this project — these checks are run locally.

## Project structure

See [CLAUDE.md](./CLAUDE.md) for an architecture overview (`GitAnalyzer`, `DashboardProvider`,
`ReportGenerator`, `BadgeSystem`, etc.) and data flow between modules.

## Making changes

- Keep PRs focused — one feature or fix per PR is easier to review than a bundle of unrelated
  changes.
- Add or update unit tests in `src/__tests__/unit/` for any change to `GitAnalyzer`,
  `BadgeSystem`, or `ReportGenerator` logic.
- If you add a new command, register it in `package.json` (`contributes.commands`) **and**
  document it in the README "Commands" table — commands that exist but aren't documented are
  easy to miss.
- If you touch webview HTML in `dashboardProvider.ts` or `reportGenerator.ts`, make sure any
  git-derived string (commit message, author name, file path, branch name) is passed through
  the existing `escapeHtml` helper before being interpolated into HTML.
- This extension is local-first by design — no telemetry, no network calls, no login. Please
  keep new features consistent with that model; if a feature needs to send data anywhere, open
  an issue to discuss it first.

## Reporting bugs / requesting features

Open an issue at
[github.com/jiwan8985/git-metrics-dashboard/issues](https://github.com/jiwan8985/git-metrics-dashboard/issues).
For bug reports, please include your VS Code version, extension version, and OS.

## License

By contributing, you agree that your contributions will be licensed under the project's
[MIT License](./LICENSE).
