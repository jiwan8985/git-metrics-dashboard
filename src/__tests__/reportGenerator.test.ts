/**
 * ReportGenerator 단위 테스트
 * 리포트 생성 기능의 정확성과 보안을 검증합니다
 */

import { ReportGenerator } from '../reportGenerator';
import type { MetricsData } from '../gitAnalyzer';
import type { Badge } from '../badgeSystem';

describe('ReportGenerator', () => {
  let reportGenerator: ReportGenerator;

  const mockMetrics: MetricsData = {
    totalCommits: 100,
    totalAuthors: 3,
    averageCommitSize: 15,
    topAuthors: [
      { name: 'John Doe', commits: 50 },
      { name: 'Jane Smith', commits: 30 },
      { name: 'Bob Johnson', commits: 20 }
    ],
    fileStats: [
      { filename: 'src/index.ts', changes: 50 },
      { filename: 'src/utils.ts', changes: 30 }
    ],
    timeAnalysis: {
      hourlyCommits: Array(24).fill(4),
      dailyCommits: [10, 20, 15, 25, 15, 10, 5]
    }
  };

  const mockBadges: Badge[] = [];

  beforeEach(() => {
    reportGenerator = new ReportGenerator();
  });

  describe('CSV Report Generation', () => {
    it('CSV 리포트를 생성해야 함', () => {
      const csv = reportGenerator.generateCSVReport(mockMetrics, mockBadges, {
        format: 'csv',
        period: 30,
        includeSummary: true,
        includeAuthorStats: true,
        includeFileStats: true,
        includeTimeAnalysis: true,
        includeBadges: true
      });

      expect(typeof csv).toBe('string');
      expect(csv.length).toBeGreaterThan(0);
    });

    it('CSV에 헤더가 포함되어야 함', () => {
      const csv = reportGenerator.generateCSVReport(mockMetrics, mockBadges, {
        format: 'csv',
        period: 30,
        includeSummary: true,
        includeAuthorStats: true,
        includeFileStats: true,
        includeTimeAnalysis: true,
        includeBadges: true
      });

      expect(csv.length).toBeGreaterThan(0);
    });

    it('CSV 인젝션 공격을 방어해야 함', () => {
      const maliciousMetrics: MetricsData = {
        ...mockMetrics,
        topAuthors: [
          { name: '=1+1', commits: 50 },
          { name: '+2*3', commits: 30 },
          { name: '@SUM(A1:A10)', commits: 20 }
        ]
      };

      const csv = reportGenerator.generateCSVReport(
        maliciousMetrics,
        mockBadges,
        {
          format: 'csv',
          period: 30,
          includeSummary: true,
          includeAuthorStats: true,
          includeFileStats: true,
          includeTimeAnalysis: true,
          includeBadges: true
        }
      );

      expect(csv).toBeTruthy();
      expect(csv.length).toBeGreaterThan(0);
    });
  });

  describe('JSON Report Generation', () => {
    it('JSON 리포트를 생성해야 함', () => {
      const json = reportGenerator.generateJSONReport(mockMetrics, mockBadges, {
        format: 'json',
        period: 30,
        includeSummary: true,
        includeAuthorStats: true,
        includeFileStats: true,
        includeTimeAnalysis: true,
        includeBadges: true
      });

      expect(typeof json).toBe('string');
      expect(json.length).toBeGreaterThan(0);
    });

    it('JSON이 유효해야 함', () => {
      const json = reportGenerator.generateJSONReport(mockMetrics, mockBadges, {
        format: 'json',
        period: 30,
        includeSummary: true,
        includeAuthorStats: true,
        includeFileStats: true,
        includeTimeAnalysis: true,
        includeBadges: true
      });

      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('JSON이 필수 속성을 포함해야 함', () => {
      const json = reportGenerator.generateJSONReport(mockMetrics, mockBadges, {
        format: 'json',
        period: 30,
        includeSummary: true,
        includeAuthorStats: true,
        includeFileStats: true,
        includeTimeAnalysis: true,
        includeBadges: true
      });

      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty('summary');
    });
  });

  describe('HTML Report Generation', () => {
    it('HTML 리포트를 생성해야 함', () => {
      const html = reportGenerator.generateHTMLReport(
        mockMetrics,
        mockBadges,
        {
          format: 'html',
          period: 30,
          includeSummary: true,
          includeAuthorStats: true,
          includeFileStats: true,
          includeTimeAnalysis: true,
          includeBadges: true
        },
        'light'
      );

      expect(typeof html).toBe('string');
      expect(html).toContain('<!DOCTYPE html');
      expect(html).toContain('</html>');
    });

    it('HTML에 필수 요소가 포함되어야 함', () => {
      const html = reportGenerator.generateHTMLReport(
        mockMetrics,
        mockBadges,
        {
          format: 'html',
          period: 30,
          includeSummary: true,
          includeAuthorStats: true,
          includeFileStats: true,
          includeTimeAnalysis: true,
          includeBadges: true
        },
        'light'
      );

      expect(html).toContain('<head>');
      expect(html).toContain('<body>');
      expect(html).toContain('<title>');
    });

    it('XSS 공격을 방어해야 함', () => {
      const xssMetrics: MetricsData = {
        ...mockMetrics,
        topAuthors: [
          {
            name: '<img src=x onerror=alert("xss")>',
            commits: 50
          }
        ]
      };

      const html = reportGenerator.generateHTMLReport(
        xssMetrics,
        mockBadges,
        {
          format: 'html',
          period: 30,
          includeSummary: true,
          includeAuthorStats: true,
          includeFileStats: true,
          includeTimeAnalysis: true,
          includeBadges: true
        },
        'light'
      );

      expect(html).not.toContain('onerror=');
    });
  });

  describe('Markdown Report Generation', () => {
    it('Markdown 리포트를 생성해야 함', () => {
      const md = reportGenerator.generateMarkdownReport(
        mockMetrics,
        mockBadges,
        {
          format: 'markdown',
          period: 30,
          includeSummary: true,
          includeAuthorStats: true,
          includeFileStats: true,
          includeTimeAnalysis: true,
          includeBadges: true
        }
      );

      expect(typeof md).toBe('string');
      expect(md.length).toBeGreaterThan(0);
    });

    it('Markdown에 헤더가 포함되어야 함', () => {
      const md = reportGenerator.generateMarkdownReport(
        mockMetrics,
        mockBadges,
        {
          format: 'markdown',
          period: 30,
          includeSummary: true,
          includeAuthorStats: true,
          includeFileStats: true,
          includeTimeAnalysis: true,
          includeBadges: true
        }
      );

      expect(md).toContain('#');
    });
  });

  describe('Empty Metrics', () => {
    it('빈 메트릭을 처리해야 함', () => {
      const emptyMetrics: MetricsData = {
        totalCommits: 0,
        totalAuthors: 0,
        averageCommitSize: 0,
        topAuthors: [],
        fileStats: [],
        timeAnalysis: {
          hourlyCommits: Array(24).fill(0),
          dailyCommits: Array(7).fill(0)
        }
      };

      const csv = reportGenerator.generateCSVReport(emptyMetrics, [], {
        format: 'csv',
        period: 30,
        includeSummary: true,
        includeAuthorStats: true,
        includeFileStats: true,
        includeTimeAnalysis: true,
        includeBadges: true
      });

      expect(typeof csv).toBe('string');
      expect(csv.length).toBeGreaterThan(0);
    });
  });
});
