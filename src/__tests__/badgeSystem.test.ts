/**
 * BadgeSystem 단위 테스트
 * 배지 시스템의 계산과 판별 로직을 검증합니다
 */

import { BadgeSystem, BadgeCategory, BadgeRarity } from '../badgeSystem';
import type { MetricsData, CommitData } from '../gitAnalyzer';

describe('BadgeSystem', () => {
  let badgeSystem: BadgeSystem;

  const mockMetrics: MetricsData = {
    totalCommits: 100,
    totalAuthors: 5,
    averageCommitSize: 15,
    topAuthors: [
      { name: 'John', commits: 50 },
      { name: 'Jane', commits: 30 },
      { name: 'Bob', commits: 20 }
    ],
    fileStats: [],
    timeAnalysis: {
      hourlyCommits: Array(24).fill(4),
      dailyCommits: [10, 20, 15, 25, 15, 10, 5]
    }
  };

  const mockCommits: CommitData[] = Array(100)
    .fill(0)
    .map((_, i) => ({
      hash: `hash${i}`,
      author: ['John', 'Jane', 'Bob'][i % 3],
      date: new Date(Date.now() - i * 86400000).toISOString(),
      message: `Commit ${i}`,
      filesChanged: 5 + (i % 10)
    }));

  beforeEach(() => {
    badgeSystem = new BadgeSystem();
  });

  describe('calculateBadges', () => {
    it('배지 배열을 반환해야 함', () => {
      const badges = badgeSystem.calculateBadges(mockMetrics, mockCommits, 30);
      expect(Array.isArray(badges)).toBe(true);
    });

    it('배지가 필수 속성을 가져야 함', () => {
      const badges = badgeSystem.calculateBadges(mockMetrics, mockCommits, 30);
      if (badges.length > 0) {
        const badge = badges[0];
        expect(badge).toHaveProperty('id');
        expect(badge).toHaveProperty('name');
        expect(badge).toHaveProperty('category');
        expect(badge).toHaveProperty('rarity');
        expect(badge).toHaveProperty('progress');
        expect(badge).toHaveProperty('unlocked');
      }
    });

    it('진행률이 0-100 범위 내여야 함', () => {
      const badges = badgeSystem.calculateBadges(mockMetrics, mockCommits, 30);
      badges.forEach((badge) => {
        expect(badge.progress).toBeGreaterThanOrEqual(0);
        expect(badge.progress).toBeLessThanOrEqual(100);
      });
    });

    it('언락된 배지는 100% 진행률을 가져야 함', () => {
      const badges = badgeSystem.calculateBadges(mockMetrics, mockCommits, 30);
      badges
        .filter((b) => b.unlocked)
        .forEach((badge) => {
          expect(badge.progress).toBe(100);
        });
    });

    it('빈 배열을 처리해야 함', () => {
      const badges = badgeSystem.calculateBadges(
        {
          totalCommits: 0,
          totalAuthors: 0,
          averageCommitSize: 0,
          topAuthors: [],
          fileStats: [],
          timeAnalysis: {
            hourlyCommits: Array(24).fill(0),
            dailyCommits: Array(7).fill(0)
          }
        },
        [],
        30
      );
      expect(Array.isArray(badges)).toBe(true);
    });
  });

  describe('getUnlockedBadges', () => {
    it('언락된 배지 목록을 반환해야 함', () => {
      badgeSystem.calculateBadges(mockMetrics, mockCommits, 30);
      const unlocked = badgeSystem.getUnlockedBadges();
      expect(Array.isArray(unlocked)).toBe(true);
      unlocked.forEach((badge) => {
        expect(badge.unlocked).toBe(true);
      });
    });
  });

  describe('getInProgressBadges', () => {
    it('진행 중인 배지 목록을 반환해야 함', () => {
      badgeSystem.calculateBadges(mockMetrics, mockCommits, 30);
      const inProgress = badgeSystem.getInProgressBadges();
      expect(Array.isArray(inProgress)).toBe(true);
      inProgress.forEach((badge) => {
        expect(badge.unlocked).toBe(false);
        expect(badge.progress).toBeGreaterThan(0);
        expect(badge.progress).toBeLessThan(100);
      });
    });
  });

  describe('getBadgeStats', () => {
    it('배지 통계를 반환해야 함', () => {
      badgeSystem.calculateBadges(mockMetrics, mockCommits, 30);
      const stats = badgeSystem.getBadgeStats();

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('unlocked');
      expect(stats).toHaveProperty('inProgress');
      expect(stats).toHaveProperty('byCategory');
      expect(stats).toHaveProperty('byRarity');

      expect(typeof stats.total).toBe('number');
      expect(typeof stats.unlocked).toBe('number');
      expect(typeof stats.inProgress).toBe('number');
    });
  });

  describe('getBadgesByCategory', () => {
    it('카테고리별 배지를 필터링해야 함', () => {
      badgeSystem.calculateBadges(mockMetrics, mockCommits, 30);
      const commitBadges = badgeSystem.getBadgesByCategory(
        BadgeCategory.COMMIT_MASTER
      );
      expect(Array.isArray(commitBadges)).toBe(true);
      commitBadges.forEach((badge) => {
        expect(badge.category).toBe(BadgeCategory.COMMIT_MASTER);
      });
    });
  });
});
