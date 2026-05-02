import { CommitData, MetricsData } from './gitAnalyzer';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: BadgeCategory;
    rarity: BadgeRarity;
    criteria: BadgeCriteria;
    unlocked: boolean;
    unlockedAt?: Date;
    progress: number; // 0-100
    progressDescription: string;
}

export interface BadgeCriteria {
    type: 'count' | 'percentage' | 'streak' | 'pattern' | 'milestone' | 'ratio';
    threshold: number;
    field?: string; // 추가 필드 지정
    timeWindow?: number; // 일 단위
    conditions?: { [key: string]: any }; // 추가 조건
}

export interface BadgeProgress {
    current: number;
    required: number;
    unit: string;
    description: string;
}

export enum BadgeCategory {
    COMMIT_MASTER = 'commit_master',
    CODE_QUALITY = 'code_quality', 
    COLLABORATOR = 'collaborator',
    TIME_WARRIOR = 'time_warrior',
    MILESTONE = 'milestone',
    CONSISTENCY = 'consistency',
    EXPLORER = 'explorer'
}

export enum BadgeRarity {
    COMMON = 'common',
    UNCOMMON = 'uncommon', 
    RARE = 'rare',
    EPIC = 'epic',
    LEGENDARY = 'legendary'
}

export class BadgeSystem {
    private badges: Badge[] = [];

    constructor() {
        this.initializeBadges();
    }

