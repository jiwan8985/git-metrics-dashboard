/**
 * Dashboard 데이터 포맷팅에서 쓰이는 정적 참조 테이블
 * (실제 렌더링 CSS는 dashboardProvider.ts / reportGenerator.ts에 각각 인라인되어 있음)
 */

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
 * 요일 이름 (한글)
 */
export const WEEKDAY_NAMES = [
    '일요일', '월요일', '화요일', '수요일',
    '목요일', '금요일', '토요일'
];

