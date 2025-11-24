/**
 * Dashboard 테마 및 스타일 정의
 * 다크/라이트 테마의 색상 정의를 중앙화하여 관리합니다.
 */

export interface ThemeColors {
    background: string;
    foreground: string;
    secondaryBackground: string;
    borderColor: string;
    primaryColor: string;
    successColor: string;
    warningColor: string;
    errorColor: string;
    accentColor: string;
}

/**
 * 라이트 테마 색상
 */
export const LIGHT_THEME: ThemeColors = {
    background: '#ffffff',
    foreground: '#24292e',
    secondaryBackground: '#f6f8fa',
    borderColor: '#e1e4e8',
    primaryColor: '#0366d6',
    successColor: '#28a745',
    warningColor: '#ffd33d',
    errorColor: '#d73a49',
    accentColor: '#6f42c1'
};

/**
 * 다크 테마 색상
 */
export const DARK_THEME: ThemeColors = {
    background: '#0d1117',
    foreground: '#c9d1d9',
    secondaryBackground: '#161b22',
    borderColor: '#30363d',
    primaryColor: '#58a6ff',
    successColor: '#3fb950',
    warningColor: '#d29922',
    errorColor: '#f85149',
    accentColor: '#bc8ef7'
};

/**
 * 프로그래밍 언어별 색상 팔레트
 */
export const LANGUAGE_COLORS: { [key: string]: string } = {
    // Web
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7a0b',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'SCSS': '#c6538c',
    'LESS': '#1d365d',
    'Vue': '#2c3e50',
    'React': '#00d8fc',
    'Angular': '#dd0031',
    'Svelte': '#ff3e00',

    // Backend
    'Python': '#3572A5',
    'Java': '#b07219',
    'Go': '#00ADD8',
    'Rust': '#CE422B',
    'PHP': '#777bb4',
    'C#': '#239120',
    'C++': '#f34b7d',
    'C': '#555555',
    'Ruby': '#701516',
    'Kotlin': '#F18E33',

    // Mobile
    'Swift': '#FA7343',
    'Objective-C': '#438eff',
    'Dart': '#00B4AB',

    // Other
    'Shell': '#89e051',
    'Bash': '#89e051',
    'PowerShell': '#012456',
    'Markdown': '#083fa1',
    'YAML': '#cb171e',
    'JSON': '#292929',
    'SQL': '#336791',
    'Dockerfile': '#384d54',
    'Terraform': '#623CE4',
    'Ansible': '#EE0000',

    // Default
    'Unknown': '#858585'
};

/**
 * 테마에 따른 차트 색상
 */
export function getChartColors(theme: 'light' | 'dark'): {
    primary: string[];
    background: string;
    text: string;
    gridColor: string;
} {
    const colors = theme === 'light' ? LIGHT_THEME : DARK_THEME;

    return {
        primary: [
            '#0366d6', '#6f42c1', '#28a745',
            '#ffd33d', '#f85149', '#fd7e14',
            '#17a2b8', '#20c997', '#6c757d'
        ],
        background: colors.background,
        text: colors.foreground,
        gridColor: colors.borderColor
    };
}

/**
 * 파일 타입별 아이콘
 */
export const FILE_TYPE_ICONS: { [key: string]: string } = {
    'js': '📜',
    'ts': '📘',
    'tsx': '⚛️',
    'jsx': '⚛️',
    'py': '🐍',
    'java': '☕',
    'cpp': '⚙️',
    'c': '⚙️',
    'go': '🐹',
    'rs': '🦀',
    'php': '🐘',
    'rb': '💎',
    'swift': '🍎',
    'kt': '🎯',
    'cs': '#️⃣',
    'html': '🌐',
    'css': '🎨',
    'json': '📋',
    'yaml': '⚙️',
    'xml': '📄',
    'md': '📝',
    'txt': '📄',
    'sh': '🔧',
    'bash': '🔧',
    'docker': '🐳',
    'unknown': '📁'
};

/**
 * 배지 레어도별 색상
 */
export const BADGE_RARITY_COLORS: { [key: string]: string } = {
    'COMMON': '#95a5a6',
    'UNCOMMON': '#27ae60',
    'RARE': '#3498db',
    'EPIC': '#9b59b6',
    'LEGENDARY': '#f39c12'
};

/**
 * 요일 이름 (한글)
 */
export const WEEKDAY_NAMES = [
    '일요일', '월요일', '화요일', '수요일',
    '목요일', '금요일', '토요일'
];

/**
 * 월 이름 (한글)
 */
export const MONTH_NAMES = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
];

/**
 * CSS 스타일 생성 함수
 */
export function generateCSS(colors: ThemeColors): string {
    return `
    :root {
        --bg-primary: ${colors.background};
        --bg-secondary: ${colors.secondaryBackground};
        --text-primary: ${colors.foreground};
        --text-secondary: ${colors.foreground}CC;
        --border-color: ${colors.borderColor};
        --primary-color: ${colors.primaryColor};
        --success-color: ${colors.successColor};
        --warning-color: ${colors.warningColor};
        --error-color: ${colors.errorColor};
        --accent-color: ${colors.accentColor};
    }

    body {
        background-color: var(--bg-primary);
        color: var(--text-primary);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
    }

    .card {
        background-color: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
    }

    .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid var(--border-color);
    }

    .stat-value {
        font-weight: bold;
        color: var(--primary-color);
        font-size: 18px;
    }

    .chart-container {
        background-color: var(--bg-secondary);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
    }

    button {
        background-color: var(--primary-color);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    }

    button:hover {
        opacity: 0.9;
    }

    .badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        margin-right: 8px;
        margin-bottom: 8px;
    }

    .badge.unlocked {
        background-color: var(--success-color);
        color: white;
    }

    .badge.in-progress {
        background-color: var(--warning-color);
        color: white;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 16px;
    }

    th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid var(--border-color);
    }

    th {
        background-color: var(--bg-secondary);
        font-weight: 600;
    }

    tr:hover {
        background-color: var(--bg-secondary);
    }
    `;
}

/**
 * 레벨별 색상 얻기
 */
export function getLevelColor(level: number, colors: ThemeColors): string {
    if (level >= 80) {return colors.errorColor;}  // 빨강 - 높음
    if (level >= 60) {return colors.warningColor;} // 주황 - 중간
    if (level >= 40) {return colors.primaryColor;} // 파랑 - 낮음
    return '#95a5a6'; // 회색 - 매우 낮음
}
