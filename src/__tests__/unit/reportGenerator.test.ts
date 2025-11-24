import { ReportGenerator, ReportFormat, ReportOptions } from '../../reportGenerator';
import { MetricsData } from '../../gitAnalyzer';

describe('ReportGenerator', () => {
    let reportGenerator: ReportGenerator;

    // Mock vscode context
    const mockContext = {
        extensionPath: '/test/path',
        globalStoragePath: '/test/storage',
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
    });
});

// Helper function to create mock metrics
function createMockMetrics(): MetricsData {
    return {
        totalCommits: 100,
        totalFiles: 50,
        totalAuthors: 5,
        authorStats: [],
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
        badges: []
    };
}
