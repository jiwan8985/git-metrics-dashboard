# 📊 Git Metrics Dashboard

> **Comprehensive Git Repository Analytics and Metrics Dashboard for VS Code**

![Version](https://img.shields.io/badge/version-0.2.4-blue.svg)
![VS Code](https://img.shields.io/badge/VS%20Code-1.85.0+-green.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)
![Languages](https://img.shields.io/badge/UI%20languages-4-brightgreen.svg)

A powerful VS Code extension that turns Git history into an executive-ready repository intelligence dashboard with beautiful visualizations, health scoring, risk detection, achievement badges, and multi-format report exports.

**English** | [한국어](./README.ko.md) | [日本語](./README.ja.md) | [简体中文](./README.zh-CN.md)

---

## ✨ Key Features

### 📈 Dashboard Analytics
- **🧠 Repository Command Center** *(v0.2.4)* — one-screen repository health score based on momentum, churn, commit quality, collaboration, and branch hygiene
- **🌿 Branch-scoped analytics** *(v0.2.4)* — select a local branch and recalculate health, churn, contributors, and reports for that branch
- **🔀 Base Branch Comparison** *(v0.2.4)* — see ahead/behind commits and PR-sized diff stats against `main`, `master`, or `develop`
- **🎯 Recommended Next Moves** *(v0.2.4)* — prioritized, actionable suggestions generated from real repository signals
- **🔥 Refactor Radar** *(v0.2.4)* — highlights high-risk files by combining churn, commit frequency, and change volume
- **📋 Copy Brief** *(v0.2.4)* — copy a standup-ready health summary with next actions and refactor candidates
- **📅 Commit Calendar Heatmap** *(v0.2.3)* — GitHub-style 16-week activity grid with 5 color intensity levels
- **🏆 Top 3 Contributor Podium** *(v0.2.3)* — Gold/Silver/Bronze podium above the author ranking list
- **📋 Copy Summary** *(v0.2.3)* — One-click clipboard copy of a formatted stats summary
- **Commit Streak** — current and longest consecutive commit streak with activity rate
- **Week-over-Week Trend** — compare commit volume between first and second half of the period (▲▼ indicator)
- **Conventional Commits Analysis** — compliance rate for feat/fix/chore/docs/etc. with donut chart
- **Branch Status** — current branch name, total and active branch counts
- **Real-time Git Statistics** — total commits, file changes, contributor metrics
- **Real-time Change Detection** — auto-refresh dashboard on commits, branch switches, and file staging
- **Interactive Charts** — Chart.js-powered visualizations
- **Contributor Rankings** — contribution metrics and activity patterns per author
- **File Type Analysis** — support for 70+ programming languages
- **Time-based Analysis** — hourly and daily activity heatmaps
- **Achievement Badges** — gamification system with 20+ badges across 5 rarity tiers (including 3 new EPIC badges in v0.2.3)
- **Smart Themes** — full dark / light / auto theme support
- **Polished Responsive UI** — modern command center, insight cards, quick navigation, and mobile-friendly dashboard layout

### 📄 Report Export
- **Multiple Formats**: HTML, JSON, CSV, Markdown
- **Command Center Reports**: health score, risk signals, next moves, and refactor candidates are included in exported reports
- **Branch-aware Reports**: quick and custom exports can target a selected branch
- **Theme Integration**: VS Code theme automatically applied to HTML reports
- **Customizable**: choose analysis period, format, and which sections to include
- **Badge Integration**: achievement badges included in reports
- **Professional Quality**: suitable for team presentations and documentation

### 🏢 Commercial Readiness
- **Local-first privacy model**: repository data is analyzed locally and is not uploaded by the extension
- **Security-aware exports**: CSV formula injection mitigation and local report output paths
- **Adoption documents**: bundled Privacy, Security, and Support guides available from the Command Palette
- **Executive reporting**: Command Center insights are exportable for standups, reviews, and stakeholder updates
- **Lean package**: no runtime `node_modules` payload in the VSIX after dependency cleanup

---

## 🚀 Installation

1. Open VS Code
2. Search **"Git Metrics Dashboard"** in the Extensions Marketplace (`Ctrl+Shift+X`)
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

## 🔧 Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| `gitMetrics.showDashboard` | `Ctrl+Shift+G D` | Open analytics dashboard |
| `gitMetrics.quickExport` | `Ctrl+Shift+G E` | Quick export with defaults |
| `gitMetrics.customExport` | — | Export with custom options |
| `gitMetrics.toggleTheme` | `Ctrl+Shift+G T` | Toggle dashboard theme |
| `gitMetrics.openReportsFolder` | — | Open reports output folder |
| `gitMetrics.changeLanguage` | — | Change UI language |
| `gitMetrics.openPrivacySecurity` | — | Open privacy notes |
| `gitMetrics.openSupport` | — | Open support guide |

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

**Copy Summary button does nothing**
1. Check that the VS Code clipboard API is available (some restricted environments block it)
2. Verify clipboard permissions on your OS

**Report export fails**
1. Verify write permissions on the workspace folder
2. Try setting a custom path via `gitMetrics.export.customReportsPath`
3. Restart VS Code with administrator privileges if needed

**Charts not rendering**
1. Restart VS Code (`Developer: Reload Window`)
2. Check VS Code version ≥ 1.85.0

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

Bug reports and feature requests: [GitHub Issues](https://github.com/jiwan8985/git-metrics-dashboard/issues)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

⭐ If this extension is useful, please [star it on GitHub](https://github.com/jiwan8985/git-metrics-dashboard) and leave a review on the Marketplace!
