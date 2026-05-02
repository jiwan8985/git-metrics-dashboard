// import * as vscode from 'vscode';
// import { MetricsData } from './gitAnalyzer';

// export interface ReportOptions {
//     format: 'html' | 'json' | 'csv' | 'markdown';
//     includeSummary: boolean;
//     includeCharts: boolean;
//     includeFileStats: boolean;
//     includeAuthorStats: boolean;
//     includeTimeAnalysis: boolean;
//     period: number;
// }

// export interface ExportResult {
//     success: boolean;
//     filePath?: string;
//     error?: string;
// }

// export class ReportGenerator {
//     private _context: vscode.ExtensionContext;

//     constructor(context: vscode.ExtensionContext) {
//         this._context = context;
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
//                 panelBorder: '#d0d7de',
//                 gradientStart: '#667eea',
//                 gradientEnd: '#764ba2'
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
//                 panelBorder: '#30363d',
//                 gradientStart: '#4c6ef5',
//                 gradientEnd: '#7c3aed'
//             };
//         }
//     }

//     async generateReport(metrics: MetricsData, options: ReportOptions): Promise<ExportResult> {
//         try {
//             const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
//             if (!workspaceFolder) {
//                 return { success: false, error: '워크스페이스가 열려있지 않습니다.' };
//             }

//             // VS Code API를 사용한 안전한 경로 처리
//             const config = vscode.workspace.getConfiguration('gitMetrics');
//             const customPath = config.get<string>('export.customReportsPath', '');
            
//             let reportsUri: vscode.Uri;
//             if (customPath) {
//                 reportsUri = vscode.Uri.file(customPath);
//             } else {
//                 reportsUri = vscode.Uri.joinPath(workspaceFolder.uri, 'git-metrics-reports');
//             }

//             // 디렉토리 생성 (VS Code API 사용)
//             try {
//                 await vscode.workspace.fs.createDirectory(reportsUri);
//             } catch (error) {
//                 // 디렉토리가 이미 존재하거나 생성 가능한 경우 무시
//                 if ((error as vscode.FileSystemError).code !== 'FileExists') {
//                     // 폴백: 사용자 홈 디렉토리 사용
//                     const homeUri = vscode.Uri.file(require('os').homedir());
//                     reportsUri = vscode.Uri.joinPath(homeUri, 'git-metrics-reports');
//                     try {
//                         await vscode.workspace.fs.createDirectory(reportsUri);
//                     } catch (fallbackError) {
//                         return { 
//                             success: false, 
//                             error: '리포트 저장 폴더를 생성할 수 없습니다. 폴더 권한을 확인해주세요.' 
//                         };
//                     }
//                 }
//             }

//             // 안전한 파일명 생성
//             const now = new Date();
//             const timestamp = now.toISOString().split('T')[0]; // YYYY-MM-DD 형식
//             const safeFileName = `git-metrics-report-${timestamp}-${options.period}days.${options.format}`;
//             const fileUri = vscode.Uri.joinPath(reportsUri, safeFileName);

//             // 리포트 내용 생성
//             let content: string;
//             switch (options.format) {
//                 case 'html':
//                     content = this.generateHTMLReport(metrics, options);
//                     break;
//                 case 'json':
//                     content = this.generateJSONReport(metrics, options);
//                     break;
//                 case 'csv':
//                     content = this.generateCSVReport(metrics, options);
//                     break;
//                 case 'markdown':
//                     content = this.generateMarkdownReport(metrics, options);
//                     break;
//                 default:
//                     return { success: false, error: '지원하지 않는 포맷입니다.' };
//             }

//             // VS Code API를 사용한 안전한 파일 쓰기
//             const encoder = new TextEncoder();
//             let fileContent: Uint8Array;

//             // CSV의 경우 Excel 호환성을 위해 BOM 추가
//             if (options.format === 'csv') {
//                 const BOM = '\uFEFF';
//                 fileContent = encoder.encode(BOM + content);
//             } else {
//                 fileContent = encoder.encode(content);
//             }

//             await vscode.workspace.fs.writeFile(fileUri, fileContent);

//             return { success: true, filePath: fileUri.fsPath };

//         } catch (error) {
//             let errorMessage = '리포트 생성 중 오류가 발생했습니다.';
            
//             if (error instanceof vscode.FileSystemError) {
//                 switch (error.code) {
//                     case 'FileNotFound':
//                         errorMessage = '저장 경로를 찾을 수 없습니다.';
//                         break;
//                     case 'NoPermissions':
//                         errorMessage = '파일 저장 권한이 없습니다. 다른 위치를 선택하거나 권한을 확인해주세요.';
//                         break;
//                     case 'FileExists':
//                         errorMessage = '같은 이름의 파일이 이미 존재합니다.';
//                         break;
//                     default:
//                         errorMessage = `파일 시스템 오류: ${error.message}`;
//                 }
//             } else {
//                 errorMessage = `예상치 못한 오류: ${error}`;
//             }

//             return { success: false, error: errorMessage };
//         }
//     }

//     private getExtensionInfo(): { version: string; name: string } {
//         const packageJson = this._context.extension.packageJSON;
//         return {
//             version: packageJson.version || '1.0.0',
//             name: packageJson.displayName || 'Git Metrics Dashboard'
//         };
//     }

//     private generateHTMLReport(metrics: MetricsData, options: ReportOptions): string {
//         const projectName = vscode.workspace.workspaceFolders?.[0]?.name || 'Git Project';
//         const generatedAt = new Date().toLocaleString();
//         const extensionInfo = this.getExtensionInfo();

//         // 현재 테마 설정 확인
//         const config = vscode.workspace.getConfiguration('gitMetrics');
//         const useThemeInReports = config.get<boolean>('export.useThemeInReports', true);
        
//         // 테마 적용 여부에 따라 색상 설정
//         const currentTheme = useThemeInReports ? this.getCurrentTheme() : 'light';
//         const colors = this.getThemeColors(currentTheme);
//         const themeClass = currentTheme === 'dark' ? 'dark-theme' : 'light-theme';

//         return `<!DOCTYPE html>
// <html lang="ko">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Git Metrics Report - ${projectName}</title>
//     <style>
//     :root {
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
//             --gradient-start: ${colors.gradientStart};
//             --gradient-end: ${colors.gradientEnd};
//         }

//         body {
//             font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
//             margin: 0;
//             padding: 40px;
//             background: var(--bg-color);
//             color: var(--text-color);
//             line-height: 1.6;
//             transition: all 0.3s ease;
//         }
        
//         .container {
//             max-width: 1200px;
//             margin: 0 auto;
//             background: var(--bg-color);
//             border-radius: 12px;
//             box-shadow: 0 4px 20px var(--card-shadow);
//             overflow: hidden;
//             border: 1px solid var(--border-color);
//         }
        
//         .header {
//             background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
//             color: ${currentTheme === 'light' ? '#ffffff' : '#ffffff'};
//             padding: 40px;
//             text-align: center;
//         }
        
//         .header h1 {
//             margin: 0 0 10px 0;
//             font-size: 32px;
//             font-weight: 700;
//         }
        
//         .header p {
//             margin: 0;
//             opacity: 0.9;
//             font-size: 16px;
//         }
//             .theme-indicator {
//             position: absolute;
//             top: 20px;
//             right: 20px;
//             background: rgba(255, 255, 255, 0.2);
//             padding: 8px 12px;
//             border-radius: 20px;
//             font-size: 12px;
//             font-weight: 500;
//         }

//         .content {
//             padding: 40px;
//         }

//         .section {
//             margin-bottom: 40px;
//         }

//         .section h2 {
//             color: var(--primary-color);
//             border-bottom: 3px solid var(--primary-color);
//             padding-bottom: 10px;
//             margin-bottom: 20px;
//             font-size: 24px;
//         }
        
//         .metrics-grid {
//             display: grid;
//             grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
//             gap: 20px;
//             margin-bottom: 30px;
//         }
        
//         .metric-card {
//             background: var(--secondary-bg);
//             border: 1px solid var(--border-color);
//             border-radius: 8px;
//             padding: 24px;
//             text-align: center;
//             transition: transform 0.2s ease;
//         }
        
//         .metric-card:hover {
//             transform: translateY(-2px);
//             box-shadow: 0 4px 12px var(--card-shadow);
//         }
        
//         .metric-value {
//             font-size: 36px;
//             font-weight: 900;
//             color: var(--primary-color);
//             margin-bottom: 8px;
//         }
        
//         .metric-label {
//             font-size: 14px;
//             color: var(--text-muted);
//             text-transform: uppercase;
//             letter-spacing: 0.5px;
//         }
//         .table {
//             width: 100%;
//             border-collapse: collapse;
//             margin: 20px 0;
//             background: var(--bg-color);
//             border-radius: 8px;
//             overflow: hidden;
//             box-shadow: 0 2px 8px var(--card-shadow);
//         }
        
//         .table th {
//             background: var(--primary-color);
//             color: ${currentTheme === 'light' ? '#ffffff' : '#000000'};
//             padding: 16px;
//             text-align: left;
//             font-weight: 600;
//         }
        
//         .table td {
//             padding: 12px 16px;
//             border-bottom: 1px solid var(--border-color);
//             color: var(--text-color);
//         }
        
//         .table tr:last-child td {
//             border-bottom: none;
//         }
        
//         .table tr:hover {
//             background: var(--hover-bg);
//         }
//         .badge {
//             display: inline-block;
//             padding: 4px 8px;
//             border-radius: 12px;
//             font-size: 12px;
//             font-weight: 500;
//             color: ${currentTheme === 'light' ? '#ffffff' : '#000000'};
//         }
        
