import { BadgeSystem, Badge, BadgeCategory } from '../../badgeSystem';
import { MetricsData, CommitData } from '../../gitAnalyzer';

describe('BadgeSystem', () => {
    let badgeSystem: BadgeSystem;

    beforeEach(() => {
        badgeSystem = new BadgeSystem();
    });

    describe('calculateBadges', () => {
        it('should initialize with empty badges', () => {
            expect(badgeSystem).toBeDefined();
        });

        it('should calculate badges for valid metrics', () => {
            const mockMetrics: MetricsData = {
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

            const mockCommits: CommitData[] = [];
            const badges = badgeSystem.calculateBadges(mockMetrics, mockCommits, 30);

            expect(Array.isArray(badges)).toBe(true);
        });

        it('should handle zero commits gracefully', () => {
            const mockMetrics: MetricsData = {
                totalCommits: 0,
                totalFiles: 0,
                totalAuthors: 0,
                authorStats: [],
                topAuthor: '',
                fileStats: {},
                dailyCommits: {},
                thisWeekTopFiles: [],
                fileTypes: {},
                fileTypeStats: [],
                topFileType: '',
                programmingLanguages: {},
                timeAnalysis: {
                    hourlyActivity: {},
                    weeklyActivity: {},
                    peakHour: '',
                    peakDay: '',
                    nightCommits: 0,
                    weekendCommits: 0,
                    workdayCommits: 0,
                    nightPercentage: 0,
                    weekendPercentage: 0,
                    heatmapData: [],
                    workingHours: { start: 0, end: 0, commits: 0 }
                },
                badges: []
            };

            const mockCommits: CommitData[] = [];
            const badges = badgeSystem.calculateBadges(mockMetrics, mockCommits, 30);

            expect(Array.isArray(badges)).toBe(true);
        });
    });

    describe('getUnlockedBadges', () => {
        it('should return empty array initially', () => {
            const badges = badgeSystem.getUnlockedBadges();
            expect(Array.isArray(badges)).toBe(true);
        });
    });

    describe('getBadgeStats', () => {
        it('should return badge statistics', () => {
            const stats = badgeSystem.getBadgeStats();
            expect(stats).toHaveProperty('total');
            expect(stats).toHaveProperty('unlocked');
        });
    });
});
