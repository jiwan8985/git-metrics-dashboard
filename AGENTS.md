# Repository Guidelines

## Project Structure & Module Organization

This repository is a TypeScript VS Code extension. Source files live in `src/`, with activation and command wiring in `src/extension.ts`. Core modules include Git analysis, caching, dashboard rendering, tree view, reports, badges, and status indicators. Tests live under `src/__tests__/`; the legacy VS Code test entry is in `src/test/` and is ignored by Jest. Localization files are in `src/locales/`, marketplace images are in `images/`, compiled output goes to `out/`, and coverage reports go to `coverage/`.

## Build, Test, and Development Commands

- `npm run compile`: compile TypeScript to `out/`.
- `npm run watch`: run the TypeScript compiler in watch mode.
- `npm run lint`: lint TypeScript files under `src/`.
- `npm run test:unit`: run Jest tests with coverage.
- `npm test`: default test command; currently runs unit tests.
- `npm run test:integration`: run VS Code integration tests via `vscode-test`.
- `npm run package`: create a `.vsix` package with `vsce`.

## Coding Style & Naming Conventions

Use strict TypeScript targeting ES2022 with Node16 module resolution. Keep files focused and match the existing `camelCase.ts` naming pattern. Use `camelCase` for variables/functions and `PascalCase` for classes, interfaces, and types. ESLint warns on import naming, missing semicolons, loose equality, non-curly control flow, and throwing literals. Follow the existing four-space indentation unless a file already differs.

## Testing Guidelines

Jest uses `ts-jest` with a Node environment. Add tests under `src/__tests__/unit/` or `src/__tests__/integration/`, using `*.test.ts` names. Coverage is collected from `src/**/*.ts`, excluding tests, declarations, `extension.ts`, and `dashboardProvider.ts`. Maintain the configured 25% global thresholds for branches, functions, lines, and statements.

## Commit & Pull Request Guidelines

Recent history mostly follows short Conventional Commit-style messages such as `feat: v0.2.3`, `chore: bump version to 0.2.2`, and `docs: rewrite README...`; keep new commits in that style. Use scopes only when they add clarity, for example `fix: handle empty git log output`.

Pull requests should include a concise summary, test results, and screenshots or GIFs for dashboard or tree-view UI changes. Link related issues when available. Note changes to VS Code contribution points, configuration keys, localization strings, or marketplace assets.

## Security & Configuration Tips

Do not commit generated packages, credentials, or local workspace settings unless they are intentionally part of a release. Validate Git command input carefully; this extension analyzes user repositories and should avoid shell-injection-prone patterns.
