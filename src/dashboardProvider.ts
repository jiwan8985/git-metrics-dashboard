// import * as vscode from 'vscode';
// import { GitAnalyzer, MetricsData } from './gitAnalyzer';
// import { ReportGenerator, ReportOptions } from './reportGenerator';

// export class DashboardProvider {
//     private panel: vscode.WebviewPanel | undefined;
//     private reportGenerator: ReportGenerator;
//     private currentMetrics: MetricsData | undefined;
//     private currentPeriod: number = 30;

//     constructor(
//         private context: vscode.ExtensionContext,
//         private gitAnalyzer: GitAnalyzer
//     ) {
//         this.reportGenerator = new ReportGenerator(context);
//     }

//     async showDashboard() {
//         if (this.panel) {
//             this.panel.reveal();
//             return;
//         }

//         this.panel = vscode.window.createWebviewPanel(
//             'gitMetrics',
//             '📊 Git Metrics Dashboard',
//             vscode.ViewColumn.One,
//             {
//                 enableScripts: true,
//                 retainContextWhenHidden: true,
//                 localResourceRoots: [this.context.extensionUri]
//             }
//         );

//         this.panel.onDidDispose(() => {
//             this.panel = undefined;
//         });

//         // 웹뷰에서 Extension으로 메시지 수신
//         this.panel.webview.onDidReceiveMessage(
//             async message => {
//                 switch (message.command) {
//                     case 'refresh':
//                         await this.updateContent();
//                         break;
//                     case 'changeRange':
//                         await this.updateContent(message.days);
//                         break;
//                     case 'exportReport':
//                         await this.handleExportReport(message.options);
//                         break;
//                     case 'showExportDialog':
//                         await this.showExportDialog();
//                         break;
//                     case 'toggleTheme':
//                         await this.handleToggleTheme();
//                         break;
//                 }
//             },
//             undefined,
//             this.context.subscriptions
//         );

//         await this.updateContent();
//     }

//     // 테마 새로고침 기능
//     refreshTheme() {
//         if (this.panel && this.currentMetrics) {
//             const config = vscode.workspace.getConfiguration('gitMetrics');
//             const maxTopFiles = config.get<number>('maxTopFiles', 10);
//             this.panel.webview.html = this.generateAdvancedHTML(this.currentMetrics, this.currentPeriod, maxTopFiles);
//         }
//     }

//     // 테마 전환 처리
//     private async handleToggleTheme() {
//         const config = vscode.workspace.getConfiguration('gitMetrics');
//         const currentTheme = config.get<string>('theme', 'auto');
        
//         let nextTheme: string;
//         switch (currentTheme) {
//             case 'auto':
//                 nextTheme = 'light';
//                 break;
//             case 'light':
//                 nextTheme = 'dark';
//                 break;
//             case 'dark':
//                 nextTheme = 'auto';
//                 break;
//             default:
//                 nextTheme = 'auto';
//         }
        
//         await config.update('theme', nextTheme, vscode.ConfigurationTarget.Global);
//         this.refreshTheme();
        
//         const themeNames = { 'auto': '자동', 'light': '라이트', 'dark': '다크' };
//         vscode.window.showInformationMessage(`🎨 테마가 '${themeNames[nextTheme as keyof typeof themeNames]}'으로 변경되었습니다!`);
//     }

//     // 현재 테마 감지
//     private getCurrentTheme(): 'light' | 'dark' {
//         const config = vscode.workspace.getConfiguration('gitMetrics');
//         const themeConfig = config.get<string>('theme', 'auto');
        
//         if (themeConfig === 'light') return 'light';
//         if (themeConfig === 'dark') return 'dark';
        
//         // auto인 경우 VS Code의 현재 테마 감지
//         const colorTheme = vscode.window.activeColorTheme;
//         return colorTheme.kind === vscode.ColorThemeKind.Light ? 'light' : 'dark';
//     }

//     // 테마별 색상 정의
//     private getThemeColors(theme: 'light' | 'dark') {
//         if (theme === 'light') {
//             return {
//                 background: '#ffffff',
//                 foreground: '#24292e',
//                 secondaryBackground: '#f6f8fa',
//                 borderColor: '#e1e4e8',
//                 primaryColor: '#0366d6',
//                 successColor: '#28a745',
//                 warningColor: '#ffd33d',
//                 errorColor: '#d73a49',
//                 linkColor: '#0366d6',
//                 hoverBackground: '#f1f8ff',
//                 cardShadow: 'rgba(0, 0, 0, 0.1)',
//                 textMuted: '#586069',
//                 panelBorder: '#d0d7de'
//             };
//         } else {
//             return {
//                 background: '#0d1117',
//                 foreground: '#f0f6fc',
//                 secondaryBackground: '#161b22',
//                 borderColor: '#30363d',
//                 primaryColor: '#58a6ff',
//                 successColor: '#3fb950',
//                 warningColor: '#d29922',
//                 errorColor: '#f85149',
//                 linkColor: '#58a6ff',
//                 hoverBackground: '#21262d',
//                 cardShadow: 'rgba(0, 0, 0, 0.3)',
//                 textMuted: '#8b949e',
//                 panelBorder: '#30363d'
//             };
//         }
//     }

//     private async updateContent(days?: number) {
//         if (!this.panel) return;

//         try {
//             // 설정에서 기본값 읽기
//             const config = vscode.workspace.getConfiguration('gitMetrics');
//             const defaultPeriod = days || config.get<number>('defaultPeriod', 30);
//             const maxTopFiles = config.get<number>('maxTopFiles', 10);
            
//             this.currentPeriod = defaultPeriod;
            
//             vscode.window.showInformationMessage('📊 Git 데이터 분석 중...');
            
//             const commits = await this.gitAnalyzer.getCommitHistory(defaultPeriod);
//             const metrics = await this.gitAnalyzer.generateMetrics(commits);
            
//             this.currentMetrics = metrics; // 현재 메트릭 저장

//             this.panel.webview.html = this.generateAdvancedHTML(metrics, defaultPeriod, maxTopFiles);
            
//             vscode.window.showInformationMessage('✅ Git 메트릭 대시보드 업데이트 완료!');
//         } catch (error) {
//             vscode.window.showErrorMessage(`오류: ${error}`);
//         }
//     }

//     private async handleExportReport(options: ReportOptions) {
//         if (!this.currentMetrics) {
//             vscode.window.showErrorMessage('먼저 데이터를 로드해주세요.');
//             return;
//         }

//         try {
//             vscode.window.showInformationMessage('📄 리포트 생성 중...');
            
//             const result = await this.reportGenerator.generateReport(this.currentMetrics, options);
            
//             if (result.success && result.filePath) {
//                 const config = vscode.workspace.getConfiguration('gitMetrics');
//                 const autoOpen = config.get<boolean>('export.autoOpenAfterExport', false);
                
//                 if (autoOpen) {
//                     const doc = await vscode.workspace.openTextDocument(result.filePath);
//                     await vscode.window.showTextDocument(doc);
//                 } else {
//                     const action = await vscode.window.showInformationMessage(
//                         `✅ 리포트가 성공적으로 생성되었습니다!`,
//                         '파일 열기',
//                         '폴더에서 보기'
//                     );

//                     if (action === '파일 열기') {
//                         const doc = await vscode.workspace.openTextDocument(result.filePath);
//                         await vscode.window.showTextDocument(doc);
//                     } else if (action === '폴더에서 보기') {
//                         vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(result.filePath));
//                     }
//                 }
//             } else {
//                 vscode.window.showErrorMessage(result.error || '리포트 생성에 실패했습니다.');
//             }
//         } catch (error) {
//             vscode.window.showErrorMessage(`리포트 생성 오류: ${error}`);
//         }
//     }

//     private async showExportDialog() {
//         // Quick Pick을 사용한 간단한 옵션 선택
//         const format = await vscode.window.showQuickPick([
//             { label: '📄 HTML', description: '웹 브라우저에서 볼 수 있는 리포트', detail: 'html' },
//             { label: '📋 JSON', description: '프로그래밍적으로 처리 가능한 데이터', detail: 'json' },
//             { label: '📊 CSV', description: 'Excel에서 열 수 있는 표 형식', detail: 'csv' },
//             { label: '📝 Markdown', description: 'GitHub README 스타일 문서', detail: 'markdown' }
//         ], {
//             placeHolder: '내보내기 형식을 선택하세요'
//         });

//         if (!format) return;

//         const includeOptions = await vscode.window.showQuickPick([
//             { label: '📊 전체 리포트', description: '모든 섹션 포함', picked: true },
//             { label: '📋 요약만', description: '기본 통계만 포함' },
//             { label: '🎯 사용자 정의', description: '포함할 섹션 선택' }
//         ], {
//             placeHolder: '포함할 내용을 선택하세요'
//         });

//         if (!includeOptions) return;

//         let reportOptions: ReportOptions = {
//             format: format.detail as any,
//             includeSummary: true,
//             includeCharts: true,
//             includeFileStats: true,
//             includeAuthorStats: true,
//             includeTimeAnalysis: true,
//             period: this.currentPeriod
//         };

//         if (includeOptions.label === '📋 요약만') {
//             reportOptions = {
//                 ...reportOptions,
//                 includeCharts: false,
//                 includeFileStats: false,
//                 includeAuthorStats: false,
//                 includeTimeAnalysis: false
//             };
//         } else if (includeOptions.label === '🎯 사용자 정의') {
//             const sections = await vscode.window.showQuickPick([
//                 { label: '📋 요약 통계', picked: true, detail: 'includeSummary' },
//                 { label: '👥 개발자별 통계', picked: true, detail: 'includeAuthorStats' },
//                 { label: '📁 파일 타입별 분석', picked: true, detail: 'includeFileStats' },
//                 { label: '⏰ 시간대별 분석', picked: true, detail: 'includeTimeAnalysis' }
//             ], {
//                 placeHolder: '포함할 섹션을 선택하세요 (다중 선택 가능)',
//                 canPickMany: true
//             });

//             if (!sections) return;

//             reportOptions.includeSummary = sections.some(s => s.detail === 'includeSummary');
//             reportOptions.includeAuthorStats = sections.some(s => s.detail === 'includeAuthorStats');
//             reportOptions.includeFileStats = sections.some(s => s.detail === 'includeFileStats');
//             reportOptions.includeTimeAnalysis = sections.some(s => s.detail === 'includeTimeAnalysis');
//         }

//         await this.handleExportReport(reportOptions);
//     }

//     private generateAdvancedHTML(metrics: MetricsData, days: number, maxTopFiles: number): string {
//         const dailyCommitsData = this.prepareDailyCommitsData(metrics.dailyCommits, days);
//         const fileStatsData = this.prepareFileStatsData(metrics.fileStats);
//         const authorStatsData = this.prepareAuthorStatsData(metrics.authorStats);
//         const languageData = this.prepareLanguageData(metrics.programmingLanguages);
//         const categoryData = this.prepareCategoryData(metrics.fileTypeStats);
        
//         // 현재 테마 가져오기
//         const currentTheme = this.getCurrentTheme();
//         const colors = this.getThemeColors(currentTheme);
//         const config = vscode.workspace.getConfiguration('gitMetrics');
//         const themeConfig = config.get<string>('theme', 'auto');
        
//         const themeButtonText = {
//             'auto': '🔄 자동',
//             'light': '☀️ 라이트',
//             'dark': '🌙 다크'
//         }[themeConfig] || '🔄 자동';

//         return `<!DOCTYPE html>
// <html>
// <head>
//     <meta charset="UTF-8">
//     <title>Git Metrics Dashboard</title>
//     <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
//     <style>
//         :root {
//             --bg-color: ${colors.background};
//             --text-color: ${colors.foreground};
//             --secondary-bg: ${colors.secondaryBackground};
//             --border-color: ${colors.borderColor};
//             --primary-color: ${colors.primaryColor};
//             --success-color: ${colors.successColor};
//             --warning-color: ${colors.warningColor};
//             --error-color: ${colors.errorColor};
//             --link-color: ${colors.linkColor};
//             --hover-bg: ${colors.hoverBackground};
//             --card-shadow: ${colors.cardShadow};
//             --text-muted: ${colors.textMuted};
//             --panel-border: ${colors.panelBorder};
//         }

//         body {
//             font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
//             margin: 0;
//             padding: 20px;
//             background: var(--bg-color);
//             color: var(--text-color);
//             line-height: 1.6;
//             transition: all 0.3s ease;
//         }
        
//         .header {
//             display: flex;
//             justify-content: space-between;
//             align-items: center;
//             margin-bottom: 30px;
//             padding-bottom: 20px;
//             border-bottom: 2px solid var(--primary-color);
//         }
        
