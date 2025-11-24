/**
 * GitAnalyzer 단위 테스트
 * Git 분석 기능의 정확성을 검증합니다
 */

import { GitAnalyzer } from '../gitAnalyzer';
import * as path from 'path';

describe('GitAnalyzer', () => {
  let analyzer: GitAnalyzer;
  const testRepoPath = process.cwd();

  beforeAll(() => {
    analyzer = new GitAnalyzer(testRepoPath);
  });

  describe('getCommitHistory', () => {
    it('유효한 기간으로 커밋 히스토리를 반환해야 함', async () => {
      const result = await analyzer.getCommitHistory(7);
      expect(Array.isArray(result)).toBe(true);
    }, 10000);

    it('기간이 1-365 범위를 벗어나면 에러 발생', async () => {
      await expect(analyzer.getCommitHistory(0)).rejects.toThrow();
      await expect(analyzer.getCommitHistory(366)).rejects.toThrow();
      await expect(analyzer.getCommitHistory(-1)).rejects.toThrow();
    });

    it('정수가 아닌 기간으로 에러 발생', async () => {
      await expect(analyzer.getCommitHistory(30.5)).rejects.toThrow();
    });
  });

  describe('generateMetrics', () => {
    it('메트릭 객체를 생성해야 함', async () => {
      const commits = await analyzer.getCommitHistory(7);
      const metrics = analyzer.generateMetrics(commits);

      expect(metrics).toHaveProperty('totalCommits');
      expect(metrics).toHaveProperty('totalAuthors');
      expect(metrics).toHaveProperty('averageCommitSize');
      expect(metrics).toHaveProperty('topAuthors');
      expect(metrics).toHaveProperty('fileStats');
      expect(metrics).toHaveProperty('timeAnalysis');
    }, 10000);

    it('빈 커밋 배열을 처리해야 함', () => {
      const metrics = analyzer.generateMetrics([]);

      expect(metrics.totalCommits).toBe(0);
      expect(metrics.totalAuthors).toBe(0);
      expect(Array.isArray(metrics.topAuthors)).toBe(true);
      expect(metrics.topAuthors.length).toBe(0);
    });

    it('메트릭 값이 올바른 타입이어야 함', async () => {
      const commits = await analyzer.getCommitHistory(7);
      const metrics = analyzer.generateMetrics(commits);

      expect(typeof metrics.totalCommits).toBe('number');
      expect(typeof metrics.totalAuthors).toBe('number');
      expect(typeof metrics.averageCommitSize).toBe('number');
      expect(Array.isArray(metrics.topAuthors)).toBe(true);
      expect(Array.isArray(metrics.fileStats)).toBe(true);
    }, 10000);

    it('topAuthors가 정렬되어 있어야 함', async () => {
      const commits = await analyzer.getCommitHistory(7);
      const metrics = analyzer.generateMetrics(commits);

      if (metrics.topAuthors.length > 1) {
        for (let i = 0; i < metrics.topAuthors.length - 1; i++) {
          expect(metrics.topAuthors[i].commits).toBeGreaterThanOrEqual(
            metrics.topAuthors[i + 1].commits
          );
        }
      }
    }, 10000);
  });

  describe('getFileStats', () => {
    it('파일 통계를 반환해야 함', async () => {
      const stats = await analyzer.getFileStats(7);
      expect(Array.isArray(stats)).toBe(true);
    }, 10000);

    it('파일 통계가 구조화되어 있어야 함', async () => {
      const stats = await analyzer.getFileStats(7);
      if (stats.length > 0) {
        expect(stats[0]).toHaveProperty('filename');
        expect(stats[0]).toHaveProperty('changes');
      }
    }, 10000);
  });

  describe('getTimeAnalysis', () => {
    it('시간대별 분석을 반환해야 함', async () => {
      const analysis = await analyzer.getTimeAnalysis(7);
      expect(analysis).toHaveProperty('hourlyCommits');
      expect(analysis).toHaveProperty('dailyCommits');
      expect(Array.isArray(analysis.hourlyCommits)).toBe(true);
      expect(Array.isArray(analysis.dailyCommits)).toBe(true);
    }, 10000);

    it('시간별 배열이 24개여야 함', async () => {
      const analysis = await analyzer.getTimeAnalysis(7);
      expect(analysis.hourlyCommits.length).toBe(24);
    }, 10000);

    it('요일별 배열이 7개여야 함', async () => {
      const analysis = await analyzer.getTimeAnalysis(7);
      expect(analysis.dailyCommits.length).toBe(7);
    }, 10000);
  });
});
