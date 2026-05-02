import { MetricsData } from './gitAnalyzer';

export type InsightTone = 'good' | 'warn' | 'danger' | 'info';
export type ActionPriority = 'High' | 'Medium' | 'Low';

export interface RepositoryInsight {
    title: string;
    value: string;
    detail: string;
    tone: InsightTone;
}

export interface RepositoryAction {
    title: string;
    detail: string;
    priority: ActionPriority;
}

export interface RepositoryIntelligence {
    healthScore: number;
    healthLabel: string;
    healthTone: InsightTone;
    summary: string;
    signals: RepositoryInsight[];
    actions: RepositoryAction[];
    focusFiles: Array<{ file: string; score: number; reason: string }>;
}

export function prepareRepositoryIntelligence(metrics: MetricsData, days: number): RepositoryIntelligence {
    const totalChanges = (metrics.totalInsertions || 0) + (metrics.totalDeletions || 0);
    const deletionRatio = totalChanges > 0 ? Math.round(((metrics.totalDeletions || 0) / totalChanges) * 100) : 0;
    const topAuthorShare = metrics.authorStats[0]?.percentage || 0;
    const topHotspot = metrics.fileChurnStats?.[0];
    const totalChurn = (metrics.fileChurnStats || []).reduce((sum, file) => sum + file.churnScore, 0);
    const hotspotShare = topHotspot && totalChurn > 0 ? Math.round((topHotspot.churnScore / totalChurn) * 100) : 0;
    const staleBranchRatio = metrics.branchStats?.totalBranches
        ? Math.round(((metrics.branchStats.staleBranches?.length || 0) / metrics.branchStats.totalBranches) * 100)
        : 0;
    const streakTotalDays = metrics.commitStreak?.totalDays || days;
    const activeRate = metrics.commitStreak?.activityRate || 0;
    const conventionalRate = metrics.conventionalCommits?.conventionalPercentage || 0;
    const wow = metrics.weekOverWeekChange?.changePercent || 0;

    const maintainabilityScore = Math.max(0, 100 - Math.round(hotspotShare * 1.4) - Math.round(deletionRatio * 0.35));
    const collaborationScore = metrics.totalAuthors <= 1 ? 62 : Math.max(0, 100 - Math.max(0, topAuthorShare - 45));
    const momentumScore = Math.max(0, Math.min(100, activeRate + (wow > 0 ? 12 : wow < -20 ? -18 : 0)));
    const qualityScore = Math.max(35, conventionalRate);
    const branchScore = Math.max(0, 100 - staleBranchRatio);

    const healthScore = Math.round(
        maintainabilityScore * 0.28 +
        collaborationScore * 0.2 +
        momentumScore * 0.22 +
        qualityScore * 0.18 +
        branchScore * 0.12
    );

    const healthTone = healthScore >= 78 ? 'good' : healthScore >= 58 ? 'warn' : 'danger';
    const healthLabel = healthScore >= 78
        ? 'Healthy momentum'
        : healthScore >= 58
            ? 'Needs attention'
            : 'High-risk repository';

    const signals: RepositoryInsight[] = [
        {
            title: 'Momentum',
            value: `${activeRate}% active`,
            detail: `${metrics.commitStreak?.activeDays || 0}/${streakTotalDays}일에 커밋, 기간 변화 ${wow >= 0 ? '+' : ''}${wow}%`,
            tone: activeRate >= 60 ? 'good' : activeRate >= 30 ? 'warn' : 'danger'
        },
        {
            title: 'Code Health',
            value: `${maintainabilityScore}/100`,
            detail: topHotspot ? `최대 hotspot: ${shortenPath(topHotspot.file)} (${hotspotShare}% churn)` : '핫스팟 데이터 없음',
            tone: maintainabilityScore >= 75 ? 'good' : maintainabilityScore >= 55 ? 'warn' : 'danger'
        },
        {
            title: 'Commit Quality',
            value: `${conventionalRate}%`,
            detail: `Conventional Commit 준수율, 주요 타입 ${metrics.conventionalCommits?.topType || 'N/A'}`,
            tone: conventionalRate >= 70 ? 'good' : conventionalRate >= 35 ? 'warn' : 'danger'
        },
        {
            title: 'Collaboration',
            value: `${metrics.totalAuthors} authors`,
            detail: `상위 기여자 집중도 ${topAuthorShare}%`,
            tone: topAuthorShare <= 55 || metrics.totalAuthors <= 1 ? 'info' : topAuthorShare <= 75 ? 'warn' : 'danger'
        }
    ];

    const actions = buildRepositoryActions(metrics, {
        activeRate,
        conventionalRate,
        hotspotShare,
        staleBranchRatio,
        topAuthorShare,
        deletionRatio
    });

    const focusFiles = (metrics.fileChurnStats || [])
        .slice(0, 3)
        .map(file => {
            const score = Math.min(99, Math.round((file.commits * 7) + (file.churnScore / Math.max(1, totalChurn)) * 65));
            return {
                file: shortenPath(file.file, 34),
                score,
                reason: `${file.commits} commits, +${file.insertions}/-${file.deletions} lines. 테스트 보강 또는 모듈 분리 후보입니다.`
            };
        });

    const summary = healthScore >= 78
        ? '속도와 품질 신호가 균형 잡힌 상태입니다.'
        : healthScore >= 58
            ? '성장은 보이지만 hotspot과 규칙 준수 개선 여지가 있습니다.'
            : '변경 집중도와 운영 리스크를 먼저 낮추는 것이 좋습니다.';

    return { healthScore, healthLabel, healthTone, summary, signals, actions, focusFiles };
}