//         .badge-primary { background: var(--primary-color); }
//         .badge-success { background: var(--success-color); }
//         .badge-warning { 
//             background: var(--warning-color); 
//             color: ${currentTheme === 'light' ? '#000000' : '#000000'};
//         }
        
//         .footer {
//             text-align: center;
//             padding: 20px;
//             background: var(--secondary-bg);
//             color: var(--text-muted);
//             font-size: 14px;
//             border-top: 1px solid var(--border-color);
//         }

//         .theme-toggle-info {
//             background: var(--hover-bg);
//             border: 1px solid var(--border-color);
//             border-radius: 8px;
//             padding: 15px;
//             margin-bottom: 20px;
//             font-size: 14px;
//             color: var(--text-muted);
//         }
        
//         @media print {
//             body { 
//                 background: white; 
//                 padding: 0; 
//                 color: black;
//             }
//             .container { 
//                 box-shadow: none; 
//                 border: none;
//             }
//             .theme-indicator,
//             .theme-toggle-info {
//                 display: none;
//             }
//         }
        
//         /* 다크 테마 전용 스타일 */
//         .dark-theme .header {
//             background: linear-gradient(135deg, #4c6ef5 0%, #7c3aed 100%);
//         }
        
//         /* 라이트 테마 전용 스타일 */
//         .light-theme .header {
//             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//         }

//     </style>
// </head>
// <body>
//     <div class="container">
//         <div class="header">
//             <div class="theme-indicator">
//                 ${currentTheme === 'dark' ? '🌙 다크 테마' : '☀️ 라이트 테마'}
//             </div>
//             <h1>📊 Git Metrics Report</h1>
//             <p>${projectName} • ${options.period}일 분석 • 생성일: ${generatedAt}</p>
//         </div>
        
//         <div class="content">
//             ${useThemeInReports ? `
//             <div class="theme-toggle-info">
//                 📝 <strong>테마 정보:</strong> 이 리포트는 현재 Git Metrics Dashboard의 
//                 '${currentTheme === 'dark' ? '다크' : '라이트'}' 테마 설정으로 생성되었습니다. 
//                 VS Code 설정에서 <code>gitMetrics.export.useThemeInReports</code>를 false로 설정하면 
//                 항상 라이트 테마로 리포트를 생성할 수 있습니다.
//             </div>
//             ` : ''}
//             ${options.includeSummary ? this.generateSummarySection(metrics, options.period) : ''}
//             ${options.includeAuthorStats ? this.generateAuthorStatsSection(metrics) : ''}
//             ${options.includeFileStats ? this.generateFileStatsSection(metrics) : ''}
//             ${options.includeTimeAnalysis ? this.generateTimeAnalysisSection(metrics) : ''}
//         </div>
        
//         <div class="footer">
//             <p>${extensionInfo.name} v${extensionInfo.version} • Generated with ❤️ by VS Code Extension</p>
//             <p>테마: ${currentTheme === 'dark' ? '다크 모드' : '라이트 모드'} | 
//                생성 시간: ${new Date().toLocaleString()}</p>
//         </div>
//     </div>
// </body>
// </html>`;
//     }

//     private generateSummarySection(metrics: MetricsData, period: number): string {
//         return `
//         <div class="section">
//             <h2>📋 요약 통계</h2>
//             <div class="metrics-grid">
//                 <div class="metric-card">
//                     <div class="metric-value">${metrics.totalCommits}</div>
//                     <div class="metric-label">총 커밋 수</div>
//                 </div>
//                 <div class="metric-card">
//                     <div class="metric-value">${metrics.totalFiles}</div>
//                     <div class="metric-label">수정된 파일</div>
//                 </div>
//                 <div class="metric-card">
//                     <div class="metric-value">${(metrics.totalCommits / period).toFixed(1)}</div>
//                     <div class="metric-label">일평균 커밋</div>
//                 </div>
//                 <div class="metric-card">
//                     <div class="metric-value">${metrics.totalAuthors}</div>
//                     <div class="metric-label">활성 개발자</div>
//                 </div>
//                 <div class="metric-card">
//                     <div class="metric-value">${Math.max(...Object.values(metrics.dailyCommits), 0)}</div>
//                     <div class="metric-label">최고 일일 커밋</div>
//                 </div>
//                 <div class="metric-card">
//                     <div class="metric-value">${metrics.topFileType}</div>
//                     <div class="metric-label">주력 파일 타입</div>
//                 </div>
//             </div>
//         </div>`;
//     }

//     private generateAuthorStatsSection(metrics: MetricsData): string {
//         const authorRows = metrics.authorStats.slice(0, 10).map(author => `
//             <tr>
//                 <td><span class="badge badge-primary">${author.rank}</span></td>
//                 <td><strong>${author.name}</strong></td>
//                 <td>${author.commits}</td>
//                 <td>${author.files}</td>
//                 <td>${author.percentage}%</td>
//                 <td>+${author.insertions}/-${author.deletions}</td>
//                 <td>${author.averageCommitsPerDay}</td>
//             </tr>
//         `).join('');

//         return `
//         <div class="section">
//             <h2>👥 개발자별 기여도</h2>
//             <table class="table">
//                 <thead>
//                     <tr>
//                         <th>순위</th>
//                         <th>개발자</th>
//                         <th>커밋 수</th>
//                         <th>파일 수</th>
//                         <th>기여도</th>
//                         <th>코드 변경</th>
//                         <th>일평균</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     ${authorRows}
//                 </tbody>
//             </table>
//         </div>`;
//     }

//     private generateFileStatsSection(metrics: MetricsData): string {
//         const fileTypeRows = metrics.fileTypeStats.slice(0, 15).map((fileType, index) => `
//             <tr>
//                 <td><span class="badge badge-success">${index + 1}</span></td>
//                 <td><strong>.${fileType.extension}</strong></td>
//                 <td>${fileType.language}</td>
//                 <td>${fileType.category}</td>
//                 <td>${fileType.commits}</td>
//                 <td>${fileType.files}</td>
//                 <td>${fileType.percentage}%</td>
//             </tr>
//         `).join('');

//         return `
//         <div class="section">
//             <h2>📁 파일 타입별 분석</h2>
//             <table class="table">
//                 <thead>
//                     <tr>
//                         <th>순위</th>
//                         <th>확장자</th>
//                         <th>언어</th>
//                         <th>카테고리</th>
//                         <th>커밋 수</th>
//                         <th>파일 수</th>
//                         <th>비율</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     ${fileTypeRows}
//                 </tbody>
//             </table>
//         </div>`;
//     }

//     private generateTimeAnalysisSection(metrics: MetricsData): string {
//         const timeAnalysis = metrics.timeAnalysis;
        
//         return `
//         <div class="section">
//             <h2>⏰ 시간대별 분석</h2>
//             <div class="metrics-grid">
//                 <div class="metric-card">
//                     <div class="metric-value">${timeAnalysis.peakHour}</div>
//                     <div class="metric-label">최고 활동 시간</div>
//                 </div>
//                 <div class="metric-card">
//                     <div class="metric-value">${timeAnalysis.peakDay}</div>
//                     <div class="metric-label">최고 활동 요일</div>
//                 </div>
//                 <div class="metric-card">
//                     <div class="metric-value">${timeAnalysis.nightPercentage}%</div>
//                     <div class="metric-label">야간 커밋 비율</div>
//                 </div>
//                 <div class="metric-card">
//                     <div class="metric-value">${timeAnalysis.weekendPercentage}%</div>
//                     <div class="metric-label">주말 커밋 비율</div>
//                 </div>
//             </div>
//             <p><strong>업무 시간 분석:</strong> ${timeAnalysis.workingHours.start}시 - ${timeAnalysis.workingHours.end}시 (총 ${timeAnalysis.workingHours.commits}개 커밋)</p>
//         </div>`;
//     }

//     private generateJSONReport(metrics: MetricsData, options: ReportOptions): string {
//         const extensionInfo = this.getExtensionInfo();
//         const report = {
//             metadata: {
//                 generatedAt: new Date().toISOString(),
//                 period: options.period,
//                 projectName: vscode.workspace.workspaceFolders?.[0]?.name || 'Git Project',
//                 extensionInfo: extensionInfo,
//                 options: options
//             },
//             summary: options.includeSummary ? {
//                 totalCommits: metrics.totalCommits,
//                 totalFiles: metrics.totalFiles,
//                 totalAuthors: metrics.totalAuthors,
//                 averageCommitsPerDay: (metrics.totalCommits / options.period),
//                 topAuthor: metrics.topAuthor,
//                 topFileType: metrics.topFileType
//             } : undefined,
//             authorStats: options.includeAuthorStats ? metrics.authorStats : undefined,
//             fileStats: options.includeFileStats ? {
//                 fileTypes: metrics.fileTypes,
//                 fileTypeStats: metrics.fileTypeStats,
//                 programmingLanguages: metrics.programmingLanguages
//             } : undefined,
//             timeAnalysis: options.includeTimeAnalysis ? metrics.timeAnalysis : undefined,
//             dailyCommits: metrics.dailyCommits,
//             thisWeekTopFiles: metrics.thisWeekTopFiles
//         };

//         return JSON.stringify(report, null, 2);
//     }

//     private generateCSVReport(metrics: MetricsData, options: ReportOptions): string {
//         let csv = '';

//         if (options.includeAuthorStats) {
//             csv += '개발자별 통계\n';
//             csv += '순위,개발자,커밋수,파일수,기여도(%),추가라인,삭제라인,일평균커밋\n';
//             metrics.authorStats.forEach(author => {
//                 csv += `${author.rank},"${author.name}",${author.commits},${author.files},${author.percentage},${author.insertions},${author.deletions},${author.averageCommitsPerDay}\n`;
//             });
//             csv += '\n';
//         }

