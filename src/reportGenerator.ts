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

export interface ReportOptions {
    format: 'html' | 'json' | 'csv' | 'markdown';
    includeSummary: boolean;
    includeCharts: boolean;
    includeFileStats: boolean;
    includeAuthorStats: boolean;
    includeTimeAnalysis: boolean;
    includeBadges: boolean;
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
        
        if (themeConfig === 'light') return 'light';
        if (themeConfig === 'dark') return 'dark';
        
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
            const safeFileName = `git-metrics-report-${timestamp}-${options.period}days.${options.format}`;
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
            padding: 20px;
            background: var(--secondary-bg);
            color: var(--text-muted);
            font-size: 14px;
            border-top: 1px solid var(--border-color);
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
    </style>
</head>
<body class="${currentTheme}-theme">
    <div class="container">
        <div class="header">
            <div class="theme-indicator">
                ${currentTheme === 'dark' ? '🌙 다크 테마' : '☀️ 라이트 테마'}
            </div>
            <h1>📊 Git Metrics Report</h1>
            <p>${projectName} • ${options.period}일 분석 • 생성일: ${generatedAt}</p>
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
            ${options.includeSummary ? this.generateSummarySection(metrics, options.period) : ''}
            ${options.includeAuthorStats ? this.generateAuthorStatsSection(metrics) : ''}
            ${options.includeFileStats ? this.generateFileStatsSection(metrics) : ''}
            ${options.includeTimeAnalysis ? this.generateTimeAnalysisSection(metrics) : ''}
            ${options.includeBadges ? this.generateBadgeSection(metrics) : ''}
        </div>
        
        <div class="footer">
            <p>${extensionInfo.name} v${extensionInfo.version} • Generated with ❤️ by VS Code Extension</p>
            <p>테마: ${currentTheme === 'dark' ? '다크 모드' : '라이트 모드'} | 
               생성 시간: ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`;
    }

    private generateSummarySection(metrics: MetricsData, period: number): string {
        return `
        <div class="section">
            <h2>📋 요약 통계</h2>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">${metrics.totalCommits}</div>
                    <div class="metric-label">총 커밋 수</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${metrics.totalFiles}</div>
                    <div class="metric-label">수정된 파일</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${(metrics.totalCommits / period).toFixed(1)}</div>
                    <div class="metric-label">일평균 커밋</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${metrics.totalAuthors}</div>
                    <div class="metric-label">활성 개발자</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${Math.max(...Object.values(metrics.dailyCommits), 0)}</div>
                    <div class="metric-label">최고 일일 커밋</div>
                </div>
                <div class="metric-card">
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
                <td>${author.percentage}%</td>
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

    private generateJSONReport(metrics: MetricsData, options: ReportOptions): string {
        const extensionInfo = this.getExtensionInfo();
        const report = {
            metadata: {
                generatedAt: new Date().toISOString(),
                period: options.period,
                projectName: vscode.workspace.workspaceFolders?.[0]?.name || 'Git Project',
                extensionInfo: extensionInfo,
                options: options
            },
            summary: options.includeSummary ? {
                totalCommits: metrics.totalCommits,
                totalFiles: metrics.totalFiles,
                totalAuthors: metrics.totalAuthors,
                averageCommitsPerDay: (metrics.totalCommits / options.period),
                topAuthor: metrics.topAuthor,
                topFileType: metrics.topFileType
            } : undefined,
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

        if (options.includeAuthorStats) {
            csv += '개발자별 통계\n';
            csv += '순위,개발자,커밋수,파일수,기여도(%),추가라인,삭제라인,일평균커밋\n';
            metrics.authorStats.forEach(author => {
                csv += `${author.rank},"${author.name}",${author.commits},${author.files},${author.percentage},${author.insertions},${author.deletions},${author.averageCommitsPerDay}\n`;
            });
            csv += '\n';
        }

        if (options.includeFileStats) {
            csv += '파일 타입별 통계\n';
            csv += '순위,확장자,언어,카테고리,커밋수,파일수,비율(%)\n';
            metrics.fileTypeStats.forEach((fileType, index) => {
                csv += `${index + 1},"${fileType.extension}","${fileType.language}","${fileType.category}",${fileType.commits},${fileType.files},${fileType.percentage}\n`;
            });
            csv += '\n';
        }

        if (options.includeTimeAnalysis) {
            csv += '시간대별 분석\n';
            csv += '요일별 활동\n';
            csv += '요일,커밋수\n';
            Object.entries(metrics.timeAnalysis.weeklyActivity).forEach(([day, commits]) => {
                csv += `"${day}",${commits}\n`;
            });
            csv += '\n시간별 활동\n';
            csv += '시간,커밋수\n';
            Object.entries(metrics.timeAnalysis.hourlyActivity).forEach(([hour, commits]) => {
                csv += `"${hour}시",${commits}\n`;
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
                    csv += `"${badge.name}","${badge.description}","${badge.rarity}","${badge.category}","${unlockedDate}"\n`;
                });
            }
            
            if (inProgressBadges.length > 0) {
                csv += '\n진행 중인 배지\n';
                csv += '이름,설명,진행률,진행상태\n';
                inProgressBadges.forEach(badge => {
                    csv += `"${badge.name}","${badge.description}",${badge.progress}%,"${badge.progressDescription}"\n`;
                });
            }
        }

        return csv;
    }

    private generateMarkdownReport(metrics: MetricsData, options: ReportOptions): string {
        const projectName = vscode.workspace.workspaceFolders?.[0]?.name || 'Git Project';
        const generatedAt = new Date().toLocaleString();
        const extensionInfo = this.getExtensionInfo();

        let md = `# 📊 Git Metrics Report

**프로젝트:** ${projectName}  
**분석 기간:** ${options.period}일  
**생성일:** ${generatedAt}  

---

`;

        if (options.includeSummary) {
            md += `## 📋 요약 통계

| 항목 | 값 |
|------|-----|
| 총 커밋 수 | ${metrics.totalCommits} |
| 수정된 파일 | ${metrics.totalFiles} |
| 일평균 커밋 | ${(metrics.totalCommits / options.period).toFixed(1)} |
| 활성 개발자 | ${metrics.totalAuthors} |
| 최고 일일 커밋 | ${Math.max(...Object.values(metrics.dailyCommits), 0)} |
| 주력 파일 타입 | ${metrics.topFileType} |

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

        md += `
---

*Generated by ${extensionInfo.name} v${extensionInfo.version}*
`;

        return md;
    }
}