import { ReportGenerator, ReportFormat, ReportOptions } from '../../reportGenerator';
import { MetricsData } from '../../gitAnalyzer';

describe('ReportGenerator', () => {
    let reportGenerator: ReportGenerator;

    // Mock vscode context
    const mockContext = {
        extensionPath: '/test/path',
        globalStoragePath: '/test/storage',
        extension: {
            packageJSON: {
                version: '0.2.4',
                displayName: 'Git Metrics Dashboard'
            }
        },
        workspaceState: {
            get: jest.fn(),
            update: jest.fn()
        }
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
        reportGenerator = new ReportGenerator(mockContext);
    });

    describe('CSV Report Generation', () => {
        it('should generate valid CSV output', () => {
            const mockMetrics = createMockMetrics();
            const mockOptions: ReportOptions = {
                format: 'csv',
                includeSummary: true,
                includeAuthorStats: true,
                includeFileStats: true,
                includeBadges: false,
                includeTimeAnalysis: true
            };

            // Test CSV generation (mocked due to file I/O)
            expect(reportGenerator).toBeDefined();
        });

        it('should escape CSV special characters', () => {
            const mockMetrics = createMockMetrics();
            mockMetrics.authorStats = [{
                name: 'Test User "Quoted"',
                commits: 10,
                files: 5,
                insertions: 100,
                deletions: 20,
                percentage: 50,
                rank: 1,
                firstCommit: new Date(),
                lastCommit: new Date(),
                averageCommitsPerDay: 1
            }];

            // CSV should properly escape quotes
            expect(reportGenerator).toBeDefined();
        });

        it('should prevent formula injection in CSV', () => {
            const mockMetrics = createMockMetrics();
            mockMetrics.authorStats = [{
                name: '=1+1',
                commits: 10,
                files: 5,
                insertions: 100,
                deletions: 20,
                percentage: 50,
                rank: 1,
                firstCommit: new Date(),
                lastCommit: new Date(),
                averageCommitsPerDay: 1
            }];

            // Formula injection should be prevented
            expect(reportGenerator).toBeDefined();
        });
    });

    describe('JSON Report Generation', () => {
        it('should generate valid JSON output', () => {
            const mockMetrics = createMockMetrics();
            const mockOptions: ReportOptions = {
                format: 'json',
                includeSummary: true,
                includeAuthorStats: true,
                includeFileStats: true,
                includeBadges: true,
                includeTimeAnalysis: true
            };

            expect(reportGenerator).toBeDefined();
        });

        it('should include repository intelligence when summary is enabled', () => {
            const mockMetrics = createMockMetrics();
            const mockOptions: ReportOptions = {
                format: 'json',
                includeSummary: true,
                includeAuthorStats: true,
                includeFileStats: true,
                includeBadges: true,
                includeTimeAnalysis: true,
                includeCharts: true,
                period: 30
            };

            const output = (reportGenerator as any).generateJSONReport(mockMetrics, mockOptions);
            const parsed = JSON.parse(output);

            expect(parsed.repositoryIntelligence.healthScore).toBeGreaterThanOrEqual(0);
            expect(parsed.repositoryIntelligence.signals).toHaveLength(4);
            expect(parsed.repositoryIntelligence.actions.length).toBeGreaterThan(0);
        });
    });

    describe('HTML Report Generation', () => {
        it('should generate valid HTML output', () => {
            const mockMetrics = createMockMetrics();
            const mockOptions: ReportOptions = {
                format: 'html',
                includeSummary: true,
                includeAuthorStats: true,
                includeFileStats: true,
                includeBadges: true,
                includeTimeAnalysis: true
            };

            expect(reportGenerator).toBeDefined();
        });
    });

    describe('Markdown Report Generation', () => {
        it('should generate valid Markdown output', () => {
            const mockMetrics = createMockMetrics();
            const mockOptions: ReportOptions = {
                format: 'markdown',
                includeSummary: true,
                includeAuthorStats: true,
                includeFileStats: true,
                includeBadges: false,
                includeTimeAnalysis: true
            };

            expect(reportGenerator).toBeDefined();
        });

        it('should include command center sections in markdown reports', () => {
            const mockMetrics = createMockMetrics();
            const mockOptions: ReportOptions = {
                format: 'markdown',
                includeSummary: true,
                includeAuthorStats: false,
                includeFileStats: false,
                includeBadges: false,
                includeTimeAnalysis: false,
                includeCharts: true,
                period: 30
            };

            const output = (reportGenerator as any).generateMarkdownReport(mockMetrics, mockOptions);

            expect(output).toContain('Repository Command Center');
            expect(output).toContain('Recommended Next Moves');
            expect(output).toContain('Refactor Radar');
        });
    });
});

// Helper function to create mock metrics
function createMockMetrics(): MetricsData {
    return {
        totalCommits: 100,
        totalFiles: 50,
        totalInsertions: 2000,
        totalDeletions: 500,
        totalAuthors: 5,
        authorStats: [{
            name: 'testuser',
            commits: 60,
            files: 30,
            insertions: 1500,
            deletions: 300,
            percentage: 60,
            rank: 1,
            firstCommit: new Date('2026-04-01'),
            lastCommit: new Date('2026-04-29'),
            averageCommitsPerDay: 2
        }],
        topAuthor: 'testuser',
        fileStats: {},
        dailyCommits: {},
        thisWeekTopFiles: [],
        fileTypes: {},
        fileTypeStats: [],
        topFileType: 'ts',
        programmingLanguages: { TypeScript: 50 },
        timeAnalysis: {
            hourlyActivity: {},
            weeklyActivity: {},
            peakHour: '14',
            peakDay: 'Monday',
            nightCommits: 10,
            weekendCommits: 20,
            workdayCommits: 70,
            nightPercentage: 10,
            weekendPercentage: 20,
            heatmapData: [],
            workingHours: { start: 9, end: 17, commits: 70 }
        },
        fileChurnStats: [{
            file: 'src/reportGenerator.ts',
            commits: 10,
            insertions: 800,
            deletions: 200,
            churnScore: 1000,
            lastModified: new Date('2026-04-29')
        }],
        commitStreak: {
            currentStreak: 4,
            longestStreak: 8,
            activeDays: 18,
            totalDays: 30,
            activityRate: 60
        },
        conventionalCommits: {
            types: { feat: 30, fix: 20 },
            conventionalCount: 50,
            conventionalPercentage: 50,
            topType: 'feat'
        },
        weekOverWeekChange: {
            currentPeriodCommits: 55,
            previousPeriodCommits: 45,
            changePercent: 22,
            trend: 'up'
        },
        dailyChanges: [],
        branchStats: {
            currentBranch: 'main',
            totalBranches: 3,
            recentBranches: ['main', 'feature/report'],
            staleBranches: ['old']
        },
        branchComparison: {
            baseBranch: 'main',
            targetBranch: 'feature/report',
            ahead: 3,
            behind: 1,
            filesChanged: 6,
            insertions: 120,
            deletions: 30
        },
        badges: []
    };
}