//         if (options.includeFileStats) {
//             csv += '파일 타입별 통계\n';
//             csv += '순위,확장자,언어,카테고리,커밋수,파일수,비율(%)\n';
//             metrics.fileTypeStats.forEach((fileType, index) => {
//                 csv += `${index + 1},"${fileType.extension}","${fileType.language}","${fileType.category}",${fileType.commits},${fileType.files},${fileType.percentage}\n`;
//             });
//             csv += '\n';
//         }

//         if (options.includeTimeAnalysis) {
//             csv += '시간대별 분석\n';
//             csv += '요일별 활동\n';
//             csv += '요일,커밋수\n';
//             Object.entries(metrics.timeAnalysis.weeklyActivity).forEach(([day, commits]) => {
//                 csv += `"${day}",${commits}\n`;
//             });
//             csv += '\n시간별 활동\n';
//             csv += '시간,커밋수\n';
//             Object.entries(metrics.timeAnalysis.hourlyActivity).forEach(([hour, commits]) => {
//                 csv += `"${hour}시",${commits}\n`;
//             });
//         }

//         return csv;
//     }

//     private generateMarkdownReport(metrics: MetricsData, options: ReportOptions): string {
//         const projectName = vscode.workspace.workspaceFolders?.[0]?.name || 'Git Project';
//         const generatedAt = new Date().toLocaleString();
//         const extensionInfo = this.getExtensionInfo();

//         let md = `# 📊 Git Metrics Report

// **프로젝트:** ${projectName}  
// **분석 기간:** ${options.period}일  
// **생성일:** ${generatedAt}  

// ---

// `;

//         if (options.includeSummary) {
//             md += `## 📋 요약 통계

// | 항목 | 값 |
// |------|-----|
// | 총 커밋 수 | ${metrics.totalCommits} |
// | 수정된 파일 | ${metrics.totalFiles} |
// | 일평균 커밋 | ${(metrics.totalCommits / options.period).toFixed(1)} |
// | 활성 개발자 | ${metrics.totalAuthors} |
// | 최고 일일 커밋 | ${Math.max(...Object.values(metrics.dailyCommits), 0)} |
// | 주력 파일 타입 | ${metrics.topFileType} |

// ---

// `;
//         }

//         if (options.includeAuthorStats) {
//             md += `## 👥 개발자별 기여도

// | 순위 | 개발자 | 커밋 수 | 파일 수 | 기여도 | 코드 변경 | 일평균 |
// |------|--------|---------|---------|---------|-----------|---------|
// `;
//             metrics.authorStats.slice(0, 10).forEach(author => {
//                 md += `| ${author.rank} | ${author.name} | ${author.commits} | ${author.files} | ${author.percentage}% | +${author.insertions}/-${author.deletions} | ${author.averageCommitsPerDay} |\n`;
//             });
//             md += '\n---\n\n';
//         }

//         if (options.includeFileStats) {
//             md += `## 📁 파일 타입별 분석

// | 순위 | 확장자 | 언어 | 카테고리 | 커밋 수 | 파일 수 | 비율 |
// |------|--------|------|----------|---------|---------|------|
// `;
//             metrics.fileTypeStats.slice(0, 15).forEach((fileType, index) => {
//                 md += `| ${index + 1} | .${fileType.extension} | ${fileType.language} | ${fileType.category} | ${fileType.commits} | ${fileType.files} | ${fileType.percentage}% |\n`;
//             });
//             md += '\n---\n\n';
//         }

//         if (options.includeTimeAnalysis) {
//             const timeAnalysis = metrics.timeAnalysis;
//             md += `## ⏰ 시간대별 분석

// **최고 활동 시간:** ${timeAnalysis.peakHour}  
// **최고 활동 요일:** ${timeAnalysis.peakDay}  
// **야간 커밋 비율:** ${timeAnalysis.nightPercentage}%  
// **주말 커밋 비율:** ${timeAnalysis.weekendPercentage}%  
// **주요 업무 시간:** ${timeAnalysis.workingHours.start}시 - ${timeAnalysis.workingHours.end}시

// ### 요일별 활동

// | 요일 | 커밋 수 |
// |------|---------|
// `;
//             Object.entries(timeAnalysis.weeklyActivity).forEach(([day, commits]) => {
//                 md += `| ${day} | ${commits} |\n`;
//             });

//             md += `
// ### 시간별 활동

// | 시간 | 커밋 수 |
// |------|---------|
// `;
//             Object.entries(timeAnalysis.hourlyActivity).forEach(([hour, commits]) => {
//                 md += `| ${hour}시 | ${commits} |\n`;
//             });
//         }

//         md += `
// ---

// *Generated by ${extensionInfo.name} v${extensionInfo.version}*
// `;

//         return md;
//     }
// }

import * as vscode from 'vscode';
import { MetricsData } from './gitAnalyzer';
import { BadgeRarity } from './badgeSystem';
import { prepareRepositoryIntelligence, calcPRReadiness } from './repositoryIntelligence';

export interface ReportOptions {
    format: 'html' | 'json' | 'csv' | 'markdown';
    template?: 'full' | 'executive' | 'pr' | 'developer';
    includeSummary: boolean;
    includeCharts: boolean;
    includeFileStats: boolean;
    includeAuthorStats: boolean;
    includeTimeAnalysis: boolean;
    includeBadges: boolean;
    includePRReadiness?: boolean;
    includeStreak?: boolean;
    period: number;
}

export interface ExportResult {
    success: boolean;
    filePath?: string;
    error?: string;
}

