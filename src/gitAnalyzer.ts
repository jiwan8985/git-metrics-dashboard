import { execFile } from 'child_process';
import { promisify } from 'util';
import * as vscode from 'vscode';
import { BadgeSystem, Badge } from './badgeSystem';
import { CacheManager } from './cacheManager';

const execFileAsync = promisify(execFile);

export interface CommitData {
    hash: string;
    author: string;
    date: Date;
    message: string;
    files: string[];
    insertions?: number;
    deletions?: number;
}

export interface AuthorStats {
    name: string;
    commits: number;
    files: number;
    insertions: number;
    deletions: number;
    percentage: number;
    rank: number;
    firstCommit: Date | null;
    lastCommit: Date | null;
    averageCommitsPerDay: number;
}

export interface FileTypeStats {
    extension: string;
    commits: number;
    files: number;
    percentage: number;
    language: string;
    category: string;
}

export interface TimeAnalysis {
    hourlyActivity: { [hour: string]: number };
    weeklyActivity: { [day: string]: number };
    peakHour: string;
    peakDay: string;
    nightCommits: number;  // 22시-6시 커밋
    weekendCommits: number; // 토일 커밋
    workdayCommits: number; // 월-금 커밋
    nightPercentage: number;
    weekendPercentage: number;
    heatmapData: Array<{ day: number; hour: number; commits: number }>;
    workingHours: { start: number; end: number; commits: number }; // 가장 활발한 8시간
}

export interface FileChurnStats {
    file: string;
    commits: number;
    insertions: number;
    deletions: number;
    churnScore: number; // insertions + deletions
    lastModified: Date | null;
}

export interface CommitStreak {
    currentStreak: number;   // 현재 연속 커밋 일수
    longestStreak: number;   // 기간 내 최장 연속 커밋
    activeDays: number;      // 커밋이 있는 날 수
    totalDays: number;       // 전체 분석 기간 일수
    activityRate: number;    // activeDays / totalDays * 100
}

export interface ConventionalCommitStats {
    types: { [type: string]: number };   // feat, fix, chore, docs, test, refactor, style, perf ...
    conventionalCount: number;           // Conventional Commit 형식을 따르는 커밋 수
    conventionalPercentage: number;      // 전체 대비 비율
    topType: string;                     // 가장 많은 커밋 타입
}

export interface BranchStats {
    currentBranch: string;
    totalBranches: number;
    recentBranches: string[];    // 최근 30일 이내 커밋이 있는 브랜치
    staleBranches: string[];     // 30일 이상 커밋 없는 브랜치
}

export interface BranchComparison {
    baseBranch: string;
    targetBranch: string;
    ahead: number;
    behind: number;
    filesChanged: number;
    insertions: number;
    deletions: number;
}

export interface DailyChanges {
    date: string;
    insertions: number;
    deletions: number;
    commits: number;
}

export interface WeekOverWeekChange {
    currentPeriodCommits: number;
    previousPeriodCommits: number;
    changePercent: number;   // 양수 = 증가, 음수 = 감소
    trend: 'up' | 'down' | 'stable';
}

export interface MetricsData {
    dailyCommits: { [date: string]: number };
    fileStats: { [file: string]: number };
    thisWeekTopFiles: Array<{ file: string; commits: number }>;
    totalCommits: number;
    totalFiles: number;
    totalInsertions: number;
    totalDeletions: number;
    // 작성자별 통계
    authorStats: AuthorStats[];
    totalAuthors: number;
    topAuthor: string;
    // 파일 타입별 통계
    fileTypes: { [ext: string]: number };
    fileTypeStats: FileTypeStats[];
    topFileType: string;
    programmingLanguages: { [lang: string]: number };
    // 시간대별 분석
    timeAnalysis: TimeAnalysis;
    // 파일 Churn 분석 (가장 많이 변경된 파일)
    fileChurnStats: FileChurnStats[];
    // 커밋 스트릭
    commitStreak: CommitStreak;
    // Conventional Commits 분석
    conventionalCommits: ConventionalCommitStats;
    // 주간 비교 (WoW)
    weekOverWeekChange: WeekOverWeekChange;
    // 일별 코드 변경량
    dailyChanges: DailyChanges[];
    // 브랜치 통계
    branchStats: BranchStats;
    branchComparison?: BranchComparison;
    // 배지 시스템
    badges: Badge[];
}

export interface ExtendedMetricsData extends MetricsData {
    averageCommitsPerDay: number;
    mostActiveDay: string;
    mostActiveHour: string;
}

