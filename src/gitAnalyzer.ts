import { exec } from 'child_process';
import { promisify } from 'util';
import * as vscode from 'vscode';
import { BadgeSystem, Badge } from './badgeSystem';
import { CacheManager } from './cacheManager';

const execAsync = promisify(exec);

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

    async getCommitHistory(days: number = 30): Promise<CommitData[]> {
        if (!this.workspaceRoot) {
            throw new Error('워크스페이스가 열려있지 않습니다.');
        }

        // 날짜 검증 (보안: 인젝션 방지)
        if (days < 1 || days > 365 || !Number.isInteger(days)) {
            throw new Error('유효하지 않은 기간입니다 (1-365일)');
        }

        // 캐시 확인
        const cacheKey = `commits_${days}`;
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
            // --numstat으로 실제 삽입/삭제 라인 수 수집
            const { stdout } = await execAsync(
                `git log --since="${sinceStr}" --pretty=format:"%H|%an|%ad|%s" --date=iso --numstat`,
                { cwd: this.workspaceRoot }
            );

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

    async generateMetrics(commits: CommitData[]): Promise<MetricsData> {
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

        const metricsData = {
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
            badges: [] as Badge[]
        };

        const badges = this.badgeSystem.calculateBadges(metricsData, commits, 30);
        metricsData.badges = badges;

        return metricsData;
    }

    async getDetailedCommitStats(days: number = 30): Promise<ExtendedMetricsData> {
        const commits = await this.getCommitHistory(days);
        const basicMetrics = await this.generateMetrics(commits);

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
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const weeklyStats: { [day: string]: number } = {};
        days.forEach(day => weeklyStats[day] = 0);
        for (const commit of commits) {
            const dayName = days[commit.date.getDay()];
            weeklyStats[dayName]++;
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

        const weekendCommits = (weeklyActivity['토'] || 0) + (weeklyActivity['일'] || 0);
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
        return Object.entries(weeklyActivity)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || '데이터 없음';
    }

    private getMostActiveHour(hourlyActivity: { [hour: string]: number }): string {
        const hour = Object.entries(hourlyActivity)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || '0';
        return `${hour}시`;
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
}
