import * as vscode from 'vscode';
import { GitAnalyzer, MetricsData } from './gitAnalyzer';
import { ReportGenerator, ReportOptions } from './reportGenerator';

export class DashboardProvider {
    private panel: vscode.WebviewPanel | undefined;
    private reportGenerator: ReportGenerator;
    private currentMetrics: MetricsData | undefined;
    private currentPeriod: number = 30;

    constructor(
        private context: vscode.ExtensionContext,
        private gitAnalyzer: GitAnalyzer
    ) {
        this.reportGenerator = new ReportGenerator(context);
    }

    async showDashboard() {
        if (this.panel) {
            this.panel.reveal();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'gitMetrics',
            '📊 Git Metrics Dashboard',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [this.context.extensionUri]
            }
        );

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });

        // 웹뷰에서 Extension으로 메시지 수신
        this.panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'refresh':
                        await this.updateContent();
                        break;
                    case 'changeRange':
                        await this.updateContent(message.days);
                        break;
                    case 'exportReport':
                        await this.handleExportReport(message.options);
                        break;
                    case 'showExportDialog':
                        await this.showExportDialog();
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );

        await this.updateContent();
    }

    async refreshDashboard() {
        if (!this.panel) {return;}
        await this.updateContent(this.currentPeriod);
    }

    refreshTheme() {
        if (this.panel && this.currentMetrics) {
            const config = vscode.workspace.getConfiguration('gitMetrics');
            const maxTopFiles = config.get<number>('maxTopFiles', 10);
            this.panel.webview.html = this.generateAdvancedHTML(this.currentMetrics, this.currentPeriod, maxTopFiles);
        }
    }

    private async updateContent(days?: number) {
        if (!this.panel) {return;}

        try {
            // 설정에서 기본값 읽기
            const config = vscode.workspace.getConfiguration('gitMetrics');
            const defaultPeriod = days || config.get<number>('defaultPeriod', 30);
            const maxTopFiles = config.get<number>('maxTopFiles', 10);

            this.currentPeriod = defaultPeriod;

            vscode.window.showInformationMessage('📊 Git 데이터 분석 중...');

            const commits = await this.gitAnalyzer.getCommitHistory(defaultPeriod);
            const metrics = await this.gitAnalyzer.generateMetrics(commits);

            this.currentMetrics = metrics; // 현재 메트릭 저장

            this.panel.webview.html = this.generateAdvancedHTML(metrics, defaultPeriod, maxTopFiles);

            vscode.window.showInformationMessage('✅ Git 메트릭 대시보드 업데이트 완료!');
        } catch (error) {
            vscode.window.showErrorMessage(`오류: ${error}`);
        }
    }

    private async handleExportReport(options: ReportOptions) {
        if (!this.currentMetrics) {
            vscode.window.showErrorMessage('먼저 데이터를 로드해주세요.');
            return;
        }

        try {
            vscode.window.showInformationMessage('📄 리포트 생성 중...');
            
            const result = await this.reportGenerator.generateReport(this.currentMetrics, options);
            
            if (result.success && result.filePath) {
                const config = vscode.workspace.getConfiguration('gitMetrics');
                const autoOpen = config.get<boolean>('export.autoOpenAfterExport', false);
                
                if (autoOpen) {
                    const doc = await vscode.workspace.openTextDocument(result.filePath);
                    await vscode.window.showTextDocument(doc);
                } else {
                    const action = await vscode.window.showInformationMessage(
                        `✅ 리포트가 성공적으로 생성되었습니다!`,
                        '파일 열기',
                        '폴더에서 보기'
                    );

                    if (action === '파일 열기') {
                        const doc = await vscode.workspace.openTextDocument(result.filePath);
                        await vscode.window.showTextDocument(doc);
                    } else if (action === '폴더에서 보기') {
                        vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(result.filePath));
                    }
                }
            } else {
                vscode.window.showErrorMessage(result.error || '리포트 생성에 실패했습니다.');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`리포트 생성 오류: ${error}`);
        }
    }

    private async showExportDialog() {
        // Quick Pick을 사용한 간단한 옵션 선택
        const format = await vscode.window.showQuickPick([
            { label: '📄 HTML', description: '웹 브라우저에서 볼 수 있는 리포트', detail: 'html' },
            { label: '📋 JSON', description: '프로그래밍적으로 처리 가능한 데이터', detail: 'json' },
            { label: '📊 CSV', description: 'Excel에서 열 수 있는 표 형식', detail: 'csv' },
            { label: '📝 Markdown', description: 'GitHub README 스타일 문서', detail: 'markdown' }
        ], {
            placeHolder: '내보내기 형식을 선택하세요'
        });

        if (!format) {return;}

        const includeOptions = await vscode.window.showQuickPick([
            { label: '📊 전체 리포트', description: '모든 섹션 포함', picked: true },
            { label: '📋 요약만', description: '기본 통계만 포함' },
            { label: '🎯 사용자 정의', description: '포함할 섹션 선택' }
        ], {
            placeHolder: '포함할 내용을 선택하세요'
        });

        if (!includeOptions) {return;}

        let reportOptions: ReportOptions = {
            format: format.detail as any,
            includeSummary: true,
            includeCharts: true,
            includeFileStats: true,
            includeAuthorStats: true,
            includeTimeAnalysis: true,
            includeBadges: true,
            period: this.currentPeriod
        };

        if (includeOptions.label === '📋 요약만') {
            reportOptions = {
                ...reportOptions,
                includeCharts: false,
                includeFileStats: false,
                includeAuthorStats: false,
                includeTimeAnalysis: false
            };
        } else if (includeOptions.label === '🎯 사용자 정의') {
            const sections = await vscode.window.showQuickPick([
                { label: '📋 요약 통계', picked: true, detail: 'includeSummary' },
                { label: '👥 개발자별 통계', picked: true, detail: 'includeAuthorStats' },
                { label: '📁 파일 타입별 분석', picked: true, detail: 'includeFileStats' },
                { label: '⏰ 시간대별 분석', picked: true, detail: 'includeTimeAnalysis' }
            ], {
                placeHolder: '포함할 섹션을 선택하세요 (다중 선택 가능)',
                canPickMany: true
            });

            if (!sections) {return;}

            reportOptions.includeSummary = sections.some(s => s.detail === 'includeSummary');
            reportOptions.includeAuthorStats = sections.some(s => s.detail === 'includeAuthorStats');
            reportOptions.includeFileStats = sections.some(s => s.detail === 'includeFileStats');
            reportOptions.includeTimeAnalysis = sections.some(s => s.detail === 'includeTimeAnalysis');
        }

        await this.handleExportReport(reportOptions);
    }

    private generateAdvancedHTML(metrics: MetricsData, days: number, maxTopFiles: number): string {
        const dailyCommitsData = this.prepareDailyCommitsData(metrics.dailyCommits, days);
        const fileStatsData = this.prepareFileStatsData(metrics.fileStats);
        const authorStatsData = this.prepareAuthorStatsData(metrics.authorStats);
        const languageData = this.prepareLanguageData(metrics.programmingLanguages);
        const categoryData = this.prepareCategoryData(metrics.fileTypeStats);
        
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Git Metrics Dashboard</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 0;
            padding: 20px;
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            line-height: 1.6;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid var(--vscode-textLink-foreground);
        }
        
        .title {
            margin: 0;
            color: var(--vscode-textLink-foreground);
            font-size: 28px;
            font-weight: 700;
        }
        
        .controls {
            display: flex;
            gap: 8px;
            align-items: center;
            flex-wrap: wrap;
        }
        
        .btn {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: 1px solid var(--vscode-button-border, transparent);
            padding: 10px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
            user-select: none;
        }
        
        .btn:hover {
            background: var(--vscode-button-hoverBackground);
            transform: translateY(-1px);
        }
        
        .btn.active {
            background: var(--vscode-textLink-foreground);
            color: var(--vscode-editor-background);
        }
        
        .btn.refresh {
            background: var(--vscode-terminal-ansiGreen);
            color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-terminal-ansiGreen);
        }
        
        .btn.refresh:hover {
            background: var(--vscode-terminal-ansiGreen);
            opacity: 0.8;
            color: var(--vscode-editor-background);
        }
        
        .btn.export {
            background: var(--vscode-terminal-ansiBlue);
            color: var(--vscode-editor-background);
            margin-left: 12px;
            border: 1px solid var(--vscode-terminal-ansiBlue);
        }
        
        .btn.export:hover {
            background: var(--vscode-terminal-ansiBlue);
            opacity: 0.8;
            color: var(--vscode-editor-background);
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: var(--vscode-sideBar-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .metric-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--vscode-textLink-foreground), var(--vscode-terminal-ansiBlue));
        }
        
        .metric-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            border-color: var(--vscode-textLink-foreground);
            background: var(--vscode-list-hoverBackground);
        }
        
        .metric-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
            color: var(--vscode-editor-foreground);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .metric-value {
            font-size: 42px;
            font-weight: 900;
            color: var(--vscode-terminal-ansiGreen);
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .metric-subtitle {
            font-size: 14px;
            color: var(--vscode-descriptionForeground);
            opacity: 0.8;
        }
        
        .chart-container {
            width: 100%;
            height: 350px;
            margin: 20px 0;
            padding: 10px;
        }
        
        .large-chart {
            grid-column: 1 / -1;
            height: auto;
        }
        
        .large-chart .chart-container {
            height: 400px;
        }
        
        .file-list {
            list-style: none;
            padding: 0;
            max-height: 320px;
            overflow-y: auto;
        }
        
        .file-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 0;
            border-bottom: 1px solid var(--vscode-panel-border);
            transition: all 0.2s ease;
        }
        
        .file-item:hover {
            background-color: var(--vscode-list-hoverBackground);
            margin: 0 -16px;
            padding-left: 16px;
            padding-right: 16px;
            border-radius: 6px;
            border: 1px solid var(--vscode-list-hoverBackground);
        }
        
        .file-name {
            color: var(--vscode-editor-foreground);
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .file-index {
            background: var(--vscode-textLink-foreground);
            color: var(--vscode-editor-background);
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            flex-shrink: 0;
        }
        
        .commit-count {
            color: var(--vscode-terminal-ansiBlue);
            font-weight: bold;
            background: var(--vscode-badge-background);
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 12px;
            border: 1px solid var(--vscode-terminal-ansiBlue);
        }
        
        .loading {
            text-align: center;
            padding: 60px;
            color: var(--vscode-descriptionForeground);
            font-size: 18px;
        }
        
        .stats-highlight {
            /* 기본 폴백 색상 (background-clip을 지원하지 않는 브라우저용) */
            color: var(--vscode-terminal-ansiGreen);
            
            /* 그라디언트 텍스트 (지원하는 브라우저용) */
            background: linear-gradient(135deg, var(--vscode-terminal-ansiGreen), var(--vscode-terminal-ansiBlue));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            
            /* 브라우저 호환성을 위한 추가 처리 */
            display: inline-block;
        }
        
        /* background-clip을 지원하지 않는 브라우저를 위한 폴백 */
        @supports not (background-clip: text) {
            .stats-highlight {
                background: none !important;
                -webkit-background-clip: unset !important;
                -webkit-text-fill-color: unset !important;
                color: var(--vscode-terminal-ansiGreen) !important;
            }
        }
        
        .empty-state {
            text-align: center;
            padding: 40px;
            color: var(--vscode-descriptionForeground);
        }
        
        .empty-icon {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.6;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .metric-card {
            animation: fadeIn 0.5s ease-out;
        }
        
        /* 작성자별 통계 스타일 */
        .author-list {
            max-height: 400px;
            overflow-y: auto;
            padding: 0;
        }
        
        .author-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 0;
            border-bottom: 1px solid var(--vscode-panel-border);
            transition: all 0.2s ease;
        }
        
        .author-item:hover {
            background-color: var(--vscode-list-hoverBackground);
            margin: 0 -16px;
            padding-left: 16px;
            padding-right: 16px;
            border-radius: 8px;
            border: 1px solid var(--vscode-list-hoverBackground);
        }
        
        .author-info {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
        }
        
        .author-rank {
            background: linear-gradient(135deg, var(--vscode-textLink-foreground), var(--vscode-terminal-ansiBlue));
            color: var(--vscode-editor-background);
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
            flex-shrink: 0;
        }
        
        .author-rank.gold {
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #000;
        }
        
        .author-rank.silver {
            background: linear-gradient(135deg, #C0C0C0, #A0A0A0);
            color: #000;
        }
        
        .author-rank.bronze {
            background: linear-gradient(135deg, #CD7F32, #B87333);
            color: #fff;
        }
        
        .author-details {
            flex: 1;
        }
        
        .author-name {
            font-weight: 600;
            color: var(--vscode-editor-foreground);
            margin-bottom: 4px;
            font-size: 15px;
        }
        
        .author-meta {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            opacity: 0.8;
        }
        
        .author-stats {
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 120px;
        }
        
        .contribution-bar {
            width: 80px;
            height: 8px;
            background: var(--vscode-panel-border);
            border-radius: 4px;
            overflow: hidden;
        }
        
        .contribution-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--vscode-terminal-ansiGreen), var(--vscode-terminal-ansiBlue));
            border-radius: 4px;
            transition: width 0.3s ease;
        }
        
        .contribution-percent {
            font-weight: bold;
            color: var(--vscode-terminal-ansiBlue);
            font-size: 14px;
            min-width: 40px;
            text-align: right;
        }
        
        /* 파일 타입별 통계 스타일 */
        .file-type-list {
            max-height: 400px;
            overflow-y: auto;
            padding: 0;
        }
        
        .file-type-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid var(--vscode-panel-border);
            transition: all 0.2s ease;
        }
        
        .file-type-item:hover {
            background-color: var(--vscode-list-hoverBackground);
            margin: 0 -12px;
            padding-left: 12px;
            padding-right: 12px;
            border-radius: 6px;
            border: 1px solid var(--vscode-list-hoverBackground);
        }
        
        .file-type-info {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
        }
        
        .file-type-rank {
            background: var(--vscode-textLink-foreground);
            color: var(--vscode-editor-background);
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: bold;
            flex-shrink: 0;
        }
        
        .file-type-details {
            flex: 1;
        }
        
        .file-type-name {
            font-weight: 600;
            color: var(--vscode-editor-foreground);
            margin-bottom: 4px;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .language-tag {
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 2px 6px;
            border-radius: 8px;
            font-size: 10px;
            font-weight: 500;
        }
        
        .file-type-meta {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            opacity: 0.8;
        }
        
        .file-type-stats {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 100px;
        }
        
        .file-type-bar {
            width: 60px;
            height: 6px;
            background: var(--vscode-panel-border);
            border-radius: 3px;
            overflow: hidden;
        }
        
        .file-type-fill {
            height: 100%;
            border-radius: 3px;
            transition: width 0.3s ease;
        }
        
        .file-type-percent {
            font-weight: bold;
            color: var(--vscode-terminal-ansiBlue);
            font-size: 12px;
            min-width: 35px;
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">📊 Git Metrics Dashboard</h1>
        <div class="controls">
            <button class="btn ${days === 7 ? 'active' : ''}" onclick="changePeriod(7)">7일</button>
            <button class="btn ${days === 30 ? 'active' : ''}" onclick="changePeriod(30)">30일</button>
            <button class="btn ${days === 90 ? 'active' : ''}" onclick="changePeriod(90)">90일</button>
            <button class="btn refresh" onclick="refresh()">🔄 새로고침</button>
            <button class="btn export" onclick="exportReport()">📄 리포트 내보내기</button>
        </div>
    </div>
    
    <div class="dashboard-grid">
        <div class="metric-card">
            <div class="metric-title">🔥 총 커밋 수</div>
            <div class="metric-value stats-highlight">${metrics.totalCommits}</div>
            <div class="metric-subtitle">최근 ${days}일 동안</div>
        </div>
        
        <div class="metric-card">
            <div class="metric-title">📁 수정된 파일</div>
            <div class="metric-value stats-highlight">${metrics.totalFiles}</div>
            <div class="metric-subtitle">고유 파일 수</div>
        </div>
        
        <div class="metric-card">
            <div class="metric-title">📊 일평균 커밋</div>
            <div class="metric-value stats-highlight">${(metrics.totalCommits / days).toFixed(1)}</div>
            <div class="metric-subtitle">commits/day</div>
        </div>
        
        <div class="metric-card">
            <div class="metric-title">🏆 최고 기록</div>
            <div class="metric-value stats-highlight">${Math.max(...Object.values(metrics.dailyCommits), 0)}</div>
            <div class="metric-subtitle">하루 최대 커밋</div>
        </div>
        
        <div class="metric-card">
            <div class="metric-title">👥 활성 개발자</div>
            <div class="metric-value stats-highlight">${metrics.totalAuthors}</div>
            <div class="metric-subtitle">참여 인원</div>
        </div>
        
        <div class="metric-card">
            <div class="metric-title">🥇 TOP 기여자</div>
            <div class="metric-value stats-highlight" style="font-size: 24px;">${metrics.topAuthor}</div>
            <div class="metric-subtitle">${metrics.authorStats[0]?.commits || 0} commits</div>
        </div>
        
        <div class="metric-card">
            <div class="metric-title">📁 주력 언어</div>
            <div class="metric-value stats-highlight" style="font-size: 24px;">${metrics.topFileType}</div>
            <div class="metric-subtitle">${metrics.fileTypeStats[0]?.commits || 0} commits</div>
        </div>
    </div>

    <div class="metric-card large-chart">
        <div class="metric-title">📈 일별 커밋 추이 - 최근 ${days}일</div>
        <div class="chart-container">
            <canvas id="dailyCommitsChart"></canvas>
        </div>
    </div>

    <!-- 작성자별 통계 섹션 -->
    <div class="metric-card large-chart">
        <div class="metric-title">👥 작성자별 기여도 분석</div>
        <div class="dashboard-grid" style="margin-bottom: 0;">
            <div style="grid-column: 1 / -1;">
                <div class="chart-container" style="height: 300px;">
                    <canvas id="authorCommitsChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <!-- 파일 타입별 분석 섹션 -->
    <div class="metric-card large-chart">
        <div class="metric-title">📁 파일 타입별 분석 & 기술 스택</div>
        <div class="dashboard-grid" style="margin-bottom: 20px;">
            <div class="metric-card" style="margin: 0;">
                <div class="metric-title">💻 프로그래밍 언어 분포</div>
                <div class="chart-container" style="height: 300px;">
                    <canvas id="languageChart"></canvas>
                </div>
            </div>
            <div class="metric-card" style="margin: 0;">
                <div class="metric-title">📊 카테고리별 활동</div>
                <div class="chart-container" style="height: 300px;">
                    <canvas id="categoryChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <div class="dashboard-grid">
        <div class="metric-card">
            <div class="metric-title">🏆 개발자 순위 & 상세 통계</div>
            <div class="author-list">
                ${metrics.authorStats.length > 0 
                    ? metrics.authorStats.slice(0, 10).map(author => 
                        `<div class="author-item">
                            <div class="author-info">
                                <div class="author-rank">${author.rank}</div>
                                <div class="author-details">
                                    <div class="author-name">👤 ${author.name}</div>
                                    <div class="author-meta">
                                        ${author.commits} commits • ${author.files} files • 
                                        +${author.insertions}/-${author.deletions} lines
                                    </div>
                                </div>
                            </div>
                            <div class="author-stats">
                                <div class="contribution-bar">
                                    <div class="contribution-fill" style="width: ${author.percentage}%;"></div>
                                </div>
                                <div class="contribution-percent">${author.percentage}%</div>
                            </div>
                        </div>`
                    ).join('')
                    : '<div class="empty-state"><div class="empty-icon">👥</div><div>작성자 데이터가 없습니다</div></div>'
                }
            </div>
        </div>

        <div class="metric-card">
            <div class="metric-title">📁 파일 타입 순위 TOP 15</div>
            <div class="file-type-list">
                ${metrics.fileTypeStats.length > 0 
                    ? metrics.fileTypeStats.slice(0, 15).map((item, index) => 
                        `<div class="file-type-item">
                            <div class="file-type-info">
                                <div class="file-type-rank">${index + 1}</div>
                                <div class="file-type-details">
                                    <div class="file-type-name">
                                        ${this.getFileTypeIcon(item.extension)} .${item.extension}
                                        <span class="language-tag">${item.language}</span>
                                    </div>
                                    <div class="file-type-meta">
                                        ${item.commits} commits • ${item.files} files • ${item.category}
                                    </div>
                                </div>
                            </div>
                            <div class="file-type-stats">
                                <div class="file-type-bar">
                                    <div class="file-type-fill" style="width: ${item.percentage}%; background: ${this.getLanguageColor(item.language)};"></div>
                                </div>
                                <div class="file-type-percent">${item.percentage}%</div>
                            </div>
                        </div>`
                    ).join('')
                    : '<div class="empty-state"><div class="empty-icon">📁</div><div>파일 타입 데이터가 없습니다</div></div>'
                }
            </div>
        </div>
    </div>

    <div class="dashboard-grid">
        <div class="metric-card">
            <div class="metric-title">🏆 이번 주 HOT 파일 TOP ${maxTopFiles}</div>
            ${metrics.thisWeekTopFiles.length > 0 
                ? `<ul class="file-list">
                    ${metrics.thisWeekTopFiles.slice(0, maxTopFiles).map((item, index) => 
                        `<li class="file-item">
                            <span class="file-name">
                                <span class="file-index">${index + 1}</span>
                                📄 ${item.file}
                            </span>
                            <span class="commit-count">${item.commits}</span>
                        </li>`
                    ).join('')}
                   </ul>`
                : `<div class="empty-state">
                     <div class="empty-icon">😴</div>
                     <div>이번 주 커밋이 없습니다</div>
                   </div>`
            }
        </div>

        <div class="metric-card">
            <div class="metric-title">📊 파일별 커밋 분포 (상위 10개)</div>
            <div class="chart-container">
                <canvas id="fileStatsChart"></canvas>
            </div>
        </div>
    </div>

    <div class="dashboard-grid">
        <div class="metric-card">
            <div class="metric-title">📊 기여도 분포</div>
            <div class="chart-container">
                <canvas id="authorPieChart"></canvas>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        // 컨트롤 함수들
        function refresh() {
            vscode.postMessage({
                command: 'refresh'
            });
        }

        function changePeriod(days) {
            // 버튼 활성화 상태 변경
            document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            vscode.postMessage({
                command: 'changeRange',
                days: days
            });
        }

        function exportReport() {
            vscode.postMessage({
                command: 'showExportDialog'
            });
        }

        // 일별 커밋 라인 차트
        const dailyData = ${JSON.stringify(dailyCommitsData)};
        const ctx1 = document.getElementById('dailyCommitsChart').getContext('2d');
        
        // VS Code 테마에 맞는 색상 가져오기
        const computedStyle = getComputedStyle(document.documentElement);
        const foregroundColor = computedStyle.getPropertyValue('--vscode-editor-foreground').trim() || '#cccccc';
        const linkColor = computedStyle.getPropertyValue('--vscode-textLink-foreground').trim() || '#007ACC';
        const borderColor = computedStyle.getPropertyValue('--vscode-panel-border').trim() || '#3c3c3c';
        
        const gradient = ctx1.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, linkColor + '4D'); // 30% opacity
        gradient.addColorStop(1, linkColor + '0D'); // 5% opacity
        
        new Chart(ctx1, {
            type: 'line',
            data: {
                labels: dailyData.labels,
                datasets: [{
                    label: '커밋 수',
                    data: dailyData.data,
                    borderColor: linkColor,
                    backgroundColor: gradient,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: linkColor,
                    pointBorderColor: foregroundColor,
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: linkColor,
                    pointHoverBorderColor: foregroundColor,
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: foregroundColor,
                        bodyColor: foregroundColor,
                        borderColor: linkColor,
                        borderWidth: 2,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            title: function(tooltipItems) {
                                return tooltipItems[0].label;
                            },
                            label: function(tooltipItem) {
                                return \`커밋: \${tooltipItem.parsed.y}개\`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: foregroundColor,
                            maxTicksLimit: 15,
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: borderColor,
                            drawBorder: false
                        }
                    },
                    y: {
                        ticks: {
                            color: foregroundColor,
                            beginAtZero: true,
                            precision: 0,
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: borderColor,
                            drawBorder: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });

        // 파일별 커밋 도넛 차트
        const fileData = ${JSON.stringify(fileStatsData)};
        if (fileData.labels.length > 0) {
            const ctx2 = document.getElementById('fileStatsChart').getContext('2d');
            
            // 테마 호환 색상 팔레트
            const chartColors = [
                linkColor, 
                computedStyle.getPropertyValue('--vscode-terminal-ansiRed').trim() || '#FF6B6B',
                computedStyle.getPropertyValue('--vscode-terminal-ansiGreen').trim() || '#4ECDC4',
                computedStyle.getPropertyValue('--vscode-terminal-ansiBlue').trim() || '#45B7D1',
                computedStyle.getPropertyValue('--vscode-terminal-ansiMagenta').trim() || '#96CEB4',
                computedStyle.getPropertyValue('--vscode-terminal-ansiYellow').trim() || '#FECA57',
                computedStyle.getPropertyValue('--vscode-terminal-ansiCyan').trim() || '#FF9FF3',
                '#54A0FF', '#5F27CD', '#00D2D3'
            ];
            
            new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: fileData.labels,
                    datasets: [{
                        data: fileData.data,
                        backgroundColor: chartColors,
                        borderWidth: 3,
                        borderColor: computedStyle.getPropertyValue('--vscode-editor-background').trim(),
                        hoverBorderWidth: 4,
                        hoverOffset: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: foregroundColor,
                                padding: 20,
                                usePointStyle: true,
                                pointStyle: 'circle',
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            titleColor: foregroundColor,
                            bodyColor: foregroundColor,
                            cornerRadius: 8,
                            callbacks: {
                                label: function(tooltipItem) {
                                    const total = tooltipItem.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((tooltipItem.parsed / total) * 100).toFixed(1);
                                    return \`\${tooltipItem.label}: \${tooltipItem.parsed}개 (\${percentage}%)\`;
                                }
                            }
                        }
                    },
                    animation: {
                        animateRotate: true,
                        duration: 1500
                    },
                    cutout: '60%'
                }
            });
        } else {
            // 데이터가 없을 때
            document.getElementById('fileStatsChart').parentElement.innerHTML = 
                '<div class="empty-state" style="color: ' + foregroundColor + ';"><div class="empty-icon">📊</div><div>파일 데이터가 없습니다</div></div>';
        }

        // 작성자별 커밋 바 차트
        const authorData = ${JSON.stringify(authorStatsData)};
        if (authorData.labels.length > 0) {
            const ctx3 = document.getElementById('authorCommitsChart').getContext('2d');
            
            new Chart(ctx3, {
                type: 'bar',
                data: {
                    labels: authorData.labels,
                    datasets: [{
                        label: '커밋 수',
                        data: authorData.data,
                        backgroundColor: authorData.labels.map((_, index) => {
                            const colors = [
                                '#FFD700', '#C0C0C0', '#CD7F32', 
                                linkColor, 
                                computedStyle.getPropertyValue('--vscode-terminal-ansiRed').trim() || '#FF6B6B',
                                computedStyle.getPropertyValue('--vscode-terminal-ansiGreen').trim() || '#4ECDC4'
                            ];
                            return colors[index % colors.length];
                        }),
                        borderColor: authorData.labels.map((_, index) => {
                            const colors = [
                                '#FFA500', '#A0A0A0', '#B87333', 
                                linkColor, 
                                '#FF5252', '#26C6DA'
                            ];
                            return colors[index % colors.length];
                        }),
                        borderWidth: 2,
                        borderRadius: 6,
                        borderSkipped: false,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            titleColor: foregroundColor,
                            bodyColor: foregroundColor,
                            cornerRadius: 8,
                            callbacks: {
                                title: function(tooltipItems) {
                                    return tooltipItems[0].label;
                                },
                                label: function(tooltipItem) {
                                    const authorInfo = ${JSON.stringify(metrics.authorStats)};
                                    const author = authorInfo.find(a => a.name.includes(tooltipItem.label) || tooltipItem.label.includes(a.name.substring(0, 12)));
                                    return [
                                        \`커밋: \${tooltipItem.parsed.x}개\`,
                                        \`파일: \${author?.files || 0}개\`,
                                        \`기여도: \${author?.percentage || 0}%\`
                                    ];
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: foregroundColor,
                                beginAtZero: true,
                                precision: 0
                            },
                            grid: {
                                color: borderColor,
                                drawBorder: false
                            }
                        },
                        y: {
                            ticks: {
                                color: foregroundColor,
                                font: {
                                    size: 12
                                }
                            },
                            grid: {
                                display: false
                            }
                        }
                    },
                    animation: {
                        duration: 1200,
                        easing: 'easeInOutQuart'
                    }
                }
            });

            // 작성자별 기여도 파이 차트
            const ctx4 = document.getElementById('authorPieChart').getContext('2d');
            
            new Chart(ctx4, {
                type: 'pie',
                data: {
                    labels: authorData.labels.slice(0, 8), // 상위 8명만
                    datasets: [{
                        data: authorData.data.slice(0, 8),
                        backgroundColor: [
                            '#FFD700', '#C0C0C0', '#CD7F32', linkColor, 
                            computedStyle.getPropertyValue('--vscode-terminal-ansiRed').trim() || '#FF6B6B',
                            computedStyle.getPropertyValue('--vscode-terminal-ansiGreen').trim() || '#4ECDC4',
                            computedStyle.getPropertyValue('--vscode-terminal-ansiYellow').trim() || '#45B7D1',
                            computedStyle.getPropertyValue('--vscode-terminal-ansiMagenta').trim() || '#96CEB4'
                        ],
                        borderWidth: 3,
                        borderColor: computedStyle.getPropertyValue('--vscode-editor-background').trim(),
                        hoverBorderWidth: 4,
                        hoverOffset: 12
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: foregroundColor,
                                padding: 15,
                                usePointStyle: true,
                                pointStyle: 'circle',
                                font: {
                                    size: 11
                                },
                                generateLabels: function(chart) {
                                    const data = chart.data;
                                    const authorInfo = ${JSON.stringify(metrics.authorStats)};
                                    return data.labels.map((label, index) => {
                                        const author = authorInfo.find(a => a.name.includes(label) || label.includes(a.name.substring(0, 12)));
                                        return {
                                            text: \`\${label} (\${author?.percentage || 0}%)\`,
                                            fillStyle: data.datasets[0].backgroundColor[index],
                                            pointStyle: 'circle',
                                            hidden: false,
                                            index: index
                                        };
                                    });
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            titleColor: foregroundColor,
                            bodyColor: foregroundColor,
                            cornerRadius: 8,
                            callbacks: {
                                label: function(tooltipItem) {
                                    const authorInfo = ${JSON.stringify(metrics.authorStats)};
                                    const author = authorInfo.find(a => a.name.includes(tooltipItem.label) || tooltipItem.label.includes(a.name.substring(0, 12)));
                                    return [
                                        \`\${tooltipItem.label}\`,
                                        \`커밋: \${tooltipItem.parsed}개\`,
                                        \`기여도: \${author?.percentage || 0}%\`,
                                        \`파일: \${author?.files || 0}개\`
                                    ];
                                }
                            }
                        }
                    },
                    animation: {
                        animateRotate: true,
                        duration: 1800
                    }
                }
            });

            // 프로그래밍 언어 분포 차트
            const languageData = ${JSON.stringify(languageData)};
            if (languageData.labels.length > 0) {
                const ctx5 = document.getElementById('languageChart').getContext('2d');
                
                new Chart(ctx5, {
                    type: 'doughnut',
                    data: {
                        labels: languageData.labels,
                        datasets: [{
                            data: languageData.data,
                            backgroundColor: languageData.colors,
                            borderWidth: 3,
                            borderColor: computedStyle.getPropertyValue('--vscode-editor-background').trim(),
                            hoverBorderWidth: 4,
                            hoverOffset: 10
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    color: foregroundColor,
                                    padding: 15,
                                    usePointStyle: true,
                                    pointStyle: 'circle',
                                    font: {
                                        size: 11
                                    }
                                }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                titleColor: foregroundColor,
                                bodyColor: foregroundColor,
                                cornerRadius: 8,
                                callbacks: {
                                    label: function(tooltipItem) {
                                        const total = tooltipItem.dataset.data.reduce((a, b) => a + b, 0);
                                        const percentage = ((tooltipItem.parsed / total) * 100).toFixed(1);
                                        return \`\${tooltipItem.label}: \${tooltipItem.parsed} commits (\${percentage}%)\`;
                                    }
                                }
                            }
                        },
                        animation: {
                            animateRotate: true,
                            duration: 2000
                        },
                        cutout: '50%'
                    }
                });
            } else {
                document.getElementById('languageChart').parentElement.innerHTML = 
                    '<div class="empty-state" style="color: ' + foregroundColor + ';"><div class="empty-icon">💻</div><div>언어 데이터가 없습니다</div></div>';
            }

            // 카테고리별 활동 차트
            const categoryData = ${JSON.stringify(categoryData)};
            if (categoryData.labels.length > 0) {
                const ctx6 = document.getElementById('categoryChart').getContext('2d');
                
                new Chart(ctx6, {
                    type: 'bar',
                    data: {
                        labels: categoryData.labels,
                        datasets: [{
                            label: '커밋 수',
                            data: categoryData.data,
                            backgroundColor: categoryData.colors,
                            borderColor: categoryData.borderColors,
                            borderWidth: 2,
                            borderRadius: 8,
                            borderSkipped: false,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                titleColor: foregroundColor,
                                bodyColor: foregroundColor,
                                cornerRadius: 8,
                                callbacks: {
                                    label: function(tooltipItem) {
                                        return \`\${tooltipItem.label}: \${tooltipItem.parsed.y} commits\`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                ticks: {
                                    color: foregroundColor,
                                    font: {
                                        size: 11
                                    }
                                },
                                grid: {
                                    display: false
                                }
                            },
                            y: {
                                ticks: {
                                    color: foregroundColor,
                                    beginAtZero: true,
                                    precision: 0
                                },
                                grid: {
                                    color: borderColor,
                                    drawBorder: false
                                }
                            }
                        },
                        animation: {
                            duration: 1500,
                            easing: 'easeInOutQuart'
                        }
                    }
                });
            } else {
                document.getElementById('categoryChart').parentElement.innerHTML = 
                    '<div class="empty-state" style="color: ' + foregroundColor + ';"><div class="empty-icon">📊</div><div>카테고리 데이터가 없습니다</div></div>';
            }
        } else {
            // 데이터가 없을 때
            document.getElementById('authorCommitsChart').parentElement.innerHTML = 
                '<div class="empty-state" style="color: ' + foregroundColor + ';"><div class="empty-icon">👥</div><div>작성자 데이터가 없습니다</div></div>';
            document.getElementById('authorPieChart').parentElement.innerHTML = 
                '<div class="empty-state" style="color: ' + foregroundColor + ';"><div class="empty-icon">📊</div><div>기여도 데이터가 없습니다</div></div>';
            document.getElementById('languageChart').parentElement.innerHTML = 
                '<div class="empty-state" style="color: ' + foregroundColor + ';"><div class="empty-icon">💻</div><div>언어 데이터가 없습니다</div></div>';
            document.getElementById('categoryChart').parentElement.innerHTML = 
                '<div class="empty-state" style="color: ' + foregroundColor + ';"><div class="empty-icon">📊</div><div>카테고리 데이터가 없습니다</div></div>';
        }

        // 페이지 로드 완료 시 애니메이션
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('.metric-card').forEach((card, index) => {
                card.style.animationDelay = \`\${index * 0.1}s\`;
            });

            // 작성자 순위에 메달 스타일 적용
            document.querySelectorAll('.author-rank').forEach((rank, index) => {
                const rankNumber = index + 1;
                if (rankNumber === 1) {
                    rank.classList.add('gold');
                } else if (rankNumber === 2) {
                    rank.classList.add('silver');
                } else if (rankNumber === 3) {
                    rank.classList.add('bronze');
                }
            });
        });
    </script>
</body>
</html>`;
    }

    // 기존의 private 메서드들
    private prepareDailyCommitsData(dailyCommits: { [date: string]: number }, days: number) {
        const labels = [];
        const data = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            labels.push(date.toLocaleDateString('ko-KR', { 
                month: 'short', 
                day: 'numeric',
                weekday: 'short'
            }));
            data.push(dailyCommits[dateStr] || 0);
        }
        
        return { labels, data };
    }

    private prepareFileStatsData(fileStats: { [file: string]: number }) {
        const sortedFiles = Object.entries(fileStats)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
        
        if (sortedFiles.length === 0) {
            return { labels: [], data: [] };
        }
        
        const labels = sortedFiles.map(([file]) => {
            const fileName = file.split('/').pop() || file;
            return fileName.length > 15 ? fileName.substring(0, 15) + '...' : fileName;
        });
        const data = sortedFiles.map(([,commits]) => commits);
        
        return { labels, data };
    }

    private prepareAuthorStatsData(authorStats: any[]) {
        if (authorStats.length === 0) {
            return { labels: [], data: [] };
        }

        // 상위 10명의 작성자만 표시
        const topAuthors = authorStats.slice(0, 10);
        
        const labels = topAuthors.map(author => {
            const name = author.name.length > 12 ? author.name.substring(0, 12) + '...' : author.name;
            return name;
        });
        const data = topAuthors.map(author => author.commits);
        
        return { labels, data };
    }

    private prepareLanguageData(programmingLanguages: { [lang: string]: number }) {
        const sortedLanguages = Object.entries(programmingLanguages)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
        
        if (sortedLanguages.length === 0) {
            return { labels: [], data: [], colors: [] };
        }

        const labels = sortedLanguages.map(([lang]) => lang);
        const data = sortedLanguages.map(([,commits]) => commits);
        const colors = labels.map(lang => this.getLanguageColor(lang));
        
        return { labels, data, colors };
    }

    private prepareCategoryData(fileTypeStats: any[]) {
        const categories: { [category: string]: number } = {};
        
        for (const stat of fileTypeStats) {
            categories[stat.category] = (categories[stat.category] || 0) + stat.commits;
        }

        const sortedCategories = Object.entries(categories)
            .sort(([,a], [,b]) => b - a);
        
        if (sortedCategories.length === 0) {
            return { labels: [], data: [], colors: [], borderColors: [] };
        }

        const labels = sortedCategories.map(([category]) => category);
        const data = sortedCategories.map(([,commits]) => commits);
        
        const categoryColors: { [key: string]: { bg: string; border: string } } = {
            'Frontend': { bg: '#61DAFB', border: '#21B1D1' },
            'Backend': { bg: '#68A063', border: '#4A7C3A' },
            'Mobile': { bg: '#FF6B6B', border: '#FF4757' },
            'Database': { bg: '#F39C12', border: '#E67E22' },
            'Config': { bg: '#9B59B6', border: '#8E44AD' },
            'Documentation': { bg: '#3498DB', border: '#2980B9' },
            'Scripts': { bg: '#E74C3C', border: '#C0392B' },
            'Other': { bg: '#95A5A6', border: '#7F8C8D' }
        };

        const colors = labels.map(category => categoryColors[category]?.bg || '#95A5A6');
        const borderColors = labels.map(category => categoryColors[category]?.border || '#7F8C8D');
        
        return { labels, data, colors, borderColors };
    }

    private getFileTypeIcon(extension: string): string {
        const iconMap: { [ext: string]: string } = {
            'js': '🟨',
            'jsx': '⚛️',
            'ts': '🔷',
            'tsx': '⚛️',
            'vue': '💚',
            'svelte': '🧡',
            'py': '🐍',
            'java': '☕',
            'go': '🔵',
            'rs': '🦀',
            'php': '🐘',
            'rb': '💎',
            'cs': '🔵',
            'cpp': '⚪',
            'c': '⚪',
            'swift': '🍎',
            'dart': '🎯',
            'html': '🌐',
            'css': '🎨',
            'scss': '🎨',
            'sass': '🎨',
            'json': '📋',
            'xml': '📄',
            'yaml': '⚙️',
            'yml': '⚙️',
            'md': '📝',
            'txt': '📄',
            'sql': '🗃️',
            'sh': '🖥️',
            'bat': '🖥️',
            'no-ext': '❓'
        };
        
        return iconMap[extension] || '📄';
    }

    private getLanguageColor(language: string): string {
        const colorMap: { [lang: string]: string } = {
            'JavaScript': '#F7DF1E',
            'React': '#61DAFB',
            'TypeScript': '#3178C6',
            'React TypeScript': '#61DAFB',
            'Vue.js': '#4FC08D',
            'Svelte': '#FF3E00',
            'Python': '#3776AB',
            'Java': '#ED8B00',
            'Kotlin': '#7F52FF',
            'Go': '#00ADD8',
            'Rust': '#CE422B',
            'PHP': '#777BB4',
            'Ruby': '#CC342D',
            'C#': '#239120',
            'C++': '#00599C',
            'C': '#A8B9CC',
            'Swift': '#FA7343',
            'Dart': '#0175C2',
            'HTML': '#E34F26',
            'CSS': '#1572B6',
            'SCSS': '#CF649A',
            'Sass': '#CF649A',
            'JSON': '#000000',
            'XML': '#FF6600',
            'YAML': '#CB171E',
            'Markdown': '#083FA1',
            'SQL': '#4479A1',
            'Shell': '#89E051',
            'Batch': '#C1F12E',
            'PowerShell': '#012456'
        };
        
        return colorMap[language] || '#95A5A6';
    }
}