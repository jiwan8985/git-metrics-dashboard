# Changelog

All notable changes to "Git Metrics Dashboard" are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.5] - 2026-04-30

### Added
- 📊 **Health Score Status Bar** — status bar now shows live health score (e.g. `✅ Git: 87/100`) after dashboard analysis, color-coded green/yellow/red
- 📋 **Copy README Badge** (`Git Metrics: Copy README Badge`) — generates a shields.io Markdown badge to embed in your project README; every repo visitor sees the badge and can install the extension
- ⭐ **Review Prompt** — after 5 dashboard opens, a gentle prompt invites users to leave a Marketplace review (fueling search ranking)
- 🚀 **Auto-open on first install** — dashboard opens automatically 0.8 s after the extension is installed in a Git workspace
- 🎨 **Marketplace Gallery Banner** — dark banner color in `galleryBanner` for a polished Marketplace listing header

### Improved
- HTML report footer now includes a branded **"Get Git Metrics Dashboard"** CTA button with a Marketplace deep-link — every shared report becomes a marketing channel
- Markdown report footer now includes a live **VS Code Marketplace version badge** with a link, making shared `.md` reports discoverable
- Status bar icon updated to use VS Code codicons (`$(graph)`, `$(pass)`, `$(warning)`, `$(error)`) for a native look

---

## [0.2.4] - 2026-04-29

### Added
- 🧠 **Repository Command Center** — new premium dashboard layer that calculates a repository health score from delivery momentum, churn concentration, Conventional Commit quality, contributor balance, and branch hygiene
- 🌿 **Branch-scoped analytics** — dashboard and report exports can analyze a selected local branch instead of only the checked-out branch
- 🔀 **Base Branch Comparison** — selected branches show ahead/behind commits and diff size against `main`, `master`, or `develop`
- 🎯 **Recommended Next Moves** — actionable, priority-ranked suggestions that tell users what to fix next instead of only showing raw charts
- 🔥 **Refactor Radar** — high-risk file cards that combine commit frequency and churn to identify refactoring or test-coverage candidates
- ✨ **Modern command-center UI** — responsive health ring, signal cards, action cards, quick section navigation, and cleaner risk panels designed to make the dashboard more marketplace-friendly and presentation-ready
- 📋 **Copy Brief** — copied summary now includes health score, next actions, and refactor candidates for standups and reports
- 📄 **Command Center exports** — HTML, Markdown, JSON, and CSV reports now include health score, signals, recommended actions, and refactor candidates
- 🏢 **Commercial readiness docs** — bundled Privacy, Security, and Support guides for team adoption reviews
- 🔎 **Trust-center commands** — Command Palette entries for opening privacy/security notes and support guidance

### Improved
- Dashboard now emphasizes decision-making, code health, and user convenience in addition to visual analytics
- Added responsive layout refinements for smaller VS Code webview widths
- Extracted repository intelligence scoring into a dedicated tested module so dashboard and report exports share the same logic
- Marketplace metadata now emphasizes repository health, engineering intelligence, technical debt, and executive reporting use cases
- Removed the runtime `i18next` dependency and replaced it with a lightweight local translator, reducing the packaged VSIX from about 4.75 MB / 467 files to about 482 KB / 33 files

---

## [0.2.3] - 2026-03-28

### Added
- 📅 **Commit Calendar Heatmap** — GitHub-style 16-week (7×16) commit activity grid with 5 color intensity levels, displayed below summary cards
- 🏆 **Top 3 Contributor Podium** — Gold/Silver/Bronze podium with visual bars above the author ranking list (shown when ≥ 2 contributors)
- 📋 **Copy Summary Button** — One-click copy of formatted stats to clipboard (`📊 Git Stats [30일]: 커밋 N개 | ...`)
- 📐 **New EPIC Badge: Conventional Master** — Awarded for ≥ 70% Conventional Commit compliance (requires ≥ 20 total commits)
- 🌍 **New EPIC Badge: Polyglot Expert** — Awarded for working across ≥ 10 programming languages
- 🏃 **New EPIC Badge: Code Marathoner** — Awarded for achieving a 60-day consecutive commit streak

### Fixed
- **Extension not activating** — Added `onView:gitMetrics` and key `onCommand:*` activation events so the sidebar panel and commands work immediately without needing a `.git` workspace scan first

---

## [0.2.2] - 2026-03-26

### Fixed
- Lowered `engines.vscode` minimum from `^1.102.0` to `^1.85.0` — dramatically increases the addressable user base on the Marketplace
- Translated all command titles and configuration descriptions in `package.json` from Korean to English for global discoverability
- Rewrote README and CHANGELOG in English for global Marketplace visibility

---

## [0.2.0] - 2026-03-26