// 파일 확장자 → 언어 매핑 (모듈 레벨 상수 - 매 호출마다 재생성 방지)
const EXTENSION_TO_LANGUAGE: { [ext: string]: { language: string; category: string } } = {
    // Frontend Languages
    'js': { language: 'JavaScript', category: 'Frontend' },
    'jsx': { language: 'React', category: 'Frontend' },
    'ts': { language: 'TypeScript', category: 'Frontend' },
    'tsx': { language: 'React TypeScript', category: 'Frontend' },
    'vue': { language: 'Vue.js', category: 'Frontend' },
    'svelte': { language: 'Svelte', category: 'Frontend' },
    'html': { language: 'HTML', category: 'Frontend' },
    'htm': { language: 'HTML', category: 'Frontend' },
    'css': { language: 'CSS', category: 'Frontend' },
    'scss': { language: 'SCSS', category: 'Frontend' },
    'sass': { language: 'Sass', category: 'Frontend' },
    'less': { language: 'Less', category: 'Frontend' },
    'styl': { language: 'Stylus', category: 'Frontend' },
    'stylus': { language: 'Stylus', category: 'Frontend' },

    // Backend Languages
    'py': { language: 'Python', category: 'Backend' },
    'pyw': { language: 'Python', category: 'Backend' },
    'pyc': { language: 'Python', category: 'Backend' },
    'java': { language: 'Java', category: 'Backend' },
    'jar': { language: 'Java', category: 'Backend' },
    'kt': { language: 'Kotlin', category: 'Backend' },
    'kts': { language: 'Kotlin', category: 'Backend' },
    'go': { language: 'Go', category: 'Backend' },
    'rs': { language: 'Rust', category: 'Backend' },
    'php': { language: 'PHP', category: 'Backend' },
    'rb': { language: 'Ruby', category: 'Backend' },
    'cs': { language: 'C#', category: 'Backend' },
    'vb': { language: 'Visual Basic', category: 'Backend' },
    'cpp': { language: 'C++', category: 'Backend' },
    'cxx': { language: 'C++', category: 'Backend' },
    'cc': { language: 'C++', category: 'Backend' },
    'c': { language: 'C', category: 'Backend' },
    'h': { language: 'C', category: 'Backend' },
    'hpp': { language: 'C++', category: 'Backend' },
    'scala': { language: 'Scala', category: 'Backend' },
    'sc': { language: 'Scala', category: 'Backend' },
    'clj': { language: 'Clojure', category: 'Backend' },
    'cljs': { language: 'Clojure', category: 'Backend' },
    'ex': { language: 'Elixir', category: 'Backend' },
    'exs': { language: 'Elixir', category: 'Backend' },
    'erl': { language: 'Erlang', category: 'Backend' },

    // Mobile Development
    'swift': { language: 'Swift', category: 'Mobile' },
    'dart': { language: 'Dart', category: 'Mobile' },
    'm': { language: 'Objective-C', category: 'Mobile' },
    'mm': { language: 'Objective-C++', category: 'Mobile' },
    'xaml': { language: 'Xamarin', category: 'Mobile' },

    // Functional Languages
    'hs': { language: 'Haskell', category: 'Functional' },
    'lhs': { language: 'Haskell', category: 'Functional' },
    'elm': { language: 'Elm', category: 'Functional' },
    'ml': { language: 'OCaml', category: 'Functional' },
    'mli': { language: 'OCaml', category: 'Functional' },
    'fs': { language: 'F#', category: 'Functional' },

    // System Languages
    'zig': { language: 'Zig', category: 'System' },
    'nim': { language: 'Nim', category: 'System' },
    'crystal': { language: 'Crystal', category: 'System' },
    'd': { language: 'D', category: 'System' },
    'asm': { language: 'Assembly', category: 'System' },
    's': { language: 'Assembly', category: 'System' },
    'wasm': { language: 'WebAssembly', category: 'System' },
    'wat': { language: 'WebAssembly', category: 'System' },

    // Scripting Languages
    'sh': { language: 'Shell', category: 'Scripts' },
    'bash': { language: 'Bash', category: 'Scripts' },
    'zsh': { language: 'Shell', category: 'Scripts' },
    'fish': { language: 'Shell', category: 'Scripts' },
    'bat': { language: 'Batch', category: 'Scripts' },
    'cmd': { language: 'Batch', category: 'Scripts' },
    'ps1': { language: 'PowerShell', category: 'Scripts' },
    'psm1': { language: 'PowerShell', category: 'Scripts' },
    'lua': { language: 'Lua', category: 'Scripts' },
    'perl': { language: 'Perl', category: 'Scripts' },
    'pl': { language: 'Perl', category: 'Scripts' },
    'awk': { language: 'AWK', category: 'Scripts' },

    // Infrastructure as Code
    'hcl': { language: 'HCL', category: 'Infrastructure' },
    'tf': { language: 'Terraform', category: 'Infrastructure' },
    'tfvars': { language: 'Terraform', category: 'Infrastructure' },
    'dockerfile': { language: 'Docker', category: 'Infrastructure' },
    'docker': { language: 'Docker', category: 'Infrastructure' },

    // Configuration Files
    'json': { language: 'JSON', category: 'Config' },
    'json5': { language: 'JSON', category: 'Config' },
    'xml': { language: 'XML', category: 'Config' },
    'yaml': { language: 'YAML', category: 'Config' },
    'yml': { language: 'YAML', category: 'Config' },
    'toml': { language: 'TOML', category: 'Config' },
    'ini': { language: 'INI', category: 'Config' },
    'cfg': { language: 'INI', category: 'Config' },
    'conf': { language: 'INI', category: 'Config' },
    'config': { language: 'INI', category: 'Config' },
    'env': { language: 'Environment', category: 'Config' },
    'properties': { language: 'Properties', category: 'Config' },
    'plist': { language: 'Properties', category: 'Config' },

    // Documentation
    'md': { language: 'Markdown', category: 'Documentation' },
    'markdown': { language: 'Markdown', category: 'Documentation' },
    'txt': { language: 'Text', category: 'Documentation' },
    'rst': { language: 'reStructuredText', category: 'Documentation' },
    'tex': { language: 'LaTeX', category: 'Documentation' },
    'adoc': { language: 'AsciiDoc', category: 'Documentation' },

    // Database
    'sql': { language: 'SQL', category: 'Database' },
    'db': { language: 'SQLite', category: 'Database' },

    // Build Tools
    'makefile': { language: 'Makefile', category: 'Build' },
    'make': { language: 'Makefile', category: 'Build' },
    'cmake': { language: 'CMake', category: 'Build' },
    'gradle': { language: 'Gradle', category: 'Build' },

    // Template Languages
    'hbs': { language: 'Handlebars', category: 'Template' },
    'pug': { language: 'Pug', category: 'Template' },
    'ejs': { language: 'EJS', category: 'Template' },
    'erb': { language: 'ERB', category: 'Template' },
    'liquid': { language: 'Liquid', category: 'Template' },

    // Query Languages
    'graphql': { language: 'GraphQL', category: 'Query' },
    'gql': { language: 'GraphQL', category: 'Query' },

    // Blockchain
    'sol': { language: 'Solidity', category: 'Blockchain' },

    // Protocol & API
    'proto': { language: 'Protocol Buffers', category: 'Protocol' },

    // Data Science
    'r': { language: 'R', category: 'Data Science' },
    'R': { language: 'R', category: 'Data Science' },
    'jl': { language: 'Julia', category: 'Data Science' },

    // Legacy Languages
    'f90': { language: 'Fortran', category: 'Legacy' },
    'cobol': { language: 'COBOL', category: 'Legacy' },
    'cob': { language: 'COBOL', category: 'Legacy' },
    'pas': { language: 'Pascal', category: 'Legacy' },

    // Other
    'no-ext': { language: 'No Extension', category: 'Other' }
};

