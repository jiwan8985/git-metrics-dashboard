# Git Metrics Dashboard

**Turn your Git history into a repository health score** — risk detection, refactor radar, contributor analytics, and exportable team reports. No login. No cloud upload. Local-first.

[![Install in VS Code](https://img.shields.io/badge/Install%20in-VS%20Code-007ACC?logo=visualstudiocode&logoColor=white)](vscode:extension/jiwan-dev.git-metrics-dashboard)
![Version](https://img.shields.io/badge/version-0.3.1-blue.svg)
![VS Code](https://img.shields.io/badge/VS%20Code-1.85.0+-green.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)
![Languages](https://img.shields.io/badge/UI%20languages-4-brightgreen.svg)

- 🧠 **One-screen health score** for any Git repo — install and open, no setup
- 📤 **Export HTML/JSON/CSV/Markdown reports** for standups, reviews, and stakeholders
- 🔒 **100% local** — nothing is ever uploaded

<!-- Screenshots/GIF go here: Command Center health score, calendar heatmap + contributor podium, Refactor Radar, HTML report export, badge unlock toast, light/dark theme comparison -->

---

## ✨ Key Features

### 📈 Dashboard Analytics
- **🧠 Repository Command Center** — one-screen repository health score based on momentum, churn, commit quality, collaboration, and branch hygiene
- **🌿 Branch-scoped analytics** — select a local branch and recalculate health, churn, contributors, and reports for that branch
- **🔀 Base Branch Comparison** — see ahead/behind commits and PR-sized diff stats against `main`, `master`, or `develop`
- **🎯 Recommended Next Moves** — prioritized, actionable suggestions generated from real repository signals
- **🔥 Refactor Radar** — highlights high-risk files by combining churn, commit frequency, and change volume; click any file to open it right beside the dashboard
- **Custom Date Range** — pick a start date instead of the fixed 7/30/90/180/365-day presets
- **Me vs Team Average** — pick a contributor to compare their commits, files, +/- lines, and daily average against the team average
- **📋 Copy Brief** — copy a standup-ready health summary with next actions and refactor candidates
- **📅 Commit Calendar Heatmap** — GitHub-style 16-week activity grid with 5 color intensity levels
- **🏆 Top 3 Contributor Podium** — Gold/Silver/Bronze podium above the author ranking list
- **📋 Copy Summary** — one-click clipboard copy of a formatted stats summary
- **Commit Streak & Daily Goal** — current/longest consecutive commit streak, activity rate, an optional daily commit goal shown in the status bar, and an 8 PM reminder before an active streak breaks
- **Week-over-Week Trend** — compare commit volume between first and second half of the period (▲▼ indicator)
- **Conventional Commits Analysis** — compliance rate for feat/fix/chore/docs/etc. with donut chart
- **Branch Status** — current branch name, total and active branch counts
- **Real-time Git Statistics** — total commits, file changes, contributor metrics
- **Real-time Change Detection** — auto-refresh dashboard on commits, branch switches, and file staging
- **Interactive Charts** — Chart.js-powered visualizations
- **Contributor Rankings** — contribution metrics and activity patterns per author
- **File Type Analysis** — support for 70+ programming languages
- **Time-based Analysis** — hourly and daily activity heatmaps
- **Achievement Badges** — gamification system with 35 badges across 5 rarity tiers
- **Smart Themes** — full dark / light / auto theme support
- **Polished Responsive UI** — modern command center, insight cards, quick navigation, and mobile-friendly dashboard layout

### 📄 Report Export
- **4 Formats**: HTML, JSON, CSV, Markdown
- **4 Template Presets**: Full / Executive / PR / Developer — pick the shape that matches your audience
- **Command Center Reports**: health score, risk signals, next moves, and refactor candidates are included in exported reports
- **Branch-aware Reports**: quick and custom exports can target a selected branch
- **Theme Integration**: VS Code theme automatically applied to HTML reports
- **Customizable**: choose analysis period, format, and which sections to include
- **Badge Integration**: achievement badges included in reports
- **Professional Quality**: suitable for team presentations and documentation

### 🆕 Release Notes Generator
- `Git Metrics: Generate Release Notes` groups every commit since the last tag by Conventional Commit type (feat/fix/chore/docs/…)
- Copy to clipboard or save as `RELEASE_NOTES.md`

### 🛠️ Developer Workflow Tools
- **Conventional Commit Helper** — guided quick-pick for building a Conventional Commit message (type, scope, description)
- **Generate Monthly Brief** — 30/60/90-day engineering brief, copied to clipboard or saved as `MONTHLY_BRIEF.md`
- **Windows Troubleshooter** — diagnoses common Windows Git/environment issues and offers one-click fixes

### 🏢 Commercial Readiness
- **Local-first privacy model**: repository data is analyzed locally and is not uploaded by the extension
- **Security-aware exports**: CSV formula injection mitigation and local report output paths
- **Adoption documents**: bundled Privacy, Security, and Support guides available from the Command Palette
- **Executive reporting**: Command Center insights are exportable for standups, reviews, and stakeholder updates

---

## 🚀 Installation

**Quickest way — opens VS Code directly:**

[![Install in VS Code](https://img.shields.io/badge/Install%20in-VS%20Code-007ACC?logo=visualstudiocode&logoColor=white)](vscode:extension/jiwan-dev.git-metrics-dashboard)

Or manually:
1. Open VS Code → press `Ctrl+Shift+X`
2. Search **"Git Metrics Dashboard"**
3. Click **Install**
4. Open any Git repository in your workspace

---

## 📋 Usage

### Open Dashboard
| Method | Action |
|--------|--------|
| Status Bar | Click the `📊 Git Stats` button |
| Command Palette | `Ctrl+Shift+P` → **Git Metrics: Open Dashboard** |
| Keyboard Shortcut | `Ctrl+Shift+G` → `Ctrl+Shift+D` (Win/Linux) / `Cmd+Shift+G` → `Cmd+Shift+D` (Mac) |

### Export Reports
| Method | Action |
|--------|--------|
| Quick Export | `Ctrl+Shift+G` → `Ctrl+Shift+E` |
| Custom Export | Command Palette → **Git Metrics: Custom Export Report** |
| Dashboard button | Click **📄 Export Report** inside the dashboard |

### Switch Theme
- Status bar theme button: 🔄 Auto / ☀️ Light / 🌙 Dark
- Keyboard: `Ctrl+Shift+G` → `Ctrl+Shift+T`

---

## 📊 Report Formats

| Format | Best For |
|--------|----------|
| **HTML** | Interactive browser view, team presentations, print-friendly |
| **JSON** | Programmatic processing, API integration, automation |
| **CSV** | Excel / Google Sheets analysis, statistical tools |
| **Markdown** | GitHub README inclusion, project documentation |

Reports are saved to `<workspace>/git-metrics-reports/` by default (configurable).

---

## ⚙️ Configuration

```json
{
  "gitMetrics.defaultPeriod": 30,
  "gitMetrics.maxTopFiles": 10,
  "gitMetrics.theme": "auto",
  "gitMetrics.language": "auto",
  "gitMetrics.autoRefresh": false,
  "gitMetrics.autoRefreshInterval": 5000,
  "gitMetrics.showChangeNotification": false,
  "gitMetrics.dailyCommitGoal": 0,
  "gitMetrics.streakDangerAlert": true,
  "gitMetrics.export.defaultFormat": "html",
  "gitMetrics.export.useThemeInReports": true,
  "gitMetrics.export.autoOpenAfterExport": false,
  "gitMetrics.export.customReportsPath": ""
}
```

| Setting | Default | Description |
|---------|---------|-------------|
| `defaultPeriod` | `30` | Analysis period in days (1–365) |
| `theme` | `"auto"` | Dashboard theme: `auto` / `light` / `dark` |
| `language` | `"auto"` | UI language: `auto` / `en` / `ko` / `ja` / `zh-CN` |
| `autoRefresh` | `false` | Auto-refresh on Git changes |
| `autoRefreshInterval` | `5000` | Change detection interval in ms |
| `dailyCommitGoal` | `0` | Daily commit goal shown in the status bar (`0` disables it) |
| `streakDangerAlert` | `true` | Remind you at 8 PM if today has no commit and a streak is active |

The full setting list (including per-report export toggles) is available in VS Code's Settings UI under **Git Metrics Dashboard**.

---

## 🎯 Use Cases

**Team Leads / Managers**
- Get an instant repository health score before standups or reviews
- Spot delivery, ownership, and branch hygiene risks without reading raw Git logs
- Analyze per-contributor metrics and velocity
- Generate monthly / quarterly reports
- Monitor project progress and code health

**Individual Developers**
- Identify refactoring candidates from the Refactor Radar
- Use Recommended Next Moves to decide what to clean up next
- Track personal coding activity and streaks
- Analyze your technology stack usage
- Understand your commit patterns and productivity peaks

**Project Management**
- Convert Git activity into clear health and risk signals
- Codebase health overview
- Identify technical debt hotspots
- Optimize resource allocation

---

## 👥 Install for Your Team

Add Git Metrics Dashboard to your project's recommended extensions so every teammate gets a VS Code install prompt when they open the repository.

**1.** Create or edit `.vscode/extensions.json` in your project root:

```json
{
  "recommendations": ["jiwan-dev.git-metrics-dashboard"]
}
```

**2.** Commit and push. When a teammate opens the project, VS Code will suggest installing Git Metrics Dashboard automatically.

Or, inside the dashboard, click **🤝 Share with Team** to copy the snippet to your clipboard.

---

## 🔧 Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| `gitMetrics.showDashboard` | `Ctrl+Shift+G D` | Open the analytics dashboard |
| `gitMetrics.quickExport` | `Ctrl+Shift+G E` | Quick export with default settings |
| `gitMetrics.customExport` | — | Export with custom options |
| `gitMetrics.toggleTheme` | `Ctrl+Shift+G T` | Toggle dashboard theme |
| `gitMetrics.openReportsFolder` | — | Open the reports output folder |
| `gitMetrics.refreshTreeView` | — | Refresh the sidebar tree view |
| `gitMetrics.changeLanguage` | — | Change the UI language |
| `gitMetrics.generateReleaseNotes` | — | Generate release notes from commits since the last tag |
| `gitMetrics.generateMonthlyBrief` | — | Generate a 30/60/90-day engineering brief |
| `gitMetrics.conventionalCommit` | — | Build a Conventional Commit message interactively |
| `gitMetrics.shareWithTeam` | — | Copy a `.vscode/extensions.json` recommendation snippet |
| `gitMetrics.copyReadmeBadge` | — | Copy a "Analyzed with Git Metrics Dashboard" README badge |
| `gitMetrics.rateExtension` | — | Open the Marketplace review page directly |
| `gitMetrics.openPrivacySecurity` | — | Open the bundled Privacy & Security notes |
| `gitMetrics.openSupport` | — | Open the GitHub Issues page for support |
| `gitMetrics.windowsTroubleshoot` | — | Diagnose and fix common Windows Git issues |

---

## 🛠️ Troubleshooting

**Sidebar shows "There is no data provider" or commands are not found**
1. Ensure you are on VS Code 1.85.0 or later
2. Run `Developer: Reload Window` from the Command Palette
3. If the issue persists, open a folder (`File → Open Folder`) containing a Git repository

**Dashboard shows no data**
1. Confirm the workspace contains a Git repository (`git status`)
2. Check that commits exist within the selected period
3. Try increasing `gitMetrics.defaultPeriod`

**Copy Summary / Copy Brief button does nothing**
1. Check that the VS Code clipboard API is available (some restricted environments block it)
2. Verify clipboard permissions on your OS

**Report export fails**
1. Verify write permissions on the workspace folder
2. Try setting a custom path via `gitMetrics.export.customReportsPath`
3. Restart VS Code with administrator privileges if needed

**Charts not rendering**
1. Restart VS Code (`Developer: Reload Window`)
2. Check VS Code version ≥ 1.85.0

**Windows-specific issues**
Run **Git Metrics: Run Windows Troubleshooter** from the Command Palette for an automated diagnosis.

---

## 🤝 Contributing

See [CONTRIBUTING.md](https://github.com/jiwan8985/git-metrics-dashboard/blob/main/CONTRIBUTING.md) for local setup, build/test commands, and PR guidelines.

Bug reports and feature requests: [GitHub Issues](https://github.com/jiwan8985/git-metrics-dashboard/issues)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

⭐ If this extension is useful, please [star it on GitHub](https://github.com/jiwan8985/git-metrics-dashboard) and leave a review on the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=jiwan-dev.git-metrics-dashboard)!

[![Install in VS Code](https://img.shields.io/badge/Install%20in-VS%20Code-007ACC?logo=visualstudiocode&logoColor=white)](vscode:extension/jiwan-dev.git-metrics-dashboard)
