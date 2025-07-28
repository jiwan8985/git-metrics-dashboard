import * as vscode from 'vscode';
import { GitAnalyzer } from './gitAnalyzer';
import { DashboardProvider } from './dashboardProvider';
import { ReportGenerator, ReportOptions } from './reportGenerator';

export function activate(context: vscode.ExtensionContext) {
    console.log('Git Metrics Dashboard 활성화됨!');

    const gitAnalyzer = new GitAnalyzer();
    const dashboardProvider = new DashboardProvider(context, gitAnalyzer);
    const reportGenerator = new ReportGenerator(context);

    // 대시보드 열기 명령어 등록
    const showDashboardDisposable = vscode.commands.registerCommand('gitMetrics.showDashboard', () => {
        dashboardProvider.showDashboard();
    });

    // 빠른 리포트 내보내기 명령어 등록
    const quickExportDisposable = vscode.commands.registerCommand('gitMetrics.quickExport', async () => {
        try {
            vscode.window.showInformationMessage('📊 Git 데이터 수집 중...');
            
            const config = vscode.workspace.getConfiguration('gitMetrics');
            const defaultPeriod = config.get<number>('defaultPeriod', 30);
            
            const commits = await gitAnalyzer.getCommitHistory(defaultPeriod);
            const metrics = await gitAnalyzer.generateMetrics(commits);

            const format = await vscode.window.showQuickPick([
                { label: '📄 HTML 리포트', detail: 'html' },
                { label: '📋 JSON 데이터', detail: 'json' },
                { label: '📊 CSV 파일', detail: 'csv' },
                { label: '📝 Markdown 문서', detail: 'markdown' }
            ], {
                placeHolder: '내보내기 형식을 선택하세요'
            });

            if (!format) return;

            const options: ReportOptions = {
                format: format.detail as any,
                includeSummary: true,
                includeCharts: true,
                includeFileStats: true,
                includeAuthorStats: true,
                includeTimeAnalysis: true,
                period: defaultPeriod
            };

            vscode.window.showInformationMessage('📄 리포트 생성 중...');
            const result = await reportGenerator.generateReport(metrics, options);

            if (result.success && result.filePath) {
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
            } else {
                vscode.window.showErrorMessage(result.error || '리포트 생성에 실패했습니다.');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`오류: ${error}`);
        }
    });

    // 사용자 정의 리포트 내보내기 명령어 등록
    const customExportDisposable = vscode.commands.registerCommand('gitMetrics.customExport', async () => {
        try {
            // 분석 기간 선택
            const periodInput = await vscode.window.showInputBox({
                prompt: '분석 기간을 입력하세요 (일 단위)',
                value: '30',
                validateInput: (value) => {
                    const num = parseInt(value);
                    if (isNaN(num) || num <= 0 || num > 365) {
                        return '1-365 사이의 숫자를 입력하세요';
                    }
                    return null;
                }
            });

            if (!periodInput) return;
            const period = parseInt(periodInput);

            vscode.window.showInformationMessage('📊 Git 데이터 수집 중...');
            
            const commits = await gitAnalyzer.getCommitHistory(period);
            const metrics = await gitAnalyzer.generateMetrics(commits);

            // 포맷 선택
            const format = await vscode.window.showQuickPick([
                { label: '📄 HTML 리포트', description: '웹 브라우저에서 볼 수 있는 리포트', detail: 'html' },
                { label: '📋 JSON 데이터', description: '프로그래밍적으로 처리 가능한 데이터', detail: 'json' },
                { label: '📊 CSV 파일', description: 'Excel에서 열 수 있는 표 형식', detail: 'csv' },
                { label: '📝 Markdown 문서', description: 'GitHub README 스타일 문서', detail: 'markdown' }
            ], {
                placeHolder: '내보내기 형식을 선택하세요'
            });

            if (!format) return;

            // 포함할 섹션 선택
            const sections = await vscode.window.showQuickPick([
                { label: '📋 요약 통계', picked: true, detail: 'includeSummary' },
                { label: '👥 개발자별 통계', picked: true, detail: 'includeAuthorStats' },
                { label: '📁 파일 타입별 분석', picked: true, detail: 'includeFileStats' },
                { label: '⏰ 시간대별 분석', picked: true, detail: 'includeTimeAnalysis' }
            ], {
                placeHolder: '포함할 섹션을 선택하세요 (다중 선택 가능)',
                canPickMany: true
            });

            if (!sections || sections.length === 0) return;

            const options: ReportOptions = {
                format: format.detail as any,
                includeSummary: sections.some(s => s.detail === 'includeSummary'),
                includeCharts: true,
                includeFileStats: sections.some(s => s.detail === 'includeFileStats'),
                includeAuthorStats: sections.some(s => s.detail === 'includeAuthorStats'),
                includeTimeAnalysis: sections.some(s => s.detail === 'includeTimeAnalysis'),
                period: period
            };

            vscode.window.showInformationMessage('📄 리포트 생성 중...');
            const result = await reportGenerator.generateReport(metrics, options);

            if (result.success && result.filePath) {
                const action = await vscode.window.showInformationMessage(
                    `✅ 리포트가 성공적으로 생성되었습니다! (${period}일 분석)`,
                    '파일 열기',
                    '폴더에서 보기'
                );

                if (action === '파일 열기') {
                    const doc = await vscode.workspace.openTextDocument(result.filePath);
                    await vscode.window.showTextDocument(doc);
                } else if (action === '폴더에서 보기') {
                    vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(result.filePath));
                }
            } else {
                vscode.window.showErrorMessage(result.error || '리포트 생성에 실패했습니다.');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`오류: ${error}`);
        }
    });

    // 윈도우 문제 해결 명령어 등록
    const windowsTroubleshootDisposable = vscode.commands.registerCommand('gitMetrics.windowsTroubleshoot', async () => {
        try {
            const reportGen = new ReportGenerator(context);
            
            vscode.window.showInformationMessage('🔍 윈도우 환경 진단 중...');
            
            // 진단 실행 (reportGenerator에 diagnoseWindowsIssues 메서드 추가 필요)
            const issues = await (reportGen as any).diagnoseWindowsIssues?.() || [];
            
            if (issues.length === 0) {
                vscode.window.showInformationMessage('✅ 윈도우 환경에 문제가 없습니다!');
            } else {
                const message = `⚠️ 발견된 문제:\n\n${issues.join('\n\n')}`;
                const action = await vscode.window.showWarningMessage(
                    message,
                    '최적화 적용',
                    '무시하고 계속'
                );
                
                if (action === '최적화 적용') {
                    await (reportGen as any).applyWindowsOptimizations?.();
                }
            }
        } catch (error) {
            vscode.window.showErrorMessage(`진단 실패: ${error}`);
        }
    });
    const openReportsFolderDisposable = vscode.commands.registerCommand('gitMetrics.openReportsFolder', async () => {
        try {
            const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!workspaceRoot) {
                vscode.window.showErrorMessage('워크스페이스가 열려있지 않습니다.');
                return;
            }

            const reportsPath = vscode.Uri.file(`${workspaceRoot}/git-metrics-reports`);
            
            try {
                await vscode.workspace.fs.stat(reportsPath);
                vscode.commands.executeCommand('revealFileInOS', reportsPath);
            } catch {
                vscode.window.showInformationMessage('아직 생성된 리포트가 없습니다. 먼저 리포트를 내보내주세요.');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`오류: ${error}`);
        }
    });

    // 상태바 아이템 추가
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = 'gitMetrics.showDashboard';
    statusBarItem.text = "📊 Git Stats";
    statusBarItem.tooltip = "Git 메트릭 대시보드 열기";
    statusBarItem.show();

    // 상태바 리포트 버튼 추가
    const exportStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
    exportStatusBarItem.command = 'gitMetrics.quickExport';
    exportStatusBarItem.text = "📄 Export";
    exportStatusBarItem.tooltip = "Git 메트릭 리포트 빠른 내보내기";
    exportStatusBarItem.show();

    // Git 저장소인지 확인하고 상태바 표시
    const checkGitRepo = async () => {
        try {
            const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (workspaceRoot) {
                const gitPath = vscode.Uri.file(`${workspaceRoot}/.git`);
                try {
                    await vscode.workspace.fs.stat(gitPath);
                    statusBarItem.show();
                    exportStatusBarItem.show();
                } catch {
                    statusBarItem.hide();
                    exportStatusBarItem.hide();
                }
            }
        } catch (error) {
            console.log('Git 저장소 확인 중 오류:', error);
        }
    };

    // 초기 체크
    checkGitRepo();

    // 워크스페이스 변경 시 다시 체크
    vscode.workspace.onDidChangeWorkspaceFolders(checkGitRepo);

    context.subscriptions.push(
        showDashboardDisposable,
        quickExportDisposable,
        customExportDisposable,
        openReportsFolderDisposable,
        windowsTroubleshootDisposable,
        statusBarItem,
        exportStatusBarItem
    );

    // 웰컴 메시지 (첫 설치 시에만)
    const hasShownWelcome = context.globalState.get('gitMetrics.hasShownWelcome', false);
    if (!hasShownWelcome) {
        const isWindows = process.platform === 'win32';
        const welcomeMessage = isWindows 
            ? '🎉 Git Metrics Dashboard가 설치되었습니다! Windows 사용자라면 문제 발생시 "윈도우 문제 해결" 명령어를 사용해보세요.'
            : '🎉 Git Metrics Dashboard가 설치되었습니다! 상태바의 "📊 Git Stats" 버튼을 클릭하여 시작하세요.';
            
        const buttons = isWindows 
            ? ['대시보드 열기', '윈도우 문제 해결', '더 이상 보지 않기']
            : ['대시보드 열기', '더 이상 보지 않기'];
            
        vscode.window.showInformationMessage(welcomeMessage, ...buttons).then(action => {
            if (action === '대시보드 열기') {
                vscode.commands.executeCommand('gitMetrics.showDashboard');
            } else if (action === '윈도우 문제 해결') {
                vscode.commands.executeCommand('gitMetrics.windowsTroubleshoot');
            } else if (action === '더 이상 보지 않기') {
                context.globalState.update('gitMetrics.hasShownWelcome', true);
            }
        });
    }
}

export function deactivate() {
    console.log('Git Metrics Dashboard 비활성화됨');
}