/**
 * Git Metrics 사이드바 TreeView 제공자
 * Explorer 패널에 빠른 통계 뷰를 제공합니다 (Git Graph 스타일)
 */

import * as vscode from 'vscode';
import { GitAnalyzer, MetricsData } from './gitAnalyzer';

export class GitMetricsTreeItem extends vscode.TreeItem {
    constructor(
        label: string,
        collapsibleState: vscode.TreeItemCollapsibleState,
        value?: string,
        contextValue?: string,
        icon?: vscode.ThemeIcon,
        cmd?: vscode.Command
    ) {
        super(label, collapsibleState);
        if (value !== undefined) { this.description = value; }
        if (contextValue !== undefined) { this.contextValue = contextValue; }
        if (icon !== undefined) { this.iconPath = icon; }
        if (cmd !== undefined) { this.command = cmd; }
    }
}

type TreeSection = 'summary' | 'authors' | 'languages' | 'hotfiles' | 'time' | 'badges';

export class GitMetricsTreeProvider implements vscode.TreeDataProvider<GitMetricsTreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<GitMetricsTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private metrics: MetricsData | null = null;
    private isLoading = false;
    private currentPeriod = 30;

    constructor(private gitAnalyzer: GitAnalyzer) {}

    /**
     * 데이터 새로고침
     */
    async refresh(period?: number): Promise<void> {
        if (this.isLoading) { return; }
        this.isLoading = true;
        this._onDidChangeTreeData.fire();

        try {
            this.currentPeriod = period ?? this.currentPeriod;
            const commits = await this.gitAnalyzer.getCommitHistory(this.currentPeriod);
            this.metrics = await this.gitAnalyzer.generateMetrics(commits);
        } catch (error) {
            console.error('TreeView 데이터 로드 오류:', error);
            this.metrics = null;
        } finally {
            this.isLoading = false;
            this._onDidChangeTreeData.fire();
        }
    }

    getTreeItem(element: GitMetricsTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: GitMetricsTreeItem): Thenable<GitMetricsTreeItem[]> {
        if (this.isLoading) {
            return Promise.resolve([
                new GitMetricsTreeItem('분석 중...', vscode.TreeItemCollapsibleState.None, undefined, undefined, new vscode.ThemeIcon('loading~spin'))
            ]);
        }

        if (!this.metrics) {
            return Promise.resolve([
                new GitMetricsTreeItem('대시보드 열기', vscode.TreeItemCollapsibleState.None, undefined, 'openDashboard', new vscode.ThemeIcon('graph'), {
                    command: 'gitMetrics.showDashboard',
                    title: '대시보드 열기'
                }),
                new GitMetricsTreeItem('Git 저장소가 없거나 데이터가 없습니다.', vscode.TreeItemCollapsibleState.None, undefined, undefined, new vscode.ThemeIcon('info'))
            ]);
        }

        if (!element) {
            return Promise.resolve(this.getRootItems());
        }

        return Promise.resolve(this.getChildItems(element));
    }

    private getRootItems(): GitMetricsTreeItem[] {
        const m = this.metrics!;
        return [
            new GitMetricsTreeItem(
                `📊 요약 (최근 ${this.currentPeriod}일)`,
                vscode.TreeItemCollapsibleState.Expanded,
                undefined, 'summary', new vscode.ThemeIcon('pulse')
            ),
            new GitMetricsTreeItem(
                `👥 개발자 (${m.totalAuthors}명)`,
                vscode.TreeItemCollapsibleState.Collapsed,
                undefined, 'authors', new vscode.ThemeIcon('person')
            ),
            new GitMetricsTreeItem(
                `💻 언어`,
                vscode.TreeItemCollapsibleState.Collapsed,
                undefined, 'languages', new vscode.ThemeIcon('code')
            ),
            new GitMetricsTreeItem(
                `🔥 핫파일 (Churn)`,
                vscode.TreeItemCollapsibleState.Collapsed,
                undefined, 'hotfiles', new vscode.ThemeIcon('flame')
            ),
            new GitMetricsTreeItem(
                `⏰ 시간 패턴`,
                vscode.TreeItemCollapsibleState.Collapsed,
                undefined, 'time', new vscode.ThemeIcon('clock')
            ),
            new GitMetricsTreeItem(
                `🏆 배지 (${m.badges.filter(b => b.unlocked).length}/${m.badges.length})`,
                vscode.TreeItemCollapsibleState.Collapsed,
                undefined, 'badges', new vscode.ThemeIcon('trophy')
            ),
            // 대시보드 열기 버튼
            new GitMetricsTreeItem(
                '전체 대시보드 열기',
                vscode.TreeItemCollapsibleState.None,
                undefined, 'openDashboard', new vscode.ThemeIcon('graph'),
                { command: 'gitMetrics.showDashboard', title: '대시보드 열기' }
            )
        ];
    }

    private getChildItems(element: GitMetricsTreeItem): GitMetricsTreeItem[] {
        const m = this.metrics!;
        const section = element.contextValue as TreeSection;

        switch (section) {
            case 'summary':
                return this.getSummaryItems(m);
            case 'authors':
                return this.getAuthorItems(m);
            case 'languages':
                return this.getLanguageItems(m);
            case 'hotfiles':
                return this.getHotFileItems(m);
            case 'time':
                return this.getTimeItems(m);
            case 'badges':
                return this.getBadgeItems(m);
            default:
                return [];
        }
    }

    private getSummaryItems(m: MetricsData): GitMetricsTreeItem[] {
        const avgPerDay = (m.totalCommits / this.currentPeriod).toFixed(1);
        return [
            new GitMetricsTreeItem('총 커밋', vscode.TreeItemCollapsibleState.None, `${m.totalCommits}개`, undefined, new vscode.ThemeIcon('git-commit')),
            new GitMetricsTreeItem('일평균 커밋', vscode.TreeItemCollapsibleState.None, `${avgPerDay}개/일`, undefined, new vscode.ThemeIcon('calendar')),
            new GitMetricsTreeItem('변경 파일 수', vscode.TreeItemCollapsibleState.None, `${m.totalFiles}개`, undefined, new vscode.ThemeIcon('files')),
            new GitMetricsTreeItem('추가 라인', vscode.TreeItemCollapsibleState.None, `+${m.totalInsertions.toLocaleString()}`, undefined, new vscode.ThemeIcon('diff-added')),
            new GitMetricsTreeItem('삭제 라인', vscode.TreeItemCollapsibleState.None, `-${m.totalDeletions.toLocaleString()}`, undefined, new vscode.ThemeIcon('diff-removed')),
            new GitMetricsTreeItem('상위 기여자', vscode.TreeItemCollapsibleState.None, m.topAuthor, undefined, new vscode.ThemeIcon('star')),
            new GitMetricsTreeItem('가장 활발한 요일', vscode.TreeItemCollapsibleState.None, m.timeAnalysis.peakDay, undefined, new vscode.ThemeIcon('flame')),
            new GitMetricsTreeItem('피크 시간', vscode.TreeItemCollapsibleState.None, m.timeAnalysis.peakHour, undefined, new vscode.ThemeIcon('clock')),
            new GitMetricsTreeItem('현재 스트릭', vscode.TreeItemCollapsibleState.None, `${m.commitStreak?.currentStreak ?? 0}일 연속`, undefined, new vscode.ThemeIcon('flame')),
            new GitMetricsTreeItem('현재 브랜치', vscode.TreeItemCollapsibleState.None, m.branchStats?.currentBranch ?? 'N/A', undefined, new vscode.ThemeIcon('git-branch'))
        ];
    }

    private getAuthorItems(m: MetricsData): GitMetricsTreeItem[] {
        return m.authorStats.slice(0, 10).map(author => {
            const label = `${author.rank}. ${author.name}`;
            const detail = `${author.commits}커밋 · +${author.insertions}/-${author.deletions}`;
            return new GitMetricsTreeItem(label, vscode.TreeItemCollapsibleState.None, detail, undefined, new vscode.ThemeIcon('account'));
        });
    }

    private getLanguageItems(m: MetricsData): GitMetricsTreeItem[] {
        const top = Object.entries(m.programmingLanguages)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        if (top.length === 0) {
            return [new GitMetricsTreeItem('데이터 없음', vscode.TreeItemCollapsibleState.None)];
        }

        return top.map(([lang, count]) =>
            new GitMetricsTreeItem(lang, vscode.TreeItemCollapsibleState.None, `${count}커밋`, undefined, new vscode.ThemeIcon('symbol-class'))
        );
    }

    private getHotFileItems(m: MetricsData): GitMetricsTreeItem[] {
        if (!m.fileChurnStats || m.fileChurnStats.length === 0) {
            return [new GitMetricsTreeItem('데이터 없음', vscode.TreeItemCollapsibleState.None)];
        }

        return m.fileChurnStats.slice(0, 10).map(file => {
            const shortName = file.file.split('/').pop() || file.file;
            const detail = `${file.commits}커밋 · +${file.insertions}/-${file.deletions}`;
            return new GitMetricsTreeItem(shortName, vscode.TreeItemCollapsibleState.None, detail, undefined, new vscode.ThemeIcon('file'));
        });
    }

    private getTimeItems(m: MetricsData): GitMetricsTreeItem[] {
        const t = m.timeAnalysis;
        return [
            new GitMetricsTreeItem('피크 시간', vscode.TreeItemCollapsibleState.None, t.peakHour, undefined, new vscode.ThemeIcon('clock')),
            new GitMetricsTreeItem('피크 요일', vscode.TreeItemCollapsibleState.None, t.peakDay, undefined, new vscode.ThemeIcon('calendar')),
            new GitMetricsTreeItem('야간 커밋', vscode.TreeItemCollapsibleState.None, `${t.nightCommits}개 (${t.nightPercentage}%)`, undefined, new vscode.ThemeIcon('moon')),
            new GitMetricsTreeItem('주말 커밋', vscode.TreeItemCollapsibleState.None, `${t.weekendCommits}개 (${t.weekendPercentage}%)`, undefined, new vscode.ThemeIcon('calendar')),
            new GitMetricsTreeItem('업무일 커밋', vscode.TreeItemCollapsibleState.None, `${t.workdayCommits}개`, undefined, new vscode.ThemeIcon('briefcase'))
        ];
    }

    private getBadgeItems(m: MetricsData): GitMetricsTreeItem[] {
        const unlocked = m.badges.filter(b => b.unlocked);
        const inProgress = m.badges.filter(b => !b.unlocked && b.progress > 0);

        const items: GitMetricsTreeItem[] = [];

        if (unlocked.length > 0) {
            items.push(new GitMetricsTreeItem('— 획득한 배지 —', vscode.TreeItemCollapsibleState.None, undefined, undefined, new vscode.ThemeIcon('check')));
            unlocked.forEach(badge =>
                items.push(new GitMetricsTreeItem(`${badge.icon} ${badge.name}`, vscode.TreeItemCollapsibleState.None, badge.rarity, undefined, new vscode.ThemeIcon('star-full')))
            );
        }

        if (inProgress.length > 0) {
            items.push(new GitMetricsTreeItem('— 진행 중 —', vscode.TreeItemCollapsibleState.None, undefined, undefined, new vscode.ThemeIcon('sync')));
            inProgress.slice(0, 5).forEach(badge =>
                items.push(new GitMetricsTreeItem(`${badge.icon} ${badge.name}`, vscode.TreeItemCollapsibleState.None, `${badge.progress}%`, undefined, new vscode.ThemeIcon('loading~spin')))
            );
        }

        if (items.length === 0) {
            items.push(new GitMetricsTreeItem('아직 획득한 배지가 없습니다', vscode.TreeItemCollapsibleState.None, undefined, undefined, new vscode.ThemeIcon('info')));
        }

        return items;
    }
}