    private initializeBadges(): void {
        this.badges = [
            // Commit Master 카테고리
            {
                id: 'commit_streak_7',
                name: '일주일 연속 커밋',
                description: '7일 연속으로 커밋한 개발자',
                icon: '🔥',
                category: BadgeCategory.COMMIT_MASTER,
                rarity: BadgeRarity.COMMON,
                criteria: { type: 'streak', threshold: 7 },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'commit_streak_30',
                name: '한 달 연속 커밋',
                description: '30일 연속으로 커밋한 진정한 개발자',
                icon: '🚀',
                category: BadgeCategory.COMMIT_MASTER,
                rarity: BadgeRarity.RARE,
                criteria: { type: 'streak', threshold: 30 },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'daily_committer',
                name: '매일 커밋러',
                description: '하루 평균 5개 이상의 커밋',
                icon: '📈',
                category: BadgeCategory.COMMIT_MASTER,
                rarity: BadgeRarity.UNCOMMON,
                criteria: { type: 'ratio', threshold: 5, field: 'daily_average' },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            
            // Code Quality 카테고리
            {
                id: 'small_commits',
                name: '깔끔한 커밋',
                description: '평균 3개 이하 파일을 수정하는 작고 집중된 커밋',
                icon: '🔧',
                category: BadgeCategory.CODE_QUALITY,
                rarity: BadgeRarity.UNCOMMON,
                criteria: { type: 'ratio', threshold: 3, field: 'files_per_commit' },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'descriptive_commits',
                name: '설명충',
                description: '90% 이상의 커밋에 의미있는 메시지 (10자 이상)',
                icon: '📝',
                category: BadgeCategory.CODE_QUALITY,
                rarity: BadgeRarity.UNCOMMON,
                criteria: { type: 'percentage', threshold: 90, field: 'meaningful_messages' },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            
            // Collaboration 카테고리
            {
                id: 'polyglot',
                name: '다언어 마스터',
                description: '5개 이상의 프로그래밍 언어를 사용',
                icon: '🤝',
                category: BadgeCategory.COLLABORATOR,
                rarity: BadgeRarity.RARE,
                criteria: { type: 'count', threshold: 5, field: 'programming_languages' },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'file_explorer',
                name: '파일 탐험가',
                description: '50개 이상의 서로 다른 파일을 수정',
                icon: '🗂️',
                category: BadgeCategory.EXPLORER,
                rarity: BadgeRarity.UNCOMMON,
                criteria: { type: 'count', threshold: 50, field: 'unique_files' },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            
            // Time Warrior 카테고리
            {
                id: 'early_bird',
                name: '얼리버드',
                description: '커밋의 30% 이상을 오전 6-9시에 진행',
                icon: '🌅',
                category: BadgeCategory.TIME_WARRIOR,
                rarity: BadgeRarity.UNCOMMON,
                criteria: { type: 'percentage', threshold: 30, field: 'morning_commits' },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'night_owl',
                name: '올빼미',
                description: '커밋의 30% 이상을 밤 10시-새벽 2시에 진행',
                icon: '🦉',
                category: BadgeCategory.TIME_WARRIOR,
                rarity: BadgeRarity.UNCOMMON,
                criteria: { type: 'percentage', threshold: 30, field: 'night_commits' },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'weekend_warrior',
                name: '주말 전사',
                description: '커밋의 25% 이상을 주말에 진행',
                icon: '⚔️',
                category: BadgeCategory.TIME_WARRIOR,
                rarity: BadgeRarity.UNCOMMON,
                criteria: { type: 'percentage', threshold: 25, field: 'weekend_commits' },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            
            // Milestone 카테고리
            {
                id: 'milestone_100',
                name: '백전백승',
                description: '100개의 커밋 달성',
                icon: '🏆',
                category: BadgeCategory.MILESTONE,
                rarity: BadgeRarity.UNCOMMON,
                criteria: { type: 'milestone', threshold: 100, field: 'total_commits' },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'milestone_500',
                name: '커밋 마스터',
                description: '500개의 커밋 달성',
                icon: '👑',
                category: BadgeCategory.MILESTONE,
                rarity: BadgeRarity.RARE,
                criteria: { type: 'milestone', threshold: 500, field: 'total_commits' },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'milestone_1000',
                name: '커밋 레전드',
                description: '1000개의 커밋 달성',
                icon: '⚡',
                category: BadgeCategory.MILESTONE,
                rarity: BadgeRarity.LEGENDARY,
                criteria: { type: 'milestone', threshold: 1000, field: 'total_commits' },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'file_milestone_100',
                name: '파일 헌터',
                description: '100개의 서로 다른 파일을 수정',
                icon: '📁',
                category: BadgeCategory.MILESTONE,
                rarity: BadgeRarity.UNCOMMON,
                criteria: { type: 'milestone', threshold: 100, field: 'unique_files' },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            
            // Consistency 카테고리
            {
                id: 'consistent_committer',
                name: '꾸준한 개발자',
                description: '30일 중 20일 이상 커밋',
                icon: '📊',
                category: BadgeCategory.CONSISTENCY,
                rarity: BadgeRarity.UNCOMMON,
                criteria: { type: 'ratio', threshold: 0.67, field: 'active_days_ratio' },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'balanced_developer',
                name: '균형잡힌 개발자',
                description: '5개 이상의 파일 타입에서 고르게 작업',
                icon: '⚖️',
                category: BadgeCategory.CONSISTENCY,
                rarity: BadgeRarity.RARE,
                criteria: { type: 'count', threshold: 5, field: 'balanced_file_types' },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'conventional_master',
                name: '커밋 규격 마스터',
                description: 'Conventional commit 70% 이상 준수',
                icon: '📐',
                category: BadgeCategory.CONSISTENCY,
                rarity: BadgeRarity.EPIC,
                criteria: { type: 'percentage', threshold: 70, field: 'conventional_percentage' },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'polyglot_expert',
                name: '폴리글랏 전문가',
                description: '10개 이상의 프로그래밍 언어로 작업',
                icon: '🌍',
                category: BadgeCategory.COLLABORATOR,
                rarity: BadgeRarity.EPIC,
                criteria: { type: 'count', threshold: 10, field: 'programming_languages' },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'code_marathon',
                name: '코드 마라토너',
                description: '60일 연속 커밋 달성',
                icon: '🏃',
                category: BadgeCategory.COMMIT_MASTER,
                rarity: BadgeRarity.EPIC,
                criteria: { type: 'streak', threshold: 60 },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            // ── New badges (v0.2.9) ──────────────────────────────────────────
            {
                id: 'hot_streak_14',
                name: '핫 스트릭',
                description: '14일 연속 커밋 달성',
                icon: '🔥',
                category: BadgeCategory.COMMIT_MASTER,
                rarity: BadgeRarity.UNCOMMON,
                criteria: { type: 'streak', threshold: 14 },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'hot_streak_50',
                name: '레전더리 스트릭',
                description: '50일 연속 커밋 달성',
                icon: '⚡',
                category: BadgeCategory.COMMIT_MASTER,
                rarity: BadgeRarity.LEGENDARY,
                criteria: { type: 'streak', threshold: 50 },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'doc_writer',
                name: '문서 작성자',
                description: '커밋의 20% 이상이 문서 파일 변경',
                icon: '📝',
                category: BadgeCategory.CODE_QUALITY,
                rarity: BadgeRarity.UNCOMMON,
                criteria: { type: 'percentage', threshold: 20 },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'test_champion',
                name: '테스트 챔피언',
                description: '커밋의 15% 이상이 테스트 파일 변경',
                icon: '✅',
                category: BadgeCategory.CODE_QUALITY,
                rarity: BadgeRarity.RARE,
                criteria: { type: 'percentage', threshold: 15 },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'refactor_hero',
                name: '리팩터 히어로',
                description: '삭제 라인이 추가 라인보다 많은 커밋이 30% 이상',
                icon: '♻️',
                category: BadgeCategory.CODE_QUALITY,
                rarity: BadgeRarity.RARE,
                criteria: { type: 'percentage', threshold: 30 },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'midnight_coder',
                name: '미드나이트 코더',
                description: '자정(00:00~03:59) 커밋이 10% 이상',
                icon: '🌙',
                category: BadgeCategory.CONSISTENCY,
                rarity: BadgeRarity.UNCOMMON,
                criteria: { type: 'percentage', threshold: 10 },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'speed_demon',
                name: '스피드 데몬',
                description: '하루 평균 3회 이상 커밋',
                icon: '💨',
                category: BadgeCategory.COMMIT_MASTER,
                rarity: BadgeRarity.UNCOMMON,
                criteria: { type: 'count', threshold: 3 },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'first_blood',
                name: '퍼스트 블러드',
                description: '오전 9시 이전 첫 커밋 비율 20% 이상',
                icon: '🌅',
                category: BadgeCategory.CONSISTENCY,
                rarity: BadgeRarity.COMMON,
                criteria: { type: 'percentage', threshold: 20 },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'release_maker',
                name: '릴리스 메이커',
                description: 'main/master 브랜치에 커밋 20개 이상',
                icon: '🚀',
                category: BadgeCategory.MILESTONE,
                rarity: BadgeRarity.RARE,
                criteria: { type: 'count', threshold: 20 },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'mono_focus',
                name: '모노 포커스',
                description: '단일 파일 타입에 80% 이상 집중',
                icon: '🎯',
                category: BadgeCategory.EXPLORER,
                rarity: BadgeRarity.COMMON,
                criteria: { type: 'percentage', threshold: 80 },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'code_reviewer',
                name: '코드 리뷰어',
                description: '3개 이하 파일 변경 커밋이 40% 이상 (리뷰 친화적 커밋 패턴)',
                icon: '👁️',
                category: BadgeCategory.COLLABORATOR,
                rarity: BadgeRarity.RARE,
                criteria: { type: 'percentage', threshold: 40 },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'velocity_king',
                name: '벨로시티 킹',
                description: '분석 기간 내 하루 평균 커밋 3개 이상 (고속 개발)',
                icon: '⚡',
                category: BadgeCategory.COMMIT_MASTER,
                rarity: BadgeRarity.RARE,
                criteria: { type: 'ratio', threshold: 30 },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'clean_coder',
                name: '클린 코더',
                description: '커밋당 평균 변경 라인 50줄 미만 & 커밋 20개 이상 (작고 깔끔한 커밋)',
                icon: '🧹',
                category: BadgeCategory.CODE_QUALITY,
                rarity: BadgeRarity.UNCOMMON,
                criteria: { type: 'count', threshold: 20 },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'deep_diver',
                name: '딥 다이버',
                description: '단일 파일에 50회 이상 커밋 (전문 집중)',
                icon: '🤿',
                category: BadgeCategory.EXPLORER,
                rarity: BadgeRarity.EPIC,
                criteria: { type: 'count', threshold: 50 },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'repo_guardian',
                name: '레포 가디언',
                description: '총 커밋 1000개 이상 달성',
                icon: '🛡️',
                category: BadgeCategory.MILESTONE,
                rarity: BadgeRarity.LEGENDARY,
                criteria: { type: 'count', threshold: 1000 },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            },
            {
                id: 'commit_365',
                name: '1년 개발자',
                description: '1년(365일) 이상 커밋 기록 보유',
                icon: '🗓️',
                category: BadgeCategory.MILESTONE,
                rarity: BadgeRarity.LEGENDARY,
                criteria: { type: 'count', threshold: 365 },
                unlocked: false,
                progress: 0,
                progressDescription: ''
            }
        ];
    }

    calculateBadges(metrics: MetricsData, commits: CommitData[], period: number = 30): Badge[] {
        const updatedBadges = this.badges.map(badge => {
            const progress = this.calculateBadgeProgress(badge, metrics, commits, period);
            const unlocked = progress.current >= progress.required;
            
            const result: Badge = {
                ...badge,
                unlocked,
                progress: Math.min(100, Math.round((progress.current / progress.required) * 100)),
                progressDescription: `${progress.current}/${progress.required} ${progress.unit}`
            };
            
            if (unlocked && !badge.unlocked) {
                result.unlockedAt = new Date();
            } else if (badge.unlockedAt) {
                result.unlockedAt = badge.unlockedAt;
            }
            
            return result;
        });

        // Update internal badges array
        this.badges = updatedBadges;
        return updatedBadges;
    }

    private calculateBadgeProgress(badge: Badge, metrics: MetricsData, commits: CommitData[], period: number): BadgeProgress {
        const { criteria } = badge;
        
        switch (badge.id) {
            case 'commit_streak_7':
            case 'commit_streak_30':
                return this.calculateStreakProgress(commits, criteria.threshold);
                
            case 'daily_committer':
                return this.calculateDailyAverageProgress(metrics, period, criteria.threshold);
                
            case 'small_commits':
                return this.calculateFilesPerCommitProgress(commits, criteria.threshold);
                
            case 'descriptive_commits':
                return this.calculateMeaningfulMessagesProgress(commits, criteria.threshold);
                
            case 'polyglot':
                return this.calculateProgrammingLanguagesProgress(metrics, criteria.threshold);
                
            case 'file_explorer':
            case 'file_milestone_100':
                return this.calculateUniqueFilesProgress(metrics, criteria.threshold);
                
            case 'early_bird':
                return this.calculateMorningCommitsProgress(metrics, criteria.threshold);
                
            case 'night_owl':
                return this.calculateNightCommitsProgress(metrics, criteria.threshold);
                
            case 'weekend_warrior':
                return this.calculateWeekendCommitsProgress(metrics, criteria.threshold);
                
            case 'milestone_100':
            case 'milestone_500':
            case 'milestone_1000':
                return this.calculateCommitMilestoneProgress(metrics, criteria.threshold);
                
            case 'consistent_committer':
                return this.calculateActiveDaysProgress(commits, period, criteria.threshold);
                
            case 'balanced_developer':
                return this.calculateBalancedFileTypesProgress(metrics, criteria.threshold);

            case 'conventional_master': {
                const convPct = metrics.conventionalCommits?.conventionalPercentage ?? 0;
                const eligible = metrics.totalCommits >= 20;
                return { current: eligible ? convPct : 0, required: 70, unit: '%', description: 'Conventional commit %' };
            }

            case 'polyglot_expert':
                return this.calculateProgrammingLanguagesProgress(metrics, 10);

            case 'code_marathon':
                return this.calculateStreakProgress(commits, 60);

            case 'hot_streak_14':
                return this.calculateStreakProgress(commits, 14);

            case 'hot_streak_50':
                return this.calculateStreakProgress(commits, 50);

            case 'doc_writer':
                return this.calculateDocCommitsProgress(commits, criteria.threshold);

            case 'test_champion':
                return this.calculateTestCommitsProgress(commits, criteria.threshold);

            case 'refactor_hero':
                return this.calculateRefactorCommitsProgress(commits, criteria.threshold);

            case 'midnight_coder':
                return this.calculateMidnightCommitsProgress(metrics, criteria.threshold);

            case 'speed_demon':
                return this.calculateDailyAverageProgress(metrics, period, criteria.threshold);

            case 'first_blood':
                return this.calculateEarlyMorningCommitsProgress(metrics, criteria.threshold);

            case 'release_maker':
                return this.calculateReleaseMakerProgress(metrics, criteria.threshold);

            case 'mono_focus':
                return this.calculateMonoFocusProgress(metrics, criteria.threshold);

            case 'code_reviewer':
                return this.calculateCodeReviewerProgress(commits, criteria.threshold);

            case 'velocity_king':
                return this.calculateVelocityKingProgress(metrics, commits, period);

            case 'clean_coder':
                return this.calculateCleanCoderProgress(metrics, commits);

            case 'deep_diver':
                return this.calculateDeepDiverProgress(metrics, criteria.threshold);

            case 'repo_guardian':
                return this.calculateRepoGuardianProgress(commits, criteria.threshold);

            case 'commit_365':
                return this.calculateCommit365Progress(commits, criteria.threshold);

            default:
                return { current: 0, required: criteria.threshold, unit: 'units', description: 'Unknown badge' };
        }
    }

    private calculateStreakProgress(commits: CommitData[], required: number): BadgeProgress {
        if (commits.length === 0) {
            return { current: 0, required, unit: 'days', description: 'Consecutive commit days' };
        }

        // 날짜별로 그룹화
        const commitDates = new Set<string>();
        commits.forEach(commit => {
            const dateKey = commit.date.toISOString().split('T')[0];
            commitDates.add(dateKey);
        });

        // 날짜 정렬
        const sortedDates = Array.from(commitDates).sort();
        
        // 최대 연속 일수 계산
        let maxStreak = 0;
        let currentStreak = 1;
        
        for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = new Date(sortedDates[i - 1]);
            const currentDate = new Date(sortedDates[i]);
            const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                currentStreak++;
            } else {
                maxStreak = Math.max(maxStreak, currentStreak);
                currentStreak = 1;
            }
        }
        
        maxStreak = Math.max(maxStreak, currentStreak);

        return {
            current: maxStreak,
            required,
            unit: 'days',
            description: 'Consecutive commit days'
        };
    }

    private calculateDailyAverageProgress(metrics: MetricsData, period: number, required: number): BadgeProgress {
        const dailyAverage = metrics.totalCommits / period;
        
        return {
            current: Math.round(dailyAverage * 10) / 10,
            required,
            unit: 'commits/day',
            description: 'Daily average commits'
        };
    }

    private calculateFilesPerCommitProgress(commits: CommitData[], required: number): BadgeProgress {
        if (commits.length === 0) {
            return { current: 0, required, unit: 'files/commit', description: 'Average files per commit' };
        }

        const totalFiles = commits.reduce((sum, commit) => sum + commit.files.length, 0);
        const averageFiles = totalFiles / commits.length;
        
        // 낮을수록 좋은 지표이므로, required보다 낮으면 달성
        const current = Math.round(averageFiles * 10) / 10;
        
        return {
            current,
            required,
            unit: 'files/commit',
            description: 'Average files per commit (lower is better)'
        };
    }

    private calculateMeaningfulMessagesProgress(commits: CommitData[], required: number): BadgeProgress {
        if (commits.length === 0) {
            return { current: 0, required, unit: '%', description: 'Commits with meaningful messages' };
        }

        const meaningfulCommits = commits.filter(commit => 
            commit.message.length >= 10 && 
            !commit.message.match(/^(fix|update|change|add|remove)$/i) &&
            !commit.message.match(/^(wip|temp|test|debug)$/i)
        ).length;
        
        const percentage = Math.round((meaningfulCommits / commits.length) * 100);
        
        return {
            current: percentage,
            required,
            unit: '%',
            description: 'Commits with meaningful messages'
        };
    }

    private calculateProgrammingLanguagesProgress(metrics: MetricsData, required: number): BadgeProgress {
        const languageCount = Object.keys(metrics.programmingLanguages).length;
        
        return {
            current: languageCount,
            required,
            unit: 'languages',
            description: 'Programming languages used'
        };
    }

    private calculateUniqueFilesProgress(metrics: MetricsData, required: number): BadgeProgress {
        const uniqueFiles = metrics.totalFiles;
        
        return {
            current: uniqueFiles,
            required,
            unit: 'files',
            description: 'Unique files modified'
        };
    }

    private calculateMorningCommitsProgress(metrics: MetricsData, required: number): BadgeProgress {
        const morningCommits = [6, 7, 8].reduce((sum, hour) => 
            sum + (metrics.timeAnalysis.hourlyActivity[hour.toString()] || 0), 0);
        const percentage = metrics.totalCommits > 0 ? 
            Math.round((morningCommits / metrics.totalCommits) * 100) : 0;
        
        return {
            current: percentage,
            required,
            unit: '%',
            description: 'Morning commits (6-9 AM)'
        };
    }

    private calculateNightCommitsProgress(metrics: MetricsData, required: number): BadgeProgress {
        const nightCommits = [22, 23, 0, 1].reduce((sum, hour) => 
            sum + (metrics.timeAnalysis.hourlyActivity[hour.toString()] || 0), 0);
        const percentage = metrics.totalCommits > 0 ? 
            Math.round((nightCommits / metrics.totalCommits) * 100) : 0;
        
        return {
            current: percentage,
            required,
            unit: '%',
            description: 'Night commits (10 PM - 2 AM)'
        };
    }

    private calculateWeekendCommitsProgress(metrics: MetricsData, required: number): BadgeProgress {
        const percentage = metrics.timeAnalysis.weekendPercentage;
        
        return {
            current: percentage,
            required,
            unit: '%',
            description: 'Weekend commits'
        };
    }

    private calculateCommitMilestoneProgress(metrics: MetricsData, required: number): BadgeProgress {
        return {
            current: metrics.totalCommits,
            required,
            unit: 'commits',
            description: 'Total commits'
        };
    }

    private calculateActiveDaysProgress(commits: CommitData[], period: number, required: number): BadgeProgress {
        const commitDates = new Set<string>();
        commits.forEach(commit => {
            const dateKey = commit.date.toISOString().split('T')[0];
            commitDates.add(dateKey);
        });
        
        const activeDays = commitDates.size;
        const ratio = activeDays / period;
        const percentage = Math.round(ratio * 100);
        
        return {
            current: percentage,
            required: Math.round(required * 100),
            unit: '%',
            description: 'Active days ratio'
        };
    }

    private calculateBalancedFileTypesProgress(metrics: MetricsData, required: number): BadgeProgress {
        // 5% 이상의 커밋을 가진 파일 타입들을 "균형잡힌" 것으로 간주
        const significantFileTypes = metrics.fileTypeStats.filter(stat => stat.percentage >= 5);
        
        return {
            current: significantFileTypes.length,
            required,
            unit: 'file types',
            description: 'File types with significant contribution'
        };
    }

    private calculateDocCommitsProgress(commits: CommitData[], required: number): BadgeProgress {
        if (commits.length === 0) {
            return { current: 0, required, unit: '%', description: 'Commits touching doc files' };
        }
        const docExtensions = /\.(md|txt|rst|adoc|wiki|pdf|docx?|tex)$/i;
        const docCommits = commits.filter(c =>
            c.files.some(f => docExtensions.test(f))
        ).length;
        const pct = Math.round((docCommits / commits.length) * 100);
        return { current: pct, required, unit: '%', description: 'Commits touching documentation files' };
    }

    private calculateTestCommitsProgress(commits: CommitData[], required: number): BadgeProgress {
        if (commits.length === 0) {
            return { current: 0, required, unit: '%', description: 'Commits touching test files' };
        }
        const testPattern = /(test|spec|__tests__|\.test\.|\.spec\.)/i;
        const testCommits = commits.filter(c =>
            c.files.some(f => testPattern.test(f))
        ).length;
        const pct = Math.round((testCommits / commits.length) * 100);
        return { current: pct, required, unit: '%', description: 'Commits touching test files' };
    }

    private calculateRefactorCommitsProgress(commits: CommitData[], required: number): BadgeProgress {
        if (commits.length === 0) {
            return { current: 0, required, unit: '%', description: 'Cleanup commits (deletions > insertions)' };
        }
        const cleanupCommits = commits.filter(c => (c.deletions || 0) > (c.insertions || 0)).length;
        const pct = Math.round((cleanupCommits / commits.length) * 100);
        return { current: pct, required, unit: '%', description: 'Cleanup commits (deletions > insertions)' };
    }

    private calculateMidnightCommitsProgress(metrics: MetricsData, required: number): BadgeProgress {
        const midnightHours = [0, 1, 2, 3];
        const midnightCommits = midnightHours.reduce((sum, h) =>
            sum + (metrics.timeAnalysis.hourlyActivity[h.toString()] || 0), 0);
        const pct = metrics.totalCommits > 0
            ? Math.round((midnightCommits / metrics.totalCommits) * 100) : 0;
        return { current: pct, required, unit: '%', description: 'Commits between midnight and 4 AM' };
    }

    private calculateEarlyMorningCommitsProgress(metrics: MetricsData, required: number): BadgeProgress {
        const earlyHours = [5, 6, 7, 8];
        const earlyCommits = earlyHours.reduce((sum, h) =>
            sum + (metrics.timeAnalysis.hourlyActivity[h.toString()] || 0), 0);
        const pct = metrics.totalCommits > 0
            ? Math.round((earlyCommits / metrics.totalCommits) * 100) : 0;
        return { current: pct, required, unit: '%', description: 'Commits before 9 AM' };
    }

    private calculateReleaseMakerProgress(metrics: MetricsData, required: number): BadgeProgress {
        return { current: metrics.totalCommits, required, unit: 'commits', description: 'Total commits (main/master branch)' };
    }

    private calculateMonoFocusProgress(metrics: MetricsData, required: number): BadgeProgress {
        if (metrics.fileTypeStats.length === 0) {
            return { current: 0, required, unit: '%', description: 'Dominant file type percentage' };
        }
        const maxPct = Math.max(...metrics.fileTypeStats.map(s => s.percentage));
        return { current: Math.round(maxPct), required, unit: '%', description: 'Dominant file type percentage' };
    }

    private calculateCodeReviewerProgress(commits: CommitData[], required: number): BadgeProgress {
        if (commits.length === 0) {
            return { current: 0, required, unit: '%', description: 'Small-scope commits (≤3 files)' };
        }
        const smallCommits = commits.filter(c => c.files.length <= 3).length;
        const pct = Math.round((smallCommits / commits.length) * 100);
        return { current: pct, required, unit: '%', description: 'Small-scope commits (≤3 files)' };
    }

    private calculateVelocityKingProgress(_metrics: MetricsData, commits: CommitData[], period: number): BadgeProgress {
        const required = 30; // ratio×10 threshold (3.0 avg/day)
        if (commits.length === 0 || period === 0) {
            return { current: 0, required, unit: 'avg×10', description: 'Daily average commits ×10' };
        }
        const dailyMap: { [date: string]: number } = {};
        for (const c of commits) {
            const d = c.date.toISOString().split('T')[0];
            dailyMap[d] = (dailyMap[d] || 0) + 1;
        }
        const activeDays = Object.keys(dailyMap).length;
        if (activeDays === 0) {
            return { current: 0, required, unit: 'avg×10', description: 'Daily average commits ×10' };
        }
        const avg = commits.length / activeDays;
        return { current: Math.round(avg * 10), required, unit: 'avg×10', description: `${avg.toFixed(1)} avg commits/active day` };
    }

    private calculateCleanCoderProgress(_metrics: MetricsData, commits: CommitData[]): BadgeProgress {
        const required = 50;
        if (commits.length < 20) {
            return { current: 0, required: 20, unit: 'commits', description: 'Need 20+ commits (clean small commits)' };
        }
        const totalChanges = commits.reduce((sum, c) => sum + (c.insertions || 0) + (c.deletions || 0), 0);
        const avgLines = Math.round(totalChanges / commits.length);
        // 50줄 미만이면 진행도 100 (달성), 초과면 낮은 진행도
        const current = avgLines < required ? commits.length : 0;
        return { current, required: commits.length, unit: 'commits', description: `Avg ${avgLines} lines/commit (need <50)` };
    }

    private calculateDeepDiverProgress(metrics: MetricsData, required: number): BadgeProgress {
        const fileCounts = Object.values(metrics.fileStats);
        const maxCount = fileCounts.length > 0 ? Math.max(...fileCounts) : 0;
        return { current: maxCount, required, unit: 'commits', description: 'Max commits to single file' };
    }

    private calculateRepoGuardianProgress(commits: CommitData[], required: number): BadgeProgress {
        return { current: commits.length, required, unit: 'commits', description: 'Total commits (all time in analysis window)' };
    }

    private calculateCommit365Progress(commits: CommitData[], required: number): BadgeProgress {
        if (commits.length === 0) {
            return { current: 0, required, unit: 'days', description: 'Days with commit history' };
        }
        const sortedDates = commits
            .map(c => c.date.toISOString().split('T')[0])
            .filter((v, i, a) => a.indexOf(v) === i)
            .sort();
        if (sortedDates.length < 2) {
            return { current: 0, required, unit: 'days', description: 'Days span of commit history' };
        }
        const first = new Date(sortedDates[0]);
        const last = new Date(sortedDates[sortedDates.length - 1]);
        const span = Math.round((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
        return { current: span, required, unit: 'days', description: 'Days span of commit history' };
    }

    // 배지 카테고리별 필터링
    getBadgesByCategory(category: BadgeCategory): Badge[] {
        return this.badges.filter(badge => badge.category === category);
    }

    // 언락된 배지만 반환
    getUnlockedBadges(): Badge[] {
        return this.badges.filter(badge => badge.unlocked);
    }

    // 진행중인 배지 반환 (언락되지 않았지만 진행도가 0이 아닌 배지들)
    getInProgressBadges(): Badge[] {
        return this.badges.filter(badge => !badge.unlocked && badge.progress > 0);
    }

    // 배지 통계
    getBadgeStats(): {
        total: number;
        unlocked: number;
        byRarity: { [key in BadgeRarity]: number };
        byCategory: { [key in BadgeCategory]: number };
    } {
        const stats = {
            total: this.badges.length,
            unlocked: this.badges.filter(b => b.unlocked).length,
            byRarity: {} as { [key in BadgeRarity]: number },
            byCategory: {} as { [key in BadgeCategory]: number }
        };

        // 희귀도별 통계
        Object.values(BadgeRarity).forEach(rarity => {
            stats.byRarity[rarity] = this.badges.filter(b => b.rarity === rarity && b.unlocked).length;
        });

        // 카테고리별 통계
        Object.values(BadgeCategory).forEach(category => {
            stats.byCategory[category] = this.badges.filter(b => b.category === category && b.unlocked).length;
        });

        return stats;
    }

    // 모든 배지 반환
    getAllBadges(): Badge[] {
        return [...this.badges];
    }
}