export function buildExecutiveBrief(metrics: MetricsData, intelligence: RepositoryIntelligence, days: number): string {
    const actions = intelligence.actions
        .map((action, index) => `${index + 1}. [${action.priority}] ${action.title}`)
        .join('\n');
    const focusFiles = intelligence.focusFiles.length > 0
        ? intelligence.focusFiles.map(file => `- ${file.file} (Risk ${file.score})`).join('\n')
        : '- No high-risk file detected';
    const badges = metrics.badges || [];
    const unlockedBadges = badges.filter(badge => badge.unlocked);
    const badgeSummary = badges.length > 0
        ? `Achievements: ${unlockedBadges.length}/${badges.length} unlocked`
        : 'Achievements: no badge data';
    const branchComparison = metrics.branchComparison
        ? `Branch Compare: ${metrics.branchComparison.targetBranch} vs ${metrics.branchComparison.baseBranch}, ahead ${metrics.branchComparison.ahead}, behind ${metrics.branchComparison.behind}, ${metrics.branchComparison.filesChanged} files (+${metrics.branchComparison.insertions}/-${metrics.branchComparison.deletions})`
        : 'Branch Compare: no base comparison available';

    return [
        `Git Metrics Brief (${days} days)`,
        `Branch: ${metrics.branchStats?.currentBranch || 'N/A'}`,
        `Health Score: ${intelligence.healthScore}/100 - ${intelligence.healthLabel}`,
        `Commits: ${metrics.totalCommits}, Files: ${metrics.totalFiles}, Authors: ${metrics.totalAuthors}`,
        `Changes: +${(metrics.totalInsertions || 0).toLocaleString()} / -${(metrics.totalDeletions || 0).toLocaleString()}`,
        branchComparison,
        badgeSummary,
        '',
        'Recommended Next Moves:',
        actions,
        '',
        'Refactor Radar:',
        focusFiles,
        '',
        '---',
        'Generated by Git Metrics Dashboard for VS Code',
        'https://marketplace.visualstudio.com/items?itemName=jiwan-dev.git-metrics-dashboard'
    ].join('\n');
}

export function getToneColor(tone: InsightTone): string {
    const colors: Record<InsightTone, string> = {
        good: 'var(--accent-green)',
        warn: 'var(--accent-orange)',
        danger: 'var(--accent-red)',
        info: 'var(--accent-blue)'
    };
    return colors[tone];
}

export function getPriorityColor(priority: ActionPriority): string {
    const colors: Record<ActionPriority, string> = {
        High: 'var(--accent-red)',
        Medium: 'var(--accent-orange)',
        Low: 'var(--accent-blue)'
    };
    return colors[priority];
}

