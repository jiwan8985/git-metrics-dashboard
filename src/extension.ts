import * as vscode from 'vscode';
import { GitAnalyzer } from './gitAnalyzer';
import { DashboardProvider } from './dashboardProvider';
import { ReportGenerator, ReportOptions } from './reportGenerator';
import { GitChangeDetector } from './gitChangeDetector';
import { GitStatusIndicator } from './gitStatusIndicator';
import { GitMetricsTreeProvider } from './gitMetricsTreeProvider';
import { initializeI18n, changeLanguage, SUPPORTED_LANGUAGES } from './i18n';

export function activate(context: vscode.ExtensionContext) {
    console.log('Git Metrics Dashboard 활성화됨!');

    // i18n 초기화
    initializeI18n();

    const gitAnalyzer = new GitAnalyzer();
    const dashboardProvider = new DashboardProvider(context, gitAnalyzer);
    const reportGenerator = new ReportGenerator(context);

    const openBundledDocument = async (fileName: string, missingMessage: string) => {
        const documentUri = vscode.Uri.joinPath(context.extensionUri, fileName);
        try {
            const doc = await vscode.workspace.openTextDocument(documentUri);
            await vscode.window.showTextDocument(doc, { preview: true });
        } catch {
            vscode.window.showWarningMessage(missingMessage);
        }
    };

    const pickAnalysisBranch = async (): Promise<string | undefined> => {
        const branches = await gitAnalyzer.getBranches();
        if (branches.length === 0) {
            return undefined;
        }

        const selected = await vscode.window.showQuickPick([
            { label: 'Current branch', description: 'Use the currently checked-out branch', value: undefined as string | undefined },
            ...branches.map(branch => ({ label: branch, description: 'Analyze this local branch', value: branch }))
        ], {
            placeHolder: '분석할 브랜치를 선택하세요'
        });

        return selected?.value;
    };

    // 사이드바 TreeView 등록
    const treeProvider = new GitMetricsTreeProvider(gitAnalyzer);
    const treeView = vscode.window.createTreeView('gitMetrics', {
        treeDataProvider: treeProvider,
        showCollapseAll: true
    });

    // TreeView 최초 데이터 로드
    treeProvider.refresh().catch(console.error);

    // 실시간 Git 변경 감지 초기화
    let changeDetector: GitChangeDetector | null = null;
    let statusIndicator: GitStatusIndicator | null = null;

    const initializeGitChangeDetector = () => {
        // 기존 감지기 및 상태 표시기 정리
        if (changeDetector) {
            changeDetector.dispose();
            changeDetector = null;
        }
        if (statusIndicator) {
            statusIndicator.dispose();
            statusIndicator = null;
        }

        // 워크스페이스 폴더 확인
        if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
            return;
        }

        const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;

        // 설정 확인
        const config = vscode.workspace.getConfiguration('gitMetrics');
        const autoRefresh = config.get<boolean>('autoRefresh', false);
        const refreshInterval = config.get<number>('autoRefreshInterval', 5000);

        if (autoRefresh) {
            try {
                // 상태 표시기 초기화
                statusIndicator = new GitStatusIndicator(workspacePath);
                statusIndicator.startWatching();

                // 변경 감지기 초기화
                changeDetector = new GitChangeDetector(workspacePath);

                // 변경 감지 시 대시보드 새로고침 및 상태 업데이트
                changeDetector.watchForChanges((event) => {
                    console.log(`📡 Git 변경 감지: ${event.type} - ${event.message}`);

                    // 상태 표시기에 변경 기록
                    if (statusIndicator) {
                        statusIndicator.recordChange(event.type, event.message);
                    }

                    // 새 커밋 감지 시 캐시 무효화 (최신 데이터 보장)
                    if (event.type === 'commit') {
                        gitAnalyzer.invalidateCache();
                    }

                    // 대시보드 및 사이드바 자동 새로고침
                    dashboardProvider.refreshDashboard();
                    treeProvider.refresh().catch(console.error);

                    // 사용자 알림 (선택사항)
                    if (config.get<boolean>('showChangeNotification', false)) {
                        vscode.window.showInformationMessage(
                            `🔄 ${event.message}`,
                            '확인'
                        );
                    }
                });

                changeDetector.setDebounceDelay(refreshInterval);
                console.log(`✅ 실시간 Git 변경 감지 활성화 (${refreshInterval}ms)`);
                console.log(`✅ Git 상태 표시 활성화`);
            } catch (error) {
                console.error('Git 변경 감지 초기화 실패:', error);
                changeDetector = null;
                statusIndicator = null;
            }
        } else {
            console.log('ℹ️ 실시간 Git 변경 감지 비활성화');
        }
    };

    // 초기 설정
    initializeGitChangeDetector();

    // 설정 변경 감지
    const configChangeDisposable = vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration('gitMetrics.autoRefresh') ||
            event.affectsConfiguration('gitMetrics.autoRefreshInterval')) {
            console.log('⚙️ Git 변경 감지 설정 업데이트');
            initializeGitChangeDetector();
        }
    });
    context.subscriptions.push(configChangeDisposable);

    // 대시보드 열기 명령어 등록
    const showDashboardDisposable = vscode.commands.registerCommand('gitMetrics.showDashboard', async () => {
        await dashboardProvider.showDashboard();
    });

    // 테마 전환 명령어 등록
    const toggleThemeDisposable = vscode.commands.registerCommand('gitMetrics.toggleTheme', async () => {
        const config = vscode.workspace.getConfiguration('gitMetrics');
        const currentTheme = config.get<string>('theme', 'auto');
        
        const themeOptions = [
            { label: '🔄 자동 (VS Code 테마 따라감)', description: 'VS Code의 현재 테마를 자동으로 감지', value: 'auto' },
            { label: '☀️ 라이트 테마', description: '밝은 테마로 고정', value: 'light' },
            { label: '🌙 다크 테마', description: '어두운 테마로 고정', value: 'dark' }
        ];
        
        const selectedTheme = await vscode.window.showQuickPick(themeOptions, {
            placeHolder: `현재 테마: ${currentTheme === 'auto' ? '자동' : currentTheme === 'light' ? '라이트' : '다크'} - 새로운 테마를 선택하세요`,
            ignoreFocusOut: false
        });

        if (selectedTheme && selectedTheme.value !== currentTheme) {
            await config.update('theme', selectedTheme.value, vscode.ConfigurationTarget.Global);
            
            // 대시보드가 열려있다면 새로고침
            dashboardProvider.refreshTheme();
            
            vscode.window.showInformationMessage(`🎨 테마가 '${selectedTheme.label.split(' ')[1]}'으로 변경되었습니다!`);
        }
    });

    // 빠른 리포트 내보내기 명령어 등록
    const quickExportDisposable = vscode.commands.registerCommand('gitMetrics.quickExport', async () => {
        try {
            const config = vscode.workspace.getConfiguration('gitMetrics');
            const defaultPeriod = config.get<number>('defaultPeriod', 30);

            const format = await vscode.window.showQuickPick([
                { label: '📄 HTML 리포트', detail: 'html' },
                { label: '📋 JSON 데이터', detail: 'json' },
                { label: '📊 CSV 파일', detail: 'csv' },
                { label: '📝 Markdown 문서', detail: 'markdown' }
            ], {
                placeHolder: '내보내기 형식을 선택하세요'
            });

            if (!format) {return;}

            const branch = await pickAnalysisBranch();
            vscode.window.showInformationMessage('📊 Git 데이터 수집 중...');
            const commits = await gitAnalyzer.getCommitHistory(defaultPeriod, branch);
            const metrics = await gitAnalyzer.generateMetrics(commits, branch);

            const options: ReportOptions = {
                format: format.detail as any,
                includeSummary: true,
                includeCharts: true,
                includeFileStats: true,
                includeAuthorStats: true,
                includeTimeAnalysis: true,
                includeBadges: true,
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

            if (!periodInput) {return;}
            const period = parseInt(periodInput);

            // 포맷 선택
            const format = await vscode.window.showQuickPick([
                { label: '📄 HTML 리포트', description: '웹 브라우저에서 볼 수 있는 리포트', detail: 'html' },
                { label: '📋 JSON 데이터', description: '프로그래밍적으로 처리 가능한 데이터', detail: 'json' },
                { label: '📊 CSV 파일', description: 'Excel에서 열 수 있는 표 형식', detail: 'csv' },
                { label: '📝 Markdown 문서', description: 'GitHub README 스타일 문서', detail: 'markdown' }
            ], {
                placeHolder: '내보내기 형식을 선택하세요'
            });

            if (!format) {return;}

            const branch = await pickAnalysisBranch();

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

            if (!sections || sections.length === 0) {return;}

            const options: ReportOptions = {
                format: format.detail as any,
                includeSummary: sections.some(s => s.detail === 'includeSummary'),
                includeCharts: true,
                includeFileStats: sections.some(s => s.detail === 'includeFileStats'),
                includeAuthorStats: sections.some(s => s.detail === 'includeAuthorStats'),
                includeTimeAnalysis: sections.some(s => s.detail === 'includeTimeAnalysis'),
                includeBadges: true,
                period: period
            };

            vscode.window.showInformationMessage('📄 리포트 생성 중...');
            const commits = await gitAnalyzer.getCommitHistory(period, branch);
            const metrics = await gitAnalyzer.generateMetrics(commits, branch);
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

    const openPrivacySecurityDisposable = vscode.commands.registerCommand('gitMetrics.openPrivacySecurity', async () => {
        await openBundledDocument(
            'PRIVACY.md',
            'Privacy notes are not bundled in this installation.'
        );
    });

    const openSupportDisposable = vscode.commands.registerCommand('gitMetrics.openSupport', async () => {
        await openBundledDocument(
            'SUPPORT.md',
            'Support guide is not bundled in this installation.'
        );
    });

    // README 뱃지 복사 명령어
    const copyReadmeBadgeDisposable = vscode.commands.registerCommand('gitMetrics.copyReadmeBadge', async () => {
        const badge = `[![Analyzed with Git Metrics Dashboard](https://img.shields.io/badge/git--metrics-analyzed-blue?logo=visual-studio-code&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=jiwan-dev.git-metrics-dashboard)`;
        await vscode.env.clipboard.writeText(badge);
        const action = await vscode.window.showInformationMessage(
            '📋 README 뱃지가 클립보드에 복사되었습니다! 프로젝트 README.md에 붙여넣기 하세요.',
            '마켓플레이스 보기'
        );
        if (action === '마켓플레이스 보기') {
            vscode.env.openExternal(vscode.Uri.parse(
                'https://marketplace.visualstudio.com/items?itemName=jiwan-dev.git-metrics-dashboard'
            ));
        }
    });

    // TreeView 새로고침 명령어
    const refreshTreeViewDisposable = vscode.commands.registerCommand('gitMetrics.refreshTreeView', async () => {
        await treeProvider.refresh();
        vscode.window.showInformationMessage('🔄 Git 메트릭 새로고침 완료!');
    });

    // 언어 변경 명령어
    const changeLanguageDisposable = vscode.commands.registerCommand('gitMetrics.changeLanguage', async () => {
        const items = SUPPORTED_LANGUAGES.map(lang => ({
            label: `${lang.flag} ${lang.name}`,
            description: lang.code,
            value: lang.code
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: '대시보드 언어를 선택하세요'
        });

        if (selected) {
            await changeLanguage(selected.value);
            const config = vscode.workspace.getConfiguration('gitMetrics');
            await config.update('language', selected.value, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`🌐 언어가 '${selected.label}'으로 변경되었습니다. 대시보드를 다시 열어주세요.`);
        }
    });

    // 상태바 아이템 추가
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = 'gitMetrics.showDashboard';
    statusBarItem.text = "$(graph) Git Metrics";
    statusBarItem.tooltip = "Git 메트릭 대시보드 열기";
    statusBarItem.show();

    // 대시보드 분석 완료 시 상태바에 health score 표시
    dashboardProvider.setHealthScoreCallback((score: number) => {
        const icon = score >= 78 ? '$(pass)' : score >= 58 ? '$(warning)' : '$(error)';
        statusBarItem.text = `${icon} Git: ${score}/100`;
        statusBarItem.tooltip = `Repository Health: ${score}/100 — 클릭하여 대시보드 열기`;
    });

    // 상태바 리포트 버튼 추가
    const exportStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
    exportStatusBarItem.command = 'gitMetrics.quickExport';
    exportStatusBarItem.text = "📄 Export";
    exportStatusBarItem.tooltip = "Git 메트릭 리포트 빠른 내보내기";
    exportStatusBarItem.show();

    // 테마 상태바 버튼 추가
    const themeStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 98);
    themeStatusBarItem.command = 'gitMetrics.toggleTheme';
    themeStatusBarItem.tooltip = "Git 메트릭 테마 전환";
    
    // 현재 테마에 따라 아이콘 업데이트
    const updateThemeStatusBar = () => {
        const config = vscode.workspace.getConfiguration('gitMetrics');
        const theme = config.get<string>('theme', 'auto');
        switch (theme) {
            case 'light':
                themeStatusBarItem.text = "☀️ Light";
                break;
            case 'dark':
                themeStatusBarItem.text = "🌙 Dark";
                break;
            default:
                themeStatusBarItem.text = "🔄 Auto";
        }
    };

    updateThemeStatusBar();
    themeStatusBarItem.show();

    // 설정 변경 감지
    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('gitMetrics.theme')) {
            updateThemeStatusBar();
            dashboardProvider.refreshTheme();
        }
    });

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
                    themeStatusBarItem.show();
                } catch {
                    statusBarItem.hide();
                    exportStatusBarItem.hide();
                    themeStatusBarItem.hide();
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

    // changeDetector / statusIndicator는 여기서 등록하지 않고
    // initializeGitChangeDetector 내부에서 직접 관리 (재초기화 필요)
    context.subscriptions.push(
        showDashboardDisposable,
        toggleThemeDisposable,
        quickExportDisposable,
        customExportDisposable,
        openReportsFolderDisposable,
        openPrivacySecurityDisposable,
        openSupportDisposable,
        windowsTroubleshootDisposable,
        copyReadmeBadgeDisposable,
        refreshTreeViewDisposable,
        changeLanguageDisposable,
        statusBarItem,
        exportStatusBarItem,
        themeStatusBarItem,
        treeView,
        { dispose: () => { changeDetector?.dispose(); statusIndicator?.dispose(); } }
    );

    // 웰컴 메시지 (첫 설치 시에만)
    const hasShownWelcome = context.globalState.get('gitMetrics.hasShownWelcome', false);
    if (!hasShownWelcome) {
        context.globalState.update('gitMetrics.hasShownWelcome', true);
        // 첫 설치 시 대시보드 자동 오픈 (Git 저장소가 있을 때)
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (workspaceRoot) {
            setTimeout(() => {
                vscode.commands.executeCommand('gitMetrics.showDashboard');
            }, 800);
        }

        const isWindows = process.platform === 'win32';
        const welcomeMessage = isWindows
            ? '🎉 Git Metrics Dashboard 설치 완료! Windows 사용자는 문제 발생 시 "윈도우 문제 해결" 명령어를 사용해보세요.'
            : '🎉 Git Metrics Dashboard 설치 완료! 대시보드가 자동으로 열립니다.';

        const buttons = isWindows
            ? ['Windows 문제 해결', '⭐ 리뷰 남기기']
            : ['⭐ 리뷰 남기기'];

        vscode.window.showInformationMessage(welcomeMessage, ...buttons).then(action => {
            if (action === 'Windows 문제 해결') {
                vscode.commands.executeCommand('gitMetrics.windowsTroubleshoot');
            } else if (action === '⭐ 리뷰 남기기') {
                vscode.env.openExternal(vscode.Uri.parse(
                    'https://marketplace.visualstudio.com/items?itemName=jiwan-dev.git-metrics-dashboard&ssr=false#review-details'
                ));
            }
        });
    }

    // 리뷰 유도 (5회 대시보드 오픈 후)
    const openCount = (context.globalState.get<number>('gitMetrics.openCount', 0)) + 1;
    context.globalState.update('gitMetrics.openCount', openCount);
    const hasReviewed = context.globalState.get<boolean>('gitMetrics.hasReviewed', false);

    if (!hasReviewed && openCount === 5) {
        vscode.window.showInformationMessage(
            '❤️ Git Metrics Dashboard를 즐겨 사용하고 계신가요? VS Code Marketplace에 ⭐ 별점을 남겨주시면 더 많은 개발자들에게 도움이 됩니다!',
            '⭐ 지금 리뷰 남기기',
            '나중에',
            '다시 보지 않기'
        ).then(action => {
            if (action === '⭐ 지금 리뷰 남기기') {
                context.globalState.update('gitMetrics.hasReviewed', true);
                vscode.env.openExternal(vscode.Uri.parse(
                    'https://marketplace.visualstudio.com/items?itemName=jiwan-dev.git-metrics-dashboard&ssr=false#review-details'
                ));
            } else if (action === '다시 보지 않기') {
                context.globalState.update('gitMetrics.hasReviewed', true);
            }
        });
    }
}

export function deactivate() {
    console.log('Git Metrics Dashboard 비활성화됨');

    // 참고: changeDetector와 statusIndicator는 context.subscriptions를 통해 자동으로 정리됩니다.
    // extension.ts의 전역 변수가 가비지 컬렉션되면서 dispose()가 호출됩니다.
}