export class ReportGenerator {
    private _context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this._context = context;
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
                panelBorder: '#d0d7de',
                gradientStart: '#667eea',
                gradientEnd: '#764ba2'
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
                panelBorder: '#30363d',
                gradientStart: '#4c6ef5',
                gradientEnd: '#7c3aed'
            };
        }
    }

    async generateReport(metrics: MetricsData, options: ReportOptions): Promise<ExportResult> {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                return { success: false, error: '워크스페이스가 열려있지 않습니다.' };
            }

            // VS Code API를 사용한 안전한 경로 처리
            const config = vscode.workspace.getConfiguration('gitMetrics');
            const customPath = config.get<string>('export.customReportsPath', '');
            
            let reportsUri: vscode.Uri;
            if (customPath) {
                reportsUri = vscode.Uri.file(customPath);
            } else {
                reportsUri = vscode.Uri.joinPath(workspaceFolder.uri, 'git-metrics-reports');
            }

            // 디렉토리 생성 (VS Code API 사용)
            try {
                await vscode.workspace.fs.createDirectory(reportsUri);
            } catch (error) {
                // 디렉토리가 이미 존재하거나 생성 가능한 경우 무시
                if ((error as vscode.FileSystemError).code !== 'FileExists') {
                    // 폴백: 사용자 홈 디렉토리 사용
                    const homeUri = vscode.Uri.file(require('os').homedir());
                    reportsUri = vscode.Uri.joinPath(homeUri, 'git-metrics-reports');
                    try {
                        await vscode.workspace.fs.createDirectory(reportsUri);
                    } catch (fallbackError) {
                        return { 
                            success: false, 
                            error: '리포트 저장 폴더를 생성할 수 없습니다. 폴더 권한을 확인해주세요.' 
                        };
                    }
                }
            }

            // 안전한 파일명 생성
            const now = new Date();
            const timestamp = now.toISOString().split('T')[0]; // YYYY-MM-DD 형식
            const templateName = options.template || 'full';
            const branchName = (metrics.branchStats?.currentBranch || 'unknown')
                .replace(/[^a-zA-Z0-9-_]/g, '-')
                .replace(/-+/g, '-')
                .slice(0, 20)
                .replace(/^-|-$/g, '');
            const safeFileName = `git-metrics-${templateName}-${branchName || 'repo'}-${timestamp}-${options.period}days.${options.format}`;
            const fileUri = vscode.Uri.joinPath(reportsUri, safeFileName);

            // 리포트 내용 생성
            let content: string;
            switch (options.format) {
                case 'html':
                    content = this.generateHTMLReport(metrics, options);
                    break;
                case 'json':
                    content = this.generateJSONReport(metrics, options);
                    break;
                case 'csv':
                    content = this.generateCSVReport(metrics, options);
                    break;
                case 'markdown':
                    content = this.generateMarkdownReport(metrics, options);
                    break;
                default:
                    return { success: false, error: '지원하지 않는 포맷입니다.' };
            }

            // VS Code API를 사용한 안전한 파일 쓰기
            const encoder = new TextEncoder();
            let fileContent: Uint8Array;

            // CSV의 경우 Excel 호환성을 위해 BOM 추가
            if (options.format === 'csv') {
                const BOM = '\uFEFF';
                fileContent = encoder.encode(BOM + content);
            } else {
                fileContent = encoder.encode(content);
            }

            await vscode.workspace.fs.writeFile(fileUri, fileContent);

            return { success: true, filePath: fileUri.fsPath };

        } catch (error) {
            let errorMessage = '리포트 생성 중 오류가 발생했습니다.';
            
            if (error instanceof vscode.FileSystemError) {
                switch (error.code) {
                    case 'FileNotFound':
                        errorMessage = '저장 경로를 찾을 수 없습니다.';
                        break;
                    case 'NoPermissions':
                        errorMessage = '파일 저장 권한이 없습니다. 다른 위치를 선택하거나 권한을 확인해주세요.';
                        break;
                    case 'FileExists':
                        errorMessage = '같은 이름의 파일이 이미 존재합니다.';
                        break;
                    default:
                        errorMessage = `파일 시스템 오류: ${error.message}`;
                }
            } else {
                errorMessage = `예상치 못한 오류: ${error}`;
            }

            return { success: false, error: errorMessage };
        }
    }

    private getExtensionInfo(): { version: string; name: string } {
        const packageJson = this._context.extension.packageJSON;
        return {
            version: packageJson.version || '1.0.0',
            name: packageJson.displayName || 'Git Metrics Dashboard'
        };
    }

    private generateHTMLReport(metrics: MetricsData, options: ReportOptions): string {
        const projectName = vscode.workspace.workspaceFolders?.[0]?.name || 'Git Project';
        const generatedAt = new Date().toLocaleString();
        const extensionInfo = this.getExtensionInfo();

        // 현재 테마 설정 확인
        const config = vscode.workspace.getConfiguration('gitMetrics');
        const useThemeInReports = config.get<boolean>('export.useThemeInReports', true);
        
        // 테마 적용 여부에 따라 색상 설정
        const currentTheme = useThemeInReports ? this.getCurrentTheme() : 'light';
        const colors = this.getThemeColors(currentTheme);
        const intelligence = options.includeSummary ? prepareRepositoryIntelligence(metrics, options.period) : null;
        const currentStreak = metrics.commitStreak?.currentStreak || 0;
        const scoreColor = intelligence
            ? (intelligence.healthScore >= 78 ? '#3fb950' : intelligence.healthScore >= 58 ? '#e3b341' : '#f85149')
            : '#3fb950';
        const templateLabel: Record<string, string> = {
            full: '📊 Full Report', executive: '👔 Executive', pr: '🔀 PR Report', developer: '👤 Developer'
        };

        return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Git Metrics Report - ${projectName}</title>
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
            --gradient-start: ${colors.gradientStart};
            --gradient-end: ${colors.gradientEnd};
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 0;
            padding: 40px;
            background: var(--bg-color);
            color: var(--text-color);
            line-height: 1.6;
            transition: all 0.3s ease;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: var(--bg-color);
            border-radius: 12px;
            box-shadow: 0 4px 20px var(--card-shadow);
            overflow: hidden;
            border: 1px solid var(--border-color);
        }
        
        .header {
            background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
            color: #ffffff;
            padding: 40px;
            text-align: center;
            position: relative;
        }
        
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 32px;
            font-weight: 700;
        }
        
        .header p {
            margin: 0;
            opacity: 0.9;
            font-size: 16px;
        }
        
        .theme-indicator {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
        }

        .content {
            padding: 40px;
        }

        .section {
            margin-bottom: 40px;
        }

        .section h2 {
            color: var(--primary-color);
            border-bottom: 3px solid var(--primary-color);
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: 24px;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: var(--secondary-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 24px;
            text-align: center;
            transition: transform 0.2s ease;
        }
        
        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px var(--card-shadow);
        }
        
        .metric-value {
            font-size: 36px;
            font-weight: 900;
            color: var(--primary-color);
            margin-bottom: 8px;
        }
        
        .metric-label {
            font-size: 14px;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: var(--bg-color);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px var(--card-shadow);
        }
        
        .table th {
            background: var(--primary-color);
            color: #ffffff;
            padding: 16px;
            text-align: left;
            font-weight: 600;
        }
        
        .table td {
            padding: 12px 16px;
            border-bottom: 1px solid var(--border-color);
            color: var(--text-color);
        }
        
        .table tr:last-child td {
            border-bottom: none;
        }
        
        .table tr:hover {
            background: var(--hover-bg);
        }
        
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            color: #ffffff;
        }
        
        .badge-primary { 
            background: var(--primary-color); 
        }
        
        .badge-success { 
            background: var(--success-color); 
        }
        
        .badge-warning { 
            background: var(--warning-color); 
            color: #000000;
        }
        
        .footer {
            text-align: center;
            padding: 24px 20px;
            background: var(--secondary-bg);
            color: var(--text-muted);
            font-size: 13px;
            border-top: 1px solid var(--border-color);
        }

        .footer a { color: var(--primary-color); text-decoration: none; }
        .footer a:hover { text-decoration: underline; }

        .footer-cta {
            display: inline-block;
            margin-top: 10px;
            padding: 7px 18px;
            background: var(--primary-color);
            color: #ffffff !important;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            text-decoration: none !important;
        }

        .theme-toggle-info {
            background: var(--hover-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            font-size: 14px;
            color: var(--text-muted);
        }
        
        /* 배지 시스템 스타일 */
        .badge-list {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            margin: 20px 0;
        }

        .badge-item {
            display: flex;
            align-items: center;
            background: var(--secondary-bg);
            border: 2px solid var(--border-color);
            border-radius: 12px;
            padding: 12px 16px;
            min-width: 250px;
            transition: all 0.3s ease;
        }

        .badge-item.common {
            border-color: #6c757d;
        }

        .badge-item.uncommon {
            border-color: #28a745;
        }

        .badge-item.rare {
            border-color: #007bff;
        }

        .badge-item.epic {
            border-color: #6f42c1;
        }

        .badge-item.legendary {
            border-color: #fd7e14;
        }

        .badge-item.in-progress {
            opacity: 0.8;
            border-style: dashed;
        }

        .badge-icon {
            font-size: 24px;
            margin-right: 12px;
            flex-shrink: 0;
        }

        .badge-info {
            flex-grow: 1;
        }

        .badge-name {
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 4px;
            color: var(--text-color);
        }

        .badge-description {
            font-size: 12px;
            color: var(--text-muted);
            margin-bottom: 8px;
            line-height: 1.3;
        }

        .badge-rarity {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
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
            margin-top: 4px;
        }

        .badge-progress {
            margin: 8px 0;
        }

        .badge-progress .progress-bar {
            background: var(--border-color);
            border-radius: 6px;
            height: 10px;
            overflow: hidden;
            margin-bottom: 4px;
        }

        .badge-progress .progress-fill {
            height: 100%;
            background: var(--warning-color);
            border-radius: 6px;
            transition: width 0.3s ease;
        }

        .badge-progress .progress-text {
            font-size: 10px;
            color: var(--text-muted);
        }

        .rarity-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 12px;
            margin-top: 16px;
        }

        .rarity-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background: var(--secondary-bg);
            border-radius: 8px;
            border: 1px solid var(--border-color);
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

        @media print {
            body { 
                background: white; 
                padding: 0; 
                color: black;
            }
            .container { 
                box-shadow: none; 
                border: none;
            }
            .theme-indicator,
            .theme-toggle-info {
                display: none;
            }
        }

        .command-center {
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
            background: var(--secondary-bg);
        }

        .health-row {
            display: grid;
            grid-template-columns: minmax(160px, 220px) 1fr;
            gap: 20px;
            align-items: stretch;
        }

        .health-score {
            border: 1px solid var(--border-color);
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            background: var(--bg-color);
        }

        .health-number {
            font-size: 48px;
            font-weight: 900;
            color: var(--primary-color);
            line-height: 1;
        }

        .health-label {
            margin-top: 10px;
            font-weight: 700;
            color: var(--text-color);
        }

        .signal-grid,
        .action-grid,
        .focus-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 12px;
            margin-top: 16px;
        }

        .signal-card,
        .action-card,
        .focus-card {
            border: 1px solid var(--border-color);
            border-left: 4px solid var(--primary-color);
            border-radius: 8px;
            padding: 14px;
            background: var(--bg-color);
        }

        .signal-title,
        .priority {
            font-size: 12px;
            color: var(--text-muted);
            font-weight: 700;
            text-transform: uppercase;
        }

        .signal-value,
        .focus-risk {
            font-size: 22px;
            font-weight: 900;
            margin: 6px 0;
            color: var(--text-color);
        }

        @media (max-width: 700px) {
            .health-row {
                grid-template-columns: 1fr;
            }
        }

        /* ── Hero Header ── */
        .header { text-align: left !important; }
        .header-layout {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 24px;
        }
        .header-main { flex: 1; }
        .template-badge {
            display: inline-block;
            margin-top: 8px;
            background: rgba(255,255,255,0.18);
            padding: 3px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        .header-score { flex-shrink: 0; text-align: center; color: #fff; }
        .score-ring {
            width: 84px; height: 84px;
            border-radius: 50%;
            background: conic-gradient(
                var(--ring-clr, #3fb950) calc(var(--pct, 0) * 1%),
                rgba(255,255,255,0.2) 0
            );
            display: grid;
            place-items: center;
            position: relative;
            margin: 0 auto 6px;
        }
        .score-ring::before {
            content: '';
            position: absolute;
            inset: 10px;
            border-radius: 50%;
            background: rgba(0,0,0,0.35);
        }
        .score-number {
            position: relative; z-index: 1;
            font-size: 24px; font-weight: 900; color: #fff;
            text-shadow: 0 1px 3px rgba(0,0,0,0.4);
        }
        .score-label {
            font-size: 11px; font-weight: 600;
            letter-spacing: 0.5px; text-transform: uppercase;
            opacity: 0.85; margin-bottom: 4px;
        }
        .streak-pill {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 4px 12px; border-radius: 20px;
            font-size: 13px; font-weight: 600;
        }

        /* ── Colored metric cards ── */
        .metric-card.blue   .metric-value { color: #58a6ff; }
        .metric-card.green  .metric-value { color: #3fb950; }
        .metric-card.purple .metric-value { color: #bc8cff; }
        .metric-card.orange .metric-value { color: #e3b341; }
        .metric-card.pink   .metric-value { color: #f778ba; }
        .metric-card.teal   .metric-value { color: #39d353; }

        /* ── Contribution bar ── */
        .contrib-bar-wrap { display: flex; align-items: center; gap: 8px; }
        .contrib-bar {
            flex: 1; min-width: 50px; height: 8px;
            background: var(--border-color); border-radius: 4px; overflow: hidden;
        }
        .contrib-fill {
            height: 100%; background: var(--primary-color); border-radius: 4px;
        }

        /* ── File type horizontal bars ── */
        .type-bar-list { display: flex; flex-direction: column; gap: 8px; margin: 16px 0; }
        .type-bar-row {
            display: grid;
            grid-template-columns: 70px 1fr 48px;
            align-items: center; gap: 10px;
        }
        .type-bar-label { font-size: 13px; font-weight: 600; color: var(--text-color); text-align: right; }
        .type-bar-track {
            background: var(--border-color); border-radius: 6px; height: 16px; overflow: hidden;
        }
        .type-bar-fill {
            height: 100%; border-radius: 6px;
            background: linear-gradient(90deg, var(--primary-color), var(--success-color));
        }
        .type-bar-pct { font-size: 12px; color: var(--text-muted); text-align: right; }

        /* ── Streak section ── */
        .streak-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 16px; margin-bottom: 20px;
        }
        .streak-card {
            background: var(--secondary-bg); border: 1px solid var(--border-color);
            border-left: 4px solid #e3b341; border-radius: 8px; padding: 16px; text-align: center;
        }
        .streak-value { font-size: 30px; font-weight: 900; color: #e3b341; line-height: 1.1; }
        .mini-bar-chart {
            display: flex; align-items: flex-end; gap: 3px;
            height: 56px; padding: 8px;
            background: var(--secondary-bg); border-radius: 8px;
            border: 1px solid var(--border-color); margin-top: 12px;
        }
        .mini-bar { flex: 1; border-radius: 2px 2px 0 0; min-height: 3px; }
        .mini-bar-labels {
            display: flex; justify-content: space-between;
            padding: 4px 8px 0; font-size: 10px; color: var(--text-muted);
        }

        /* ── PR Readiness section ── */
        .pr-top { display: flex; align-items: center; gap: 20px; margin-bottom: 16px; flex-wrap: wrap; }
        .pr-score-circle {
            width: 72px; height: 72px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 22px; font-weight: 900; color: white; flex-shrink: 0;
        }
        .pr-score-good   { background: var(--success-color); }
        .pr-score-warn   { background: var(--warning-color); color: #000; }
        .pr-score-danger { background: var(--error-color); }
        .pr-meta { display: flex; flex-direction: column; gap: 6px; }
        .pr-size-badge {
            display: inline-block; padding: 4px 14px; border-radius: 20px;
            font-weight: 700; font-size: 15px;
            background: var(--secondary-bg); border: 1px solid var(--border-color);
        }
        .pr-risk-list { list-style: none; padding: 0; margin: 12px 0 0; }
        .pr-risk-list li {
            padding: 8px 14px; border-left: 3px solid var(--warning-color);
            background: var(--secondary-bg); margin-bottom: 8px;
            border-radius: 0 6px 6px 0; font-size: 14px;
        }
        .pr-risk-list li.ok { border-left-color: var(--success-color); }

        @media (max-width: 600px) {
            .header-layout { flex-direction: column; }
            .type-bar-row { grid-template-columns: 55px 1fr 40px; }
        }
    </style>
</head>
<body class="${currentTheme}-theme">
    <div class="container">
        <div class="header">
            <div class="theme-indicator">
                ${currentTheme === 'dark' ? '🌙 다크 테마' : '☀️ 라이트 테마'}
            </div>
            <div class="header-layout">
                <div class="header-main">
                    <h1>📊 Git Metrics Report</h1>
                    <p>${projectName} • ${options.period}일 분석 • 브랜치: ${metrics.branchStats?.currentBranch || 'N/A'} • 생성일: ${generatedAt}</p>
                    ${options.template ? `<div class="template-badge">${templateLabel[options.template] || options.template}</div>` : ''}
                </div>
                ${intelligence ? `
                <div class="header-score">
                    <div class="score-ring" style="--pct:${intelligence.healthScore};--ring-clr:${scoreColor}">
                        <span class="score-number">${intelligence.healthScore}</span>
                    </div>
                    <div class="score-label">Health Score</div>
                    ${currentStreak > 0 ? `<div class="streak-pill">🔥 ${currentStreak}d streak</div>` : ''}
                </div>
                ` : ''}
            </div>
        </div>
        
        <div class="content">
            ${useThemeInReports ? `
            <div class="theme-toggle-info">
                📝 <strong>테마 정보:</strong> 이 리포트는 현재 Git Metrics Dashboard의 
                '${currentTheme === 'dark' ? '다크' : '라이트'}' 테마 설정으로 생성되었습니다. 
                VS Code 설정에서 <code>gitMetrics.export.useThemeInReports</code>를 false로 설정하면 
                항상 라이트 테마로 리포트를 생성할 수 있습니다.
            </div>
            ` : ''}
            ${options.includeSummary ? this.generateCommandCenterSection(metrics, options.period) : ''}
            ${options.includePRReadiness && metrics.branchComparison ? this.generatePRReadinessSection(metrics) : ''}
            ${options.includeSummary ? this.generateSummarySection(metrics, options.period) : ''}
            ${options.includeAuthorStats ? this.generateAuthorStatsSection(metrics) : ''}
            ${options.includeFileStats ? this.generateFileStatsSection(metrics) : ''}
            ${options.includeTimeAnalysis ? this.generateTimeAnalysisSection(metrics) : ''}
            ${options.includeBadges ? this.generateBadgeSection(metrics) : ''}
            ${options.includeStreak ? this.generateStreakSection(metrics) : ''}
        </div>
        
        <div class="footer">
            <p>Generated by <a href="https://marketplace.visualstudio.com/items?itemName=jiwan-dev.git-metrics-dashboard"><strong>${extensionInfo.name}</strong></a> v${extensionInfo.version} for VS Code &nbsp;·&nbsp; ${currentTheme === 'dark' ? '🌙 Dark' : '☀️ Light'} &nbsp;·&nbsp; ${new Date().toLocaleString()}</p>
            <a class="footer-cta" href="https://marketplace.visualstudio.com/items?itemName=jiwan-dev.git-metrics-dashboard">⚡ Get Git Metrics Dashboard — Free for VS Code</a>
        </div>
    </div>
</body>
</html>`;
    }

    private generateCommandCenterSection(metrics: MetricsData, period: number): string {
        const intelligence = prepareRepositoryIntelligence(metrics, period);
        const actions = intelligence.actions.map(action => `
            <div class="action-card">
                <div class="priority">${action.priority}</div>
                <strong>${action.title}</strong>
                <div>${action.detail}</div>
            </div>
        `).join('');
        const focusFiles = intelligence.focusFiles.length > 0
            ? intelligence.focusFiles.map(file => `
                <div class="focus-card">
                    <div class="focus-risk">Risk ${file.score}</div>
                    <strong><code>${file.file}</code></strong>
                    <div>${file.reason}</div>
                </div>
            `).join('')
            : '<p>High-risk file candidates were not detected in this period.</p>';

        return `
        <div class="section command-center">
            <h2>🧠 Repository Command Center</h2>
            <div class="health-row">
                <div class="health-score">
                    <div class="health-number">${intelligence.healthScore}</div>
                    <div class="health-label">${intelligence.healthLabel}</div>
                    <p>${intelligence.summary}</p>
                </div>
                <div>
                    <div class="signal-grid">
                        ${intelligence.signals.map(signal => `
                        <div class="signal-card">
                            <div class="signal-title">${signal.title}</div>
                            <div class="signal-value">${signal.value}</div>
                            <div>${signal.detail}</div>
                        </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <h3>🎯 Recommended Next Moves</h3>
            <div class="action-grid">${actions}</div>
            <h3>🔥 Refactor Radar</h3>
            <div class="focus-grid">${focusFiles}</div>
        </div>`;
    }

    private generateSummarySection(metrics: MetricsData, period: number): string {
        return `
        <div class="section">
            <h2>📋 요약 통계</h2>
            <div class="metrics-grid">
                <div class="metric-card blue">
                    <div class="metric-value">${metrics.totalCommits}</div>
                    <div class="metric-label">총 커밋 수</div>
                </div>
                <div class="metric-card green">
                    <div class="metric-value">${metrics.totalFiles}</div>
                    <div class="metric-label">수정된 파일</div>
                </div>
                <div class="metric-card orange">
                    <div class="metric-value">${(metrics.totalCommits / period).toFixed(1)}</div>
                    <div class="metric-label">일평균 커밋</div>
                </div>
                <div class="metric-card purple">
                    <div class="metric-value">${metrics.totalAuthors}</div>
                    <div class="metric-label">활성 개발자</div>
                </div>
                <div class="metric-card pink">
                    <div class="metric-value">${Math.max(...Object.values(metrics.dailyCommits), 0)}</div>
                    <div class="metric-label">최고 일일 커밋</div>
                </div>
                <div class="metric-card teal">
                    <div class="metric-value">${metrics.topFileType}</div>
                    <div class="metric-label">주력 파일 타입</div>
                </div>
            </div>
        </div>`;
    }

    private generateAuthorStatsSection(metrics: MetricsData): string {
        const authorRows = metrics.authorStats.slice(0, 10).map(author => `
            <tr>
                <td><span class="badge badge-primary">${author.rank}</span></td>
                <td><strong>${author.name}</strong></td>
                <td>${author.commits}</td>
                <td>${author.files}</td>
                <td>
                    <div class="contrib-bar-wrap">
                        <div class="contrib-bar"><div class="contrib-fill" style="width:${author.percentage}%"></div></div>
                        <span>${author.percentage}%</span>
                    </div>
                </td>
                <td>+${author.insertions}/-${author.deletions}</td>
                <td>${author.averageCommitsPerDay}</td>
            </tr>
        `).join('');

        return `
        <div class="section">
            <h2>👥 개발자별 기여도</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>순위</th>
                        <th>개발자</th>
                        <th>커밋 수</th>
                        <th>파일 수</th>
                        <th>기여도</th>
                        <th>코드 변경</th>
                        <th>일평균</th>
                    </tr>
                </thead>
                <tbody>
                    ${authorRows}
                </tbody>
            </table>
        </div>`;
    }

    private generateFileStatsSection(metrics: MetricsData): string {
        const topTypes = metrics.fileTypeStats.slice(0, 8);
        const maxPct = Math.max(...topTypes.map(f => f.percentage), 1);
        const barChart = topTypes.map(f => `
            <div class="type-bar-row">
                <div class="type-bar-label">.${f.extension}</div>
                <div class="type-bar-track">
                    <div class="type-bar-fill" style="width:${Math.round((f.percentage / maxPct) * 100)}%"></div>
                </div>
                <div class="type-bar-pct">${f.percentage}%</div>
            </div>
        `).join('');

        const fileTypeRows = metrics.fileTypeStats.slice(0, 15).map((fileType, index) => `
            <tr>
                <td><span class="badge badge-success">${index + 1}</span></td>
                <td><strong>.${fileType.extension}</strong></td>
                <td>${fileType.language}</td>
                <td>${fileType.category}</td>
                <td>${fileType.commits}</td>
                <td>${fileType.files}</td>
                <td>${fileType.percentage}%</td>
            </tr>
        `).join('');

        return `
        <div class="section">
            <h2>📁 파일 타입별 분석</h2>
            <div class="type-bar-list">${barChart}</div>
            <table class="table">
                <thead>
                    <tr>
                        <th>순위</th>
                        <th>확장자</th>
                        <th>언어</th>
                        <th>카테고리</th>
                        <th>커밋 수</th>
                        <th>파일 수</th>
                        <th>비율</th>
                    </tr>
                </thead>
                <tbody>
                    ${fileTypeRows}
                </tbody>
            </table>
        </div>`;
    }

    private generateTimeAnalysisSection(metrics: MetricsData): string {
        const timeAnalysis = metrics.timeAnalysis;
        
        return `
        <div class="section">
            <h2>⏰ 시간대별 분석</h2>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">${timeAnalysis.peakHour}</div>
                    <div class="metric-label">최고 활동 시간</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${timeAnalysis.peakDay}</div>
                    <div class="metric-label">최고 활동 요일</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${timeAnalysis.nightPercentage}%</div>
                    <div class="metric-label">야간 커밋 비율</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${timeAnalysis.weekendPercentage}%</div>
                    <div class="metric-label">주말 커밋 비율</div>
                </div>
            </div>
            <p><strong>업무 시간 분석:</strong> ${timeAnalysis.workingHours.start}시 - ${timeAnalysis.workingHours.end}시 (총 ${timeAnalysis.workingHours.commits}개 커밋)</p>
        </div>`;
    }

    private generateBadgeSection(metrics: MetricsData): string {
        const badges = metrics.badges || [];
        const unlockedBadges = badges.filter(badge => badge.unlocked);
        const inProgressBadges = badges.filter(badge => !badge.unlocked && badge.progress > 0);
        
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

        const completionPercentage = badges.length > 0 ? Math.round((unlockedBadges.length / badges.length) * 100) : 0;

        return `
        <div class="section">
            <h2>🏆 개발자 뱃지 시스템</h2>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">${unlockedBadges.length}/${badges.length}</div>
                    <div class="metric-label">획득한 배지</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${completionPercentage}%</div>
                    <div class="metric-label">완료율</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${rarityStats[BadgeRarity.LEGENDARY] + rarityStats[BadgeRarity.EPIC]}</div>
                    <div class="metric-label">고급 배지</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${inProgressBadges.length}</div>
                    <div class="metric-label">진행 중</div>
                </div>
            </div>
            
            ${unlockedBadges.length > 0 ? `
            <h3>🎖️ 획득한 배지</h3>
            <div class="badge-list">
                ${unlockedBadges.map(badge => `
                <div class="badge-item ${badge.rarity}">
                    <span class="badge-icon">${badge.icon}</span>
                    <div class="badge-info">
                        <div class="badge-name">${badge.name}</div>
                        <div class="badge-description">${badge.description}</div>
                        <div class="badge-rarity">${badge.rarity.toUpperCase()}</div>
                        ${badge.unlockedAt ? `<div class="badge-date">획득일: ${badge.unlockedAt.toLocaleDateString()}</div>` : ''}
                    </div>
                </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${inProgressBadges.length > 0 ? `
            <h3>⏳ 진행 중인 배지</h3>
            <div class="badge-list">
                ${inProgressBadges.map(badge => `
                <div class="badge-item in-progress ${badge.rarity}">
                    <span class="badge-icon">${badge.icon}</span>
                    <div class="badge-info">
                        <div class="badge-name">${badge.name}</div>
                        <div class="badge-description">${badge.description}</div>
                        <div class="badge-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${badge.progress}%"></div>
                            </div>
                            <div class="progress-text">${badge.progress}% - ${badge.progressDescription}</div>
                        </div>
                        <div class="badge-rarity">${badge.rarity.toUpperCase()}</div>
                    </div>
                </div>
                `).join('')}
            </div>
            ` : ''}
            
            <h3>📊 희귀도별 통계</h3>
            <div class="rarity-stats">
                <div class="rarity-item">
                    <span class="rarity-badge common">Common</span>
                    <span>${rarityStats.common}</span>
                </div>
                <div class="rarity-item">
                    <span class="rarity-badge uncommon">Uncommon</span>
                    <span>${rarityStats.uncommon}</span>
                </div>
                <div class="rarity-item">
                    <span class="rarity-badge rare">Rare</span>
                    <span>${rarityStats.rare}</span>
                </div>
                <div class="rarity-item">
                    <span class="rarity-badge epic">Epic</span>
                    <span>${rarityStats.epic}</span>
                </div>
                <div class="rarity-item">
                    <span class="rarity-badge legendary">Legendary</span>
                    <span>${rarityStats.legendary}</span>
                </div>
            </div>
        </div>`;
    }

    private generateStreakSection(metrics: MetricsData): string {
        const streak = metrics.commitStreak;
        if (!streak) { return ''; }

        // 최근 14일 일별 커밋 데이터
        const today = new Date();
        const recent14: { date: string; count: number }[] = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = d.toISOString().split('T')[0];
            recent14.push({ date: key, count: metrics.dailyCommits[key] || 0 });
        }
        const maxCount = Math.max(...recent14.map(d => d.count), 1);
        const miniBars = recent14.map(d => {
            const heightPct = Math.max(Math.round((d.count / maxCount) * 100), 5);
            const bg = d.count > 0 ? '#e3b341' : 'var(--border-color)';
            return `<div class="mini-bar" style="height:${heightPct}%;background:${bg}" title="${d.date}: ${d.count}"></div>`;
        }).join('');

        const actColor = streak.activityRate >= 60 ? 'var(--success-color)' : streak.activityRate >= 30 ? 'var(--warning-color)' : 'var(--error-color)';
        return `
        <div class="section">
            <h2>🔥 커밋 스트릭</h2>
            <div class="streak-grid">
                <div class="streak-card">
                    <div class="streak-value">${streak.currentStreak}일</div>
                    <div class="metric-label">현재 스트릭</div>
                </div>
                <div class="streak-card">
                    <div class="streak-value">${streak.longestStreak}일</div>
                    <div class="metric-label">최장 스트릭</div>
                </div>
                <div class="streak-card">
                    <div class="streak-value" style="color:${actColor}">${streak.activityRate}%</div>
                    <div class="metric-label">활동률</div>
                </div>
                <div class="streak-card">
                    <div class="streak-value">${streak.activeDays}일</div>
                    <div class="metric-label">활성 일수</div>
                </div>
            </div>
            <div style="font-size:13px;color:var(--text-muted);margin-bottom:6px;">최근 14일 활동</div>
            <div class="mini-bar-chart">${miniBars}</div>
            <div class="mini-bar-labels"><span>-13일</span><span>-6일</span><span>오늘</span></div>
        </div>`;
    }

    private generatePRReadinessSection(metrics: MetricsData): string {
        const bc = metrics.branchComparison;
        if (!bc) { return ''; }

        const pr = calcPRReadiness(metrics);
        const scoreClass = pr.score >= 80 ? 'pr-score-good' : pr.score >= 60 ? 'pr-score-warn' : 'pr-score-danger';
        const riskItems = pr.risks.map(r => {
            const isOk = r.includes('good to go') || r.includes('No major');
            return `<li class="${isOk ? 'ok' : ''}">${isOk ? '✅' : '⚠️'} ${r}</li>`;
        }).join('');

        return `
        <div class="section">
            <h2>🔀 PR Readiness</h2>
            <div class="pr-top">
                <div class="pr-score-circle ${scoreClass}">${pr.score}</div>
                <div class="pr-meta">
                    <div><span class="pr-size-badge">Size: ${pr.sizeLabel}</span></div>
                    <div style="font-size:14px;color:var(--text-muted)">
                        <strong>${bc.targetBranch}</strong> → ${bc.baseBranch} &nbsp;·&nbsp;
                        ${bc.filesChanged} files &nbsp;·&nbsp;
                        +${bc.insertions}/-${bc.deletions} lines &nbsp;·&nbsp;
                        ${bc.ahead} commits ahead
                    </div>
                </div>
            </div>
            <ul class="pr-risk-list">${riskItems}</ul>
        </div>`;
    }

    private generateJSONReport(metrics: MetricsData, options: ReportOptions): string {
        const extensionInfo = this.getExtensionInfo();
        const intelligence = prepareRepositoryIntelligence(metrics, options.period);
        const report = {
            metadata: {
                generatedAt: new Date().toISOString(),
                period: options.period,
                projectName: vscode.workspace.workspaceFolders?.[0]?.name || 'Git Project',
                branch: metrics.branchStats?.currentBranch || 'N/A',
                extensionInfo: extensionInfo,
                options: options
            },
            summary: options.includeSummary ? {
                totalCommits: metrics.totalCommits,
                totalFiles: metrics.totalFiles,
                totalAuthors: metrics.totalAuthors,
                averageCommitsPerDay: (metrics.totalCommits / options.period),
                topAuthor: metrics.topAuthor,
                topFileType: metrics.topFileType,
                branch: metrics.branchStats?.currentBranch || 'N/A',
                branchComparison: metrics.branchComparison
            } : undefined,
            repositoryIntelligence: options.includeSummary ? intelligence : undefined,
            authorStats: options.includeAuthorStats ? metrics.authorStats : undefined,
            fileStats: options.includeFileStats ? {
                fileTypes: metrics.fileTypes,
                fileTypeStats: metrics.fileTypeStats,
                programmingLanguages: metrics.programmingLanguages
            } : undefined,
            timeAnalysis: options.includeTimeAnalysis ? metrics.timeAnalysis : undefined,
            badges: options.includeBadges ? {
                all: metrics.badges || [],
                unlocked: (metrics.badges || []).filter(badge => badge.unlocked),
                inProgress: (metrics.badges || []).filter(badge => !badge.unlocked && badge.progress > 0),
                locked: (metrics.badges || []).filter(badge => !badge.unlocked && badge.progress === 0),
                stats: {
                    total: (metrics.badges || []).length,
                    unlocked: (metrics.badges || []).filter(badge => badge.unlocked).length,
                    completionPercentage: (metrics.badges || []).length > 0 ? 
                        Math.round(((metrics.badges || []).filter(badge => badge.unlocked).length / (metrics.badges || []).length) * 100) : 0
                }
            } : undefined,
            dailyCommits: metrics.dailyCommits,
            thisWeekTopFiles: metrics.thisWeekTopFiles
        };

        return JSON.stringify(report, null, 2);
    }

    private generateCSVReport(metrics: MetricsData, options: ReportOptions): string {
        let csv = '';

        if (options.includeSummary) {
            const intelligence = prepareRepositoryIntelligence(metrics, options.period);
            csv += 'Repository Command Center\n';
            csv += 'Branch,Health Score,Health Label,Summary\n';
            csv += [
                this.escapeCSV(metrics.branchStats?.currentBranch || 'N/A'),
                intelligence.healthScore,
                this.escapeCSV(intelligence.healthLabel),
                this.escapeCSV(intelligence.summary)
            ].join(',') + '\n';
            csv += '\nSignals\n';
            csv += 'Title,Value,Detail,Tone\n';
            intelligence.signals.forEach(signal => {
                csv += [
                    this.escapeCSV(signal.title),
                    this.escapeCSV(signal.value),
                    this.escapeCSV(signal.detail),
                    this.escapeCSV(signal.tone)
                ].join(',') + '\n';
            });
            csv += '\nRecommended Next Moves\n';
            csv += 'Priority,Title,Detail\n';
            intelligence.actions.forEach(action => {
                csv += [
                    this.escapeCSV(action.priority),
                    this.escapeCSV(action.title),
                    this.escapeCSV(action.detail)
                ].join(',') + '\n';
            });
            csv += '\nRefactor Radar\n';
            csv += 'File,Risk Score,Reason\n';
            intelligence.focusFiles.forEach(file => {
                csv += [
                    this.escapeCSV(file.file),
                    file.score,
                    this.escapeCSV(file.reason)
                ].join(',') + '\n';
            });
            csv += '\n';
        }

        if (options.includeSummary && metrics.branchComparison) {
            csv += 'Branch Comparison\n';
            csv += 'Base Branch,Target Branch,Ahead,Behind,Files Changed,Insertions,Deletions\n';
            csv += [
                this.escapeCSV(metrics.branchComparison.baseBranch),
                this.escapeCSV(metrics.branchComparison.targetBranch),
                metrics.branchComparison.ahead,
                metrics.branchComparison.behind,
                metrics.branchComparison.filesChanged,
                metrics.branchComparison.insertions,
                metrics.branchComparison.deletions
            ].join(',') + '\n\n';
        }

        if (options.includeAuthorStats) {
            csv += '개발자별 통계\n';
            csv += '순위,개발자,커밋수,파일수,기여도(%),추가라인,삭제라인,일평균커밋\n';
            metrics.authorStats.forEach(author => {
                csv += [
                    author.rank,
                    this.escapeCSV(author.name),
                    author.commits,
                    author.files,
                    author.percentage,
                    author.insertions,
                    author.deletions,
                    author.averageCommitsPerDay
                ].join(',') + '\n';
            });
            csv += '\n';
        }

        if (options.includeFileStats) {
            csv += '파일 타입별 통계\n';
            csv += '순위,확장자,언어,카테고리,커밋수,파일수,비율(%)\n';
            metrics.fileTypeStats.forEach((fileType, index) => {
                csv += [
                    index + 1,
                    this.escapeCSV(fileType.extension),
                    this.escapeCSV(fileType.language),
                    this.escapeCSV(fileType.category),
                    fileType.commits,
                    fileType.files,
                    fileType.percentage
                ].join(',') + '\n';
            });
            csv += '\n';
        }

        if (options.includeTimeAnalysis) {
            csv += '시간대별 분석\n';
            csv += '요일별 활동\n';
            csv += '요일,커밋수\n';
            Object.entries(metrics.timeAnalysis.weeklyActivity).forEach(([day, commits]) => {
                csv += `${this.escapeCSV(day)},${commits}\n`;
            });
            csv += '\n시간별 활동\n';
            csv += '시간,커밋수\n';
            Object.entries(metrics.timeAnalysis.hourlyActivity).forEach(([hour, commits]) => {
                csv += `${this.escapeCSV(hour + '시')},${commits}\n`;
            });
        }

        if (options.includeBadges && metrics.badges) {
            const badges = metrics.badges;
            const unlockedBadges = badges.filter(badge => badge.unlocked);
            const inProgressBadges = badges.filter(badge => !badge.unlocked && badge.progress > 0);

            csv += '\n배지 시스템\n';
            csv += '전체 배지 수,획득한 배지,완료율\n';
            csv += `${badges.length},${unlockedBadges.length},${badges.length > 0 ? Math.round((unlockedBadges.length / badges.length) * 100) : 0}%\n`;

            if (unlockedBadges.length > 0) {
                csv += '\n획득한 배지\n';
                csv += '이름,설명,희귀도,카테고리,획득일\n';
                unlockedBadges.forEach(badge => {
                    const unlockedDate = badge.unlockedAt ? badge.unlockedAt.toLocaleDateString() : '';
                    csv += [
                        this.escapeCSV(badge.name),
                        this.escapeCSV(badge.description),
                        this.escapeCSV(badge.rarity),
                        this.escapeCSV(badge.category),
                        this.escapeCSV(unlockedDate)
                    ].join(',') + '\n';
                });
            }

            if (inProgressBadges.length > 0) {
                csv += '\n진행 중인 배지\n';
                csv += '이름,설명,진행률,진행상태\n';
                inProgressBadges.forEach(badge => {
                    csv += [
                        this.escapeCSV(badge.name),
                        this.escapeCSV(badge.description),
                        badge.progress + '%',
                        this.escapeCSV(badge.progressDescription || '')
                    ].join(',') + '\n';
                });
            }
        }

        return csv;
    }

    private generateMarkdownReport(metrics: MetricsData, options: ReportOptions): string {
        const projectName = vscode.workspace.workspaceFolders?.[0]?.name || 'Git Project';
        const generatedAt = new Date().toLocaleString();
        const extensionInfo = this.getExtensionInfo();

        const mdTemplateLabels: Record<string, string> = {
            full: 'Full Report', executive: 'Executive Summary', pr: 'PR Report', developer: 'Developer Focus'
        };
        const mdTemplateLabel = options.template ? mdTemplateLabels[options.template] || options.template : 'Full Report';

        let md = `# 📊 Git Metrics Report

**프로젝트:** ${projectName}
**분석 기간:** ${options.period}일
**브랜치:** ${metrics.branchStats?.currentBranch || 'N/A'}
**생성일:** ${generatedAt}  ${options.template ? `  \n**Template:** ${mdTemplateLabel}` : ''}

---

`;

        // Executive 프리셋: Health Score 뱃지 강조
        if (options.template === 'executive' && options.includeSummary) {
            const execInt = prepareRepositoryIntelligence(metrics, options.period);
            const scoreEmoji = execInt.healthScore >= 78 ? '🟢' : execInt.healthScore >= 58 ? '🟡' : '🔴';
            md += `> **Health Score: ${execInt.healthScore}/100** ${scoreEmoji} — ${execInt.healthLabel}\n\n`;
        }

        if (options.includeSummary) {
            const intelligence = prepareRepositoryIntelligence(metrics, options.period);
            md += `## 🧠 Repository Command Center

**Health Score:** ${intelligence.healthScore}/100 - ${intelligence.healthLabel}  
${intelligence.summary}

### Signals

| Signal | Value | Detail |
|--------|-------|--------|
`;
            intelligence.signals.forEach(signal => {
                md += `| ${signal.title} | ${signal.value} | ${signal.detail} |\n`;
            });

            md += `
### Recommended Next Moves

| Priority | Action | Detail |
|----------|--------|--------|
`;
            intelligence.actions.forEach(action => {
                md += `| ${action.priority} | ${action.title} | ${action.detail} |\n`;
            });

            md += `
### Refactor Radar

| File | Risk | Reason |
|------|------|--------|
`;
            if (intelligence.focusFiles.length > 0) {
                intelligence.focusFiles.forEach(file => {
                    md += `| \`${file.file}\` | ${file.score} | ${file.reason} |\n`;
                });
            } else {
                md += '| - | - | High-risk file candidates were not detected in this period. |\n';
            }

            md += '\n---\n\n';

            md += `## 📋 요약 통계

| 항목 | 값 |
|------|-----|
| 총 커밋 수 | ${metrics.totalCommits} |
| 수정된 파일 | ${metrics.totalFiles} |
| 일평균 커밋 | ${(metrics.totalCommits / options.period).toFixed(1)} |
| 활성 개발자 | ${metrics.totalAuthors} |
| 최고 일일 커밋 | ${Math.max(...Object.values(metrics.dailyCommits), 0)} |
| 주력 파일 타입 | ${metrics.topFileType} |
${metrics.branchComparison ? `| Base 비교 | ${metrics.branchComparison.targetBranch} vs ${metrics.branchComparison.baseBranch}, ahead ${metrics.branchComparison.ahead}, behind ${metrics.branchComparison.behind} |
| PR 규모 | ${metrics.branchComparison.filesChanged} files, +${metrics.branchComparison.insertions}/-${metrics.branchComparison.deletions} |` : ''}

---

`;
        }

        if (options.includeAuthorStats) {
            md += `## 👥 개발자별 기여도

| 순위 | 개발자 | 커밋 수 | 파일 수 | 기여도 | 코드 변경 | 일평균 |
|------|--------|---------|---------|---------|-----------|---------|
`;
            metrics.authorStats.slice(0, 10).forEach(author => {
                md += `| ${author.rank} | ${author.name} | ${author.commits} | ${author.files} | ${author.percentage}% | +${author.insertions}/-${author.deletions} | ${author.averageCommitsPerDay} |\n`;
            });
            md += '\n---\n\n';
        }

        if (options.includeFileStats) {
            md += `## 📁 파일 타입별 분석

| 순위 | 확장자 | 언어 | 카테고리 | 커밋 수 | 파일 수 | 비율 |
|------|--------|------|----------|---------|---------|------|
`;
            metrics.fileTypeStats.slice(0, 15).forEach((fileType, index) => {
                md += `| ${index + 1} | .${fileType.extension} | ${fileType.language} | ${fileType.category} | ${fileType.commits} | ${fileType.files} | ${fileType.percentage}% |\n`;
            });
            md += '\n---\n\n';
        }

        if (options.includeTimeAnalysis) {
            const timeAnalysis = metrics.timeAnalysis;
            md += `## ⏰ 시간대별 분석

**최고 활동 시간:** ${timeAnalysis.peakHour}  
**최고 활동 요일:** ${timeAnalysis.peakDay}  
**야간 커밋 비율:** ${timeAnalysis.nightPercentage}%  
**주말 커밋 비율:** ${timeAnalysis.weekendPercentage}%  
**주요 업무 시간:** ${timeAnalysis.workingHours.start}시 - ${timeAnalysis.workingHours.end}시

### 요일별 활동

| 요일 | 커밋 수 |
|------|---------|
`;
            Object.entries(timeAnalysis.weeklyActivity).forEach(([day, commits]) => {
                md += `| ${day} | ${commits} |\n`;
            });

            md += `
### 시간별 활동

| 시간 | 커밋 수 |
|------|---------|
`;
            Object.entries(timeAnalysis.hourlyActivity).forEach(([hour, commits]) => {
                md += `| ${hour}시 | ${commits} |\n`;
            });
        }

        if (options.includeBadges && metrics.badges) {
            const badges = metrics.badges;
            const unlockedBadges = badges.filter(badge => badge.unlocked);
            const inProgressBadges = badges.filter(badge => !badge.unlocked && badge.progress > 0);
            const completionPercentage = badges.length > 0 ? Math.round((unlockedBadges.length / badges.length) * 100) : 0;

            md += `## 🏆 개발자 뱃지 시스템

**전체 배지:** ${badges.length}개  
**획득한 배지:** ${unlockedBadges.length}개  
**완료율:** ${completionPercentage}%  

`;

            if (unlockedBadges.length > 0) {
                md += `### 🎖️ 획득한 배지

| 배지 | 이름 | 설명 | 희귀도 | 획득일 |
|------|------|------|--------|--------|
`;
                unlockedBadges.forEach(badge => {
                    const unlockedDate = badge.unlockedAt ? badge.unlockedAt.toLocaleDateString() : '-';
                    md += `| ${badge.icon} | ${badge.name} | ${badge.description} | ${badge.rarity.toUpperCase()} | ${unlockedDate} |\n`;
                });
                md += '\n';
            }

            if (inProgressBadges.length > 0) {
                md += `### ⏳ 진행 중인 배지

| 배지 | 이름 | 설명 | 진행률 | 상태 |
|------|------|------|--------|------|
`;
                inProgressBadges.forEach(badge => {
                    md += `| ${badge.icon} | ${badge.name} | ${badge.description} | ${badge.progress}% | ${badge.progressDescription} |\n`;
                });
                md += '\n';
            }

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

            md += `### 📊 희귀도별 통계

| 희귀도 | 획득 수 |
|--------|---------|
| Common | ${rarityStats.common} |
| Uncommon | ${rarityStats.uncommon} |
| Rare | ${rarityStats.rare} |
| Epic | ${rarityStats.epic} |
| Legendary | ${rarityStats.legendary} |

`;
        }

        // Streak 섹션 (includeStreak 또는 developer 프리셋)
        if (options.includeStreak && metrics.commitStreak) {
            const s = metrics.commitStreak;
            md += `## 🔥 커밋 스트릭\n\n`;
            md += `| 항목 | 값 |\n|------|-----|\n`;
            md += `| 현재 스트릭 | **${s.currentStreak}일** |\n`;
            md += `| 최장 스트릭 | ${s.longestStreak}일 |\n`;
            md += `| 활동률 | ${s.activityRate}% |\n`;
            md += `| 활성 일수 | ${s.activeDays}일 |\n\n---\n\n`;
        }

        // PR Readiness 섹션 (includePRReadiness 또는 pr 프리셋)
        if ((options.template === 'pr' || options.includePRReadiness) && metrics.branchComparison) {
            const pr = calcPRReadiness(metrics);
            const bc = metrics.branchComparison;
            md += `## 🔀 PR Readiness\n\n`;
            md += `| 항목 | 값 |\n|------|-----|\n`;
            md += `| Score | **${pr.score}/100** |\n`;
            md += `| Size | ${pr.sizeLabel} |\n`;
            md += `| Files Changed | ${bc.filesChanged} |\n`;
            md += `| Lines | +${bc.insertions}/-${bc.deletions} |\n`;
            md += `| Commits Ahead | ${bc.ahead} |\n\n`;
            md += '**Risk Signals:**\n\n';
            pr.risks.forEach(r => { md += `- ${r}\n`; });
            md += '\n---\n\n';
        }

        md += `
---

*Generated by [${extensionInfo.name}](https://marketplace.visualstudio.com/items?itemName=jiwan-dev.git-metrics-dashboard) v${extensionInfo.version} for VS Code · Template: ${mdTemplateLabel}*

[![Get Git Metrics Dashboard](https://img.shields.io/visual-studio-marketplace/v/jiwan-dev.git-metrics-dashboard?label=Git%20Metrics%20Dashboard&logo=visual-studio-code&logoColor=white&color=0078d4)](https://marketplace.visualstudio.com/items?itemName=jiwan-dev.git-metrics-dashboard)
`;

        return md;
    }

    /**
     * CSV 인젝션 공격 방지를 위한 문자열 이스케이프
     * 수식 인젝션(=, +, @, -, 탭 등)을 방지합니다.
     */
    private escapeCSV(value: any): string {
        if (value === null || value === undefined) {return '';}

        const str = String(value).trim();

        // 수식 인젝션 문자로 시작하면 단일 따옴표 추가
        if (/^[=+@\-\t]/.test(str)) {
            return `'${str}`;
        }

        // 큰따옴표 내부의 큰따옴표를 이스케이프
        if (str.includes('"')) {
            return `"${str.replace(/"/g, '""')}"`;
        }

        // 쉼표나 줄바꿈이 있으면 따옴표로 감싸기
        if (str.includes(',') || str.includes('\n') || str.includes('\r')) {
            return `"${str}"`;
        }

        return str;
    }

    /**
     * HTML 특수 문자 이스케이프 (XSS 방지)
     * 현재는 CSV 리포트에서 주로 사용되며, 향후 HTML 리포트 개선 시 더 광범위하게 활용 예정
     */
    // @ts-ignore - 향후 HTML 리포트에서 사용 예정
     
    private escapeHTML(value: any): string {
        if (value === null || value === undefined) {return '';}

        const str = String(value);
        // 기본적인 HTML 이스케이프 (XSS 방지용)
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    }

    /**
     * 주석: escapeHTML 메서드는 HTML 리포트에서 사용자 입력을 안전하게 처리하기 위해
     * 유지되고 있습니다. 현재는 CSV에서 주로 사용 중이며, HTML 리포트 개선 시 활용됩니다.
     */
}