function buildRepositoryActions(metrics: MetricsData, scores: {
    activeRate: number;
    conventionalRate: number;
    hotspotShare: number;
    staleBranchRatio: number;
    topAuthorShare: number;
    deletionRatio: number;
}): RepositoryAction[] {
    const actions: RepositoryAction[] = [];

    if (scores.hotspotShare >= 25 && metrics.fileChurnStats?.[0]) {
        actions.push({
            priority: 'High',
            title: 'Split or test the hottest file',
            detail: `${shortenPath(metrics.fileChurnStats[0].file)} 파일에 변경이 집중됩니다. 작은 모듈로 나누거나 regression 테스트를 먼저 추가하세요.`
        });
    }

    if (scores.conventionalRate < 60) {
        actions.push({
            priority: scores.conventionalRate < 30 ? 'High' : 'Medium',
            title: 'Standardize commit messages',
            detail: '`feat:`, `fix:`, `docs:` 같은 Conventional Commit 규칙을 적용하면 리포트와 릴리스 노트 품질이 좋아집니다.'
        });
    }

    if (scores.staleBranchRatio >= 35) {
        actions.push({
            priority: 'Medium',
            title: 'Prune stale branches',
            detail: `브랜치의 ${scores.staleBranchRatio}%가 오래되었습니다. 닫힌 작업 브랜치를 정리해 리뷰와 배포 혼선을 줄이세요.`
        });
    }

    if (scores.topAuthorShare >= 70 && metrics.totalAuthors > 1) {
        actions.push({
            priority: 'Medium',
            title: 'Reduce contributor concentration',
            detail: `상위 기여자가 ${scores.topAuthorShare}%를 담당합니다. 리뷰 로테이션이나 소유권 분산이 필요합니다.`
        });
    }

    if (scores.activeRate < 35 && metrics.totalCommits > 0) {
        actions.push({
            priority: 'Low',
            title: 'Stabilize delivery cadence',
            detail: `최근 활동일이 ${scores.activeRate}%입니다. 작은 PR 단위와 주간 체크포인트로 흐름을 일정하게 만드세요.`
        });
    }

    if (scores.deletionRatio >= 55) {
        actions.push({
            priority: 'Low',
            title: 'Validate large cleanup work',
            detail: `삭제 비중이 ${scores.deletionRatio}%입니다. 마이그레이션, 회귀 테스트, 릴리스 노트를 함께 확인하세요.`
        });
    }

    if (actions.length === 0) {
        actions.push({
            priority: 'Low',
            title: 'Keep the current rhythm',
            detail: '핵심 리스크 신호가 낮습니다. 현재 cadence를 유지하면서 리뷰 품질과 테스트 커버리지를 점검하세요.'
        });
    }

    return actions.slice(0, 3);
}

function shortenPath(path: string, maxLength: number = 28): string {
    if (path.length <= maxLength) { return path; }
    const fileName = path.split('/').pop() || path;
    if (fileName.length >= maxLength - 2) {
        return `…${fileName.slice(-(maxLength - 1))}`;
    }
    return `…/${fileName}`;
}

// ─── P2: PR Readiness ─────────────────────────────────────────────────────

export interface PRReadiness {
    score: number;
    sizeLabel: 'S' | 'M' | 'L' | 'XL';
    risks: string[];
}

export function calcPRReadiness(metrics: MetricsData): PRReadiness {
    const bc = metrics.branchComparison;
    if (!bc) { return { score: 100, sizeLabel: 'S', risks: ['No branch comparison available'] }; }

    let score = 100;
    const risks: string[] = [];
    const totalLines = (bc.insertions || 0) + (bc.deletions || 0);
    let sizeLabel: 'S' | 'M' | 'L' | 'XL' = 'S';

    if (bc.filesChanged >= 50 || totalLines >= 1000) {
        sizeLabel = 'XL'; score -= 40;
        risks.push('XL PR — consider splitting into smaller pull requests');
    } else if (bc.filesChanged >= 20 || totalLines >= 400) {
        sizeLabel = 'L'; score -= 20;
        risks.push('Large PR — reviewers may need extra time');
    } else if (bc.filesChanged >= 5 || totalLines >= 100) {
        sizeLabel = 'M'; score -= 5;
    }

    if (bc.ahead > 20) {
        score -= 15;
        risks.push(`${bc.ahead} commits ahead — consider squashing for a cleaner history`);
    } else if (bc.ahead > 10) {
        score -= 8;
        risks.push(`${bc.ahead} commits ahead — consider squashing`);
    }

    const highChurnCount = (metrics.fileChurnStats || []).filter(f => f.churnScore > 50).length;
    if (highChurnCount > 0) {
        score -= Math.min(20, highChurnCount * 5);
        risks.push(`${highChurnCount} high-churn file(s) in repository — review carefully`);
    }

    if (risks.length === 0) { risks.push('No major risk signals detected — good to go!'); }
    return { score: Math.max(0, Math.min(100, score)), sizeLabel, risks };
}

