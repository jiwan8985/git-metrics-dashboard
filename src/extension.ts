import * as vscode from 'vscode';
import { GitAnalyzer } from './gitAnalyzer';
import { DashboardProvider } from './dashboardProvider';
import { ReportGenerator, ReportOptions } from './reportGenerator';
import { GitChangeDetector } from './gitChangeDetector';
import { GitStatusIndicator } from './gitStatusIndicator';
import { GitMetricsTreeProvider } from './gitMetricsTreeProvider';
import { initializeI18n, changeLanguage, SUPPORTED_LANGUAGES } from './i18n';
import { prepareRepositoryIntelligence, buildMonthlyBrief } from './repositoryIntelligence';

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

            // Step 1: 템플릿 선택
            const templateChoice = await vscode.window.showQuickPick([
                { label: '📊 Full Report',       description: '모든 섹션 — 팀 공유용 [HTML]', detail: 'full' },
                { label: '👔 Executive Summary', description: 'Health score + Actions only [HTML/MD]', detail: 'executive' },
                { label: '🔀 PR Report',          description: 'PR Readiness + Branch [Markdown]', detail: 'pr' },
                { label: '👤 Developer Focus',    description: 'Badges + Streak + Time Analysis [HTML]', detail: 'developer' },
                { label: '⚙️ Custom',            description: '포맷과 섹션을 직접 선택', detail: 'custom' }
            ], { placeHolder: '리포트 템플릿을 선택하세요' });

            if (!templateChoice) {return;}
            const template = templateChoice.detail as 'full' | 'executive' | 'pr' | 'developer' | 'custom';

            // Step 2: 포맷 선택 (템플릿별 필터링)
            const allFormats = [
                { label: '📄 HTML 리포트', detail: 'html' },
                { label: '📋 JSON 데이터', detail: 'json' },
                { label: '📊 CSV 파일',    detail: 'csv' },
                { label: '📝 Markdown',    detail: 'markdown' }
            ];
            const formatItems = template === 'pr'
                ? [{ label: '📝 Markdown', detail: 'markdown' }, { label: '📄 HTML 리포트', detail: 'html' }]
                : template === 'executive'
                    ? [{ label: '📄 HTML 리포트', detail: 'html' }, { label: '📝 Markdown', detail: 'markdown' }]
                    : allFormats;

            const format = await vscode.window.showQuickPick(formatItems, { placeHolder: '내보내기 형식을 선택하세요' });
            if (!format) {return;}

            // 프리셋별 옵션 빌드
            let options: ReportOptions;
            if (template === 'executive') {
                const anonymizeChoice = await vscode.window.showQuickPick([
                    { label: '❌ 실제 이름 유지', description: '내부 팀용', detail: 'false' },
                    { label: '✅ 익명화 (Developer A/B/C...)', description: '외부 이해관계자 공유용', detail: 'true' }
                ], { placeHolder: '작성자 익명화 옵션 선택' });
                if (!anonymizeChoice) { return; }
                const anonymize = anonymizeChoice.detail === 'true';
                options = {
                    format: format.detail as any, template: 'executive',
                    includeSummary: true, includeCharts: false, includeFileStats: false,
                    includeAuthorStats: anonymize, includeTimeAnalysis: false, includeBadges: false,
                    includePRReadiness: false, includeStreak: false,
                    anonymizeAuthors: anonymize, period: defaultPeriod
                };
            } else if (template === 'pr') {
                options = {
                    format: format.detail as any, template: 'pr',
                    includeSummary: true, includeCharts: false, includeFileStats: false,
                    includeAuthorStats: false, includeTimeAnalysis: false, includeBadges: false,
                    includePRReadiness: true, includeStreak: false, period: defaultPeriod
                };
            } else if (template === 'developer') {
                options = {
                    format: format.detail as any, template: 'developer',
                    includeSummary: true, includeCharts: false, includeFileStats: false,
                    includeAuthorStats: false, includeTimeAnalysis: true, includeBadges: true,
                    includePRReadiness: false, includeStreak: true, period: defaultPeriod
                };
            } else if (template === 'custom') {
                const sections = await vscode.window.showQuickPick([
                    { label: '📋 요약 통계',         picked: true,  detail: 'includeSummary' },
                    { label: '👥 개발자별 통계',       picked: true,  detail: 'includeAuthorStats' },
                    { label: '📁 파일 타입별 분석',    picked: true,  detail: 'includeFileStats' },
                    { label: '⏰ 시간대별 분석',       picked: true,  detail: 'includeTimeAnalysis' },
                    { label: '🏆 개발자 배지',         picked: true,  detail: 'includeBadges' },
                    { label: '🔥 커밋 스트릭',         picked: false, detail: 'includeStreak' },
                    { label: '🔀 PR Readiness',        picked: false, detail: 'includePRReadiness' }
                ], { placeHolder: '포함할 섹션을 선택하세요 (다중 선택)', canPickMany: true });
                if (!sections || sections.length === 0) {return;}
                options = {
                    format: format.detail as any,
                    includeSummary:     sections.some(s => s.detail === 'includeSummary'),
                    includeCharts: true,
                    includeFileStats:   sections.some(s => s.detail === 'includeFileStats'),
                    includeAuthorStats: sections.some(s => s.detail === 'includeAuthorStats'),
                    includeTimeAnalysis:sections.some(s => s.detail === 'includeTimeAnalysis'),
                    includeBadges:      sections.some(s => s.detail === 'includeBadges'),
                    includePRReadiness: sections.some(s => s.detail === 'includePRReadiness'),
                    includeStreak:      sections.some(s => s.detail === 'includeStreak'),
                    period: defaultPeriod
                };
            } else {
                // full
                options = {
                    format: format.detail as any, template: 'full',
                    includeSummary: true, includeCharts: true, includeFileStats: true,
                    includeAuthorStats: true, includeTimeAnalysis: true, includeBadges: true,
                    includePRReadiness: true, includeStreak: true, period: defaultPeriod
                };
            }

            const branch = await pickAnalysisBranch();
            vscode.window.showInformationMessage('📊 Git 데이터 수집 중...');
            const commits = await gitAnalyzer.getCommitHistory(defaultPeriod, branch);
            const metrics = await gitAnalyzer.generateMetrics(commits, branch);

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
                triggerReviewPromptIfReady(context);
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

            // 템플릿 선택
            const templateChoice = await vscode.window.showQuickPick([
                { label: '📊 Full Report',       description: '모든 섹션', detail: 'full' },
                { label: '👔 Executive Summary', description: 'Health score + Actions only', detail: 'executive' },
                { label: '🔀 PR Report',          description: 'PR Readiness + Branch', detail: 'pr' },
                { label: '👤 Developer Focus',    description: 'Badges + Streak + Time', detail: 'developer' },
                { label: '⚙️ Custom',            description: '섹션 직접 선택', detail: 'custom' }
            ], { placeHolder: '리포트 템플릿을 선택하세요' });

            if (!templateChoice) {return;}
            const template = templateChoice.detail as 'full' | 'executive' | 'pr' | 'developer' | 'custom';

            // 포맷 선택 (템플릿별 필터)
            const allFormats = [
                { label: '📄 HTML 리포트', description: '웹 브라우저에서 볼 수 있는 리포트', detail: 'html' },
                { label: '📋 JSON 데이터', description: '프로그래밍적으로 처리 가능한 데이터', detail: 'json' },
                { label: '📊 CSV 파일',    description: 'Excel에서 열 수 있는 표 형식', detail: 'csv' },
                { label: '📝 Markdown',    description: 'GitHub README 스타일 문서', detail: 'markdown' }
            ];
            const formatItems = template === 'pr'
                ? [{ label: '📝 Markdown', description: 'PR 공유에 최적', detail: 'markdown' }, { label: '📄 HTML 리포트', description: '웹 브라우저용', detail: 'html' }]
                : template === 'executive'
                    ? [{ label: '📄 HTML 리포트', description: '웹 브라우저용', detail: 'html' }, { label: '📝 Markdown', description: 'GitHub 문서용', detail: 'markdown' }]
                    : allFormats;

            const format = await vscode.window.showQuickPick(formatItems, { placeHolder: '내보내기 형식을 선택하세요' });
            if (!format) {return;}

            const branch = await pickAnalysisBranch();

            // 프리셋별 옵션 빌드
            let options: ReportOptions;
            if (template === 'executive') {
                const anonymizeChoice = await vscode.window.showQuickPick([
                    { label: '❌ 실제 이름 유지', description: '내부 팀용', detail: 'false' },
                    { label: '✅ 익명화 (Developer A/B/C...)', description: '외부 이해관계자 공유용', detail: 'true' }
                ], { placeHolder: '작성자 익명화 옵션 선택' });
                if (!anonymizeChoice) { return; }
                const anonymize = anonymizeChoice.detail === 'true';
                options = {
                    format: format.detail as any, template: 'executive',
                    includeSummary: true, includeCharts: false, includeFileStats: false,
                    includeAuthorStats: anonymize, includeTimeAnalysis: false, includeBadges: false,
                    includePRReadiness: false, includeStreak: false,
                    anonymizeAuthors: anonymize, period
                };
            } else if (template === 'pr') {
                options = {
                    format: format.detail as any, template: 'pr',
                    includeSummary: true, includeCharts: false, includeFileStats: false,
                    includeAuthorStats: false, includeTimeAnalysis: false, includeBadges: false,
                    includePRReadiness: true, includeStreak: false, period
                };
            } else if (template === 'developer') {
                options = {
                    format: format.detail as any, template: 'developer',
                    includeSummary: true, includeCharts: false, includeFileStats: false,
                    includeAuthorStats: false, includeTimeAnalysis: true, includeBadges: true,
                    includePRReadiness: false, includeStreak: true, period
                };
            } else if (template === 'custom') {
                const sections = await vscode.window.showQuickPick([
                    { label: '📋 요약 통계',       picked: true,  detail: 'includeSummary' },
                    { label: '👥 개발자별 통계',     picked: true,  detail: 'includeAuthorStats' },
                    { label: '📁 파일 타입별 분석',  picked: true,  detail: 'includeFileStats' },
                    { label: '⏰ 시간대별 분석',     picked: true,  detail: 'includeTimeAnalysis' },
                    { label: '🏆 개발자 배지',       picked: true,  detail: 'includeBadges' },
                    { label: '🔥 커밋 스트릭',       picked: false, detail: 'includeStreak' },
                    { label: '🔀 PR Readiness',      picked: false, detail: 'includePRReadiness' }
                ], { placeHolder: '포함할 섹션을 선택하세요 (다중 선택 가능)', canPickMany: true });
                if (!sections || sections.length === 0) {return;}
                options = {
                    format: format.detail as any,
                    includeSummary:     sections.some(s => s.detail === 'includeSummary'),
                    includeCharts: true,
                    includeFileStats:   sections.some(s => s.detail === 'includeFileStats'),
                    includeAuthorStats: sections.some(s => s.detail === 'includeAuthorStats'),
                    includeTimeAnalysis:sections.some(s => s.detail === 'includeTimeAnalysis'),
                    includeBadges:      sections.some(s => s.detail === 'includeBadges'),
                    includePRReadiness: sections.some(s => s.detail === 'includePRReadiness'),
                    includeStreak:      sections.some(s => s.detail === 'includeStreak'),
                    period
                };
            } else {
                options = {
                    format: format.detail as any, template: 'full',
                    includeSummary: true, includeCharts: true, includeFileStats: true,
                    includeAuthorStats: true, includeTimeAnalysis: true, includeBadges: true,
                    includePRReadiness: true, includeStreak: true, period
                };
            }

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
                triggerReviewPromptIfReady(context);
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
        triggerReviewPromptIfReady(context);
    });

    // 팀 공유 명령어
    const shareWithTeamDisposable = vscode.commands.registerCommand('gitMetrics.shareWithTeam', async () => {
        const snippet = JSON.stringify({ recommendations: ['jiwan-dev.git-metrics-dashboard'] }, null, 2);
        await vscode.env.clipboard.writeText(snippet);
        const action = await vscode.window.showInformationMessage(
            '📋 .vscode/extensions.json 스니펫이 복사되었습니다! 팀 저장소의 .vscode/extensions.json에 붙여넣으면 팀원이 VS Code를 열 때 자동 설치 권유를 받습니다.',
            '자세히 보기'
        );
        if (action === '자세히 보기') {
            vscode.env.openExternal(vscode.Uri.parse(
                'https://code.visualstudio.com/docs/editor/extension-marketplace#_workspace-recommended-extensions'
            ));
        }
    });

    // 릴리즈 노트 생성 명령어
    const generateReleaseNotesDisposable = vscode.commands.registerCommand('gitMetrics.generateReleaseNotes', async () => {
        try {
            const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!workspaceRoot) {
                vscode.window.showErrorMessage('워크스페이스가 열려있지 않습니다.');
                return;
            }

            const analyzer = new GitAnalyzer();
            let generatedNotes = '';
            await vscode.window.withProgress(
                { location: vscode.ProgressLocation.Notification, title: '릴리즈 노트 생성 중...', cancellable: false },
                async () => {
                    generatedNotes = await analyzer.generateReleaseNotes();
                    await vscode.env.clipboard.writeText(generatedNotes);
                }
            );

            const action = await vscode.window.showInformationMessage(
                '📋 릴리즈 노트가 클립보드에 복사되었습니다! CHANGELOG.md 또는 PR description에 붙여넣기 하세요.',
                '파일로 저장'
            );

            if (action === '파일로 저장') {
                const notes = generatedNotes;
                const savePath = vscode.Uri.file(`${workspaceRoot}/RELEASE_NOTES.md`);
                await vscode.workspace.fs.writeFile(savePath, Buffer.from(notes, 'utf8'));
                const doc = await vscode.workspace.openTextDocument(savePath);
                await vscode.window.showTextDocument(doc);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`릴리즈 노트 생성 실패: ${error}`);
        }
    });

    // Conventional Commit 도우미 명령어
    const conventionalCommitDisposable = vscode.commands.registerCommand('gitMetrics.conventionalCommit', async () => {
        const TYPES = [
            { label: '✨ feat', description: 'A new feature', detail: 'feat' },
            { label: '🐛 fix', description: 'A bug fix', detail: 'fix' },
            { label: '📝 docs', description: 'Documentation only changes', detail: 'docs' },
            { label: '♻️ refactor', description: 'Code change that neither fixes a bug nor adds a feature', detail: 'refactor' },
            { label: '🧪 test', description: 'Adding missing tests or correcting existing tests', detail: 'test' },
            { label: '🔧 chore', description: 'Other changes that don\'t modify src or test files', detail: 'chore' },
            { label: '⚡ perf', description: 'A code change that improves performance', detail: 'perf' },
            { label: '💄 style', description: 'Changes that do not affect the meaning of the code', detail: 'style' },
            { label: '🔨 build', description: 'Changes that affect the build system or external dependencies', detail: 'build' },
            { label: '🚀 ci', description: 'Changes to CI/CD configuration files and scripts', detail: 'ci' }
        ];

        const typeChoice = await vscode.window.showQuickPick(TYPES, {
            placeHolder: '커밋 타입을 선택하세요'
        });
        if (!typeChoice) { return; }

        const scope = await vscode.window.showInputBox({
            prompt: '스코프 입력 (선택사항, 예: auth, ui, api)',
            placeHolder: '비워두면 스코프 없이 생성됩니다'
        });
        if (scope === undefined) { return; }

        const description = await vscode.window.showInputBox({
            prompt: '커밋 설명 입력 (소문자로 시작, 마침표 없이)',
            placeHolder: '예: add login button, fix null pointer exception',
            validateInput: (val) => {
                if (!val || val.trim().length === 0) { return '설명을 입력해주세요'; }
                if (val.trim().endsWith('.')) { return '마침표 없이 입력해주세요'; }
                return null;
            }
        });
        if (!description) { return; }

        const prefix = scope ? `${typeChoice.detail}(${scope.trim()})` : typeChoice.detail;
        const commitMsg = `${prefix}: ${description.trim()}`;

        await vscode.env.clipboard.writeText(commitMsg);

        const terminal = vscode.window.activeTerminal || vscode.window.createTerminal('Git Commit');
        terminal.show();
        terminal.sendText(`git commit -m "${commitMsg}"`, false);

        vscode.window.showInformationMessage(
            `✅ 커밋 메시지: ${commitMsg}`,
            '클립보드에 복사됨'
        );
    });

    // 월간 브리프 생성 명령어
    const generateMonthlyBriefDisposable = vscode.commands.registerCommand('gitMetrics.generateMonthlyBrief', async () => {
        try {
            const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!workspaceRoot) {
                vscode.window.showErrorMessage('워크스페이스가 열려있지 않습니다.');
                return;
            }

            const periodChoice = await vscode.window.showQuickPick([
                { label: '📅 최근 30일 (Monthly)', detail: '30' },
                { label: '📅 최근 60일 (Bi-Monthly)', detail: '60' },
                { label: '📅 최근 90일 (Quarterly)', detail: '90' }
            ], { placeHolder: '브리프 기간을 선택하세요' });
            if (!periodChoice) { return; }
            const period = parseInt(periodChoice.detail);

            let briefContent = '';
            await vscode.window.withProgress(
                { location: vscode.ProgressLocation.Notification, title: `월간 브리프 생성 중 (${period}일)...`, cancellable: false },
                async () => {
                    const commits = await gitAnalyzer.getCommitHistory(period);
                    const metrics = await gitAnalyzer.generateMetrics(commits);
                    const intelligence = prepareRepositoryIntelligence(metrics, period);
                    briefContent = buildMonthlyBrief(metrics, intelligence, period);
                    await vscode.env.clipboard.writeText(briefContent);
                }
            );

            const action = await vscode.window.showInformationMessage(
                `📋 월간 브리프가 클립보드에 복사되었습니다! (${period}일 분석)`,
                '파일로 저장'
            );

            if (action === '파일로 저장') {
                const savePath = vscode.Uri.file(`${workspaceRoot}/MONTHLY_BRIEF.md`);
                await vscode.workspace.fs.writeFile(savePath, Buffer.from(briefContent, 'utf8'));
                const doc = await vscode.workspace.openTextDocument(savePath);
                await vscode.window.showTextDocument(doc);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`월간 브리프 생성 실패: ${error}`);
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

    // 대시보드 분석 완료 시 상태바에 health score 표시 (트렌드 화살표 포함)
    dashboardProvider.setHealthScoreCallback((score: number) => {
        const icon = score >= 78 ? '$(pass)' : score >= 58 ? '$(warning)' : '$(error)';

        // Health score history 관리 (최근 30개 유지)
        const historyKey = 'gitMetrics.healthHistory';
        const history: number[] = context.globalState.get<number[]>(historyKey, []);
        history.push(score);
        if (history.length > 30) { history.splice(0, history.length - 30); }
        context.globalState.update(historyKey, history);

        // 트렌드 화살표 계산 (직전 값과 비교)
        let trend = '';
        if (history.length >= 2) {
            const prev = history[history.length - 2];
            if (score > prev + 2) { trend = '↑'; }
            else if (score < prev - 2) { trend = '↓'; }
            else { trend = '→'; }
        }

        statusBarItem.text = `${icon} Git: ${score}/100${trend}`;
        statusBarItem.tooltip = `Repository Health: ${score}/100${trend ? ` (${trend === '↑' ? '개선' : trend === '↓' ? '하락' : '유지'})` : ''} — 클릭하여 대시보드 열기`;

        // Health score +5 이상 향상 시 축하 알림
        if (history.length >= 2) {
            const prev = history[history.length - 2];
            const improvement = score - prev;
            if (improvement >= 5) {
                void (async () => {
                    const action = await vscode.window.showInformationMessage(
                        `🎉 저번보다 +${improvement}점 향상! ${score}/100 🧠`,
                        '𝕏 공유하기',
                        '닫기'
                    );
                    if (action === '𝕏 공유하기') {
                        const tweetText = `My repo health score improved by +${improvement} points to ${score}/100! 🧠 Tracking progress with Git Metrics Dashboard for VS Code`;
                        await vscode.env.openExternal(vscode.Uri.parse(
                            `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent('https://marketplace.visualstudio.com/items?itemName=jiwan-dev.git-metrics-dashboard')}`
                        ));
                    }
                })();
            }
        }
    });

    // 스트릭 상태바
    const streakStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 97);
    streakStatusBarItem.command = 'gitMetrics.showDashboard';
    streakStatusBarItem.tooltip = '현재 커밋 스트릭 — 클릭하여 대시보드 열기';

    dashboardProvider.setStreakCallback((streak: number, _longestStreak: number) => {
        if (streak > 0) {
            streakStatusBarItem.text = `🔥 ${streak}d`;
            streakStatusBarItem.show();
        } else {
            streakStatusBarItem.hide();
        }
        // 스트릭 위험 알림용으로 현재 스트릭 저장
        context.globalState.update('gitMetrics.currentStreak', streak);
        checkStreakMilestone(context, streak);
    });

    // 오늘 커밋수 상태바 (일일 목표 지원)
    const todayStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 96);
    todayStatusBarItem.command = 'gitMetrics.showDashboard';
    todayStatusBarItem.tooltip = '오늘 커밋 수 — 클릭하여 대시보드 열기';

    let todayCommitCount = 0;
    let goalReachedToday = false;

    dashboardProvider.setTodayCommitsCallback((count: number) => {
        todayCommitCount = count;
        const config = vscode.workspace.getConfiguration('gitMetrics');
        const goal = config.get<number>('dailyCommitGoal', 0);

        if (goal > 0) {
            todayStatusBarItem.text = `📝 ${count}/${goal} today`;
            todayStatusBarItem.tooltip = `오늘 커밋: ${count}/${goal} — 클릭하여 대시보드 열기`;
            todayStatusBarItem.show();
            // 목표 달성 축하 (1회만)
            if (count >= goal && !goalReachedToday) {
                goalReachedToday = true;
                vscode.window.showInformationMessage(`🎯 오늘의 커밋 목표 달성! ${count}/${goal} 커밋 완료!`, '대시보드 열기').then(a => {
                    if (a === '대시보드 열기') { vscode.commands.executeCommand('gitMetrics.showDashboard'); }
                });
            }
        } else if (count > 0) {
            todayStatusBarItem.text = `📝 ${count} today`;
            todayStatusBarItem.tooltip = '오늘 커밋 수 — 클릭하여 대시보드 열기';
            todayStatusBarItem.show();
        } else {
            todayStatusBarItem.hide();
        }
    });

    // 오늘 날짜 변경 감지 → 목표 달성 플래그 초기화
    let lastCheckedDate = new Date().toDateString();
    const dateCheckInterval = setInterval(() => {
        const today = new Date().toDateString();
        if (today !== lastCheckedDate) {
            lastCheckedDate = today;
            goalReachedToday = false;
        }
    }, 60000);

    // 배지 달성 토스트
    dashboardProvider.setBadgeUnlockCallback(async (badge) => {
        const action = await vscode.window.showInformationMessage(
            `🏆 새 배지 달성: ${badge.icon} ${badge.name}! (${badge.rarity})`,
            '𝕏 트위터 공유',
            '📋 텍스트 복사',
            '확인'
        );
        if (action === '𝕏 트위터 공유') {
            const tweetText = `🏆 Just earned the "${badge.name}" ${badge.icon} badge on Git Metrics Dashboard for VS Code! #DevLife #GitMetrics`;
            await vscode.env.openExternal(vscode.Uri.parse(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent('https://marketplace.visualstudio.com/items?itemName=jiwan-dev.git-metrics-dashboard')}`
            ));
        } else if (action === '📋 텍스트 복사') {
            const text = `🏆 "${badge.name}" 배지 달성! ${badge.icon} — Git Metrics Dashboard for VS Code\nhttps://marketplace.visualstudio.com/items?itemName=jiwan-dev.git-metrics-dashboard`;
            await vscode.env.clipboard.writeText(text);
            vscode.window.showInformationMessage('📋 공유 텍스트가 클립보드에 복사되었습니다!');
        }
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
                    streakStatusBarItem.hide();
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
        shareWithTeamDisposable,
        generateReleaseNotesDisposable,
        generateMonthlyBriefDisposable,
        conventionalCommitDisposable,
        refreshTreeViewDisposable,
        changeLanguageDisposable,
        statusBarItem,
        exportStatusBarItem,
        themeStatusBarItem,
        streakStatusBarItem,
        todayStatusBarItem,
        treeView,
        { dispose: () => { changeDetector?.dispose(); statusIndicator?.dispose(); } }
    );

    // 웰컴 메시지 (첫 설치 시에만)
    // 스트릭 위험 알림 스케줄러 (매분 체크 → 오후 8시 윈도우에 스트릭 있고 오늘 커밋 없으면 알림)
    const streakDangerCheckInterval = setInterval(async () => {
        const config = vscode.workspace.getConfiguration('gitMetrics');
        if (!config.get<boolean>('streakDangerAlert', true)) { return; }

        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();

        // 오후 8시 ~ 8시 1분 사이에만 발동 (하루 1회)
        if (hour !== 20 || minute !== 0) { return; }

        // 이미 오늘 알림을 보냈으면 skip
        const alertKey = 'gitMetrics.streakDangerAlertDate';
        const lastAlertDate = context.globalState.get<string>(alertKey, '');
        const todayStr = now.toDateString();
        if (lastAlertDate === todayStr) { return; }

        // 스트릭이 있는지 확인
        const currentStreak = context.globalState.get<number>('gitMetrics.currentStreak', 0);
        if (currentStreak <= 0) { return; }

        // 오늘 커밋이 없는지 확인
        if (todayCommitCount > 0) { return; }

        await context.globalState.update(alertKey, todayStr);
        const action = await vscode.window.showWarningMessage(
            `🔥 ${currentStreak}일 스트릭이 자정에 끊깁니다! 오늘 커밋을 남기세요.`,
            '대시보드 열기',
            '나중에'
        );
        if (action === '대시보드 열기') {
            vscode.commands.executeCommand('gitMetrics.showDashboard');
        }
    }, 60000);
    context.subscriptions.push({ dispose: () => clearInterval(streakDangerCheckInterval) });
    context.subscriptions.push({ dispose: () => clearInterval(dateCheckInterval) });

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

}

async function checkStreakMilestone(context: vscode.ExtensionContext, streak: number): Promise<void> {
    const milestones = [7, 14, 30, 50, 100];
    const alerted = new Set<number>(context.globalState.get<number[]>('gitMetrics.streakMilestonesAlerted', []));
    for (const m of milestones) {
        if (streak >= m && !alerted.has(m)) {
            alerted.add(m);
            await context.globalState.update('gitMetrics.streakMilestonesAlerted', Array.from(alerted));
            const action = await vscode.window.showInformationMessage(
                `🔥 ${m}일 커밋 스트릭 달성! 축하합니다!`,
                '공유하기',
                '확인'
            );
            if (action === '공유하기') {
                const text = `🔥 ${m}-day commit streak achieved! Tracked with Git Metrics Dashboard for VS Code\nhttps://marketplace.visualstudio.com/items?itemName=jiwan-dev.git-metrics-dashboard`;
                await vscode.env.clipboard.writeText(text);
                vscode.window.showInformationMessage('📋 공유 텍스트가 복사되었습니다!');
            }
            break; // 한 번에 하나만 표시
        }
    }
}

async function triggerReviewPromptIfReady(context: vscode.ExtensionContext): Promise<void> {
    const hasReviewed = context.globalState.get<boolean>('gitMetrics.hasReviewed', false);
    if (hasReviewed) { return; }

    const snoozedUntil = context.globalState.get<number>('gitMetrics.reviewSnoozedUntil', 0);
    if (Date.now() < snoozedUntil) { return; }

    const successCount = (context.globalState.get<number>('gitMetrics.reviewSuccessCount', 0)) + 1;
    await context.globalState.update('gitMetrics.reviewSuccessCount', successCount);
    if (successCount < 3) { return; }

    const action = await vscode.window.showInformationMessage(
        '❤️ Git Metrics Dashboard가 도움이 되셨나요? VS Code Marketplace에 ⭐ 별점을 남겨주시면 더 많은 개발자들에게 도움이 됩니다!',
        '⭐ 지금 리뷰 남기기',
        '30일 후 다시',
        '다시 보지 않기'
    );

    if (action === '⭐ 지금 리뷰 남기기') {
        await context.globalState.update('gitMetrics.hasReviewed', true);
        vscode.env.openExternal(vscode.Uri.parse(
            'https://marketplace.visualstudio.com/items?itemName=jiwan-dev.git-metrics-dashboard&ssr=false#review-details'
        ));
    } else if (action === '30일 후 다시') {
        const snoozeTo = Date.now() + 30 * 24 * 60 * 60 * 1000;
        await context.globalState.update('gitMetrics.reviewSnoozedUntil', snoozeTo);
        await context.globalState.update('gitMetrics.reviewSuccessCount', 0);
    } else if (action === '다시 보지 않기') {
        await context.globalState.update('gitMetrics.hasReviewed', true);
    }
}

export function deactivate() {
    console.log('Git Metrics Dashboard 비활성화됨');

    // 참고: changeDetector와 statusIndicator는 context.subscriptions를 통해 자동으로 정리됩니다.
    // extension.ts의 전역 변수가 가비지 컬렉션되면서 dispose()가 호출됩니다.
}
