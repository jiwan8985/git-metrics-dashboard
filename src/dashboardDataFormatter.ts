/**
 * Dashboard 데이터 포맷팅 및 변환
 * 메트릭 데이터를 UI 표시용으로 변환합니다.
 */

import { MetricsData } from './gitAnalyzer';
import { FILE_TYPE_ICONS, LANGUAGE_COLORS, WEEKDAY_NAMES } from './dashboardStyles';

/**
 * 일일 커밋 데이터 준비
 */
export function prepareDailyCommitsData(
    dailyCommits: { [date: string]: number },
    days: number
): { labels: string[]; datasets: any[] } {
    const labels: string[] = [];
    const values: number[] = [];

    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const count = dailyCommits[dateStr] || 0;

        labels.push(dateStr.split('-')[2]); // 일만 표시
        values.push(count);
    }

    return {
        labels,
        datasets: [{
            label: '일일 커밋 수',
            data: values,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            tension: 0.1
        }]
    };
}

/**
 * 파일 통계 데이터 준비
 */
export function prepareFileStatsData(
    fileStats: { [file: string]: number }
): { labels: string[]; datasets: any[] } {
    const sortedFiles = Object.entries(fileStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    const labels = sortedFiles.map(([file]) => {
        const parts = file.split('.');
        return parts[parts.length - 1] || 'unknown';
    });

    const data = sortedFiles.map(([, count]) => count);

    return {
        labels,
        datasets: [{
            label: '파일별 커밋 수',
            data,
            backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 206, 86)',
                'rgb(75, 192, 192)',
                'rgb(153, 102, 255)',
                'rgb(255, 159, 64)',
                'rgb(199, 199, 199)',
                'rgb(83, 102, 255)',
                'rgb(255, 99, 255)',
                'rgb(99, 255, 132)'
            ]
        }]
    };
}

/**
 * 작성자 통계 데이터 준비
 */
export function prepareAuthorStatsData(authorStats: any[]): {
    labels: string[];
    datasets: any[];
} {
    const labels = authorStats.map(author => author.name);
    const commits = authorStats.map(author => author.commits);

    return {
        labels,
        datasets: [{
            label: '커밋 수',
            data: commits,
            backgroundColor: 'rgb(75, 192, 192)',
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1
        }]
    };
}

/**
 * 프로그래밍 언어 데이터 준비
 */
export function prepareLanguageData(
    programmingLanguages: { [lang: string]: number }
): { labels: string[]; datasets: any[] } {
    const sortedLangs = Object.entries(programmingLanguages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 15);

    const labels = sortedLangs.map(([lang]) => lang);
    const data = sortedLangs.map(([, count]) => count);

    const colors = labels.map(lang => LANGUAGE_COLORS[lang] || '#858585');

    return {
        labels,
        datasets: [{
            label: '언어별 커밋 수',
            data,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1
        }]
    };
}

/**
 * 파일 타입 카테고리 데이터 준비
 */
export function prepareCategoryData(fileTypeStats: any[]): {
    labels: string[];
    datasets: any[];
} {
    const categoryMap: { [key: string]: number } = {};

    fileTypeStats.forEach(stat => {
        categoryMap[stat.category] = (categoryMap[stat.category] || 0) + stat.commits;
    });

    const labels = Object.keys(categoryMap);
    const data = Object.values(categoryMap);

    const categoryColors: { [key: string]: string } = {
        'Frontend': '#61dafb',
        'Backend': '#3776ab',
        'Mobile': '#fa7343',
        'Data Science': '#ffd700',
        'DevOps': '#326ce5',
        'Documentation': '#083fa1',
        'Other': '#858585'
    };

    const colors = labels.map(cat => categoryColors[cat] || '#858585');

    return {
        labels,
        datasets: [{
            label: '카테고리별 커밋 수',
            data,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1
        }]
    };
}

/**
 * 시간대별 활동 데이터 준비
 */
export function prepareHourlyActivityData(hourlyActivity: { [hour: string]: number }): {
    labels: string[];
    datasets: any[];
} {
    const labels = Array.from({ length: 24 }, (_, i) => `${i}시`);
    const data = labels.map(hour => {
        const key = hour.replace('시', '');
        return hourlyActivity[key] || 0;
    });

    return {
        labels,
        datasets: [{
            label: '시간별 커밋 수',
            data,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            tension: 0.1
        }]
    };
}

/**
 * 요일별 활동 데이터 준비
 */
export function prepareWeeklyActivityData(weeklyActivity: { [day: string]: number }): {
    labels: string[];
    datasets: any[];
} {
    const labels = WEEKDAY_NAMES;
    const dayMap: { [key: string]: number } = {
        '월요일': 0, '화요일': 0, '수요일': 0, '목요일': 0,
        '금요일': 0, '토요일': 0, '일요일': 0
    };

    Object.entries(weeklyActivity).forEach(([day, count]) => {
        if (dayMap.hasOwnProperty(day)) {
            dayMap[day] = count;
        }
    });

    const data = labels.map(day => dayMap[day]);

    return {
        labels,
        datasets: [{
            label: '요일별 커밋 수',
            data,
            backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
                'rgba(255, 159, 64, 0.5)',
                'rgba(199, 199, 199, 0.5)'
            ],
            borderColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 206, 86)',
                'rgb(75, 192, 192)',
                'rgb(153, 102, 255)',
                'rgb(255, 159, 64)',
                'rgb(199, 199, 199)'
            ],
            borderWidth: 1
        }]
    };
}

/**
 * 숫자를 시간 형식으로 변환
 */
export function formatTime(hours: number): string {
    if (hours >= 24) {
        return `${Math.floor(hours / 24)}일 ${hours % 24}시간`;
    }
    return `${hours}시간`;
}

/**
 * 숫자를 단위와 함께 포맷팅
 */
export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * 백분율 포맷팅
 */
export function formatPercent(value: number, total: number): string {
    if (total === 0) {return '0%';}
    return ((value / total) * 100).toFixed(1) + '%';
}

/**
 * 날짜 포맷팅
 */
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
}

/**
 * 파일 타입 아이콘 얻기
 */
export function getFileIcon(extension: string): string {
    const ext = extension.toLowerCase().replace('.', '');
    return FILE_TYPE_ICONS[ext] || FILE_TYPE_ICONS['unknown'];
}

/**
 * 언어 색상 얻기
 */
export function getLanguageColor(language: string): string {
    return LANGUAGE_COLORS[language] || LANGUAGE_COLORS['Unknown'];
}

/**
 * 데이터 검증
 */
export function validateMetricsData(metrics: MetricsData): boolean {
    return (
        metrics &&
        typeof metrics.totalCommits === 'number' &&
        typeof metrics.totalFiles === 'number' &&
        Array.isArray(metrics.authorStats) &&
        Array.isArray(metrics.fileTypeStats) &&
        metrics.timeAnalysis &&
        typeof metrics.timeAnalysis.peakHour === 'string'
    );
}
