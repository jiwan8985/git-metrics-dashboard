# Git Metrics Dashboard

**Gitの履歴をリポジトリヘルススコアに変換** — リスク検出、リファクターレーダー、コントリビューター分析、チームレポートのエクスポート。ログイン不要。クラウドアップロードなし。ローカルファースト。

[![VS Codeでインストール](https://img.shields.io/badge/Install%20in-VS%20Code-007ACC?logo=visualstudiocode&logoColor=white)](vscode:extension/jiwan-dev.git-metrics-dashboard)
![Version](https://img.shields.io/badge/version-0.2.13-blue.svg)
![VS Code](https://img.shields.io/badge/VS%20Code-1.85.0+-green.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)
![Languages](https://img.shields.io/badge/UI%20languages-4-brightgreen.svg)

[English](./README.md) | [한국어](./README.ko.md) | **日本語** | [简体中文](./README.zh-CN.md)

---

## ✨ 主な機能

### 📈 ダッシュボード分析
- **🧠 リポジトリコマンドセンター** *(v0.2.4)* — モメンタム、チャーン、コミット品質、コラボレーション、ブランチ衛生に基づく総合ヘルススコア
- **🌿 ブランチスコープ分析** *(v0.2.4)* — 特定ブランチを選択してヘルス、チャーン、コントリビューター、レポートを再計算
- **🔀 ベースブランチ比較** *(v0.2.4)* — `main`、`master`、`develop`に対するahead/behindコミットとPRサイズのdiff統計
- **🎯 推奨ネクストアクション** *(v0.2.4)* — 実際のリポジトリシグナルから生成された優先アクション提案
- **🔥 リファクターレーダー** *(v0.2.4)* — チャーン、コミット頻度、変更量を組み合わせた高リスクファイルの強調表示
- **📋 ブリーフコピー** *(v0.2.4)* — スタンドアップ用ヘルスサマリー＋次のアクション＋リファクター候補をクリップボードにコピー
- **📅 コミットカレンダーヒートマップ** *(v0.2.3)* — GitHub風16週間アクティビティグリッド（5段階カラー強度）
- **🏆 Top 3コントリビューターポディウム** *(v0.2.3)* — 金/銀/銅メダルポディウム
- **📋 サマリーコピー** *(v0.2.3)* — フォーマット済み統計サマリーのワンクリックコピー
- **コミットストリーク** — 現在/最長連続コミット日数＋アクティビティ率
- **週次トレンド** — 前半/後半のコミット量比較（▲▼インジケーター）
- **コンベンショナルコミット分析** — feat/fix/chore/docsなどの準拠率＋ドーナツチャート
- **ブランチステータス** — 現在のブランチ、総数/アクティブブランチ数
- **リアルタイムGit統計** — 総コミット数、ファイル変更、コントリビューターメトリクス
- **リアルタイム変更検出** — コミット、ブランチ切替、ファイルステージング時に自動更新
- **インタラクティブチャート** — Chart.jsによるビジュアライゼーション
- **コントリビューターランキング** — 著者別コントリビューションメトリクスとアクティビティパターン
- **ファイルタイプ分析** — 70以上のプログラミング言語サポート
- **時間ベース分析** — 時間帯別/曜日別アクティビティヒートマップ
- **達成バッジ** — 5段階レアリティ、34個バッジのゲーミフィケーションシステム
- **スマートテーマ** — ダーク/ライト/自動テーマ切替
- **洗練されたレスポンシブUI** — モダンなコマンドセンター、インサイトカード、クイックナビゲーション

### 📄 レポートエクスポート
- **4つのフォーマット**: HTML、JSON、CSV、Markdown
- **4つのテンプレートプリセット**: Full / Executive / PR / Developer
- **コマンドセンターレポート**: ヘルススコア、リスクシグナル、次のアクション、リファクター候補を含む
- **ブランチ対応レポート**: 選択したブランチを基準にエクスポート
- **テーマ統合**: VS CodeテーマがHTMLレポートに自動適用
- **カスタマイズ**: 期間、フォーマット、含めるセクションを選択可能
- **バッジ統合**: 達成バッジをレポートに含める
- **プロフェッショナル品質**: チームプレゼンテーションとドキュメントに適した品質

### 🆕 リリースノートジェネレーター *(v0.2.10)*
- `Git Metrics: Generate Release Notes`コマンドで最後のタグ以降のコミットをConventional Commitタイプ別に自動グループ化
- クリップボードコピーまたは`RELEASE_NOTES.md`として保存

---

## 🚀 インストール

**最速の方法 — VS Codeで直接開く:**

[![VS Codeでインストール](https://img.shields.io/badge/Install%20in-VS%20Code-007ACC?logo=visualstudiocode&logoColor=white)](vscode:extension/jiwan-dev.git-metrics-dashboard)

または手動インストール:
1. VS Codeを開く → `Ctrl+Shift+X`
2. **"Git Metrics Dashboard"** を検索
3. **インストール**をクリック
4. ワークスペースにGitリポジトリを開く

---

## 📋 使い方

### ダッシュボードを開く
| 方法 | 操作 |
|------|------|
| ステータスバー | `📊 Git Stats`ボタンをクリック |
| コマンドパレット | `Ctrl+Shift+P` → **Git Metrics: Open Dashboard** |
| キーボードショートカット | `Ctrl+Shift+G` → `Ctrl+Shift+D` (Win/Linux) / `Cmd+Shift+G` → `Cmd+Shift+D` (Mac) |

### レポートエクスポート
| 方法 | 操作 |
|------|------|
| クイックエクスポート | `Ctrl+Shift+G` → `Ctrl+Shift+E` |
| カスタムエクスポート | コマンドパレット → **Git Metrics: Custom Export Report** |
| ダッシュボードボタン | ダッシュボード内の**📄 Export Report**をクリック |

### テーマ切替
- ステータスバーテーマボタン: 🔄 自動 / ☀️ ライト / 🌙 ダーク
- キーボード: `Ctrl+Shift+G` → `Ctrl+Shift+T`

---

## 📊 レポートフォーマット

| フォーマット | 最適な用途 |
|-------------|-----------|
| **HTML** | ブラウザインタラクティブビュー、チームプレゼンテーション、印刷用 |
| **JSON** | プログラム処理、API連携、自動化 |
| **CSV** | Excel / Google Sheets分析、統計ツール |
| **Markdown** | GitHub READMEへの挿入、プロジェクトドキュメント |

レポートはデフォルトで`<ワークスペース>/git-metrics-reports/`に保存されます（設定変更可能）。

---

## ⚙️ 設定

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

| 設定 | デフォルト | 説明 |
|------|-----------|------|
| `defaultPeriod` | `30` | 分析期間（日、1〜365） |
| `theme` | `"auto"` | ダッシュボードテーマ: `auto` / `light` / `dark` |
| `language` | `"auto"` | UI言語: `auto` / `en` / `ko` / `ja` / `zh-CN` |
| `autoRefresh` | `false` | Git変更時に自動更新 |
| `autoRefreshInterval` | `5000` | 変更検出間隔（ms） |

---

## 🎯 ユースケース

**チームリード / マネージャー**
- スタンドアップやレビュー前に即座にリポジトリヘルススコアを確認
- Gitログを直接読まずに納期、オーナーシップ、ブランチ衛生リスクを把握
- コントリビューター別メトリクスと速度を分析
- 月次/四半期レポートを生成

**個人開発者**
- リファクターレーダーでリファクタリング候補を特定
- 推奨ネクストアクションで次のクリーンアップを決定
- 個人のコーディングアクティビティとストリークを追跡
- 技術スタックの使用状況を分析

**プロジェクト管理**
- Gitアクティビティを明確なヘルス/リスクシグナルに変換
- コードベース健全性の概要把握
- 技術的負債のホットスポット特定

---

## 👥 チームへのインストール

`.vscode/extensions.json`に追加するとチームメンバーがプロジェクトを開いたときに自動でインストール案内が表示されます。

```json
{
  "recommendations": ["jiwan-dev.git-metrics-dashboard"]
}
```

コミット＆プッシュすれば完了。またはダッシュボード内の**🤝 Share with Team**をクリックしてスニペットをコピーしてください。

---

## 🔧 コマンド

| コマンド | ショートカット | 説明 |
|---------|-------------|------|
| `gitMetrics.showDashboard` | `Ctrl+Shift+G D` | 分析ダッシュボードを開く |
| `gitMetrics.quickExport` | `Ctrl+Shift+G E` | クイックエクスポート |
| `gitMetrics.customExport` | — | カスタムエクスポート |
| `gitMetrics.generateReleaseNotes` | — | リリースノートを生成 |
| `gitMetrics.toggleTheme` | `Ctrl+Shift+G T` | テーマ切替 |
| `gitMetrics.openReportsFolder` | — | レポートフォルダを開く |
| `gitMetrics.changeLanguage` | — | UI言語を変更 |

---

## 🛠️ トラブルシューティング

**サイドバーに"There is no data provider"と表示またはコマンドが見つからない**
1. VS Code 1.85.0以降であることを確認
2. コマンドパレットから`Developer: Reload Window`を実行
3. Gitリポジトリを含むフォルダを開いてください

**ダッシュボードにデータが表示されない**
1. ワークスペースにGitリポジトリがあることを確認（`git status`）
2. 選択した期間内にコミットがあることを確認
3. `gitMetrics.defaultPeriod`の値を増やしてみてください

**レポートエクスポートが失敗する**
1. ワークスペースフォルダへの書き込み権限を確認
2. `gitMetrics.export.customReportsPath`でパスを直接指定
3. 必要に応じて管理者権限でVS Codeを再起動

---

## 📄 ライセンス

MIT License — 詳細は[LICENSE](LICENSE)を参照してください。

---

⭐ 役に立った場合は[GitHubでスター](https://github.com/jiwan8985/git-metrics-dashboard)をつけて、[VS Code Marketplaceにレビュー](https://marketplace.visualstudio.com/items?itemName=jiwan-dev.git-metrics-dashboard)を残してください！

[![VS Codeでインストール](https://img.shields.io/badge/Install%20in-VS%20Code-007ACC?logo=visualstudiocode&logoColor=white)](vscode:extension/jiwan-dev.git-metrics-dashboard)
