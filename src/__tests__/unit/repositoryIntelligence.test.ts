import { MetricsData } from '../../gitAnalyzer';
import {
    buildExecutiveBrief,
    getPriorityColor,
    getToneColor,
    prepareRepositoryIntelligence
} from '../../repositoryIntelligence';

function makeMetrics(overrides: Partial<MetricsData> = {}): MetricsData {
    const metrics: MetricsData = {
        dailyCommits: {},
        fileStats: {},
        thisWeekTopFiles: [],
        totalCommits: 40,
        totalFiles: 18,
        totalInsertions: 2400,
        totalDeletions: 600,
        authorStats: [{
            name: 'Alice',
            commits: 22,
            files: 12,
            insertions: 1400,
            deletions: 300,
            percentage: 55,
            rank: 1,
            firstCommit: new Date('2026-04-01'),
            lastCommit: new Date('2026-04-29'),
            averageCommitsPerDay: 1.4
        }, {
            name: 'Bob',
            commits: 18,
            files: 10,
            insertions: 1000,
            deletions: 300,
            percentage: 45,
            rank: 2,
            firstCommit: new Date('2026-04-02'),
            lastCommit: new Date('2026-04-29'),
            averageCommitsPerDay: 1.2
        }],
        totalAuthors: 2,
        topAuthor: 'Alice',
        fileTypes: { ts: 20 },
        fileTypeStats: [],
        topFileType: 'ts',
        programmingLanguages: { TypeScript: 20 },
        timeAnalysis: {
            hourlyActivity: {},
            weeklyActivity: {},
            peakHour: '10시',
            peakDay: 'Wed',
            nightCommits: 2,
            weekendCommits: 4,
            workdayCommits: 36,
            nightPercentage: 5,
            weekendPercentage: 10,
            heatmapData: [],
            workingHours: { start: 9, end: 16, commits: 28 }
        },
        fileChurnStats: [{
            file: 'src/core/repositoryService.ts',
            commits: 8,
            insertions: 500,
            deletions: 180,
            churnScore: 680,
            lastModified: new Date('2026-04-29')
        }, {
            file: 'src/ui/dashboard.ts',
            commits: 5,
            insertions: 240,
            deletions: 120,
            churnScore: 360,
            lastModified: new Date('2026-04-28')
        }],
        commitStreak: {
            currentStreak: 6,
            longestStreak: 10,
            activeDays: 21,
            totalDays: 30,
            activityRate: 70
        },
        conventionalCommits: {
            types: { feat: 18, fix: 10 },
            conventionalCount: 28,
            conventionalPercentage: 70,
            topType: 'feat'
        },
        weekOverWeekChange: {
            currentPeriodCommits: 22,
            previousPeriodCommits: 18,
            changePercent: 22,
            trend: 'up'
        },
        dailyChanges: [],
        branchStats: {
            currentBranch: 'main',
            totalBranches: 4,
            recentBranches: ['main', 'feature/dashboard'],
            staleBranches: ['old-a', 'old-b']
        },
        branchComparison: {
            baseBranch: 'main',
            targetBranch: 'feature/dashboard',
            ahead: 4,
            behind: 0,
            filesChanged: 5,
            insertions: 150,
            deletions: 40
        },
        badges: []
    };

    return { ...metrics, ...overrides };
}

describe('repositoryIntelligence', () => {
    it('builds bounded command-center insights and focus files', () => {
        const intelligence = prepareRepositoryIntelligence(makeMetrics(), 30);

        expect(intelligence.healthScore).toBeGreaterThanOrEqual(0);
        expect(intelligence.healthScore).toBeLessThanOrEqual(100);
        expect(intelligence.signals).toHaveLength(4);
        expect(intelligence.actions.length).toBeLessThanOrEqual(3);
        expect(intelligence.focusFiles).toHaveLength(2);
        expect(intelligence.focusFiles[0].file).toContain('repositoryService.ts');
    });

    it('prioritizes risky repositories with concrete recommendations', () => {
        const intelligence = prepareRepositoryIntelligence(makeMetrics({
            totalDeletions: 1800,
            authorStats: [{
                name: 'Alice',
                commits: 38,
                files: 18,
                insertions: 2100,
                deletions: 1700,
                percentage: 95,
                rank: 1,
                firstCommit: new Date('2026-04-01'),
                lastCommit: new Date('2026-04-29'),
                averageCommitsPerDay: 2
            }],
            totalAuthors: 1,
            commitStreak: {
                currentStreak: 1,
                longestStreak: 2,
                activeDays: 5,
                totalDays: 30,
                activityRate: 17
            },
            conventionalCommits: {
                types: {},
                conventionalCount: 0,
                conventionalPercentage: 0,
                topType: 'N/A'
            },
            weekOverWeekChange: {
                currentPeriodCommits: 4,
                previousPeriodCommits: 20,
                changePercent: -80,
                trend: 'down'
            }
        }), 30);

        expect(intelligence.healthTone).toBe('danger');
        expect(intelligence.actions.some(action => action.priority === 'High')).toBe(true);
    });

    it('builds a copyable executive brief', () => {
        const metrics = makeMetrics();
        const intelligence = prepareRepositoryIntelligence(metrics, 30);
        const brief = buildExecutiveBrief(metrics, intelligence, 30);

        expect(brief).toContain('Git Metrics Brief (30 days)');
        expect(brief).toContain('Recommended Next Moves:');
        expect(brief).toContain('Refactor Radar:');
    });

    it('maps semantic tones to CSS variables', () => {
        expect(getToneColor('good')).toBe('var(--accent-green)');
        expect(getPriorityColor('High')).toBe('var(--accent-red)');
    });
});