export function buildPRSummary(metrics: MetricsData, intelligence: RepositoryIntelligence, _days: number): string {
    const bc = metrics.branchComparison;
    if (!bc) { return 'No branch comparison data available.'; }
    const pr = calcPRReadiness(metrics);
    return [
        `🔀 PR Summary: ${bc.targetBranch} → ${bc.baseBranch}`,
        `Size: ${pr.sizeLabel} — ${bc.filesChanged} files, +${bc.insertions}/-${bc.deletions} lines, ${bc.ahead} commits ahead`,
        `PR Readiness: ${pr.score}/100  |  Repository Health: ${intelligence.healthScore}/100 — ${intelligence.healthLabel}`,
        '',
        'Risk Signals:',
        ...pr.risks.map(r => `  - ${r}`),
        '',
        '---',
        'Generated by Git Metrics Dashboard for VS Code',
        'https://marketplace.visualstudio.com/items?itemName=jiwan-dev.git-metrics-dashboard'
    ].join('\n');
}

export function buildPRDescription(metrics: MetricsData, intelligence: RepositoryIntelligence): string {
    const bc = metrics.branchComparison;
    if (!bc) { return 'No branch comparison data available.'; }
    const pr = calcPRReadiness(metrics);
    return [
        '## Summary',
        '',
        `**Branch:** \`${bc.targetBranch}\` → \`${bc.baseBranch}\``,
        `**Size:** ${pr.sizeLabel} — ${bc.filesChanged} files changed, +${bc.insertions}/-${bc.deletions} lines`,
        `**Commits:** ${bc.ahead} commits ahead`,
        `**Repository Health:** ${intelligence.healthScore}/100 — ${intelligence.healthLabel}`,
        '',
        '## Risk Signals',
        '',
        ...pr.risks.map(r => `- ${r}`),
        '',
        '---',
        '*Generated by [Git Metrics Dashboard](https://marketplace.visualstudio.com/items?itemName=jiwan-dev.git-metrics-dashboard) for VS Code*'
    ].join('\n');
}

// ─── P2: Weekly Engineering Brief ─────────────────────────────────────────

export function buildWeeklyBrief(metrics: MetricsData, intelligence: RepositoryIntelligence, days: number): string {
    const topContributors = (metrics.authorStats || [])
        .slice(0, 3)
        .map((a, i) => `${['🥇', '🥈', '🥉'][i]} ${a.name}: ${a.commits} commits`)
        .join('\n');
    const actions = intelligence.actions
        .map((a, i) => `${i + 1}. [${a.priority}] ${a.title}`)
        .join('\n');
    const risky = (metrics.fileChurnStats || []).slice(0, 3)
        .map(f => `  - ${shortenPath(f.file)} (${f.commits} commits)`)
        .join('\n');

    return [
        `📊 Engineering Brief — Last ${days} Days`,
        `Branch: ${metrics.branchStats?.currentBranch || 'N/A'}  |  Health: ${intelligence.healthScore}/100 — ${intelligence.healthLabel}`,
        intelligence.summary,
        '',
        `Activity: ${metrics.totalCommits} commits | ${metrics.totalFiles} files | ${metrics.totalAuthors} contributor(s)`,
        `Changes: +${(metrics.totalInsertions || 0).toLocaleString()} / -${(metrics.totalDeletions || 0).toLocaleString()}`,
        '',
        'Top Contributors:',
        topContributors,
        ...(risky ? ['', 'Hot Files:', risky] : []),
        '',
        'Next Moves:',
        actions,
        '',
        '---',
        'Generated by Git Metrics Dashboard for VS Code',
        'https://marketplace.visualstudio.com/items?itemName=jiwan-dev.git-metrics-dashboard'
    ].join('\n');
}
