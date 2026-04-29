import { GitAnalyzer, CommitData } from '../../gitAnalyzer';

describe('GitAnalyzer', () => {
    let analyzer: GitAnalyzer;

    beforeEach(() => {
        jest.mock('vscode');
        analyzer = new GitAnalyzer();
    });

    describe('parseGitLog (numstat format)', () => {
        it('should parse numstat git log output correctly', () => {
            // --numstat 형식: insertions\tdeletions\tfilename (탭 구분)
            const gitOutput = [
                'cf62f0c6effa6e6d6952c77c15fba280dad79bcb|Jiwan|2025-08-18 16:24:53 +0900|Merge pull request #6',
                '2\t1\tCHANGELOG.md',
                '5\t0\tREADME.md',
                'de39b790f5bbf5475e5416fd25ff6a4430b4952b|jiwan|2025-08-18 16:21:05 +0900|feat: 개발자 배지 서비스 추가',
                '150\t10\tsrc/badgeSystem.ts',
                '20\t5\tsrc/extension.ts'
            ].join('\n');

            // @ts-ignore - accessing private method for testing
            const result = analyzer.parseGitLog(gitOutput);

            expect(result).toHaveLength(2);
            expect(result[0].hash).toBe('cf62f0c6effa6e6d6952c77c15fba280dad79bcb');
            expect(result[0].author).toBe('Jiwan');
            expect(result[0].files).toContain('CHANGELOG.md');
            expect(result[0].files).toContain('README.md');
            expect(result[0].insertions).toBe(7);  // 2 + 5
            expect(result[0].deletions).toBe(1);   // 1 + 0

            expect(result[1].insertions).toBe(170); // 150 + 20
            expect(result[1].deletions).toBe(15);   // 10 + 5
        });

        it('should handle empty git output', () => {
            // @ts-ignore
            const result = analyzer.parseGitLog('');
            expect(result).toHaveLength(0);
        });

        it('should handle binary files (- instead of number)', () => {
            const gitOutput = [
                'abc123|Author|2025-01-01 12:00:00 +0900|Add binary',
                '-\t-\timages/icon.png',
                '10\t5\tsrc/index.ts'
            ].join('\n');

            // @ts-ignore
            const result = analyzer.parseGitLog(gitOutput);
            expect(result).toHaveLength(1);
            expect(result[0].files).toContain('images/icon.png');
            expect(result[0].files).toContain('src/index.ts');
            expect(result[0].insertions).toBe(10); // binary = 0, ts = 10
            expect(result[0].deletions).toBe(5);
        });

        it('should handle commit messages containing pipe characters', () => {
            const gitOutput = 'abc123|Author|2025-01-01 12:00:00 +0900|fix: handle a|b edge case\n5\t2\tsrc/util.ts';
            // @ts-ignore
            const result = analyzer.parseGitLog(gitOutput);
            expect(result).toHaveLength(1);
            expect(result[0].message).toBe('fix: handle a|b edge case');
        });
    });

    describe('generateMetrics', () => {
        it('should calculate totalInsertions and totalDeletions', async () => {
            const commits: CommitData[] = [
                {
                    hash: 'abc123',
                    author: 'Alice',
                    date: new Date('2025-01-01'),
                    message: 'feat: add feature',
                    files: ['src/a.ts'],
                    insertions: 50,
                    deletions: 10
                },
                {
                    hash: 'def456',
                    author: 'Bob',
                    date: new Date('2025-01-02'),
                    message: 'fix: fix bug',
                    files: ['src/b.ts'],
                    insertions: 20,
                    deletions: 30
                }
            ];

            const metrics = await analyzer.generateMetrics(commits);

            expect(metrics.totalCommits).toBe(2);
            expect(metrics.totalInsertions).toBe(70);
            expect(metrics.totalDeletions).toBe(40);
            expect(metrics.authorStats).toHaveLength(2);
            expect(metrics.authorStats[0].insertions).toBe(50);
            expect(metrics.authorStats[0].deletions).toBe(10);
        });

        it('should generate fileChurnStats', async () => {
            const commits: CommitData[] = [
                {
                    hash: 'abc',
                    author: 'Dev',
                    date: new Date('2025-01-01'),
                    message: 'update',
                    files: ['src/hot.ts', 'src/cold.ts'],
                    insertions: 100,
                    deletions: 50
                },
                {
                    hash: 'def',
                    author: 'Dev',
                    date: new Date('2025-01-02'),
                    message: 'fix',
                    files: ['src/hot.ts'],
                    insertions: 20,
                    deletions: 10
                }
            ];

            const metrics = await analyzer.generateMetrics(commits);
            expect(metrics.fileChurnStats).toBeDefined();
            expect(metrics.fileChurnStats[0].file).toBe('src/hot.ts'); // 2 commits - highest
            expect(metrics.fileChurnStats[0].commits).toBe(2);
        });
    });

    describe('parseShortStat', () => {
        it('should parse git diff shortstat output', () => {
            // @ts-ignore - private helper
            const result = analyzer.parseShortStat(' 4 files changed, 120 insertions(+), 35 deletions(-)');

            expect(result).toEqual({
                filesChanged: 4,
                insertions: 120,
                deletions: 35
            });
        });

        it('should handle empty shortstat output', () => {
            // @ts-ignore - private helper
            const result = analyzer.parseShortStat('');

            expect(result).toEqual({
                filesChanged: 0,
                insertions: 0,
                deletions: 0
            });
        });
    });

    describe('invalidateCache', () => {
        it('should clear cache without throwing', () => {
            expect(() => analyzer.invalidateCache()).not.toThrow();
        });
    });
});
