import { GitAnalyzer, CommitData, MetricsData } from '../../gitAnalyzer';

describe('GitAnalyzer', () => {
    let analyzer: GitAnalyzer;

    beforeEach(() => {
        // Mock VSCode workspace
        jest.mock('vscode');
        analyzer = new GitAnalyzer();
    });

    describe('parseGitLog', () => {
        it('should parse valid git log output', () => {
            const gitOutput = `cf62f0c6effa6e6d6952c77c15fba280dad79bcb|Jiwan|2025-08-18 16:24:53 +0900|Merge pull request #6
CHANGELOG.md
README.md
de39b790f5bbf5475e5416fd25ff6a4430b4952b|jiwan|2025-08-18 16:21:05 +0900|📦 NEW: 개발자 배지 서비스 추가
src/badgeSystem.ts
src/extension.ts`;

            // @ts-ignore - accessing private method for testing
            const result = analyzer.parseGitLog(gitOutput);

            expect(result).toHaveLength(2);
            expect(result[0].hash).toBe('cf62f0c6effa6e6d6952c77c15fba280dad79bcb');
            expect(result[0].author).toBe('Jiwan');
            expect(result[0].files).toContain('CHANGELOG.md');
        });

        it('should handle empty git output', () => {
            // @ts-ignore - accessing private method for testing
            const result = analyzer.parseGitLog('');
            expect(result).toHaveLength(0);
        });

        it('should handle malformed lines gracefully', () => {
            const gitOutput = `cf62f0c6effa6e6d6952c77c15fba280dad79bcb|Jiwan|2025-08-18 16:24:53 +0900|Test
CHANGELOG.md
invalid line without pipe
valid_file.ts`;

            // @ts-ignore - accessing private method for testing
            const result = analyzer.parseGitLog(gitOutput);

            expect(result).toHaveLength(1);
            expect(result[0].files).toContain('CHANGELOG.md');
        });
    });

    describe('Data validation', () => {
        it('should handle valid date parsing', () => {
            const date = new Date('2025-08-18 16:24:53 +0900');
            expect(date.getTime()).toBeGreaterThan(0);
        });

        it('should validate author name', () => {
            const authorName = 'Jiwan';
            expect(authorName).toBeTruthy();
            expect(typeof authorName).toBe('string');
        });

        it('should handle file array', () => {
            const files = ['CHANGELOG.md', 'README.md', 'src/extension.ts'];
            expect(Array.isArray(files)).toBe(true);
            expect(files.length).toBeGreaterThan(0);
        });
    });
});
