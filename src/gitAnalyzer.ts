import { exec } from 'child_process';
import { promisify } from 'util';
import * as vscode from 'vscode';

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

export interface MetricsData {
    dailyCommits: { [date: string]: number };
    fileStats: { [file: string]: number };
    thisWeekTopFiles: Array<{ file: string; commits: number }>;
    totalCommits: number;
    totalFiles: number;
    // 작성자별 통계
    authorStats: AuthorStats[];
    totalAuthors: number;
    topAuthor: string;
    // 파일 타입별 통계
    fileTypes: { [ext: string]: number };
    fileTypeStats: FileTypeStats[];
    topFileType: string;
    programmingLanguages: { [lang: string]: number };
    // 시간대별 분석 추가
    timeAnalysis: TimeAnalysis;
}

export interface ExtendedMetricsData extends MetricsData {
    averageCommitsPerDay: number;
    mostActiveDay: string;
    mostActiveHour: string;
}

export class GitAnalyzer {
    private workspaceRoot: string;

    constructor() {
        this.workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    }

    async getCommitHistory(days: number = 30): Promise<CommitData[]> {
        if (!this.workspaceRoot) {
            throw new Error('워크스페이스가 열려있지 않습니다.');
        }

        const since = new Date();
        since.setDate(since.getDate() - days);
        const sinceStr = since.toISOString().split('T')[0];

        try {
            const { stdout } = await execAsync(
                `git log --since="${sinceStr}" --pretty=format:"%H|%an|%ad|%s" --date=iso --name-only`,
                { cwd: this.workspaceRoot }
            );

            return this.parseGitLog(stdout);
        } catch (error) {
            console.error('Git log 실행 오류:', error);
            return [];
        }
    }

    private parseGitLog(gitOutput: string): CommitData[] {
        const commits: CommitData[] = [];
        const commitBlocks = gitOutput.split('\n\n').filter(block => block.trim());

        for (const block of commitBlocks) {
            const lines = block.split('\n');
            if (lines.length < 2) continue;

            const [hash, author, dateStr, message] = lines[0].split('|');
            const files = lines.slice(1).filter(line => line.trim() && !line.includes('|'));

            commits.push({
                hash: hash || '',
                author: author || 'Unknown',
                date: new Date(dateStr),
                message: message || '',
                files,
                insertions: 0,
                deletions: 0
            });
        }

        return commits;
    }