//         .title {
//             margin: 0;
//             color: var(--primary-color);
//             font-size: 28px;
//             font-weight: 700;
//         }
        
//         .controls {
//             display: flex;
//             gap: 8px;
//             align-items: center;
//             flex-wrap: wrap;
//         }
        
//         .btn {
//             background: var(--secondary-bg);
//             color: var(--text-color);
//             border: 1px solid var(--border-color);
//             padding: 10px 16px;
//             border-radius: 6px;
//             cursor: pointer;
//             font-size: 14px;
//             font-weight: 500;
//             transition: all 0.2s ease;
//             user-select: none;
//         }
        
//         .btn:hover {
//             background: var(--hover-bg);
//             transform: translateY(-1px);
//             border-color: var(--primary-color);
//         }
        
//         .btn.active {
//             background: var(--primary-color);
//             color: ${currentTheme === 'light' ? '#ffffff' : '#000000'};
//             border-color: var(--primary-color);
//         }
        
//         .btn.refresh {
//             background: var(--success-color);
//             color: ${currentTheme === 'light' ? '#ffffff' : '#000000'};
//             border: 1px solid var(--success-color);
//         }
        
//         .btn.refresh:hover {
//             background: var(--success-color);
//             opacity: 0.8;
//         }
        
//         .btn.export {
//             background: var(--primary-color);
//             color: ${currentTheme === 'light' ? '#ffffff' : '#000000'};
//             margin-left: 12px;
//             border: 1px solid var(--primary-color);
//         }
        
//         .btn.export:hover {
//             background: var(--primary-color);
//             opacity: 0.8;
//         }
        
//         .btn.theme {
//             background: var(--warning-color);
//             color: ${currentTheme === 'light' ? '#000000' : '#000000'};
//             border: 1px solid var(--warning-color);
//         }
        
//         .btn.theme:hover {
//             background: var(--warning-color);
//             opacity: 0.8;
//         }
        
//         .dashboard-grid {
//             display: grid;
//             grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
//             gap: 20px;
//             margin-bottom: 30px;
//         }
        
//         .metric-card {
//             background: var(--secondary-bg);
//             border: 1px solid var(--border-color);
//             border-radius: 12px;
//             padding: 24px;
//             box-shadow: 0 4px 16px var(--card-shadow);
//             transition: all 0.3s ease;
//             position: relative;
//             overflow: hidden;
//         }
        
//         .metric-card::before {
//             content: '';
//             position: absolute;
//             top: 0;
//             left: 0;
//             right: 0;
//             height: 4px;
//             background: linear-gradient(90deg, var(--primary-color), var(--success-color));
//         }
        
//         .metric-card:hover {
//             transform: translateY(-4px);
//             box-shadow: 0 8px 24px var(--card-shadow);
//             border-color: var(--primary-color);
//             background: var(--hover-bg);
//         }
        
//         .metric-title {
//             font-size: 16px;
//             font-weight: 600;
//             margin-bottom: 16px;
//             color: var(--text-color);
//             display: flex;
//             align-items: center;
//             gap: 8px;
//         }
        
//         .metric-value {
//             font-size: 42px;
//             font-weight: 900;
//             color: var(--success-color);
//             margin-bottom: 8px;
//             text-shadow: 0 2px 4px var(--card-shadow);
//         }
        
//         .metric-subtitle {
//             font-size: 14px;
//             color: var(--text-muted);
//             opacity: 0.8;
//         }
        
//         .chart-container {
//             width: 100%;
//             height: 350px;
//             margin: 20px 0;
//             padding: 10px;
//         }
        
//         .large-chart {
//             grid-column: 1 / -1;
//             height: auto;
//         }
        
//         .large-chart .chart-container {
//             height: 400px;
//         }
        
//         .file-list {
//             list-style: none;
//             padding: 0;
//             max-height: 320px;
//             overflow-y: auto;
//         }
        
//         .file-item {
//             display: flex;
//             justify-content: space-between;
//             align-items: center;
//             padding: 14px 0;
//             border-bottom: 1px solid var(--border-color);
//             transition: all 0.2s ease;
//         }
        
//         .file-item:hover {
//             background-color: var(--hover-bg);
//             margin: 0 -16px;
//             padding-left: 16px;
//             padding-right: 16px;
//             border-radius: 6px;
//         }
        
//         .file-name {
//             color: var(--text-color);
//             font-weight: 500;
//             display: flex;
//             align-items: center;
//             gap: 8px;
//         }
        
//         .file-index {
//             background: var(--primary-color);
//             color: ${currentTheme === 'light' ? '#ffffff' : '#000000'};
//             border-radius: 50%;
//             width: 24px;
//             height: 24px;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             font-size: 12px;
//             font-weight: bold;
//             flex-shrink: 0;
//         }
        
//         .commit-count {
//             color: var(--primary-color);
//             font-weight: bold;
//             background: var(--secondary-bg);
//             padding: 6px 12px;
//             border-radius: 16px;
//             font-size: 12px;
//             border: 1px solid var(--primary-color);
//         }
        
//         .loading {
//             text-align: center;
//             padding: 60px;
//             color: var(--text-muted);
//             font-size: 18px;
//         }
        
//         .stats-highlight {
//             color: var(--success-color);
//             background: linear-gradient(135deg, var(--success-color), var(--primary-color));
//             -webkit-background-clip: text;
//             -webkit-text-fill-color: transparent;
//             background-clip: text;
//             display: inline-block;
//         }
        
//         @supports not (background-clip: text) {
//             .stats-highlight {
//                 background: none !important;
//                 -webkit-background-clip: unset !important;
//                 -webkit-text-fill-color: unset !important;
//                 color: var(--success-color) !important;
//             }
//         }
        
//         .empty-state {
//             text-align: center;
//             padding: 40px;
//             color: var(--text-muted);
//         }
        
//         .empty-icon {
//             font-size: 48px;
//             margin-bottom: 16px;
//             opacity: 0.6;
//         }
        
//         @keyframes fadeIn {
//             from { opacity: 0; transform: translateY(20px); }
//             to { opacity: 1; transform: translateY(0); }
//         }
        
//         .metric-card {
//             animation: fadeIn 0.5s ease-out;
//         }
        
//         /* 작성자별 통계 스타일 */
//         .author-list {
//             max-height: 400px;
//             overflow-y: auto;
//             padding: 0;
//         }
        
//         .author-item {
//             display: flex;
//             justify-content: space-between;
//             align-items: center;
//             padding: 16px 0;
//             border-bottom: 1px solid var(--border-color);
//             transition: all 0.2s ease;
//         }
        
//         .author-item:hover {
//             background-color: var(--hover-bg);
//             margin: 0 -16px;
//             padding-left: 16px;
//             padding-right: 16px;
//             border-radius: 8px;
//         }
        
//         .author-info {
//             display: flex;
//             align-items: center;
//             gap: 12px;
//             flex: 1;
//         }
        
//         .author-rank {
//             background: linear-gradient(135deg, var(--primary-color), var(--success-color));
//             color: ${currentTheme === 'light' ? '#ffffff' : '#000000'};
//             border-radius: 50%;
//             width: 32px;
//             height: 32px;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             font-size: 14px;
//             font-weight: bold;
//             flex-shrink: 0;
//         }
        
//         .author-rank.gold {
//             background: linear-gradient(135deg, #FFD700, #FFA500);
//             color: #000;
//         }
        
//         .author-rank.silver {
//             background: linear-gradient(135deg, #C0C0C0, #A0A0A0);
//             color: #000;
//         }
        
//         .author-rank.bronze {
//             background: linear-gradient(135deg, #CD7F32, #B87333);
//             color: #fff;
//         }
        
//         .author-details {
//             flex: 1;
//         }
        
//         .author-name {
//             font-weight: 600;
//             color: var(--text-color);
//             margin-bottom: 4px;
//             font-size: 15px;
//         }
        
//         .author-meta {
//             font-size: 12px;
//             color: var(--text-muted);
//             opacity: 0.8;
//         }
        
//         .author-stats {
//             display: flex;
//             align-items: center;
//             gap: 12px;
//             min-width: 120px;
//         }
        
//         .contribution-bar {
//             width: 80px;
//             height: 8px;
//             background: var(--border-color);
//             border-radius: 4px;
//             overflow: hidden;
//         }
        
//         .contribution-fill {
//             height: 100%;
//             background: linear-gradient(90deg, var(--success-color), var(--primary-color));
//             border-radius: 4px;
//             transition: width 0.3s ease;
//         }
        
//         .contribution-percent {
//             font-weight: bold;
//             color: var(--primary-color);
//             font-size: 14px;
//             min-width: 40px;
//             text-align: right;
//         }
        
//         /* 파일 타입별 통계 스타일 */
//         .file-type-list {
//             max-height: 400px;
//             overflow-y: auto;
//             padding: 0;
//         }
        
//         .file-type-item {
//             display: flex;
//             justify-content: space-between;
//             align-items: center;
//             padding: 12px 0;
//             border-bottom: 1px solid var(--border-color);
//             transition: all 0.2s ease;
//         }
        
//         .file-type-item:hover {
//             background-color: var(--hover-bg);
//             margin: 0 -12px;
//             padding-left: 12px;
//             padding-right: 12px;
//             border-radius: 6px;
//         }
        
//         .file-type-info {
//             display: flex;
//             align-items: center;
//             gap: 12px;
//             flex: 1;
//         }
        
//         .file-type-rank {
//             background: var(--primary-color);
//             color: ${currentTheme === 'light' ? '#ffffff' : '#000000'};
//             border-radius: 50%;
//             width: 24px;
//             height: 24px;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             font-size: 11px;
//             font-weight: bold;
//             flex-shrink: 0;
//         }
        
//         .file-type-details {
//             flex: 1;
//         }
        
//         .file-type-name {
//             font-weight: 600;
//             color: var(--text-color);
//             margin-bottom: 4px;
//             font-size: 14px;
//             display: flex;
//             align-items: center;
//             gap: 8px;
//         }
        
//         .language-tag {
//             background: var(--secondary-bg);
//             color: var(--text-color);
//             padding: 2px 6px;
//             border-radius: 8px;
//             font-size: 10px;
//             font-weight: 500;
//             border: 1px solid var(--border-color);
//         }
        
//         .file-type-meta {
//             font-size: 11px;
//             color: var(--text-muted);
//             opacity: 0.8;
//         }
        
//         .file-type-stats {
//             display: flex;
//             align-items: center;
//             gap: 8px;
//             min-width: 100px;
//         }
        
//         .file-type-bar {
//             width: 60px;
//             height: 6px;
//             background: var(--border-color);
//             border-radius: 3px;
//             overflow: hidden;
//         }
        
//         .file-type-fill {
//             height: 100%;
//             border-radius: 3px;
//             transition: width 0.3s ease;
//         }
        
//         .file-type-percent {
//             font-weight: bold;
//             color: var(--primary-color);
//             font-size: 12px;
//             min-width: 35px;
//             text-align: right;
//         }
//     </style>
// </head>
// <body>
//     <div class="header">
//         <h1 class="title">📊 Git Metrics Dashboard</h1>
//         <div class="controls">
//             <button class="btn ${days === 7 ? 'active' : ''}" onclick="changePeriod(7)">7일</button>
//             <button class="btn ${days === 30 ? 'active' : ''}" onclick="changePeriod(30)">30일</button>
//             <button class="btn ${days === 90 ? 'active' : ''}" onclick="changePeriod(90)">90일</button>
//             <button class="btn refresh" onclick="refresh()">🔄 새로고침</button>
//             <button class="btn theme" onclick="toggleTheme()">${themeButtonText}</button>
//             <button class="btn export" onclick="exportReport()">📄 리포트 내보내기</button>
//         </div>
//     </div>
    
//     <div class="dashboard-grid">
//         <div class="metric-card">
//             <div class="metric-title">🔥 총 커밋 수</div>
//             <div class="metric-value stats-highlight">${metrics.totalCommits}</div>
//             <div class="metric-subtitle">최근 ${days}일 동안</div>
//         </div>
        
//         <div class="metric-card">
//             <div class="metric-title">📁 수정된 파일</div>
//             <div class="metric-value stats-highlight">${metrics.totalFiles}</div>
//             <div class="metric-subtitle">고유 파일 수</div>
//         </div>
        
//         <div class="metric-card">
//             <div class="metric-title">📊 일평균 커밋</div>
//             <div class="metric-value stats-highlight">${(metrics.totalCommits / days).toFixed(1)}</div>
//             <div class="metric-subtitle">commits/day</div>
//         </div>
        
