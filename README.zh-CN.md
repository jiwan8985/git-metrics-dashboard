# Git Metrics Dashboard

**将 Git 历史转化为仓库健康评分** — 风险检测、重构雷达、贡献者分析和可导出的团队报告。无需登录。不上传云端。本地优先。

[![在 VS Code 中安装](https://img.shields.io/badge/Install%20in-VS%20Code-007ACC?logo=visualstudiocode&logoColor=white)](vscode:extension/jiwan-dev.git-metrics-dashboard)
![Version](https://img.shields.io/badge/version-0.2.11-blue.svg)
![VS Code](https://img.shields.io/badge/VS%20Code-1.85.0+-green.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)
![Languages](https://img.shields.io/badge/UI%20languages-4-brightgreen.svg)

[English](./README.md) | [한국어](./README.ko.md) | [日本語](./README.ja.md) | **简体中文**

---

## ✨ 主要功能

### 📈 仪表板分析
- **🧠 仓库指挥中心** *(v0.2.4)* — 基于动量、代码变动、提交质量、协作和分支卫生的综合健康评分
- **🌿 分支范围分析** *(v0.2.4)* — 选择特定分支重新计算健康度、变动率、贡献者和报告
- **🔀 基础分支对比** *(v0.2.4)* — 查看相对 `main`、`master`、`develop` 的 ahead/behind 提交和 PR 规模差异统计
- **🎯 推荐下一步行动** *(v0.2.4)* — 基于实际仓库信号生成的优先行动建议
- **🔥 重构雷达** *(v0.2.4)* — 结合变动率、提交频率、变更量高亮高风险文件
- **📋 复制简报** *(v0.2.4)* — 一键复制包含健康摘要、下一步行动和重构候选的站会简报
- **📅 提交日历热图** *(v0.2.3)* — GitHub 风格的 16 周活动网格（5 级颜色强度）
- **🏆 前 3 贡献者领奖台** *(v0.2.3)* — 金/银/铜领奖台展示
- **📋 复制摘要** *(v0.2.3)* — 一键复制格式化的统计摘要
- **提交连击** — 当前/最长连续提交天数 + 活跃率
- **周环比趋势** — 比较前后半段提交量（▲▼ 指示器）
- **规范提交分析** — feat/fix/chore/docs 等遵从率 + 甜甜圈图表
- **分支状态** — 当前分支名称、总分支数/活跃分支数
- **实时 Git 统计** — 总提交数、文件变更、贡献者指标
- **实时变更检测** — 提交、分支切换、文件暂存时自动刷新
- **交互式图表** — Chart.js 驱动的可视化
- **贡献者排名** — 按作者显示贡献指标和活动模式
- **文件类型分析** — 支持 70 多种编程语言
- **基于时间的分析** — 小时/星期维度的活动热图
- **成就徽章** — 5 个稀有度等级、34 个徽章的游戏化系统
- **智能主题** — 深色/浅色/自动主题切换
- **精美响应式 UI** — 现代指挥中心、洞察卡片、快速导航

### 📄 报告导出
- **4 种格式**：HTML、JSON、CSV、Markdown
- **4 种模板预设**：Full（完整）/ Executive（管理层）/ PR（代码审查）/ Developer（开发者）
- **指挥中心报告**：包含健康评分、风险信号、下一步行动和重构候选
- **分支感知报告**：基于选定分支进行导出
- **主题集成**：VS Code 主题自动应用于 HTML 报告
- **可定制化**：可选择分析周期、格式和包含的章节
- **徽章集成**：在报告中包含成就徽章
- **专业品质**：适合团队演示和文档使用

### 🆕 发布说明生成器 *(v0.2.10)*
- 使用 `Git Metrics: Generate Release Notes` 命令将最后一个标签后的提交按 Conventional Commit 类型自动分组
- 复制到剪贴板或保存为 `RELEASE_NOTES.md`

---

## 🚀 安装

**最快方式 — 直接在 VS Code 中打开：**

[![在 VS Code 中安装](https://img.shields.io/badge/Install%20in-VS%20Code-007ACC?logo=visualstudiocode&logoColor=white)](vscode:extension/jiwan-dev.git-metrics-dashboard)

或手动安装：
1. 打开 VS Code → 按 `Ctrl+Shift+X`
2. 搜索 **"Git Metrics Dashboard"**
3. 点击**安装**
4. 在工作区打开任意 Git 仓库

---

## 📋 使用方法

### 打开仪表板
| 方式 | 操作 |
|------|------|
| 状态栏 | 点击 `📊 Git Stats` 按钮 |
| 命令面板 | `Ctrl+Shift+P` → **Git Metrics: Open Dashboard** |
| 键盘快捷键 | `Ctrl+Shift+G` → `Ctrl+Shift+D` (Win/Linux) / `Cmd+Shift+G` → `Cmd+Shift+D` (Mac) |

### 导出报告
| 方式 | 操作 |
|------|------|
| 快速导出 | `Ctrl+Shift+G` → `Ctrl+Shift+E` |
| 自定义导出 | 命令面板 → **Git Metrics: Custom Export Report** |
| 仪表板按钮 | 在仪表板内点击 **📄 Export Report** |

### 切换主题
- 状态栏主题按钮：🔄 自动 / ☀️ 浅色 / 🌙 深色
- 键盘：`Ctrl+Shift+G` → `Ctrl+Shift+T`

---

## 📊 报告格式

| 格式 | 最佳用途 |
|------|----------|
| **HTML** | 浏览器交互视图、团队演示、打印友好 |
| **JSON** | 程序化处理、API 集成、自动化 |
| **CSV** | Excel / Google Sheets 分析、统计工具 |
| **Markdown** | GitHub README 嵌入、项目文档 |

报告默认保存至 `<工作区>/git-metrics-reports/`（可配置）。

---

## ⚙️ 配置

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

| 设置 | 默认值 | 说明 |
|------|--------|------|
| `defaultPeriod` | `30` | 分析周期（天，1–365） |
| `theme` | `"auto"` | 仪表板主题：`auto` / `light` / `dark` |
| `language` | `"auto"` | UI 语言：`auto` / `en` / `ko` / `ja` / `zh-CN` |
| `autoRefresh` | `false` | Git 变更时自动刷新 |
| `autoRefreshInterval` | `5000` | 变更检测间隔（毫秒） |

---

## 🎯 使用场景

**团队负责人 / 管理者**
- 站会或评审前即时查看仓库健康评分
- 无需阅读原始 Git 日志，即可发现交付、所有权和分支卫生风险
- 分析每位贡献者的指标和速度
- 生成月度/季度报告

**个人开发者**
- 从重构雷达中识别重构候选
- 使用推荐行动决定下一步清理内容
- 跟踪个人编码活动和连击记录
- 分析技术栈使用情况

**项目管理**
- 将 Git 活动转化为清晰的健康和风险信号
- 代码库健康概览
- 识别技术债务热点

---

## 👥 为团队安装

在 `.vscode/extensions.json` 中添加后，团队成员打开项目时会自动收到安装提示。

```json
{
  "recommendations": ["jiwan-dev.git-metrics-dashboard"]
}
```

提交并推送即可完成。或者在仪表板内点击 **🤝 Share with Team** 复制代码片段。

---

## 🔧 命令

| 命令 | 快捷键 | 说明 |
|------|--------|------|
| `gitMetrics.showDashboard` | `Ctrl+Shift+G D` | 打开分析仪表板 |
| `gitMetrics.quickExport` | `Ctrl+Shift+G E` | 快速导出 |
| `gitMetrics.customExport` | — | 自定义导出 |
| `gitMetrics.generateReleaseNotes` | — | 生成发布说明 |
| `gitMetrics.toggleTheme` | `Ctrl+Shift+G T` | 切换主题 |
| `gitMetrics.openReportsFolder` | — | 打开报告文件夹 |
| `gitMetrics.changeLanguage` | — | 更改 UI 语言 |

---

## 🛠️ 故障排除

**侧边栏显示"There is no data provider"或找不到命令**
1. 确认 VS Code 版本为 1.85.0 或更高
2. 从命令面板运行 `Developer: Reload Window`
3. 请打开包含 Git 仓库的文件夹

**仪表板无数据显示**
1. 确认工作区包含 Git 仓库（`git status`）
2. 确认选定周期内有提交记录
3. 尝试增大 `gitMetrics.defaultPeriod` 的值

**报告导出失败**
1. 检查工作区文件夹的写入权限
2. 通过 `gitMetrics.export.customReportsPath` 直接指定路径
3. 必要时以管理员权限重启 VS Code

---

## 📄 许可证

MIT License — 详情请参阅 [LICENSE](LICENSE)。

---

⭐ 如果这个扩展对您有帮助，请在 [GitHub 上点星](https://github.com/jiwan8985/git-metrics-dashboard)并在 [VS Code Marketplace 留下评价](https://marketplace.visualstudio.com/items?itemName=jiwan-dev.git-metrics-dashboard)！

[![在 VS Code 中安装](https://img.shields.io/badge/Install%20in-VS%20Code-007ACC?logo=visualstudiocode&logoColor=white)](vscode:extension/jiwan-dev.git-metrics-dashboard)