    async generateMetrics(commits: CommitData[]): Promise<MetricsData> {
        const dailyCommits: { [date: string]: number } = {};
        const fileStats: { [file: string]: number } = {};

        // 이번 주 시작일 계산
        const now = new Date();
        const thisWeekStart = new Date(now);
        thisWeekStart.setDate(now.getDate() - now.getDay());
        thisWeekStart.setHours(0, 0, 0, 0);

        for (const commit of commits) {
            // 일별 커밋 통계
            const dateKey = commit.date.toISOString().split('T')[0];
            dailyCommits[dateKey] = (dailyCommits[dateKey] || 0) + 1;

            // 파일별 통계
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
            .map(([file, commits]) => ({
                file: file.split('/').pop() || file,
                commits
            }));

        // 작성자별 통계 계산
        const authorStats = this.calculateAuthorStats(commits);

        // 파일 타입별 통계 계산
        const fileTypes = this.calculateFileTypes(commits);
        const fileTypeStats = this.calculateDetailedFileTypeStats(commits);
        const programmingLanguages = this.calculateProgrammingLanguages(fileTypeStats);
        const topFileType = fileTypeStats[0]?.extension || 'N/A';

        // 시간대별 분석 계산
        const timeAnalysis = this.calculateTimeAnalysis(commits);

        return {
            dailyCommits,
            fileStats,
            thisWeekTopFiles,
            totalCommits: commits.length,
            totalFiles: Object.keys(fileStats).length,
            authorStats,
            totalAuthors: authorStats.length,
            topAuthor: authorStats[0]?.name || 'N/A',
            fileTypes,
            fileTypeStats,
            topFileType,
            programmingLanguages,
            timeAnalysis
        };
    }

    async getDetailedCommitStats(days: number = 30): Promise<ExtendedMetricsData> {
        const commits = await this.getCommitHistory(days);
        const basicMetrics = await this.generateMetrics(commits);

        // 추가 메트릭
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
        if (commits.length === 0) return [];

        const authors: { [name: string]: {
            commits: number;
            files: Set<string>;
            insertions: number;
            deletions: number;
            firstCommit: Date | null;
            lastCommit: Date | null;
        }} = {};

        // 작성자별 데이터 수집
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

            // 파일 목록 추가
            commit.files.forEach(file => {
                if (file.trim()) author.files.add(file);
            });

            // 첫 번째/마지막 커밋 날짜 업데이트
            if (!author.firstCommit || commit.date < author.firstCommit) {
                author.firstCommit = commit.date;
            }
            if (!author.lastCommit || commit.date > author.lastCommit) {
                author.lastCommit = commit.date;
            }
        }

        const totalCommits = commits.length;

        // AuthorStats 배열로 변환 및 정렬
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
                rank: 0, // 아래에서 설정
                firstCommit: data.firstCommit,
                lastCommit: data.lastCommit,
                averageCommitsPerDay: Math.round((data.commits / daysSinceFirst) * 10) / 10
            };
        }).sort((a, b) => b.commits - a.commits);

        // 순위 설정
        authorStatsArray.forEach((author, index) => {
            author.rank = index + 1;
        });

        return authorStatsArray;
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
        
        // 파일 타입과 언어 매핑
        // const extensionToLanguage: { [ext: string]: { language: string; category: string }} = {
        //     'js': { language: 'JavaScript', category: 'Frontend' },
        //     'jsx': { language: 'React', category: 'Frontend' },
        //     'ts': { language: 'TypeScript', category: 'Frontend' },
        //     'tsx': { language: 'React TypeScript', category: 'Frontend' },
        //     'vue': { language: 'Vue.js', category: 'Frontend' },
        //     'svelte': { language: 'Svelte', category: 'Frontend' },
        //     'py': { language: 'Python', category: 'Backend' },
        //     'java': { language: 'Java', category: 'Backend' },
        //     'kt': { language: 'Kotlin', category: 'Backend' },
        //     'go': { language: 'Go', category: 'Backend' },
        //     'rs': { language: 'Rust', category: 'Backend' },
        //     'php': { language: 'PHP', category: 'Backend' },
        //     'rb': { language: 'Ruby', category: 'Backend' },
        //     'cs': { language: 'C#', category: 'Backend' },
        //     'cpp': { language: 'C++', category: 'Backend' },
        //     'c': { language: 'C', category: 'Backend' },
        //     'swift': { language: 'Swift', category: 'Mobile' },
        //     'dart': { language: 'Dart', category: 'Mobile' },
        //     'html': { language: 'HTML', category: 'Frontend' },
        //     'css': { language: 'CSS', category: 'Frontend' },
        //     'scss': { language: 'SCSS', category: 'Frontend' },
        //     'sass': { language: 'Sass', category: 'Frontend' },
        //     'less': { language: 'Less', category: 'Frontend' },
        //     'json': { language: 'JSON', category: 'Config' },
        //     'xml': { language: 'XML', category: 'Config' },
        //     'yaml': { language: 'YAML', category: 'Config' },
        //     'yml': { language: 'YAML', category: 'Config' },
        //     'toml': { language: 'TOML', category: 'Config' },
        //     'md': { language: 'Markdown', category: 'Documentation' },
        //     'txt': { language: 'Text', category: 'Documentation' },
        //     'sql': { language: 'SQL', category: 'Database' },
        //     'sh': { language: 'Shell', category: 'Scripts' },
        //     'bat': { language: 'Batch', category: 'Scripts' },
        //     'ps1': { language: 'PowerShell', category: 'Scripts' },
        //     'no-ext': { language: 'No Extension', category: 'Other' }
        // };

        const extensionToLanguage: { [ext: string]: { language: string; category: string }} = {
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
            'sed': { language: 'Sed', category: 'Scripts' },
            
            // Infrastructure as Code
            'hcl': { language: 'HCL', category: 'Infrastructure' },
            'tf': { language: 'Terraform', category: 'Infrastructure' },
            'terraform': { language: 'Terraform', category: 'Infrastructure' },
            'tfvars': { language: 'Terraform', category: 'Infrastructure' },
            'ansible': { language: 'Ansible', category: 'Infrastructure' },
            'playbook': { language: 'Ansible', category: 'Infrastructure' },
            'puppet': { language: 'Puppet', category: 'Infrastructure' },
            'chef': { language: 'Chef', category: 'Infrastructure' },
            'dockerfile': { language: 'Docker', category: 'Infrastructure' },
            'docker': { language: 'Docker', category: 'Infrastructure' },
            'k8s': { language: 'Kubernetes', category: 'Infrastructure' },
            'kubernetes': { language: 'Kubernetes', category: 'Infrastructure' },
            'helm': { language: 'Kubernetes', category: 'Infrastructure' },
            
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
            'dotenv': { language: 'Environment', category: 'Config' },
            'properties': { language: 'Properties', category: 'Config' },
            'plist': { language: 'Properties', category: 'Config' },
            
            // Documentation
            'md': { language: 'Markdown', category: 'Documentation' },
            'markdown': { language: 'Markdown', category: 'Documentation' },
            'mdown': { language: 'Markdown', category: 'Documentation' },
            'txt': { language: 'Text', category: 'Documentation' },
            'rtf': { language: 'Text', category: 'Documentation' },
            'rst': { language: 'reStructuredText', category: 'Documentation' },
            'tex': { language: 'LaTeX', category: 'Documentation' },
            'latex': { language: 'LaTeX', category: 'Documentation' },
            'org': { language: 'Org', category: 'Documentation' },
            'wiki': { language: 'Wiki', category: 'Documentation' },
            'adoc': { language: 'AsciiDoc', category: 'Documentation' },
            
            // Database
            'sql': { language: 'SQL', category: 'Database' },
            'mysql': { language: 'MySQL', category: 'Database' },
            'postgres': { language: 'PostgreSQL', category: 'Database' },
            'sqlite': { language: 'SQLite', category: 'Database' },
            'db': { language: 'SQLite', category: 'Database' },
            
            // Build Tools & Package Managers
            'makefile': { language: 'Makefile', category: 'Build' },
            'make': { language: 'Makefile', category: 'Build' },
            'cmake': { language: 'CMake', category: 'Build' },
            'gradle': { language: 'Gradle', category: 'Build' },
            'maven': { language: 'Maven', category: 'Build' },
            'ant': { language: 'Ant', category: 'Build' },
            'bazel': { language: 'Bazel', category: 'Build' },
            'ninja': { language: 'Ninja', category: 'Build' },
            'cargo': { language: 'Cargo', category: 'Package Manager' },
            'npm': { language: 'npm', category: 'Package Manager' },
            'yarn': { language: 'Yarn', category: 'Package Manager' },
            'pnpm': { language: 'pnpm', category: 'Package Manager' },
            'bower': { language: 'Bower', category: 'Package Manager' },
            'composer': { language: 'Composer', category: 'Package Manager' },
            'pip': { language: 'pip', category: 'Package Manager' },
            'pipfile': { language: 'Pipfile', category: 'Package Manager' },
            'requirements': { language: 'pip', category: 'Package Manager' },
            'gemfile': { language: 'Gemfile', category: 'Package Manager' },
            'podfile': { language: 'Podfile', category: 'Package Manager' },
            'pubspec': { language: 'Pubspec', category: 'Package Manager' },
            
            // Template Languages
            'hbs': { language: 'Handlebars', category: 'Template' },
            'handlebars': { language: 'Handlebars', category: 'Template' },
            'mustache': { language: 'Mustache', category: 'Template' },
            'twig': { language: 'Twig', category: 'Template' },
            'jinja': { language: 'Jinja', category: 'Template' },
            'jinja2': { language: 'Jinja', category: 'Template' },
            'erb': { language: 'ERB', category: 'Template' },
            'haml': { language: 'HAML', category: 'Template' },
            'slim': { language: 'Slim', category: 'Template' },
            'pug': { language: 'Pug', category: 'Template' },
            'jade': { language: 'Jade', category: 'Template' },
            'ejs': { language: 'EJS', category: 'Template' },
            'liquid': { language: 'Liquid', category: 'Template' },
            'smarty': { language: 'Smarty', category: 'Template' },
            
            // Game Development
            'gd': { language: 'GDScript', category: 'Game Development' },
            'gdscript': { language: 'GDScript', category: 'Game Development' },
            'unity': { language: 'Unity', category: 'Game Development' },
            'unreal': { language: 'UnrealScript', category: 'Game Development' },
            'love2d': { language: 'Love2D', category: 'Game Development' },
            'pico8': { language: 'PICO-8', category: 'Game Development' },
            
            // Scientific/Data Languages
            'r': { language: 'R', category: 'Data Science' },
            'R': { language: 'R', category: 'Data Science' },
            'mat': { language: 'MATLAB', category: 'Data Science' },
            'matlab': { language: 'MATLAB', category: 'Data Science' },
            'julia': { language: 'Julia', category: 'Data Science' },
            'jl': { language: 'Julia', category: 'Data Science' },
            'octave': { language: 'Octave', category: 'Data Science' },
            
            // Legacy Languages
            'fortran': { language: 'Fortran', category: 'Legacy' },
            'f90': { language: 'Fortran', category: 'Legacy' },
            'f95': { language: 'Fortran', category: 'Legacy' },
            'cobol': { language: 'COBOL', category: 'Legacy' },
            'cob': { language: 'COBOL', category: 'Legacy' },
            'pascal': { language: 'Pascal', category: 'Legacy' },
            'pas': { language: 'Pascal', category: 'Legacy' },
            'ada': { language: 'Ada', category: 'Legacy' },
            'lisp': { language: 'LISP', category: 'Legacy' },
            'prolog': { language: 'Prolog', category: 'Legacy' },
            'scheme': { language: 'Scheme', category: 'Legacy' },
            'smalltalk': { language: 'Smalltalk', category: 'Legacy' },
            'basic': { language: 'BASIC', category: 'Legacy' },
            'vb6': { language: 'Visual Basic 6', category: 'Legacy' },
            
            // Hardware/Specialized Languages
            'verilog': { language: 'Verilog', category: 'Hardware' },
            'vhdl': { language: 'VHDL', category: 'Hardware' },
            'systemverilog': { language: 'SystemVerilog', category: 'Hardware' },
            'tcl': { language: 'TCL', category: 'Hardware' },
            'tk': { language: 'TCL', category: 'Hardware' },
            
            // Query Languages
            'graphql': { language: 'GraphQL', category: 'Query' },
            'gql': { language: 'GraphQL', category: 'Query' },
            'sparql': { language: 'SPARQL', category: 'Query' },
            'cypher': { language: 'Cypher', category: 'Query' },
            
            // Blockchain
            'sol': { language: 'Solidity', category: 'Blockchain' },
            'vy': { language: 'Vyper', category: 'Blockchain' },
            'cairo': { language: 'Cairo', category: 'Blockchain' },
            
            // Protocol & API
            'proto': { language: 'Protocol Buffers', category: 'Protocol' },
            'protobuf': { language: 'Protocol Buffers', category: 'Protocol' },
            'wsdl': { language: 'WSDL', category: 'Protocol' },
            'openapi': { language: 'OpenAPI', category: 'Protocol' },
            'swagger': { language: 'Swagger', category: 'Protocol' },
            
            // Web Assembly
            'wasm': { language: 'WebAssembly', category: 'System' },
            'wat': { language: 'WebAssembly', category: 'System' },
            
            // Security
            'pem': { language: 'Certificate', category: 'Security' },
            'crt': { language: 'Certificate', category: 'Security' },
            'key': { language: 'Certificate', category: 'Security' },
            
            // Other
            'no-ext': { language: 'No Extension', category: 'Other' }
        };        

        // 파일별 통계 수집
        for (const commit of commits) {
            for (const file of commit.files) {
                const ext = file.split('.').pop()?.toLowerCase() || 'no-ext';
                
                if (!fileTypeCounts[ext]) {
                    fileTypeCounts[ext] = {
                        commits: 0,
                        files: new Set<string>()
                    };
                }
                
                fileTypeCounts[ext].commits++;
                fileTypeCounts[ext].files.add(file);
            }
        }

        // 총 커밋 수 계산
        const totalCommits = Object.values(fileTypeCounts).reduce((sum, data) => sum + data.commits, 0);

        // FileTypeStats 배열로 변환
        const fileTypeStats = Object.entries(fileTypeCounts).map(([ext, data]) => {
            const langInfo = extensionToLanguage[ext] || { language: ext.toUpperCase(), category: 'Other' };
            
            return {
                extension: ext,
                commits: data.commits,
                files: data.files.size,
                percentage: Math.round((data.commits / totalCommits) * 100),
                language: langInfo.language,
                category: langInfo.category
            };
        }).sort((a, b) => b.commits - a.commits);

        return fileTypeStats;
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
        
        // 피크 시간과 요일 찾기
        const peakHour = this.getMostActiveHour(hourlyActivity);
        const peakDay = this.getMostActiveDay(weeklyActivity);
        
        // 야간 커밋 계산 (22시-6시)
        let nightCommits = 0;
        for (let hour = 22; hour <= 23; hour++) {
            nightCommits += hourlyActivity[hour.toString()] || 0;
        }
        for (let hour = 0; hour <= 6; hour++) {
            nightCommits += hourlyActivity[hour.toString()] || 0;
        }
        
        // 주말 커밋 계산 (토요일, 일요일)
        const weekendCommits = (weeklyActivity['토'] || 0) + (weeklyActivity['일'] || 0);
        const workdayCommits = commits.length - weekendCommits;
        
        // 퍼센티지 계산
        const totalCommits = commits.length;
        const nightPercentage = totalCommits > 0 ? Math.round((nightCommits / totalCommits) * 100) : 0;
        const weekendPercentage = totalCommits > 0 ? Math.round((weekendCommits / totalCommits) * 100) : 0;
        
        // 히트맵 데이터 생성 (요일 x 시간)
        const heatmapData = this.generateHeatmapData(commits);
        
        // 가장 활발한 연속 8시간 찾기
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
        
        // 초기화: 모든 요일(0-6) x 시간(0-23) 조합
        for (let day = 0; day < 7; day++) {
            for (let hour = 0; hour < 24; hour++) {
                heatmap[`${day}-${hour}`] = 0;
            }
        }
        
        // 커밋 데이터로 히트맵 채우기
        for (const commit of commits) {
            const day = commit.date.getDay(); // 0=일요일, 1=월요일, ...
            const hour = commit.date.getHours();
            const key = `${day}-${hour}`;
            heatmap[key]++;
        }
        
        // 배열 형태로 변환
        const result = [];
        for (let day = 0; day < 7; day++) {
            for (let hour = 0; hour < 24; hour++) {
                result.push({
                    day,
                    hour,
                    commits: heatmap[`${day}-${hour}`]
                });
            }
        }
        
        return result;
    }

    private findMostActiveWorkingHours(hourlyActivity: { [hour: string]: number }): { start: number; end: number; commits: number } {
        let maxCommits = 0;
        let bestStart = 9; // 기본값: 오전 9시
        
        // 연속된 8시간 중 가장 커밋이 많은 구간 찾기
        for (let start = 0; start < 24; start++) {
            let commits = 0;
            for (let i = 0; i < 8; i++) {
                const hour = (start + i) % 24;
                commits += hourlyActivity[hour.toString()] || 0;
            }
            
            if (commits > maxCommits) {
                maxCommits = commits;
                bestStart = start;
            }
        }
        
        return {
            start: bestStart,
            end: (bestStart + 7) % 24,
            commits: maxCommits
        };
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
}