//         <div class="metric-card">
//             <div class="metric-title">🏆 최고 기록</div>
//             <div class="metric-value stats-highlight">${Math.max(...Object.values(metrics.dailyCommits), 0)}</div>
//             <div class="metric-subtitle">하루 최대 커밋</div>
//         </div>
        
//         <div class="metric-card">
//             <div class="metric-title">👥 활성 개발자</div>
//             <div class="metric-value stats-highlight">${metrics.totalAuthors}</div>
//             <div class="metric-subtitle">참여 인원</div>
//         </div>
        
//         <div class="metric-card">
//             <div class="metric-title">🥇 TOP 기여자</div>
//             <div class="metric-value stats-highlight" style="font-size: 24px;">${metrics.topAuthor}</div>
//             <div class="metric-subtitle">${metrics.authorStats[0]?.commits || 0} commits</div>
//         </div>
        
//         <div class="metric-card">
//             <div class="metric-title">📁 주력 언어</div>
//             <div class="metric-value stats-highlight" style="font-size: 24px;">${metrics.topFileType}</div>
//             <div class="metric-subtitle">${metrics.fileTypeStats[0]?.commits || 0} commits</div>
//         </div>
//     </div>

//     <div class="metric-card large-chart">
//         <div class="metric-title">📈 일별 커밋 추이 - 최근 ${days}일</div>
//         <div class="chart-container">
//             <canvas id="dailyCommitsChart"></canvas>
//         </div>
//     </div>

//     <!-- 작성자별 통계 섹션 -->
//     <div class="metric-card large-chart">
//         <div class="metric-title">👥 작성자별 기여도 분석</div>
//         <div class="dashboard-grid" style="margin-bottom: 0;">
//             <div style="grid-column: 1 / -1;">
//                 <div class="chart-container" style="height: 300px;">
//                     <canvas id="authorCommitsChart"></canvas>
//                 </div>
//             </div>
//         </div>
//     </div>

//     <!-- 파일 타입별 분석 섹션 -->
//     <div class="metric-card large-chart">
//         <div class="metric-title">📁 파일 타입별 분석 & 기술 스택</div>
//         <div class="dashboard-grid" style="margin-bottom: 20px;">
//             <div class="metric-card" style="margin: 0;">
//                 <div class="metric-title">💻 프로그래밍 언어 분포</div>
//                 <div class="chart-container" style="height: 300px;">
//                     <canvas id="languageChart"></canvas>
//                 </div>
//             </div>
//             <div class="metric-card" style="margin: 0;">
//                 <div class="metric-title">📊 카테고리별 활동</div>
//                 <div class="chart-container" style="height: 300px;">
//                     <canvas id="categoryChart"></canvas>
//                 </div>
//             </div>
//         </div>
//     </div>

//     <div class="dashboard-grid">
//         <div class="metric-card">
//             <div class="metric-title">🏆 개발자 순위 & 상세 통계</div>
//             <div class="author-list">
//                 ${metrics.authorStats.length > 0 
//                     ? metrics.authorStats.slice(0, 10).map(author => 
//                         `<div class="author-item">
//                             <div class="author-info">
//                                 <div class="author-rank">${author.rank}</div>
//                                 <div class="author-details">
//                                     <div class="author-name">👤 ${author.name}</div>
//                                     <div class="author-meta">
//                                         ${author.commits} commits • ${author.files} files • 
//                                         +${author.insertions}/-${author.deletions} lines
//                                     </div>
//                                 </div>
//                             </div>
//                             <div class="author-stats">
//                                 <div class="contribution-bar">
//                                     <div class="contribution-fill" style="width: ${author.percentage}%;"></div>
//                                 </div>
//                                 <div class="contribution-percent">${author.percentage}%</div>
//                             </div>
//                         </div>`
//                     ).join('')
//                     : '<div class="empty-state"><div class="empty-icon">👥</div><div>작성자 데이터가 없습니다</div></div>'
//                 }
//             </div>
//         </div>

//         <div class="metric-card">
//             <div class="metric-title">📁 파일 타입 순위 TOP 15</div>
//             <div class="file-type-list">
//                 ${metrics.fileTypeStats.length > 0 
//                     ? metrics.fileTypeStats.slice(0, 15).map((item, index) => 
//                         `<div class="file-type-item">
//                             <div class="file-type-info">
//                                 <div class="file-type-rank">${index + 1}</div>
//                                 <div class="file-type-details">
//                                     <div class="file-type-name">
//                                         ${this.getFileTypeIcon(item.extension)} .${item.extension}
//                                         <span class="language-tag">${item.language}</span>
//                                     </div>
//                                     <div class="file-type-meta">
//                                         ${item.commits} commits • ${item.files} files • ${item.category}
//                                     </div>
//                                 </div>
//                             </div>
//                             <div class="file-type-stats">
//                                 <div class="file-type-bar">
//                                     <div class="file-type-fill" style="width: ${item.percentage}%; background: ${this.getLanguageColor(item.language)};"></div>
//                                 </div>
//                                 <div class="file-type-percent">${item.percentage}%</div>
//                             </div>
//                         </div>`
//                     ).join('')
//                     : '<div class="empty-state"><div class="empty-icon">📁</div><div>파일 타입 데이터가 없습니다</div></div>'
//                 }
//             </div>
//         </div>
//     </div>

//     <div class="dashboard-grid">
//         <div class="metric-card">
//             <div class="metric-title">🏆 이번 주 HOT 파일 TOP ${maxTopFiles}</div>
//             ${metrics.thisWeekTopFiles.length > 0 
//                 ? `<ul class="file-list">
//                     ${metrics.thisWeekTopFiles.slice(0, maxTopFiles).map((item, index) => 
//                         `<li class="file-item">
//                             <span class="file-name">
//                                 <span class="file-index">${index + 1}</span>
//                                 📄 ${item.file}
//                             </span>
//                             <span class="commit-count">${item.commits}</span>
//                         </li>`
//                     ).join('')}
//                    </ul>`
//                 : `<div class="empty-state">
//                      <div class="empty-icon">😴</div>
//                      <div>이번 주 커밋이 없습니다</div>
//                    </div>`
//             }
//         </div>

//         <div class="metric-card">
//             <div class="metric-title">📊 파일별 커밋 분포 (상위 10개)</div>
//             <div class="chart-container">
//                 <canvas id="fileStatsChart"></canvas>
//             </div>
//         </div>
//     </div>

//     <div class="dashboard-grid">
//         <div class="metric-card">
//             <div class="metric-title">📊 기여도 분포</div>
//             <div class="chart-container">
//                 <canvas id="authorPieChart"></canvas>
//             </div>
//         </div>
//     </div>

//     <script>
//         const vscode = acquireVsCodeApi();
        
//         // 차트 색상 설정
//         const chartColors = {
//             primary: '${colors.primaryColor}',
//             success: '${colors.successColor}',
//             warning: '${colors.warningColor}',
//             error: '${colors.errorColor}',
//             text: '${colors.foreground}',
//             border: '${colors.borderColor}',
//             background: '${colors.background}',
//             secondary: '${colors.secondaryBackground}'
//         };
        
//         // 컨트롤 함수들
//         function refresh() {
//             vscode.postMessage({
//                 command: 'refresh'
//             });
//         }

//         function changePeriod(days) {
//             // 버튼 활성화 상태 변경
//             document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
//             event.target.classList.add('active');
            
//             vscode.postMessage({
//                 command: 'changeRange',
//                 days: days
//             });
//         }

//         function exportReport() {
//             vscode.postMessage({
//                 command: 'showExportDialog'
//             });
//         }

//         function toggleTheme() {
//             vscode.postMessage({
//                 command: 'toggleTheme'
//             });
//         }

//         // 일별 커밋 라인 차트
//         const dailyData = ${JSON.stringify(dailyCommitsData)};
//         const ctx1 = document.getElementById('dailyCommitsChart').getContext('2d');
        
//         const gradient = ctx1.createLinearGradient(0, 0, 0, 300);
//         gradient.addColorStop(0, chartColors.primary + '4D'); // 30% opacity
//         gradient.addColorStop(1, chartColors.primary + '0D'); // 5% opacity
        