export class GitAnalyzer {
    private workspaceRoot: string;
    private badgeSystem: BadgeSystem;
    private cacheManager: CacheManager;

    constructor() {
        this.workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
        this.badgeSystem = new BadgeSystem();
        this.cacheManager = new CacheManager();
    }

    async getCommitHistory(days: number = 30, branch?: string): Promise<CommitData[]> {
        if (!this.workspaceRoot) {
            throw new Error('워크스페이스가 열려있지 않습니다.');
        }

        // 날짜 검증 (보안: 인젝션 방지)
        if (days < 1 || days > 365 || !Number.isInteger(days)) {
            throw new Error('유효하지 않은 기간입니다 (1-365일)');
        }

        // 캐시 확인
        const normalizedBranch = branch?.trim();
        const cacheKey = `commits_${days}_${normalizedBranch || 'current'}`;
        const cached = this.cacheManager.get(cacheKey);
        if (cached) {
            console.log('📦 캐시에서 커밋 데이터 로드');
            return cached;
        }

        const since = new Date();
        since.setDate(since.getDate() - days);
        const sinceStr = since.toISOString().split('T')[0];

        // 날짜 형식 검증 (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(sinceStr)) {
            throw new Error('날짜 형식 오류');
        }

        try {
            // execFile로 shell injection 방지 (인수를 배열로 전달)
            const gitArgs = [
                'log',
                ...(normalizedBranch ? [normalizedBranch] : []),
                `--since=${sinceStr}`,
                '--pretty=format:%H|%an|%ad|%s',
                '--date=iso',
                '--numstat'
            ];
            const { stdout } = await execFileAsync('git', gitArgs, { cwd: this.workspaceRoot, maxBuffer: 50 * 1024 * 1024 });

            console.log('📝 Git log 조회 완료 (numstat)');
            console.log(`📊 Raw output length: ${stdout.length}`);

            const commits = this.parseGitLog(stdout);
            this.cacheManager.set(cacheKey, commits);
            return commits;
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : '알 수 없는 오류';
            vscode.window.showErrorMessage(`Git 분석 오류: ${errorMsg}`);
            console.error('Git log 실행 오류:', error);
            return [];
        }
    }

    /**
     * 캐시 무효화 (새 커밋 감지 시 호출)
     */
    invalidateCache(): void {
        this.cacheManager.clear();
        console.log('🗑️ 캐시 초기화됨 (새 Git 변경 감지)');
    }

    /**
     * Git 로그 출력을 파싱하여 커밋 데이터로 변환
     * --numstat 형식 지원: "insertions\tdeletions\tfilename" 탭 구분
     */
    private parseGitLog(gitOutput: string | readonly any[]): CommitData[] {
        const commits: CommitData[] = [];

        if (!gitOutput) {
            console.log('⚠️ gitOutput가 비어있음');
            return commits;
        }

        let logArray: any[];
        if (Array.isArray(gitOutput)) {
            logArray = Array.from(gitOutput);
        } else if (typeof gitOutput === 'string') {
            logArray = gitOutput.split('\n');
        } else {
            return commits;
        }

        let currentCommit: any = null;
        let hashCount = 0;

        for (const line of logArray) {
            if (typeof line !== 'string') { continue; }

            const trimmedLine = line.trim();
            if (!trimmedLine) { continue; }

            // 커밋 헤더: hash|author|date|message 형식 (| 포함)
            if (trimmedLine.includes('|')) {
                // 이전 커밋 저장
                if (currentCommit && currentCommit.hash) {
                    const commit = this.createCommitData(currentCommit);
                    if (commit) { commits.push(commit); }
                }

                hashCount++;
                const parts = trimmedLine.split('|');
                if (parts.length >= 4) {
                    const [hash, author, dateStr, ...messageParts] = parts;
                    currentCommit = {
                        hash,
                        author,
                        date: dateStr,
                        message: messageParts.join('|'), // 메시지에 | 포함될 경우 처리
                        files: [],
                        insertions: 0,
                        deletions: 0
                    };
                }
            } else if (currentCommit && currentCommit.hash) {
                // numstat 라인: "insertions\tdeletions\tfilename" 형식
                const numstatMatch = trimmedLine.match(/^(\d+|-)\t(\d+|-)\t(.+)$/);
                if (numstatMatch) {
                    // 바이너리 파일은 '-'로 표시됨
                    const ins = numstatMatch[1] === '-' ? 0 : parseInt(numstatMatch[1], 10);
                    const del = numstatMatch[2] === '-' ? 0 : parseInt(numstatMatch[2], 10);
                    const filename = numstatMatch[3];
                    currentCommit.insertions += ins;
                    currentCommit.deletions += del;
                    currentCommit.files.push(filename);
                }
            }
        }

        // 마지막 커밋 저장
        if (currentCommit && currentCommit.hash) {
            const commit = this.createCommitData(currentCommit);
            if (commit) { commits.push(commit); }
        }

        console.log(`🔍 파싱 결과: 발견된 hash 수=${hashCount}, 완료된 커밋 수=${commits.length}`);
        return commits;
    }

    /**
     * 파싱된 커밋 데이터를 CommitData로 변환
     */
    private createCommitData(commitData: any): CommitData | null {
        const { hash, author, date: dateStr, message, files, insertions, deletions } = commitData;

        if (!hash || !author || !dateStr) { return null; }

        const commitDate = new Date(dateStr);
        if (isNaN(commitDate.getTime())) { return null; }

        return {
            hash: this.sanitizeString(hash),
            author: this.sanitizeString(author),
            date: commitDate,
            message: this.sanitizeString(message || ''),
            files: (files || []).map((f: string) => this.sanitizeString(f)),
            insertions: insertions || 0,
            deletions: deletions || 0
        };
    }

    /**
     * 문자열 새니타이제이션 (XSS 방지)
     */
    private sanitizeString(str: string): string {
        if (!str || typeof str !== 'string') { return ''; }
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .trim();
    }

    async generateMetrics(commits: CommitData[], selectedBranch?: string): Promise<MetricsData> {
        const dailyCommits: { [date: string]: number } = {};
        const fileStats: { [file: string]: number } = {};

        // 이번 주 시작일 계산
        const now = new Date();
        const thisWeekStart = new Date(now);
        thisWeekStart.setDate(now.getDate() - now.getDay());
        thisWeekStart.setHours(0, 0, 0, 0);

        let totalInsertions = 0;
        let totalDeletions = 0;

        for (const commit of commits) {
            const dateKey = commit.date.toISOString().split('T')[0];
            dailyCommits[dateKey] = (dailyCommits[dateKey] || 0) + 1;
            totalInsertions += commit.insertions || 0;
            totalDeletions += commit.deletions || 0;

            for (const file of commit.files) {
                if (file.trim()) {
                    fileStats[file] = (fileStats[file] || 0) + 1;
                }
            }
        }

        // 이번 주 가장 많이 작업한 파일
        const thisWeekCommits = commits.filter(c => c.date >= thisWeekStart);
        const thisWeekFiles: { [file: string]: number } = {};
        for (const commit of thisWeekCommits) {
            for (const file of commit.files) {
                if (file.trim()) {
                    thisWeekFiles[file] = (thisWeekFiles[file] || 0) + 1;
                }
            }
        }

        const thisWeekTopFiles = Object.entries(thisWeekFiles)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([file, count]) => ({
                file: file.split('/').pop() || file,
                commits: count
            }));

        const authorStats = this.calculateAuthorStats(commits);
        const fileTypes = this.calculateFileTypes(commits);
        const fileTypeStats = this.calculateDetailedFileTypeStats(commits);
        const programmingLanguages = this.calculateProgrammingLanguages(fileTypeStats);
        const topFileType = fileTypeStats[0]?.extension || 'N/A';
        const timeAnalysis = this.calculateTimeAnalysis(commits);
        const fileChurnStats = this.calculateFileChurnStats(commits);
        const commitStreak = this.calculateCommitStreak(dailyCommits, 30);
        const conventionalCommits = this.calculateConventionalCommits(commits);
        const weekOverWeekChange = this.calculateWeekOverWeekChange(dailyCommits, 30);
        const dailyChanges = this.calculateDailyChanges(commits, 30);
        const branchStats = await this.getBranchStats(selectedBranch);
        const branchComparison = await this.getBranchComparison(branchStats.currentBranch);

        const metricsData: MetricsData = {
            dailyCommits,
            fileStats,
            thisWeekTopFiles,
            totalCommits: commits.length,
            totalFiles: Object.keys(fileStats).length,
            totalInsertions,
            totalDeletions,
            authorStats,
            totalAuthors: authorStats.length,
            topAuthor: authorStats[0]?.name || 'N/A',
            fileTypes,
            fileTypeStats,
            topFileType,
            programmingLanguages,
            timeAnalysis,
            fileChurnStats,
            commitStreak,
            conventionalCommits,
            weekOverWeekChange,
            dailyChanges,
            branchStats,
            badges: [] as Badge[]
        };

        if (branchComparison) {
            metricsData.branchComparison = branchComparison;
        }

        const badges = this.badgeSystem.calculateBadges(metricsData, commits, 30);
        metricsData.badges = badges;

        return metricsData;
    }

    async getDetailedCommitStats(days: number = 30, branch?: string): Promise<ExtendedMetricsData> {
        const commits = await this.getCommitHistory(days, branch);
        const basicMetrics = await this.generateMetrics(commits, branch);

        const averageCommitsPerDay = commits.length / days;
        const mostActiveDay = this.getMostActiveDay(basicMetrics.timeAnalysis.weeklyActivity);
        const mostActiveHour = this.getMostActiveHour(basicMetrics.timeAnalysis.hourlyActivity);

        return {
            ...basicMetrics,
            averageCommitsPerDay,
            mostActiveDay,
            mostActiveHour
        };
    }

    private calculateAuthorStats(commits: CommitData[]): AuthorStats[] {
        if (commits.length === 0) { return []; }

        const authors: { [name: string]: {
            commits: number;
            files: Set<string>;
            insertions: number;
            deletions: number;
            firstCommit: Date | null;
            lastCommit: Date | null;
        }} = {};

        for (const commit of commits) {
            const authorName = commit.author || 'Unknown';

            if (!authors[authorName]) {
                authors[authorName] = {
                    commits: 0,
                    files: new Set<string>(),
                    insertions: 0,
                    deletions: 0,
                    firstCommit: null,
                    lastCommit: null
                };
            }

            const author = authors[authorName];
            author.commits++;
            author.insertions += commit.insertions || 0;
            author.deletions += commit.deletions || 0;

            commit.files.forEach(file => {
                if (file.trim()) { author.files.add(file); }
            });

            if (!author.firstCommit || commit.date < author.firstCommit) {
                author.firstCommit = commit.date;
            }
            if (!author.lastCommit || commit.date > author.lastCommit) {
                author.lastCommit = commit.date;
            }
        }

        const totalCommits = commits.length;

        const authorStatsArray = Object.entries(authors).map(([name, data]) => {
            const daysSinceFirst = data.firstCommit && data.lastCommit
                ? Math.max(1, Math.ceil((data.lastCommit.getTime() - data.firstCommit.getTime()) / (1000 * 60 * 60 * 24)))
                : 1;

            return {
                name,
                commits: data.commits,
                files: data.files.size,
                insertions: data.insertions,
                deletions: data.deletions,
                percentage: Math.round((data.commits / totalCommits) * 100),
                rank: 0,
                firstCommit: data.firstCommit,
                lastCommit: data.lastCommit,
                averageCommitsPerDay: Math.round((data.commits / daysSinceFirst) * 10) / 10
            };
        }).sort((a, b) => b.commits - a.commits);

        authorStatsArray.forEach((author, index) => {
            author.rank = index + 1;
        });

        return authorStatsArray;
    }

    /**
     * 파일 Churn 분석 - 어떤 파일이 가장 많이 변경되었는지 (핫스팟)
     */
    private calculateFileChurnStats(commits: CommitData[]): FileChurnStats[] {
        const fileMap: { [file: string]: {
            commits: number;
            insertions: number;
            deletions: number;
            lastModified: Date | null;
        }} = {};

        for (const commit of commits) {
            for (const file of commit.files) {
                if (!file.trim()) { continue; }
                if (!fileMap[file]) {
                    fileMap[file] = { commits: 0, insertions: 0, deletions: 0, lastModified: null };
                }
                fileMap[file].commits++;
                fileMap[file].insertions += Math.floor((commit.insertions || 0) / Math.max(1, commit.files.length));
                fileMap[file].deletions += Math.floor((commit.deletions || 0) / Math.max(1, commit.files.length));
                if (!fileMap[file].lastModified || commit.date > fileMap[file].lastModified!) {
                    fileMap[file].lastModified = commit.date;
                }
            }
        }

        return Object.entries(fileMap)
            .map(([file, data]) => ({
                file,
                commits: data.commits,
                insertions: data.insertions,
                deletions: data.deletions,
                churnScore: data.insertions + data.deletions,
                lastModified: data.lastModified
            }))
            .sort((a, b) => b.commits - a.commits)
            .slice(0, 20);
    }

    private calculateHourlyActivity(commits: CommitData[]): { [hour: string]: number } {
        const hourlyStats: { [hour: string]: number } = {};
        for (let hour = 0; hour < 24; hour++) {
            hourlyStats[hour.toString()] = 0;
        }
        for (const commit of commits) {
            const hour = commit.date.getHours().toString();
            hourlyStats[hour]++;
        }
        return hourlyStats;
    }

    private calculateWeeklyActivity(commits: CommitData[]): { [day: string]: number } {
        // 0=Sun, 1=Mon, ..., 6=Sat (locale-neutral numeric keys)
        const weeklyStats: { [day: string]: number } = {};
        for (let i = 0; i < 7; i++) { weeklyStats[i.toString()] = 0; }
        for (const commit of commits) {
            const dayIndex = commit.date.getDay().toString();
            weeklyStats[dayIndex]++;
        }
        return weeklyStats;
    }

    private calculateFileTypes(commits: CommitData[]): { [ext: string]: number } {
        const fileTypes: { [ext: string]: number } = {};
        for (const commit of commits) {
            for (const file of commit.files) {
                const ext = file.split('.').pop()?.toLowerCase() || 'no-ext';
                fileTypes[ext] = (fileTypes[ext] || 0) + 1;
            }
        }
        return fileTypes;
    }

    private calculateDetailedFileTypeStats(commits: CommitData[]): FileTypeStats[] {
        const fileTypeCounts: { [ext: string]: { commits: number; files: Set<string> }} = {};

        for (const commit of commits) {
            for (const file of commit.files) {
                const ext = file.split('.').pop()?.toLowerCase() || 'no-ext';
                if (!fileTypeCounts[ext]) {
                    fileTypeCounts[ext] = { commits: 0, files: new Set<string>() };
                }
                fileTypeCounts[ext].commits++;
                fileTypeCounts[ext].files.add(file);
            }
        }

        const totalCommits = Object.values(fileTypeCounts).reduce((sum, data) => sum + data.commits, 0);

        return Object.entries(fileTypeCounts).map(([ext, data]) => {
            const langInfo = EXTENSION_TO_LANGUAGE[ext] || { language: ext.toUpperCase(), category: 'Other' };
            return {
                extension: ext,
                commits: data.commits,
                files: data.files.size,
                percentage: Math.round((data.commits / totalCommits) * 100),
                language: langInfo.language,
                category: langInfo.category
            };
        }).sort((a, b) => b.commits - a.commits);
    }

    private calculateProgrammingLanguages(fileTypeStats: FileTypeStats[]): { [lang: string]: number } {
        const languages: { [lang: string]: number } = {};
        for (const stat of fileTypeStats) {
            if (stat.category !== 'Config' && stat.category !== 'Documentation' && stat.category !== 'Other') {
                languages[stat.language] = (languages[stat.language] || 0) + stat.commits;
            }
        }
        return languages;
    }

    private calculateTimeAnalysis(commits: CommitData[]): TimeAnalysis {
        const hourlyActivity = this.calculateHourlyActivity(commits);
        const weeklyActivity = this.calculateWeeklyActivity(commits);

        const peakHour = this.getMostActiveHour(hourlyActivity);
        const peakDay = this.getMostActiveDay(weeklyActivity);

        let nightCommits = 0;
        for (let hour = 22; hour <= 23; hour++) {
            nightCommits += hourlyActivity[hour.toString()] || 0;
        }
        for (let hour = 0; hour <= 6; hour++) {
            nightCommits += hourlyActivity[hour.toString()] || 0;
        }

        const weekendCommits = (weeklyActivity['6'] || 0) + (weeklyActivity['0'] || 0); // 6=Sat, 0=Sun
        const workdayCommits = commits.length - weekendCommits;
        const totalCommits = commits.length;
        const nightPercentage = totalCommits > 0 ? Math.round((nightCommits / totalCommits) * 100) : 0;
        const weekendPercentage = totalCommits > 0 ? Math.round((weekendCommits / totalCommits) * 100) : 0;

        const heatmapData = this.generateHeatmapData(commits);
        const workingHours = this.findMostActiveWorkingHours(hourlyActivity);

        return {
            hourlyActivity,
            weeklyActivity,
            peakHour,
            peakDay,
            nightCommits,
            weekendCommits,
            workdayCommits,
            nightPercentage,
            weekendPercentage,
            heatmapData,
            workingHours
        };
    }

    private generateHeatmapData(commits: CommitData[]): Array<{ day: number; hour: number; commits: number }> {
        const heatmap: { [key: string]: number } = {};

        for (let day = 0; day < 7; day++) {
            for (let hour = 0; hour < 24; hour++) {
                heatmap[`${day}-${hour}`] = 0;
            }
        }

        for (const commit of commits) {
            const day = commit.date.getDay();
            const hour = commit.date.getHours();
            heatmap[`${day}-${hour}`]++;
        }

        const result = [];
        for (let day = 0; day < 7; day++) {
            for (let hour = 0; hour < 24; hour++) {
                result.push({ day, hour, commits: heatmap[`${day}-${hour}`] });
            }
        }
        return result;
    }

    private findMostActiveWorkingHours(hourlyActivity: { [hour: string]: number }): { start: number; end: number; commits: number } {
        let maxCommits = 0;
        let bestStart = 9;

        for (let start = 0; start < 24; start++) {
            let count = 0;
            for (let i = 0; i < 8; i++) {
                const hour = (start + i) % 24;
                count += hourlyActivity[hour.toString()] || 0;
            }
            if (count > maxCommits) {
                maxCommits = count;
                bestStart = start;
            }
        }

        return { start: bestStart, end: (bestStart + 7) % 24, commits: maxCommits };
    }

    private getMostActiveDay(weeklyActivity: { [day: string]: number }): string {
        const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const topEntry = Object.entries(weeklyActivity).sort(([, a], [, b]) => b - a)[0];
        if (!topEntry) { return 'N/A'; }
        return DAY_NAMES[parseInt(topEntry[0])] || topEntry[0];
    }

    private getMostActiveHour(hourlyActivity: { [hour: string]: number }): string {
        const hour = Object.entries(hourlyActivity)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || '0';
        return `${hour}시`;
    }

    /**
     * 커밋 스트릭 계산 (연속 커밋 일수)
     */
    private calculateCommitStreak(dailyCommits: { [date: string]: number }, days: number): CommitStreak {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeDays = Object.keys(dailyCommits).filter(d => dailyCommits[d] > 0).length;
        const totalDays = days;
        const activityRate = totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0;

        // 현재 스트릭: 오늘부터 역순으로 연속 커밋 일수 계산
        let currentStreak = 0;
        let checkDate = new Date(today);
        // 오늘 커밋이 없으면 어제부터 체크
        const todayStr = checkDate.toISOString().split('T')[0];
        if (!dailyCommits[todayStr]) {
            checkDate.setDate(checkDate.getDate() - 1);
        }
        for (let i = 0; i < totalDays; i++) {
            const dateStr = checkDate.toISOString().split('T')[0];
            if (dailyCommits[dateStr] && dailyCommits[dateStr] > 0) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        // 최장 스트릭: 전체 기간에서 계산
        let longestStreak = 0;
        let tempStreak = 0;
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const ds = d.toISOString().split('T')[0];
            if (dailyCommits[ds] && dailyCommits[ds] > 0) {
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                tempStreak = 0;
            }
        }

        return { currentStreak, longestStreak, activeDays, totalDays, activityRate };
    }

    /**
     * Conventional Commits 패턴 감지
     * https://www.conventionalcommits.org/
     */
    private calculateConventionalCommits(commits: CommitData[]): ConventionalCommitStats {
        const CONVENTIONAL_REGEX = /^(feat|fix|chore|docs|test|refactor|style|perf|ci|build|revert)(\(.+\))?!?:/i;
        const types: { [type: string]: number } = {};

        let conventionalCount = 0;
        for (const commit of commits) {
            const match = commit.message.match(CONVENTIONAL_REGEX);
            if (match) {
                conventionalCount++;
                const type = match[1].toLowerCase();
                types[type] = (types[type] || 0) + 1;
            }
        }

        const conventionalPercentage = commits.length > 0
            ? Math.round((conventionalCount / commits.length) * 100)
            : 0;

        const topType = Object.entries(types).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

        return { types, conventionalCount, conventionalPercentage, topType };
    }

    /**
     * 주간 비교 (Week-over-Week) 변화율 계산
     */
    private calculateWeekOverWeekChange(dailyCommits: { [date: string]: number }, days: number): WeekOverWeekChange {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 현재 기간 (최근 절반 기간)
        const halfPeriod = Math.ceil(days / 2);
        let currentPeriodCommits = 0;
        let previousPeriodCommits = 0;

        for (let i = 0; i < halfPeriod; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const ds = d.toISOString().split('T')[0];
            currentPeriodCommits += dailyCommits[ds] || 0;
        }

        for (let i = halfPeriod; i < days; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const ds = d.toISOString().split('T')[0];
            previousPeriodCommits += dailyCommits[ds] || 0;
        }

        let changePercent = 0;
        if (previousPeriodCommits > 0) {
            changePercent = Math.round(((currentPeriodCommits - previousPeriodCommits) / previousPeriodCommits) * 100);
        } else if (currentPeriodCommits > 0) {
            changePercent = 100;
        }

        const trend: 'up' | 'down' | 'stable' =
            changePercent > 5 ? 'up' : changePercent < -5 ? 'down' : 'stable';

        return { currentPeriodCommits, previousPeriodCommits, changePercent, trend };
    }

    /**
     * 일별 코드 변경량 계산 (insertions/deletions 트렌드)
     */
    private calculateDailyChanges(commits: CommitData[], days: number): DailyChanges[] {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const changeMap: { [date: string]: { insertions: number; deletions: number; commits: number } } = {};

        for (const commit of commits) {
            const ds = commit.date.toISOString().split('T')[0];
            if (!changeMap[ds]) { changeMap[ds] = { insertions: 0, deletions: 0, commits: 0 }; }
            changeMap[ds].insertions += commit.insertions || 0;
            changeMap[ds].deletions += commit.deletions || 0;
            changeMap[ds].commits++;
        }

        const result: DailyChanges[] = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const ds = d.toISOString().split('T')[0];
            result.push({
                date: ds,
                insertions: changeMap[ds]?.insertions || 0,
                deletions: changeMap[ds]?.deletions || 0,
                commits: changeMap[ds]?.commits || 0
            });
        }
        return result;
    }

    /**
     * 브랜치 현황 조회
     */
    async getBranchStats(selectedBranch?: string): Promise<BranchStats> {
        if (!this.workspaceRoot) {
            return { currentBranch: 'N/A', totalBranches: 0, recentBranches: [], staleBranches: [] };
        }

        try {
            const [currentResult, allResult] = await Promise.all([
                execFileAsync('git', ['branch', '--show-current'], { cwd: this.workspaceRoot }),
                execFileAsync('git', ['branch', '--format=%(refname:short)|%(committerdate:iso)'], { cwd: this.workspaceRoot })
            ]);

            const currentBranch = selectedBranch || currentResult.stdout.trim();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const recentBranches: string[] = [];
            const staleBranches: string[] = [];

            allResult.stdout.trim().split('\n').forEach(line => {
                const [name, dateStr] = line.split('|');
                if (!name) { return; }
                const branchDate = new Date(dateStr);
                if (!isNaN(branchDate.getTime()) && branchDate >= thirtyDaysAgo) {
                    recentBranches.push(name.trim());
                } else {
                    staleBranches.push(name.trim());
                }
            });

            const totalBranches = recentBranches.length + staleBranches.length;
            return { currentBranch, totalBranches, recentBranches, staleBranches };
        } catch {
            return { currentBranch: 'N/A', totalBranches: 0, recentBranches: [], staleBranches: [] };
        }
    }

    async getBranches(): Promise<string[]> {
        if (!this.workspaceRoot) {
            return [];
        }

        try {
            const { stdout } = await execFileAsync('git', [
                'branch',
                '--format=%(refname:short)'
            ], { cwd: this.workspaceRoot });

            return stdout
                .split('\n')
                .map(branch => branch.trim())
                .filter(Boolean)
                .filter((branch, index, branches) => branches.indexOf(branch) === index)
                .sort((a, b) => a.localeCompare(b));
        } catch {
            return [];
        }
    }

    async getBranchComparison(targetBranch?: string): Promise<BranchComparison | undefined> {
        if (!this.workspaceRoot || !targetBranch || targetBranch === 'N/A') {
            return undefined;
        }

        const branches = await this.getBranches();
        const baseBranch = this.pickBaseBranch(branches, targetBranch);
        if (!baseBranch || baseBranch === targetBranch) {
            return undefined;
        }

        try {
            const [aheadBehindResult, diffResult] = await Promise.all([
                execFileAsync('git', ['rev-list', '--left-right', '--count', `${baseBranch}...${targetBranch}`], { cwd: this.workspaceRoot }),
                execFileAsync('git', ['diff', '--shortstat', `${baseBranch}...${targetBranch}`], { cwd: this.workspaceRoot })
            ]);

            const [behindRaw, aheadRaw] = aheadBehindResult.stdout.trim().split(/\s+/);
            const diff = this.parseShortStat(diffResult.stdout);

            return {
                baseBranch,
                targetBranch,
                ahead: parseInt(aheadRaw || '0', 10),
                behind: parseInt(behindRaw || '0', 10),
                filesChanged: diff.filesChanged,
                insertions: diff.insertions,
                deletions: diff.deletions
            };
        } catch {
            return undefined;
        }
    }

    private pickBaseBranch(branches: string[], targetBranch: string): string | undefined {
        const preferredBases = ['main', 'master', 'develop', 'dev'];
        return preferredBases.find(branch => branches.includes(branch) && branch !== targetBranch);
    }

    private parseShortStat(shortStat: string): { filesChanged: number; insertions: number; deletions: number } {
        return {
            filesChanged: parseInt(shortStat.match(/(\d+)\s+files?\s+changed/)?.[1] || '0', 10),
            insertions: parseInt(shortStat.match(/(\d+)\s+insertions?\(\+\)/)?.[1] || '0', 10),
            deletions: parseInt(shortStat.match(/(\d+)\s+deletions?\(-\)/)?.[1] || '0', 10)
        };
    }

    getBadgeSystem(): BadgeSystem {
        return this.badgeSystem;
    }

    async calculateBadgesForCommits(commits: CommitData[], metrics: MetricsData, period: number = 30): Promise<Badge[]> {
        return this.badgeSystem.calculateBadges(metrics, commits, period);
    }

    getUnlockedBadges(): Badge[] {
        return this.badgeSystem.getUnlockedBadges();
    }

    getBadgeStats() {
        return this.badgeSystem.getBadgeStats();
    }

    /**
     * 릴리즈 노트 생성: 마지막 태그 이후 커밋을 conventional commit 타입별 그룹핑
     */
    async generateReleaseNotes(): Promise<string> {
        try {
            // 가장 최근 태그 가져오기
            let sinceTag = '';
            try {
                const { stdout: tagOut } = await execFileAsync('git', ['describe', '--tags', '--abbrev=0'], { cwd: this.workspaceRoot });
                sinceTag = tagOut.trim();
            } catch {
                // 태그 없으면 전체 히스토리 사용
            }

            const gitArgs = sinceTag
                ? ['log', `${sinceTag}..HEAD`, '--pretty=format:%s', '--no-merges']
                : ['log', '--pretty=format:%s', '--no-merges', '--max-count=100'];

            const { stdout } = await execFileAsync('git', gitArgs, { cwd: this.workspaceRoot });
            const lines = stdout.split('\n').map(l => l.trim()).filter(Boolean);

            // Conventional commit 타입 파싱
            const groups: Record<string, string[]> = {
                feat: [],
                fix: [],
                docs: [],
                refactor: [],
                test: [],
                chore: [],
                perf: [],
                style: [],
                other: []
            };

            const typeLabels: Record<string, string> = {
                feat: '✨ New Features',
                fix: '🐛 Bug Fixes',
                docs: '📝 Documentation',
                refactor: '♻️ Refactoring',
                test: '✅ Tests',
                chore: '🔧 Chores',
                perf: '⚡ Performance',
                style: '💄 Style',
                other: '📦 Other'
            };

            for (const line of lines) {
                const match = line.match(/^(\w+)(?:\([\w-]+\))?!?:\s*(.+)$/);
                if (match) {
                    const type = match[1].toLowerCase();
                    const desc = match[2];
                    if (type in groups) {
                        groups[type].push(desc);
                    } else {
                        groups['other'].push(line);
                    }
                } else {
                    groups['other'].push(line);
                }
            }

            const today = new Date().toISOString().split('T')[0];
            const lines2: string[] = [
                `# Release Notes`,
                ``,
                `**Date:** ${today}${sinceTag ? `  **Since:** \`${sinceTag}\`` : ''}`,
                ``
            ];

            for (const [type, items] of Object.entries(groups)) {
                if (items.length > 0) {
                    lines2.push(`## ${typeLabels[type]}`);
                    lines2.push('');
                    for (const item of items) {
                        lines2.push(`- ${item}`);
                    }
                    lines2.push('');
                }
            }

            if (lines.length === 0) {
                lines2.push('_No commits found since last tag._');
            }

            lines2.push(`---`);
            lines2.push(`_Generated by [Git Metrics Dashboard](https://marketplace.visualstudio.com/items?itemName=jiwan-dev.git-metrics-dashboard)_`);

            return lines2.join('\n');
        } catch (error) {
            throw new Error(`릴리즈 노트 생성 실패: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