### Added
- 🔥 **Commit Streak** — current and longest consecutive commit streak, activity rate card + sidebar tree item
- 📊 **Code Change Trend Chart** — daily insertions (+) vs deletions (−) stacked bar chart
- ✅ **Conventional Commits Analysis** — compliance rate for `feat`/`fix`/`chore`/`docs`/etc., type breakdown donut chart
- 📈 **Week-over-Week (WoW) Comparison** — commit volume change between first and second half of the period with ▲▼→ trend indicators
- 🌿 **Branch Status Card** — current branch name, total branch count, active vs stale classification

### Fixed
- `weeklyActivity` keys were hardcoded Korean strings (`'일','월','화'`) — changed to numeric keys (`'0'`–`'6'`) so weekend/weekday calculations work correctly for all locales
- `dashboardDataFormatter` day-of-week map was mismatched with `weeklyActivity` keys
- Date display was forced to `ko-KR` locale — now uses the system locale
- Memory leak on extension deactivation: `changeDetector` and `statusIndicator` were not disposed

### Improved
- Analysis notification spam (3× `showInformationMessage`) replaced with a single `withProgress` progress bar
- `exec()` shell injection risk replaced with `execFile()` array-argument invocation throughout
- Removed unused dependencies: `simple-git`, `i18next-node-fs-backend`
- Reduced extension bundle size from ~4.5 MB to ~473 KB by fixing `.vscodeignore` (excluded `node_modules/`, `coverage/`, dev docs)

---

## [0.1.0] - 2025-11-24

### Added
- **Real-time Git Change Detection** — watches `.git` directory for commits, branch switches, file staging, and stash changes; auto-refreshes the dashboard
- **Git Status Indicator** — tracks staged / unstaged / untracked file counts in real time
- **Internationalization (i18n)** — full UI string localization via i18next; supported languages: English, 한국어, 日本語, 简体中文
- Dynamic language switching via `gitMetrics.changeLanguage` command
- New settings: `gitMetrics.autoRefresh`, `gitMetrics.autoRefreshInterval`, `gitMetrics.showChangeNotification`, `gitMetrics.language`

### Improved
- Modular architecture: added `gitChangeDetector.ts`, `gitStatusIndicator.ts`, `dashboardStyles.ts`, `dashboardDataFormatter.ts`, `i18n.ts`

---

## [0.0.9] - 2025-11-24

### Security
- Replaced `child_process.exec()` with `simple-git` for all Git operations — eliminates command injection risk
- Added `sanitizeString()` for HTML output — prevents XSS from author names, commit messages, file paths
- Added `escapeCSV()` — prevents formula injection (`=`, `+`, `@`, `-`, `\t`) in CSV exports

### Fixed
- 27 ESLint warnings resolved
- 4 TypeScript compilation errors fixed

---

## [0.0.8] - 2025-08-18

### Added
- **Achievement Badge System** — gamification with 5 categories: Productivity, Quality, Consistency, Milestone, Special
- Progress tracking per badge with rarity tiers: Common, Rare, Epic, Legendary
- Badge section included in exported reports

### Fixed
- Unused imports removed from `badgeSystem.ts` and `reportGenerator.ts`
- `Badge` interface `unlockedAt` type compatibility fixed
- `calculateActiveDaysProgress` unnecessary parameter removed
- Missing `includeBadges` property added to `ReportOptions`

---

## [0.0.7] - 2025-07-30

### Fixed
- Loading flicker when switching themes

---

## [0.0.6] - 2025-07-30

### Added
- Expanded file type support from 20+ to **70+ programming languages**
- New language categories: Functional, System, Infrastructure, Scientific, Legacy, Blockchain
- Smart theme detection: auto-detects VS Code theme and applies in real time
- One-click theme toggle button in status bar
- `gitMetrics.export.useThemeInReports` setting

### Fixed
- Chart text readability in dark theme
- Theme toggle flicker removed

---

## [0.0.5] - 2025-07-29

### Improved
- README documentation updates and usage screenshots

---

## [0.0.4] - 2025-07-28

### Improved
- README updates

---

## [0.0.3] - 2025-07-28

### Added
- **Report Export** — HTML, JSON, CSV, Markdown formats
- Quick Export via status bar `📄 Export` button (`Ctrl+Shift+G E`)
- Custom Export: choose analysis period, format, and included sections
- New commands: `gitMetrics.quickExport`, `gitMetrics.customExport`, `gitMetrics.openReportsFolder`
- New settings: `gitMetrics.export.*` namespace

---

## [0.0.2] - 2025-07-25

### Added
- Core dashboard with real-time Git statistics
- Interactive Chart.js visualizations
- Contributor rankings and activity patterns
- File type breakdown (20+ languages)
- Hourly and daily activity heatmaps
- Dark / light theme integration
- Status bar quick-access button
- Settings: `gitMetrics.defaultPeriod`, `gitMetrics.autoRefresh`, `gitMetrics.showAuthorStats`, `gitMetrics.maxTopFiles`

---

**Full history**: [GitHub Releases](https://github.com/jiwan8985/git-metrics-dashboard/releases)