//         new Chart(ctx1, {
//             type: 'line',
//             data: {
//                 labels: dailyData.labels,
//                 datasets: [{
//                     label: '커밋 수',
//                     data: dailyData.data,
//                     borderColor: chartColors.primary,
//                     backgroundColor: gradient,
//                     tension: 0.4,
//                     fill: true,
//                     pointBackgroundColor: chartColors.primary,
//                     pointBorderColor: chartColors.text,
//                     pointBorderWidth: 2,
//                     pointRadius: 4,
//                     pointHoverRadius: 6,
//                     pointHoverBackgroundColor: chartColors.primary,
//                     pointHoverBorderColor: chartColors.text,
//                     borderWidth: 3
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 plugins: {
//                     legend: {
//                         display: false
//                     },
//                     tooltip: {
//                         backgroundColor: 'rgba(0, 0, 0, 0.9)',
//                         titleColor: chartColors.text,
//                         bodyColor: chartColors.text,
//                         borderColor: chartColors.primary,
//                         borderWidth: 2,
//                         cornerRadius: 8,
//                         displayColors: false,
//                         callbacks: {
//                             title: function(tooltipItems) {
//                                 return tooltipItems[0].label;
//                             },
//                             label: function(tooltipItem) {
//                                 return \`커밋: \${tooltipItem.parsed.y}개\`;
//                             }
//                         }
//                     }
//                 },
//                 scales: {
//                     x: {
//                         ticks: {
//                             color: chartColors.text,
//                             maxTicksLimit: 15,
//                             font: {
//                                 size: 12
//                             }
//                         },
//                         grid: {
//                             color: chartColors.border,
//                             drawBorder: false
//                         }
//                     },
//                     y: {
//                         ticks: {
//                             color: chartColors.text,
//                             beginAtZero: true,
//                             precision: 0,
//                             font: {
//                                 size: 12
//                             }
//                         },
//                         grid: {
//                             color: chartColors.border,
//                             drawBorder: false
//                         }
//                     }
//                 },
//                 interaction: {
//                     intersect: false,
//                     mode: 'index'
//                 },
//                 animation: {
//                     duration: 1000,
//                     easing: 'easeInOutQuart'
//                 }
//             }
//         });

//         // 파일별 커밋 도넛 차트
//         const fileData = ${JSON.stringify(fileStatsData)};
//         if (fileData.labels.length > 0) {
//             const ctx2 = document.getElementById('fileStatsChart').getContext('2d');
            
//             // 테마 호환 색상 팔레트
//             const fileChartColors = [
//                 chartColors.primary, 
//                 chartColors.success,
//                 '#FF6B6B',
//                 '#4ECDC4',
//                 '#45B7D1',
//                 '#96CEB4',
//                 '#FECA57',
//                 '#FF9FF3',
//                 '#54A0FF', 
//                 '#5F27CD', 
//                 '#00D2D3'
//             ];
            
//             new Chart(ctx2, {
//                 type: 'doughnut',
//                 data: {
//                     labels: fileData.labels,
//                     datasets: [{
//                         data: fileData.data,
//                         backgroundColor: fileChartColors,
//                         borderWidth: 3,
//                         borderColor: chartColors.background,
//                         hoverBorderWidth: 4,
//                         hoverOffset: 8
//                     }]
//                 },
//                 options: {
//                     responsive: true,
//                     maintainAspectRatio: false,
//                     plugins: {
//                         legend: {
//                             position: 'bottom',
//                             labels: {
//                                 color: chartColors.text,
//                                 padding: 20,
//                                 usePointStyle: true,
//                                 pointStyle: 'circle',
//                                 font: {
//                                     size: 12
//                                 }
//                             }
//                         },
//                         tooltip: {
//                             backgroundColor: 'rgba(0, 0, 0, 0.9)',
//                             titleColor: chartColors.text,
//                             bodyColor: chartColors.text,
//                             cornerRadius: 8,
//                             callbacks: {
//                                 label: function(tooltipItem) {
//                                     const total = tooltipItem.dataset.data.reduce((a, b) => a + b, 0);
//                                     const percentage = ((tooltipItem.parsed / total) * 100).toFixed(1);
//                                     return \`\${tooltipItem.label}: \${tooltipItem.parsed}개 (\${percentage}%)\`;
//                                 }
//                             }
//                         }
//                     },
//                     animation: {
//                         animateRotate: true,
//                         duration: 1500
//                     },
//                     cutout: '60%'
//                 }
//             });
//         } else {
//             document.getElementById('fileStatsChart').parentElement.innerHTML = 
//                 '<div class="empty-state"><div class="empty-icon">📊</div><div>파일 데이터가 없습니다</div></div>';
//         }

//         // 작성자별 커밋 바 차트
//         const authorData = ${JSON.stringify(authorStatsData)};
//         if (authorData.labels.length > 0) {
//             const ctx3 = document.getElementById('authorCommitsChart').getContext('2d');
            
//             new Chart(ctx3, {
//                 type: 'bar',
//                 data: {
//                     labels: authorData.labels,
//                     datasets: [{
//                         label: '커밋 수',
//                         data: authorData.data,
//                         backgroundColor: authorData.labels.map((_, index) => {
//                             const colors = [
//                                 '#FFD700', '#C0C0C0', '#CD7F32', 
//                                 chartColors.primary, 
//                                 '#FF6B6B',
//                                 '#4ECDC4'
//                             ];
//                             return colors[index % colors.length];
//                         }),
//                         borderColor: authorData.labels.map((_, index) => {
//                             const colors = [
//                                 '#FFA500', '#A0A0A0', '#B87333', 
//                                 chartColors.primary, 
//                                 '#FF5252', '#26C6DA'
//                             ];
//                             return colors[index % colors.length];
//                         }),
//                         borderWidth: 2,
//                         borderRadius: 6,
//                         borderSkipped: false,
//                     }]
//                 },
//                 options: {
//                     responsive: true,
//                     maintainAspectRatio: false,
//                     indexAxis: 'y',
//                     plugins: {
//                         legend: {
//                             display: false
//                         },
//                         tooltip: {
//                             backgroundColor: 'rgba(0, 0, 0, 0.9)',
//                             titleColor: chartColors.text,
//                             bodyColor: chartColors.text,
//                             cornerRadius: 8,
//                             callbacks: {
//                                 title: function(tooltipItems) {
//                                     return tooltipItems[0].label;
//                                 },
//                                 label: function(tooltipItem) {
//                                     const authorInfo = ${JSON.stringify(metrics.authorStats)};
//                                     const author = authorInfo.find(a => a.name.includes(tooltipItem.label) || tooltipItem.label.includes(a.name.substring(0, 12)));
//                                     return [
//                                         \`커밋: \${tooltipItem.parsed.x}개\`,
//                                         \`파일: \${author?.files || 0}개\`,
//                                         \`기여도: \${author?.percentage || 0}%\`
//                                     ];
//                                 }
//                             }
//                         }
//                     },
//                     scales: {
//                         x: {
//                             ticks: {
//                                 color: chartColors.text,
//                                 beginAtZero: true,
//                                 precision: 0
//                             },
//                             grid: {
//                                 color: chartColors.border,
//                                 drawBorder: false
//                             }
//                         },
//                         y: {
//                             ticks: {
//                                 color: chartColors.text,
//                                 font: {
//                                     size: 12
//                                 }
//                             },
//                             grid: {
//                                 display: false
//                             }
//                         }
//                     },
//                     animation: {
//                         duration: 1200,
//                         easing: 'easeInOutQuart'
//                     }
//                 }
//             });

//             // 작성자별 기여도 파이 차트
//             const ctx4 = document.getElementById('authorPieChart').getContext('2d');
            
//             new Chart(ctx4, {
//                 type: 'pie',
//                 data: {
//                     labels: authorData.labels.slice(0, 8), // 상위 8명만
//                     datasets: [{
//                         data: authorData.data.slice(0, 8),
//                         backgroundColor: [
//                             '#FFD700', '#C0C0C0', '#CD7F32', chartColors.primary, 
//                             '#FF6B6B',
//                             '#4ECDC4',
//                             '#45B7D1',
//                             '#96CEB4'
//                         ],
//                         borderWidth: 3,
//                         borderColor: chartColors.background,
//                         hoverBorderWidth: 4,
//                         hoverOffset: 12
//                     }]
//                 },
//                 options: {
//                     responsive: true,
//                     maintainAspectRatio: false,
//                     plugins: {
//                         legend: {
//                             position: 'bottom',
//                             labels: {
//                                 color: chartColors.text,
//                                 padding: 15,
//                                 usePointStyle: true,
//                                 pointStyle: 'circle',
//                                 font: {
//                                     size: 11
//                                 },
//                                 generateLabels: function(chart) {
//                                     const data = chart.data;
//                                     const authorInfo = ${JSON.stringify(metrics.authorStats)};
//                                     return data.labels.map((label, index) => {
//                                         const author = authorInfo.find(a => a.name.includes(label) || label.includes(a.name.substring(0, 12)));
//                                         return {
//                                             text: \`\${label} (\${author?.percentage || 0}%)\`,
//                                             fillStyle: data.datasets[0].backgroundColor[index],
//                                             pointStyle: 'circle',
//                                             hidden: false,
//                                             index: index
//                                         };
//                                     });
//                                 }
//                             }
//                         },
//                         tooltip: {
//                             backgroundColor: 'rgba(0, 0, 0, 0.9)',
//                             titleColor: chartColors.text,
//                             bodyColor: chartColors.text,
//                             cornerRadius: 8,
//                             callbacks: {
//                                 label: function(tooltipItem) {
//                                     const authorInfo = ${JSON.stringify(metrics.authorStats)};
//                                     const author = authorInfo.find(a => a.name.includes(tooltipItem.label) || tooltipItem.label.includes(a.name.substring(0, 12)));
//                                     return [
//                                         \`\${tooltipItem.label}\`,
//                                         \`커밋: \${tooltipItem.parsed}개\`,
//                                         \`기여도: \${author?.percentage || 0}%\`,
//                                         \`파일: \${author?.files || 0}개\`
//                                     ];
//                                 }
//                             }
//                         }
//                     },
//                     animation: {
//                         animateRotate: true,
//                         duration: 1800
//                     }
//                 }
//             });

//             // 프로그래밍 언어 분포 차트
//             const languageData = ${JSON.stringify(languageData)};
//             if (languageData.labels.length > 0) {
//                 const ctx5 = document.getElementById('languageChart').getContext('2d');
                
//                 new Chart(ctx5, {
//                     type: 'doughnut',
//                     data: {
//                         labels: languageData.labels,
//                         datasets: [{
//                             data: languageData.data,
//                             backgroundColor: languageData.colors,
//                             borderWidth: 3,
//                             borderColor: chartColors.background,
//                             hoverBorderWidth: 4,
//                             hoverOffset: 10
//                         }]
//                     },
//                     options: {
//                         responsive: true,
//                         maintainAspectRatio: false,
//                         plugins: {
//                             legend: {
//                                 position: 'bottom',
//                                 labels: {
//                                     color: chartColors.text,
//                                     padding: 15,
//                                     usePointStyle: true,
//                                     pointStyle: 'circle',
//                                     font: {
//                                         size: 11
//                                     }
//                                 }
//                             },
//                             tooltip: {
//                                 backgroundColor: 'rgba(0, 0, 0, 0.9)',
//                                 titleColor: chartColors.text,
//                                 bodyColor: chartColors.text,
//                                 cornerRadius: 8,
//                                 callbacks: {
//                                     label: function(tooltipItem) {
//                                         const total = tooltipItem.dataset.data.reduce((a, b) => a + b, 0);
//                                         const percentage = ((tooltipItem.parsed / total) * 100).toFixed(1);
//                                         return \`\${tooltipItem.label}: \${tooltipItem.parsed} commits (\${percentage}%)\`;
//                                     }
//                                 }
//                             }
//                         },
//                         animation: {
//                             animateRotate: true,
//                             duration: 2000
//                         },
//                         cutout: '50%'
//                     }
//                 });
//             } else {
//                 document.getElementById('languageChart').parentElement.innerHTML = 
//                     '<div class="empty-state"><div class="empty-icon">💻</div><div>언어 데이터가 없습니다</div></div>';
//             }

//             // 카테고리별 활동 차트
//             const categoryData = ${JSON.stringify(categoryData)};
//             if (categoryData.labels.length > 0) {
//                 const ctx6 = document.getElementById('categoryChart').getContext('2d');
                
//                 new Chart(ctx6, {
//                     type: 'bar',
//                     data: {
//                         labels: categoryData.labels,
//                         datasets: [{
//                             label: '커밋 수',
//                             data: categoryData.data,
//                             backgroundColor: categoryData.colors,
//                             borderColor: categoryData.borderColors,
//                             borderWidth: 2,
//                             borderRadius: 8,
//                             borderSkipped: false,
//                         }]
//                     },
//                     options: {
//                         responsive: true,
//                         maintainAspectRatio: false,
//                         plugins: {
//                             legend: {
//                                 display: false
//                             },
//                             tooltip: {
//                                 backgroundColor: 'rgba(0, 0, 0, 0.9)',
//                                 titleColor: chartColors.text,
//                                 bodyColor: chartColors.text,
//                                 cornerRadius: 8,
//                                 callbacks: {
//                                     label: function(tooltipItem) {
//                                         return \`\${tooltipItem.label}: \${tooltipItem.parsed.y} commits\`;
//                                     }
//                                 }
//                             }
//                         },
//                         scales: {
//                             x: {
//                                 ticks: {
//                                     color: chartColors.text,
//                                     font: {
//                                         size: 11
//                                     }
//                                 },
//                                 grid: {
//                                     display: false
//                                 }
//                             },
//                             y: {
//                                 ticks: {
//                                     color: chartColors.text,
//                                     beginAtZero: true,
//                                     precision: 0
//                                 },
//                                 grid: {
//                                     color: chartColors.border,
//                                     drawBorder: false
//                                 }
//                             }
//                         },
//                         animation: {
//                             duration: 1500,
//                             easing: 'easeInOutQuart'
//                         }
//                     }
//                 });
//             } else {
//                 document.getElementById('categoryChart').parentElement.innerHTML = 
//                     '<div class="empty-state"><div class="empty-icon">📊</div><div>카테고리 데이터가 없습니다</div></div>';
//             }
//         } else {
//             // 데이터가 없을 때
//             document.getElementById('authorCommitsChart').parentElement.innerHTML = 
//                 '<div class="empty-state"><div class="empty-icon">👥</div><div>작성자 데이터가 없습니다</div></div>';
//             document.getElementById('authorPieChart').parentElement.innerHTML = 
//                 '<div class="empty-state"><div class="empty-icon">📊</div><div>기여도 데이터가 없습니다</div></div>';
//             document.getElementById('languageChart').parentElement.innerHTML = 
//                 '<div class="empty-state"><div class="empty-icon">💻</div><div>언어 데이터가 없습니다</div></div>';
//             document.getElementById('categoryChart').parentElement.innerHTML = 
//                 '<div class="empty-state"><div class="empty-icon">📊</div><div>카테고리 데이터가 없습니다</div></div>';
//         }

//         // 페이지 로드 완료 시 애니메이션
//         document.addEventListener('DOMContentLoaded', function() {
//             document.querySelectorAll('.metric-card').forEach((card, index) => {
//                 card.style.animationDelay = \`\${index * 0.1}s\`;
//             });

//             // 작성자 순위에 메달 스타일 적용
//             document.querySelectorAll('.author-rank').forEach((rank, index) => {
//                 const rankNumber = index + 1;
//                 if (rankNumber === 1) {
//                     rank.classList.add('gold');
//                 } else if (rankNumber === 2) {
//                     rank.classList.add('silver');
//                 } else if (rankNumber === 3) {
//                     rank.classList.add('bronze');
//                 }
//             });
//         });
//     </script>
// </body>
// </html>`;
//     }

//     // 기존의 private 메서드들
//     private prepareDailyCommitsData(dailyCommits: { [date: string]: number }, days: number) {
//         const labels = [];
//         const data = [];
        
//         for (let i = days - 1; i >= 0; i--) {
//             const date = new Date();
//             date.setDate(date.getDate() - i);
//             const dateStr = date.toISOString().split('T')[0];
            
//             labels.push(date.toLocaleDateString('ko-KR', { 
//                 month: 'short', 
//                 day: 'numeric',
//                 weekday: 'short'
//             }));
//             data.push(dailyCommits[dateStr] || 0);
//         }
        
//         return { labels, data };
//     }

//     private prepareFileStatsData(fileStats: { [file: string]: number }) {
//         const sortedFiles = Object.entries(fileStats)
//             .sort(([,a], [,b]) => b - a)
//             .slice(0, 10);
        
//         if (sortedFiles.length === 0) {
//             return { labels: [], data: [] };
//         }
        
//         const labels = sortedFiles.map(([file]) => {
//             const fileName = file.split('/').pop() || file;
//             return fileName.length > 15 ? fileName.substring(0, 15) + '...' : fileName;
//         });
//         const data = sortedFiles.map(([,commits]) => commits);
        
//         return { labels, data };
//     }

//     private prepareAuthorStatsData(authorStats: any[]) {
//         if (authorStats.length === 0) {
//             return { labels: [], data: [] };
//         }

//         // 상위 10명의 작성자만 표시
//         const topAuthors = authorStats.slice(0, 10);
        
//         const labels = topAuthors.map(author => {
//             const name = author.name.length > 12 ? author.name.substring(0, 12) + '...' : author.name;
//             return name;
//         });
//         const data = topAuthors.map(author => author.commits);
        
//         return { labels, data };
//     }

//     private prepareLanguageData(programmingLanguages: { [lang: string]: number }) {
//         const sortedLanguages = Object.entries(programmingLanguages)
//             .sort(([,a], [,b]) => b - a)
//             .slice(0, 10);
        
//         if (sortedLanguages.length === 0) {
//             return { labels: [], data: [], colors: [] };
//         }

//         const labels = sortedLanguages.map(([lang]) => lang);
//         const data = sortedLanguages.map(([,commits]) => commits);
//         const colors = labels.map(lang => this.getLanguageColor(lang));
        
//         return { labels, data, colors };
//     }

//     private prepareCategoryData(fileTypeStats: any[]) {
//         const categories: { [category: string]: number } = {};
        
//         for (const stat of fileTypeStats) {
//             categories[stat.category] = (categories[stat.category] || 0) + stat.commits;
//         }

//         const sortedCategories = Object.entries(categories)
//             .sort(([,a], [,b]) => b - a);
        
//         if (sortedCategories.length === 0) {
//             return { labels: [], data: [], colors: [], borderColors: [] };
//         }

//         const labels = sortedCategories.map(([category]) => category);
//         const data = sortedCategories.map(([,commits]) => commits);
        
//         const categoryColors: { [key: string]: { bg: string; border: string } } = {
//             'Frontend': { bg: '#61DAFB', border: '#21B1D1' },
//             'Backend': { bg: '#68A063', border: '#4A7C3A' },
//             'Mobile': { bg: '#FF6B6B', border: '#FF4757' },
//             'Database': { bg: '#F39C12', border: '#E67E22' },
//             'Config': { bg: '#9B59B6', border: '#8E44AD' },
//             'Documentation': { bg: '#3498DB', border: '#2980B9' },
//             'Scripts': { bg: '#E74C3C', border: '#C0392B' },
//             'Other': { bg: '#95A5A6', border: '#7F8C8D' }
//         };

//         const colors = labels.map(category => categoryColors[category]?.bg || '#95A5A6');
//         const borderColors = labels.map(category => categoryColors[category]?.border || '#7F8C8D');
        
//         return { labels, data, colors, borderColors };
//     }

//     // private getFileTypeIcon(extension: string): string {
//     //     const iconMap: { [ext: string]: string } = {
//     //         'js': '🟨',
//     //         'jsx': '⚛️',
//     //         'ts': '🔷',
//     //         'tsx': '⚛️',
//     //         'vue': '💚',
//     //         'svelte': '🧡',
//     //         'py': '🐍',
//     //         'java': '☕',
//     //         'go': '🔵',
//     //         'rs': '🦀',
//     //         'php': '🐘',
//     //         'rb': '💎',
//     //         'cs': '🔵',
//     //         'cpp': '⚪',
//     //         'c': '⚪',
//     //         'swift': '🍎',
//     //         'dart': '🎯',
//     //         'html': '🌐',
//     //         'css': '🎨',
//     //         'scss': '🎨',
//     //         'sass': '🎨',
//     //         'json': '📋',
//     //         'xml': '📄',
//     //         'yaml': '⚙️',
//     //         'yml': '⚙️',
//     //         'md': '📝',
//     //         'txt': '📄',
//     //         'sql': '🗃️',
//     //         'sh': '🖥️',
//     //         'bat': '🖥️',
//     //         'no-ext': '❓'
//     //     };
        
//     //     return iconMap[extension] || '📄';
//     // }

//     private getFileTypeIcon(extension: string): string {
//         const iconMap: { [ext: string]: string } = {
//             // Frontend Languages
//             'js': '🟨',
//             'jsx': '⚛️',
//             'ts': '🔷',
//             'tsx': '⚛️',
//             'vue': '💚',
//             'svelte': '🧡',
//             'html': '🌐',
//             'htm': '🌐',
//             'css': '🎨',
//             'scss': '🎨',
//             'sass': '🎨',
//             'less': '🎨',
//             'styl': '🎨',
            
//             // Backend Languages
//             'py': '🐍',
//             'java': '☕',
//             'kt': '🔺',
//             'go': '🔵',
//             'rs': '🦀',
//             'php': '🐘',
//             'rb': '💎',
//             'cs': '🟦',
//             'cpp': '⚪',
//             'c': '⚪',
//             'scala': '🔴',
//             'clj': '🟢',
//             'ex': '💜',
//             'erl': '📡',
            
//             // Mobile Development
//             'swift': '🍎',
//             'dart': '🎯',
//             'm': '📱',
//             'mm': '📱',
            
//             // Functional Languages
//             'hs': '🔮',
//             'elm': '🌳',
//             'ml': '🐫',
//             'fs': '🔷',
            
//             // System Languages
//             'zig': '⚡',
//             'nim': '👑',
//             'crystal': '💎',
//             'd': '🔥',
//             'asm': '⚡',
            
//             // Scripting Languages
//             'sh': '🖥️',
//             'bash': '🖥️',
//             'bat': '🖥️',
//             'ps1': '💙',
//             'lua': '🌙',
//             'perl': '🐪',
//             'awk': '🔧',
            
//             // Infrastructure as Code
//             'hcl': '🏗️',
//             'tf': '🏗️',
//             'terraform': '🏗️',
//             'ansible': '🤖',
//             'puppet': '🎭',
//             'chef': '👨‍🍳',
//             'dockerfile': '🐳',
            
//             // Configuration Files
//             'json': '📋',
//             'xml': '📄',
//             'yaml': '⚙️',
//             'yml': '⚙️',
//             'toml': '⚙️',
//             'ini': '⚙️',
//             'env': '🔐',
//             'properties': '⚙️',
            
//             // Documentation
//             'md': '📝',
//             'txt': '📄',
//             'rst': '📝',
//             'tex': '📜',
//             'org': '📋',
            
//             // Database
//             'sql': '🗃️',
//             'mysql': '🐬',
//             'postgres': '🐘',
            
//             // Build Tools
//             'makefile': '🔨',
//             'cmake': '🔨',
//             'gradle': '🐘',
//             'maven': '📦',
//             'cargo': '📦',
//             'npm': '📦',
//             'yarn': '🧶',
            
//             // Template Languages
//             'hbs': '🔧',
//             'mustache': '👨',
//             'twig': '🌿',
//             'jinja': '🔧',
//             'erb': '💎',
//             'pug': '🐶',
//             'ejs': '📝',
            
//             // Game Development
//             'gd': '🎮',
//             'unity': '🎮',
            
//             // Scientific/Legacy
//             'r': '📊',
//             'matlab': '🔢',
//             'julia': '🟣',
//             'fortran': '🏛️',
//             'cobol': '🏛️',
//             'pascal': '🏛️',
//             'lisp': '🧠',
//             'prolog': '🧠',
            
//             // Hardware/Specialized
//             'verilog': '⚡',
//             'vhdl': '⚡',
//             'tcl': '🔧',
            
//             // Query Languages
//             'graphql': '🔗',
//             'gql': '🔗',
            
//             // Other
//             'no-ext': '❓'
//         };
        
//         return iconMap[extension] || '📄';
//     }

//     // private getLanguageColor(language: string): string {
//     //     const colorMap: { [lang: string]: string } = {
//     //         'JavaScript': '#F7DF1E',
//     //         'React': '#61DAFB',
//     //         'TypeScript': '#3178C6',
//     //         'React TypeScript': '#61DAFB',
//     //         'Vue.js': '#4FC08D',
//     //         'Svelte': '#FF3E00',
//     //         'Python': '#3776AB',
//     //         'Java': '#ED8B00',
//     //         'Kotlin': '#7F52FF',
//     //         'Go': '#00ADD8',
//     //         'Rust': '#CE422B',
//     //         'PHP': '#777BB4',
//     //         'Ruby': '#CC342D',
//     //         'C#': '#239120',
//     //         'C++': '#00599C',
//     //         'C': '#A8B9CC',
//     //         'Swift': '#FA7343',
//     //         'Dart': '#0175C2',
//     //         'HTML': '#E34F26',
//     //         'CSS': '#1572B6',
//     //         'SCSS': '#CF649A',
//     //         'Sass': '#CF649A',
//     //         'JSON': '#000000',
//     //         'XML': '#FF6600',
//     //         'YAML': '#CB171E',
//     //         'Markdown': '#083FA1',
//     //         'SQL': '#4479A1',
//     //         'Shell': '#89E051',
//     //         'Batch': '#C1F12E',
//     //         'PowerShell': '#012456'
//     //     };
        
//     //     return colorMap[language] || '#95A5A6';
//     // }
//     private getLanguageColor(language: string): string {
//         const colorMap: { [lang: string]: string } = {
//             // Frontend Languages
//             'JavaScript': '#F7DF1E',
//             'React': '#61DAFB',
//             'TypeScript': '#3178C6',
//             'React TypeScript': '#61DAFB',
//             'Vue.js': '#4FC08D',
//             'Svelte': '#FF3E00',
//             'HTML': '#E34F26',
//             'CSS': '#1572B6',
//             'SCSS': '#CF649A',
//             'Sass': '#CF649A',
//             'Less': '#1D365D',
//             'Stylus': '#FF6347',
            
//             // Backend Languages
//             'Python': '#3776AB',
//             'Java': '#ED8B00',
//             'Kotlin': '#7F52FF',
//             'Go': '#00ADD8',
//             'Rust': '#CE422B',
//             'PHP': '#777BB4',
//             'Ruby': '#CC342D',
//             'C#': '#239120',
//             'C++': '#00599C',
//             'C': '#A8B9CC',
//             'Scala': '#C22D40',
//             'Clojure': '#5881D8',
//             'Elixir': '#6E4A7E',
//             'Erlang': '#B83998',
//             'Node.js': '#339933',
            
//             // Mobile Development
//             'Swift': '#FA7343',
//             'Dart': '#0175C2',
//             'Flutter': '#02569B',
//             'Objective-C': '#438EFF',
//             'React Native': '#61DAFB',
            
//             // Functional Languages
//             'Haskell': '#5E5086',
//             'Elm': '#60B5CC',
//             'OCaml': '#3BE133',
//             'F#': '#B845FC',
            
//             // System Languages
//             'Zig': '#EC915C',
//             'Nim': '#FFD700',
//             'Crystal': '#000100',
//             'D': '#BA595E',
//             'Assembly': '#6E4C13',
            
//             // Scripting Languages
//             'Shell': '#89E051',
//             'Bash': '#4EAA25',
//             'Batch': '#C1F12E',
//             'PowerShell': '#012456',
//             'Lua': '#2C2D72',
//             'Perl': '#0298C3',
//             'AWK': '#C4A000',
            
//             // Infrastructure as Code
//             'HCL': '#844FBA',
//             'Terraform': '#623CE4',
//             'Ansible': '#EE0000',
//             'Puppet': '#FFAE1A',
//             'Chef': '#F09820',
//             'Docker': '#2496ED',
//             'Kubernetes': '#326CE5',
            
//             // Configuration Languages
//             'JSON': '#292929',
//             'XML': '#0060AC',
//             'YAML': '#CB171E',
//             'TOML': '#9C4221',
//             'INI': '#D1DAE7',
//             'Properties': '#2F74C0',
//             'Environment': '#228B22',
            
//             // Documentation Languages
//             'Markdown': '#083FA1',
//             'Text': '#89E051',
//             'reStructuredText': '#141414',
//             'LaTeX': '#3D6117',
//             'Org': '#77AA99',
            
//             // Database Languages
//             'SQL': '#4479A1',
//             'MySQL': '#4479A1',
//             'PostgreSQL': '#336791',
//             'SQLite': '#003B57',
            
//             // Build Tools
//             'Makefile': '#427819',
//             'CMake': '#064F8C',
//             'Gradle': '#02303A',
//             'Maven': '#C71A36',
//             'Cargo': '#000000',
//             'npm': '#CB3837',
//             'Yarn': '#2C8EBB',
            
//             // Template Languages
//             'Handlebars': '#F7931E',
//             'Mustache': '#724B2F',
//             'Twig': '#8FBC8F',
//             'Jinja': '#B41717',
//             'ERB': '#CC342D',
//             'Pug': '#A86454',
//             'EJS': '#A91E50',
            
//             // Game Development
//             'GDScript': '#355570',
//             'Unity': '#000000',
//             'UnrealScript': '#A80000',
            
//             // Scientific/Data Languages
//             'R': '#198CE7',
//             'MATLAB': '#E16737',
//             'Julia': '#9558B2',
//             'Octave': '#0790C0',
            
//             // Legacy Languages
//             'Fortran': '#734F96',
//             'COBOL': '#0076D6',
//             'Pascal': '#E3F171',
//             'Ada': '#02F88C',
//             'LISP': '#9ACD32',
//             'Prolog': '#74283C',
//             'Scheme': '#1E4AEC',
//             'Smalltalk': '#596706',
            
//             // Hardware/Specialized Languages
//             'Verilog': '#B2B7F8',
//             'VHDL': '#543978',
//             'TCL': '#E4CC98',
            
//             // Query Languages
//             'GraphQL': '#E10098',
//             'SPARQL': '#0C5D9C',
            
//             // Blockchain
//             'Solidity': '#363636',
//             'Vyper': '#2980B9',
            
//             // Default
//             'Unknown': '#95A5A6',
//             'No Extension': '#95A5A6'
//         };
        
//         return colorMap[language] || '#95A5A6';
//     }
// }

import * as vscode from 'vscode';
import { GitAnalyzer, MetricsData } from './gitAnalyzer';
import { ReportGenerator, ReportOptions } from './reportGenerator';
import { Badge, BadgeCategory, BadgeRarity } from './badgeSystem';

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
                    case 'toggleTheme':
                        await this.handleToggleTheme();
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );

        await this.updateContent();
    }

    // 대시보드 새로고침 (실시간 변경 감지용)
    async refreshDashboard() {
        if (!this.panel) {return;}
        await this.updateContent(this.currentPeriod);
    }

    // 테마 새로고침 기능
    refreshTheme() {
        if (this.panel && this.currentMetrics) {
            const config = vscode.workspace.getConfiguration('gitMetrics');
            const maxTopFiles = config.get<number>('maxTopFiles', 10);
            this.panel.webview.html = this.generateAdvancedHTML(this.currentMetrics, this.currentPeriod, maxTopFiles);
        }
    }

    // 테마 전환 처리
    private async handleToggleTheme() {
        const config = vscode.workspace.getConfiguration('gitMetrics');
        const currentTheme = config.get<string>('theme', 'auto');
        
        let nextTheme: string;
        switch (currentTheme) {
            case 'auto':
                nextTheme = 'light';
                break;
            case 'light':
                nextTheme = 'dark';
                break;
            case 'dark':
                nextTheme = 'auto';
                break;
            default:
                nextTheme = 'auto';
        }
        
        await config.update('theme', nextTheme, vscode.ConfigurationTarget.Global);
        this.refreshTheme();
        
        const themeNames = { 'auto': '자동', 'light': '라이트', 'dark': '다크' };
        vscode.window.showInformationMessage(`🎨 테마가 '${themeNames[nextTheme as keyof typeof themeNames]}'으로 변경되었습니다!`);
    }

    // 현재 테마 감지
    private getCurrentTheme(): 'light' | 'dark' {
        const config = vscode.workspace.getConfiguration('gitMetrics');
        const themeConfig = config.get<string>('theme', 'auto');
        
        if (themeConfig === 'light') {return 'light';}
        if (themeConfig === 'dark') {return 'dark';}
        
        // auto인 경우 VS Code의 현재 테마 감지
        const colorTheme = vscode.window.activeColorTheme;
        return colorTheme.kind === vscode.ColorThemeKind.Light ? 'light' : 'dark';
    }

    // 테마별 색상 정의
    private getThemeColors(theme: 'light' | 'dark') {
        if (theme === 'light') {
            return {
                background: '#ffffff',
                foreground: '#24292e',
                secondaryBackground: '#f6f8fa',
                borderColor: '#e1e4e8',
                primaryColor: '#0366d6',
                successColor: '#28a745',
                warningColor: '#ffd33d',
                errorColor: '#d73a49',
                linkColor: '#0366d6',
                hoverBackground: '#f1f8ff',
                cardShadow: 'rgba(0, 0, 0, 0.1)',
                textMuted: '#586069',
                panelBorder: '#d0d7de'
            };
        } else {
            return {
                background: '#0d1117',
                foreground: '#f0f6fc',
                secondaryBackground: '#161b22',
                borderColor: '#30363d',
                primaryColor: '#58a6ff',
                successColor: '#3fb950',
                warningColor: '#d29922',
                errorColor: '#f85149',
                linkColor: '#58a6ff',
                hoverBackground: '#21262d',
                cardShadow: 'rgba(0, 0, 0, 0.3)',
                textMuted: '#8b949e',
                panelBorder: '#30363d'
            };
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
                includeTimeAnalysis: false,
                includeBadges: false
            };
        } else if (includeOptions.label === '🎯 사용자 정의') {
            const sections = await vscode.window.showQuickPick([
                { label: '📋 요약 통계', picked: true, detail: 'includeSummary' },
                { label: '👥 개발자별 통계', picked: true, detail: 'includeAuthorStats' },
                { label: '📁 파일 타입별 분석', picked: true, detail: 'includeFileStats' },
                { label: '⏰ 시간대별 분석', picked: true, detail: 'includeTimeAnalysis' },
                { label: '🏆 개발자 배지', picked: true, detail: 'includeBadges' }
            ], {
                placeHolder: '포함할 섹션을 선택하세요 (다중 선택 가능)',
                canPickMany: true
            });

            if (!sections) {return;}

            reportOptions.includeSummary = sections.some(s => s.detail === 'includeSummary');
            reportOptions.includeAuthorStats = sections.some(s => s.detail === 'includeAuthorStats');
            reportOptions.includeFileStats = sections.some(s => s.detail === 'includeFileStats');
            reportOptions.includeTimeAnalysis = sections.some(s => s.detail === 'includeTimeAnalysis');
            reportOptions.includeBadges = sections.some(s => s.detail === 'includeBadges');
        }

        await this.handleExportReport(reportOptions);
    }

    private generateAdvancedHTML(metrics: MetricsData, days: number, maxTopFiles: number): string {
        const dailyCommitsData = this.prepareDailyCommitsData(metrics.dailyCommits, days);
        const fileStatsData = this.prepareFileStatsData(metrics.fileStats);
        const authorStatsData = this.prepareAuthorStatsData(metrics.authorStats);
        const languageData = this.prepareLanguageData(metrics.programmingLanguages);
        const categoryData = this.prepareCategoryData(metrics.fileTypeStats);
        const badgeData = this.prepareBadgeData(metrics.badges || []);
        
        // 현재 테마 가져오기
        const currentTheme = this.getCurrentTheme();
        const colors = this.getThemeColors(currentTheme);
        const config = vscode.workspace.getConfiguration('gitMetrics');
        const themeConfig = config.get<string>('theme', 'auto');
        
        const themeButtonText = {
            'auto': '🔄 자동',
            'light': '☀️ 라이트',
            'dark': '🌙 다크'
        }[themeConfig] || '🔄 자동';

        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Git Metrics Dashboard</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
    <style>
        :root {
            --bg-color: ${colors.background};
            --text-color: ${colors.foreground};
            --secondary-bg: ${colors.secondaryBackground};
            --border-color: ${colors.borderColor};
            --primary-color: ${colors.primaryColor};
            --success-color: ${colors.successColor};
            --warning-color: ${colors.warningColor};
            --error-color: ${colors.errorColor};
            --link-color: ${colors.linkColor};
            --hover-bg: ${colors.hoverBackground};
            --card-shadow: ${colors.cardShadow};
            --text-muted: ${colors.textMuted};
            --panel-border: ${colors.panelBorder};
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 0;
            padding: 20px;
            background: var(--bg-color);
            color: var(--text-color);
            line-height: 1.6;
            transition: all 0.3s ease;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid var(--primary-color);
        }
        
        .title {
            margin: 0;
            color: var(--primary-color);
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
            background: var(--secondary-bg);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            padding: 10px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
            user-select: none;
        }
        
        .btn:hover {
            background: var(--hover-bg);
            transform: translateY(-1px);
            border-color: var(--primary-color);
        }
        
        .btn.active {
            background: var(--primary-color);
            color: ${currentTheme === 'light' ? '#ffffff' : '#000000'};
            border-color: var(--primary-color);
        }
        
        .btn.refresh {
            background: var(--success-color);
            color: ${currentTheme === 'light' ? '#ffffff' : '#000000'};
            border: 1px solid var(--success-color);
        }
        
        .btn.refresh:hover {
            background: var(--success-color);
            opacity: 0.8;
        }
        
        .btn.export {
            background: var(--primary-color);
            color: ${currentTheme === 'light' ? '#ffffff' : '#000000'};
            margin-left: 12px;
            border: 1px solid var(--primary-color);
        }
        
        .btn.export:hover {
            background: var(--primary-color);
            opacity: 0.8;
        }
        
        .btn.theme {
            background: var(--warning-color);
            color: ${currentTheme === 'light' ? '#000000' : '#000000'};
            border: 1px solid var(--warning-color);
        }
        
        .btn.theme:hover {
            background: var(--warning-color);
            opacity: 0.8;
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: var(--secondary-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 16px var(--card-shadow);
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
            background: linear-gradient(90deg, var(--primary-color), var(--success-color));
        }
        
        .metric-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px var(--card-shadow);
            border-color: var(--primary-color);
            background: var(--hover-bg);
        }
        
        .metric-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
            color: var(--text-color);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .metric-value {
            font-size: 42px;
            font-weight: 900;
            color: var(--success-color);
            margin-bottom: 8px;
            text-shadow: 0 2px 4px var(--card-shadow);
        }
        
        .metric-subtitle {
            font-size: 14px;
            color: var(--text-muted);
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
            border-bottom: 1px solid var(--border-color);
            transition: all 0.2s ease;
        }
        
        .file-item:hover {
            background-color: var(--hover-bg);
            margin: 0 -16px;
            padding-left: 16px;
            padding-right: 16px;
            border-radius: 6px;
        }
        
        .file-name {
            color: var(--text-color);
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .file-index {
            background: var(--primary-color);
            color: ${currentTheme === 'light' ? '#ffffff' : '#000000'};
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
            color: var(--primary-color);
            font-weight: bold;
            background: var(--secondary-bg);
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 12px;
            border: 1px solid var(--primary-color);
        }
        
        .loading {
            text-align: center;
            padding: 60px;
            color: var(--text-muted);
            font-size: 18px;
        }
        
        .stats-highlight {
            color: var(--success-color);
            background: linear-gradient(135deg, var(--success-color), var(--primary-color));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            display: inline-block;
        }
        
        @supports not (background-clip: text) {
            .stats-highlight {
                background: none !important;
                -webkit-background-clip: unset !important;
                -webkit-text-fill-color: unset !important;
                color: var(--success-color) !important;
            }
        }
        
        .empty-state {
            text-align: center;
            padding: 40px;
            color: var(--text-muted);
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
            border-bottom: 1px solid var(--border-color);
            transition: all 0.2s ease;
        }
        
        .author-item:hover {
            background-color: var(--hover-bg);
            margin: 0 -16px;
            padding-left: 16px;
            padding-right: 16px;
            border-radius: 8px;
        }
        
        .author-info {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
        }
        
        .author-rank {
            background: linear-gradient(135deg, var(--primary-color), var(--success-color));
            color: ${currentTheme === 'light' ? '#ffffff' : '#000000'};
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
            color: var(--text-color);
            margin-bottom: 4px;
            font-size: 15px;
        }
        
        .author-meta {
            font-size: 12px;
            color: var(--text-muted);
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
            background: var(--border-color);
            border-radius: 4px;
            overflow: hidden;
        }
        
        .contribution-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--success-color), var(--primary-color));
            border-radius: 4px;
            transition: width 0.3s ease;
        }
        
        .contribution-percent {
            font-weight: bold;
            color: var(--primary-color);
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
            border-bottom: 1px solid var(--border-color);
            transition: all 0.2s ease;
        }
        
        .file-type-item:hover {
            background-color: var(--hover-bg);
            margin: 0 -12px;
            padding-left: 12px;
            padding-right: 12px;
            border-radius: 6px;
        }
        
        .file-type-info {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
        }
        
        .file-type-rank {
            background: var(--primary-color);
            color: ${currentTheme === 'light' ? '#ffffff' : '#000000'};
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
            color: var(--text-color);
            margin-bottom: 4px;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .language-tag {
            background: var(--secondary-bg);
            color: var(--text-color);
            padding: 2px 6px;
            border-radius: 8px;
            font-size: 10px;
            font-weight: 500;
            border: 1px solid var(--border-color);
        }
        
        .file-type-meta {
            font-size: 11px;
            color: var(--text-muted);
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
            background: var(--border-color);
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
            color: var(--primary-color);
            font-size: 12px;
            min-width: 35px;
            text-align: right;
        }

        /* 배지 시스템 스타일 */
        .badge-section {
            margin: 24px 0;
        }

        .badge-section-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: var(--text-color);
            border-bottom: 2px solid var(--primary-color);
            padding-bottom: 8px;
        }

        .badge-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 16px;
            margin-bottom: 20px;
        }

        .badge-card {
            background: var(--secondary-bg);
            border: 2px solid var(--border-color);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .badge-card.unlocked {
            border-color: var(--success-color);
            box-shadow: 0 4px 16px rgba(40, 167, 69, 0.2);
        }

        .badge-card.in-progress {
            border-color: var(--warning-color);
            box-shadow: 0 4px 16px rgba(255, 193, 7, 0.2);
        }

        .badge-card.locked {
            opacity: 0.6;
            border-color: var(--text-muted);
        }

        .badge-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px var(--card-shadow);
        }

        .badge-icon {
            font-size: 32px;
            margin-bottom: 8px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .badge-icon.grayscale {
            filter: grayscale(100%);
            opacity: 0.5;
        }

        .badge-name {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
            color: var(--text-color);
        }

        .badge-description {
            font-size: 12px;
            color: var(--text-muted);
            margin-bottom: 12px;
            line-height: 1.4;
        }

        .badge-rarity {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 8px;
        }

        .badge-rarity.common {
            background: #6c757d;
            color: white;
        }

        .badge-rarity.uncommon {
            background: #28a745;
            color: white;
        }

        .badge-rarity.rare {
            background: #007bff;
            color: white;
        }

        .badge-rarity.epic {
            background: #6f42c1;
            color: white;
        }

        .badge-rarity.legendary {
            background: #fd7e14;
            color: white;
        }

        .badge-date {
            font-size: 10px;
            color: var(--text-muted);
            margin-top: 8px;
        }

        .badge-progress-bar {
            background: var(--border-color);
            border-radius: 8px;
            height: 16px;
            margin: 8px 0;
            overflow: hidden;
            position: relative;
        }

        .badge-progress-bar .progress-fill {
            height: 100%;
            background: var(--warning-color);
            border-radius: 8px;
            transition: width 0.3s ease;
        }

        .badge-progress-bar .progress-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 10px;
            font-weight: 600;
            color: var(--text-color);
        }

        .badge-progress-desc {
            font-size: 10px;
            color: var(--text-muted);
        }

        .progress-bar {
            background: var(--border-color);
            border-radius: 8px;
            height: 8px;
            margin-top: 12px;
            overflow: hidden;
        }

        .progress-bar .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--primary-color), var(--success-color));
            border-radius: 8px;
            transition: width 0.3s ease;
        }

        .rarity-stats {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .rarity-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 4px 0;
        }

        .rarity-badge {
            padding: 2px 6px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .rarity-badge.common {
            background: #6c757d;
            color: white;
        }

        .rarity-badge.uncommon {
            background: #28a745;
            color: white;
        }

        .rarity-badge.rare {
            background: #007bff;
            color: white;
        }

        .rarity-badge.epic {
            background: #6f42c1;
            color: white;
        }

        .rarity-badge.legendary {
            background: #fd7e14;
            color: white;
        }

        .more-badges {
            text-align: center;
            margin-top: 16px;
            font-size: 14px;
            color: var(--text-muted);
            font-style: italic;
        }
    </style>
</head>
<body class="${currentTheme}-theme">
    <div class="header">
        <h1 class="title">📊 Git Metrics Dashboard</h1>
        <div class="controls">
            <button class="btn ${days === 7 ? 'active' : ''}" onclick="changePeriod(7)">7일</button>
            <button class="btn ${days === 30 ? 'active' : ''}" onclick="changePeriod(30)">30일</button>
            <button class="btn ${days === 90 ? 'active' : ''}" onclick="changePeriod(90)">90일</button>
            <button class="btn refresh" onclick="refresh()">🔄 새로고침</button>
            <button class="btn theme" onclick="toggleTheme()">${themeButtonText}</button>
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

    <!-- 배지 시스템 섹션 -->
    <div class="metric-card large-chart">
        <div class="metric-title">🏆 개발자 뱃지 시스템</div>
        <div class="dashboard-grid" style="margin-bottom: 20px;">
            <div class="metric-card" style="margin: 0;">
                <div class="metric-title">📈 진행 상황</div>
                <div class="metric-value stats-highlight">${badgeData.totalUnlocked}/${badgeData.totalBadges}</div>
                <div class="metric-subtitle">${badgeData.completionPercentage}% 완료</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${badgeData.completionPercentage}%"></div>
                </div>
            </div>
            <div class="metric-card" style="margin: 0;">
                <div class="metric-title">⭐ 희귀도 통계</div>
                <div class="rarity-stats">
                    <div class="rarity-item">
                        <span class="rarity-badge common">Common</span>
                        <span>${badgeData.rarityStats.common}</span>
                    </div>
                    <div class="rarity-item">
                        <span class="rarity-badge uncommon">Uncommon</span>
                        <span>${badgeData.rarityStats.uncommon}</span>
                    </div>
                    <div class="rarity-item">
                        <span class="rarity-badge rare">Rare</span>
                        <span>${badgeData.rarityStats.rare}</span>
                    </div>
                    <div class="rarity-item">
                        <span class="rarity-badge epic">Epic</span>
                        <span>${badgeData.rarityStats.epic}</span>
                    </div>
                    <div class="rarity-item">
                        <span class="rarity-badge legendary">Legendary</span>
                        <span>${badgeData.rarityStats.legendary}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 언락된 배지들 -->
        ${badgeData.unlocked.length > 0 ? `
        <div class="badge-section">
            <h3 class="badge-section-title">🏆 획득한 배지</h3>
            <div class="badge-grid">
                ${badgeData.unlocked.map(badge => `
                <div class="badge-card unlocked ${badge.rarity}">
                    <div class="badge-icon">${badge.icon}</div>
                    <div class="badge-name">${badge.name}</div>
                    <div class="badge-description">${badge.description}</div>
                    <div class="badge-rarity ${badge.rarity}">${badge.rarity.toUpperCase()}</div>
                    ${badge.unlockedAt ? `<div class="badge-date">획득일: ${badge.unlockedAt.toLocaleDateString()}</div>` : ''}
                </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <!-- 진행중인 배지들 -->
        ${badgeData.inProgress.length > 0 ? `
        <div class="badge-section">
            <h3 class="badge-section-title">⏳ 진행 중인 배지</h3>
            <div class="badge-grid">
                ${badgeData.inProgress.map(badge => `
                <div class="badge-card in-progress ${badge.rarity}">
                    <div class="badge-icon">${badge.icon}</div>
                    <div class="badge-name">${badge.name}</div>
                    <div class="badge-description">${badge.description}</div>
                    <div class="badge-progress-bar">
                        <div class="progress-fill" style="width: ${badge.progress}%"></div>
                        <span class="progress-text">${badge.progress}%</span>
                    </div>
                    <div class="badge-progress-desc">${badge.progressDescription}</div>
                </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <!-- 잠긴 배지들 (일부만 표시) -->
        ${badgeData.locked.length > 0 ? `
        <div class="badge-section">
            <h3 class="badge-section-title">🔒 미획득 배지 (일부)</h3>
            <div class="badge-grid">
                ${badgeData.locked.slice(0, 6).map(badge => `
                <div class="badge-card locked ${badge.rarity}">
                    <div class="badge-icon grayscale">❓</div>
                    <div class="badge-name">???</div>
                    <div class="badge-description">조건을 만족하면 획득할 수 있습니다</div>
                    <div class="badge-rarity ${badge.rarity}">${badge.rarity.toUpperCase()}</div>
                </div>
                `).join('')}
            </div>
            ${badgeData.locked.length > 6 ? `<div class="more-badges">... 그리고 ${badgeData.locked.length - 6}개 더</div>` : ''}
        </div>
        ` : ''}
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        // 차트 색상 설정 (툴팁 색상 포함)
        const chartColors = {
            primary: '${colors.primaryColor}',
            success: '${colors.successColor}',
            warning: '${colors.warningColor}',
            error: '${colors.errorColor}',
            text: '${colors.foreground}',
            border: '${colors.borderColor}',
            background: '${colors.background}',
            secondary: '${colors.secondaryBackground}',
            // 툴팁 전용 색상 추가
            tooltipBg: '${currentTheme === 'light' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)'}',
            tooltipText: '${currentTheme === 'light' ? '#ffffff' : '#000000'}',
            tooltipBorder: '${currentTheme === 'light' ? colors.primaryColor : '#333333'}'
        };
        
        // 공통 툴팁 설정 함수
        function getTooltipConfig(customCallbacks = {}) {
            return {
                backgroundColor: chartColors.tooltipBg,
                titleColor: chartColors.tooltipText,
                bodyColor: chartColors.tooltipText,
                borderColor: chartColors.tooltipBorder,
                borderWidth: 2,
                cornerRadius: 8,
                padding: 12,
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 13
                },
                footerFont: {
                    size: 12
                },
                displayColors: false,
                ...customCallbacks
            };
        }
        
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

        function toggleTheme() {
            vscode.postMessage({
                command: 'toggleTheme'
            });
        }

        // 일별 커밋 라인 차트
        const dailyData = ${JSON.stringify(dailyCommitsData)};
        const ctx1 = document.getElementById('dailyCommitsChart').getContext('2d');
        
        const gradient = ctx1.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, chartColors.primary + '4D'); // 30% opacity
        gradient.addColorStop(1, chartColors.primary + '0D'); // 5% opacity
        
        new Chart(ctx1, {
            type: 'line',
            data: {
                labels: dailyData.labels,
                datasets: [{
                    label: '커밋 수',
                    data: dailyData.data,
                    borderColor: chartColors.primary,
                    backgroundColor: gradient,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: chartColors.primary,
                    pointBorderColor: chartColors.text,
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: chartColors.primary,
                    pointHoverBorderColor: chartColors.text,
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
                    tooltip: getTooltipConfig({
                        callbacks: {
                            title: function(tooltipItems) {
                                return tooltipItems[0].label;
                            },
                            label: function(tooltipItem) {
                                return \`커밋: \${tooltipItem.parsed.y}개\`;
                            }
                        }
                    })
                },
                scales: {
                    x: {
                        ticks: {
                            color: chartColors.text,
                            maxTicksLimit: 15,
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: chartColors.border,
                            drawBorder: false
                        }
                    },
                    y: {
                        ticks: {
                            color: chartColors.text,
                            beginAtZero: true,
                            precision: 0,
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: chartColors.border,
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
            const fileChartColors = [
                chartColors.primary, 
                chartColors.success,
                '#FF6B6B',
                '#4ECDC4',
                '#45B7D1',
                '#96CEB4',
                '#FECA57',
                '#FF9FF3',
                '#54A0FF', 
                '#5F27CD', 
                '#00D2D3'
            ];
            
            new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: fileData.labels,
                    datasets: [{
                        data: fileData.data,
                        backgroundColor: fileChartColors,
                        borderWidth: 3,
                        borderColor: chartColors.background,
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
                                color: chartColors.text,
                                padding: 20,
                                usePointStyle: true,
                                pointStyle: 'circle',
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: getTooltipConfig({
                            callbacks: {
                                label: function(tooltipItem) {
                                    const total = tooltipItem.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((tooltipItem.parsed / total) * 100).toFixed(1);
                                    return \`\${tooltipItem.label}: \${tooltipItem.parsed}개 (\${percentage}%)\`;
                                }
                            }
                        })
                    },
                    animation: {
                        animateRotate: true,
                        duration: 1500
                    },
                    cutout: '60%'
                }
            });
        } else {
            document.getElementById('fileStatsChart').parentElement.innerHTML = 
                '<div class="empty-state"><div class="empty-icon">📊</div><div>파일 데이터가 없습니다</div></div>';
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
                                chartColors.primary, 
                                '#FF6B6B',
                                '#4ECDC4'
                            ];
                            return colors[index % colors.length];
                        }),
                        borderColor: authorData.labels.map((_, index) => {
                            const colors = [
                                '#FFA500', '#A0A0A0', '#B87333', 
                                chartColors.primary, 
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
                        tooltip: getTooltipConfig({
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
                        })
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: chartColors.text,
                                beginAtZero: true,
                                precision: 0
                            },
                            grid: {
                                color: chartColors.border,
                                drawBorder: false
                            }
                        },
                        y: {
                            ticks: {
                                color: chartColors.text,
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
                            '#FFD700', '#C0C0C0', '#CD7F32', chartColors.primary, 
                            '#FF6B6B',
                            '#4ECDC4',
                            '#45B7D1',
                            '#96CEB4'
                        ],
                        borderWidth: 3,
                        borderColor: chartColors.background,
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
                                color: chartColors.text,
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
                        tooltip: getTooltipConfig({
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
                        })
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
                            borderColor: chartColors.background,
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
                                    color: chartColors.text,
                                    padding: 15,
                                    usePointStyle: true,
                                    pointStyle: 'circle',
                                    font: {
                                        size: 11
                                    }
                                }
                            },
                            tooltip: getTooltipConfig({
                                callbacks: {
                                    label: function(tooltipItem) {
                                        const total = tooltipItem.dataset.data.reduce((a, b) => a + b, 0);
                                        const percentage = ((tooltipItem.parsed / total) * 100).toFixed(1);
                                        return \`\${tooltipItem.label}: \${tooltipItem.parsed} commits (\${percentage}%)\`;
                                    }
                                }
                            })
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
                    '<div class="empty-state"><div class="empty-icon">💻</div><div>언어 데이터가 없습니다</div></div>';
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
                            tooltip: getTooltipConfig({
                                callbacks: {
                                    label: function(tooltipItem) {
                                        return \`\${tooltipItem.label}: \${tooltipItem.parsed.y} commits\`;
                                    }
                                }
                            })
                        },
                        scales: {
                            x: {
                                ticks: {
                                    color: chartColors.text,
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
                                    color: chartColors.text,
                                    beginAtZero: true,
                                    precision: 0
                                },
                                grid: {
                                    color: chartColors.border,
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
                    '<div class="empty-state"><div class="empty-icon">📊</div><div>카테고리 데이터가 없습니다</div></div>';
            }
        } else {
            // 데이터가 없을 때
            document.getElementById('authorCommitsChart').parentElement.innerHTML = 
                '<div class="empty-state"><div class="empty-icon">👥</div><div>작성자 데이터가 없습니다</div></div>';
            document.getElementById('authorPieChart').parentElement.innerHTML = 
                '<div class="empty-state"><div class="empty-icon">📊</div><div>기여도 데이터가 없습니다</div></div>';
            document.getElementById('languageChart').parentElement.innerHTML = 
                '<div class="empty-state"><div class="empty-icon">💻</div><div>언어 데이터가 없습니다</div></div>';
            document.getElementById('categoryChart').parentElement.innerHTML = 
                '<div class="empty-state"><div class="empty-icon">📊</div><div>카테고리 데이터가 없습니다</div></div>';
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

    private prepareBadgeData(badges: Badge[]) {
        const unlockedBadges = badges.filter(badge => badge.unlocked);
        const inProgressBadges = badges.filter(badge => !badge.unlocked && badge.progress > 0);
        const lockedBadges = badges.filter(badge => !badge.unlocked && badge.progress === 0);

        // 카테고리별 배지 그룹화
        const badgesByCategory: { [key in BadgeCategory]: Badge[] } = {
            [BadgeCategory.COMMIT_MASTER]: [],
            [BadgeCategory.CODE_QUALITY]: [],
            [BadgeCategory.COLLABORATOR]: [],
            [BadgeCategory.TIME_WARRIOR]: [],
            [BadgeCategory.MILESTONE]: [],
            [BadgeCategory.CONSISTENCY]: [],
            [BadgeCategory.EXPLORER]: []
        };

        badges.forEach(badge => {
            badgesByCategory[badge.category].push(badge);
        });

        // 희귀도별 통계
        const rarityStats: { [key in BadgeRarity]: number } = {
            [BadgeRarity.COMMON]: 0,
            [BadgeRarity.UNCOMMON]: 0,
            [BadgeRarity.RARE]: 0,
            [BadgeRarity.EPIC]: 0,
            [BadgeRarity.LEGENDARY]: 0
        };

        unlockedBadges.forEach(badge => {
            rarityStats[badge.rarity]++;
        });

        return {
            unlocked: unlockedBadges,
            inProgress: inProgressBadges,
            locked: lockedBadges,
            byCategory: badgesByCategory,
            rarityStats,
            totalUnlocked: unlockedBadges.length,
            totalBadges: badges.length,
            completionPercentage: Math.round((unlockedBadges.length / badges.length) * 100)
        };
    }

    private getFileTypeIcon(extension: string): string {
        const iconMap: { [ext: string]: string } = {
            // Frontend Languages
            'js': '🟨',
            'jsx': '⚛️',
            'ts': '🔷',
            'tsx': '⚛️',
            'vue': '💚',
            'svelte': '🧡',
            'html': '🌐',
            'htm': '🌐',
            'css': '🎨',
            'scss': '🎨',
            'sass': '🎨',
            'less': '🎨',
            'styl': '🎨',
            
            // Backend Languages
            'py': '🐍',
            'java': '☕',
            'kt': '🔺',
            'go': '🔵',
            'rs': '🦀',
            'php': '🐘',
            'rb': '💎',
            'cs': '🟦',
            'cpp': '⚪',
            'c': '⚪',
            'scala': '🔴',
            'clj': '🟢',
            'ex': '💜',
            'erl': '📡',
            
            // Mobile Development
            'swift': '🍎',
            'dart': '🎯',
            'm': '📱',
            'mm': '📱',
            
            // Functional Languages
            'hs': '🔮',
            'elm': '🌳',
            'ml': '🐫',
            'fs': '🔷',
            
            // System Languages
            'zig': '⚡',
            'nim': '👑',
            'crystal': '💎',
            'd': '🔥',
            'asm': '⚡',
            
            // Scripting Languages
            'sh': '🖥️',
            'bash': '🖥️',
            'bat': '🖥️',
            'ps1': '💙',
            'lua': '🌙',
            'perl': '🐪',
            'awk': '🔧',
            
            // Infrastructure as Code
            'hcl': '🏗️',
            'tf': '🏗️',
            'terraform': '🏗️',
            'ansible': '🤖',
            'puppet': '🎭',
            'chef': '👨‍🍳',
            'dockerfile': '🐳',
            
            // Configuration Files
            'json': '📋',
            'xml': '📄',
            'yaml': '⚙️',
            'yml': '⚙️',
            'toml': '⚙️',
            'ini': '⚙️',
            'env': '🔐',
            'properties': '⚙️',
            
            // Documentation
            'md': '📝',
            'txt': '📄',
            'rst': '📝',
            'tex': '📜',
            'org': '📋',
            
            // Database
            'sql': '🗃️',
            'mysql': '🐬',
            'postgres': '🐘',
            
            // Build Tools
            'makefile': '🔨',
            'cmake': '🔨',
            'gradle': '🐘',
            'maven': '📦',
            'cargo': '📦',
            'npm': '📦',
            'yarn': '🧶',
            
            // Template Languages
            'hbs': '🔧',
            'mustache': '👨',
            'twig': '🌿',
            'jinja': '🔧',
            'erb': '💎',
            'pug': '🐶',
            'ejs': '📝',
            
            // Game Development
            'gd': '🎮',
            'unity': '🎮',
            
            // Scientific/Legacy
            'r': '📊',
            'R': '📊',
            'matlab': '🔢',
            'julia': '🟣',
            'fortran': '🏛️',
            'cobol': '🏛️',
            'pascal': '🏛️',
            'lisp': '🧠',
            'prolog': '🧠',
            
            // Hardware/Specialized
            'verilog': '⚡',
            'vhdl': '⚡',
            'tcl': '🔧',
            
            // Query Languages
            'graphql': '🔗',
            'gql': '🔗',
            
            // Other
            'no-ext': '❓'
        };
        
        return iconMap[extension] || '📄';
    }

    private getLanguageColor(language: string): string {
        const colorMap: { [lang: string]: string } = {
            // Frontend Languages
            'JavaScript': '#F7DF1E',
            'React': '#61DAFB',
            'TypeScript': '#3178C6',
            'React TypeScript': '#61DAFB',
            'Vue.js': '#4FC08D',
            'Svelte': '#FF3E00',
            'HTML': '#E34F26',
            'CSS': '#1572B6',
            'SCSS': '#CF649A',
            'Sass': '#CF649A',
            'Less': '#1D365D',
            'Stylus': '#FF6347',
            
            // Backend Languages
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
            'Scala': '#C22D40',
            'Clojure': '#5881D8',
            'Elixir': '#6E4A7E',
            'Erlang': '#B83998',
            'Node.js': '#339933',
            
            // Mobile Development
            'Swift': '#FA7343',
            'Dart': '#0175C2',
            'Flutter': '#02569B',
            'Objective-C': '#438EFF',
            'React Native': '#61DAFB',
            
            // Functional Languages
            'Haskell': '#5E5086',
            'Elm': '#60B5CC',
            'OCaml': '#3BE133',
            'F#': '#B845FC',
            
            // System Languages
            'Zig': '#EC915C',
            'Nim': '#FFD700',
            'Crystal': '#000100',
            'D': '#BA595E',
            'Assembly': '#6E4C13',
            
            // Scripting Languages
            'Shell': '#89E051',
            'Bash': '#4EAA25',
            'Batch': '#C1F12E',
            'PowerShell': '#012456',
            'Lua': '#2C2D72',
            'Perl': '#0298C3',
            'AWK': '#C4A000',
            
            // Infrastructure as Code
            'HCL': '#844FBA',
            'Terraform': '#623CE4',
            'Ansible': '#EE0000',
            'Puppet': '#FFAE1A',
            'Chef': '#F09820',
            'Docker': '#2496ED',
            'Kubernetes': '#326CE5',
            
            // Configuration Languages
            'JSON': '#292929',
            'XML': '#0060AC',
            'YAML': '#CB171E',
            'TOML': '#9C4221',
            'INI': '#D1DAE7',
            'Properties': '#2F74C0',
            'Environment': '#228B22',
            
            // Documentation Languages
            'Markdown': '#083FA1',
            'Text': '#89E051',
            'reStructuredText': '#141414',
            'LaTeX': '#3D6117',
            'Org': '#77AA99',
            
            // Database Languages
            'SQL': '#4479A1',
            'MySQL': '#4479A1',
            'PostgreSQL': '#336791',
            'SQLite': '#003B57',
            
            // Build Tools
            'Makefile': '#427819',
            'CMake': '#064F8C',
            'Gradle': '#02303A',
            'Maven': '#C71A36',
            'Cargo': '#000000',
            'npm': '#CB3837',
            'Yarn': '#2C8EBB',
            
            // Template Languages
            'Handlebars': '#F7931E',
            'Mustache': '#724B2F',
            'Twig': '#8FBC8F',
            'Jinja': '#B41717',
            'ERB': '#CC342D',
            'Pug': '#A86454',
            'EJS': '#A91E50',
            
            // Game Development
            'GDScript': '#355570',
            'Unity': '#000000',
            'UnrealScript': '#A80000',
            
            // Scientific/Data Languages
            'R': '#198CE7',
            'MATLAB': '#E16737',
            'Julia': '#9558B2',
            'Octave': '#0790C0',
            
            // Legacy Languages
            'Fortran': '#734F96',
            'COBOL': '#0076D6',
            'Pascal': '#E3F171',
            'Ada': '#02F88C',
            'LISP': '#9ACD32',
            'Prolog': '#74283C',
            'Scheme': '#1E4AEC',
            'Smalltalk': '#596706',
            
            // Hardware/Specialized Languages
            'Verilog': '#B2B7F8',
            'VHDL': '#543978',
            'TCL': '#E4CC98',
            
            // Query Languages
            'GraphQL': '#E10098',
            'SPARQL': '#0C5D9C',
            
            // Blockchain
            'Solidity': '#363636',
            'Vyper': '#2980B9',
            
            // Default
            'Unknown': '#95A5A6',
            'No Extension': '#95A5A6'
        };
        
        return colorMap[language] || '#95A5A6';
    }
}