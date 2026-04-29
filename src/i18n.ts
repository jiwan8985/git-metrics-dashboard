/**
 * i18n 초기화 및 설정
 * 다국어 지원을 위한 경량 로컬 번역 모듈 (VS Code Extension)
 */

import * as vscode from 'vscode';
import enTranslation from './locales/en.json';
import koTranslation from './locales/ko.json';
import jaTranslation from './locales/ja.json';
import zhCNTranslation from './locales/zh-CN.json';

const resources: Record<string, Record<string, any>> = {
    en: enTranslation,
    ko: koTranslation,
    ja: jaTranslation,
    'zh-CN': zhCNTranslation
};

let currentLanguage = 'en';
let initialized = false;

/**
 * VS Code 설정에서 언어 결정
 * 우선순위: gitMetrics.language 설정 > VS Code UI 언어 > 영어(기본)
 */
function resolveLanguage(): string {
    const config = vscode.workspace.getConfiguration('gitMetrics');
    const langSetting = config.get<string>('language', 'auto');

    if (langSetting !== 'auto') {
        return langSetting;
    }

    // VS Code UI 언어 감지
    const vscodeLanguage = vscode.env.language;
    if (vscodeLanguage.startsWith('ko')) { return 'ko'; }
    if (vscodeLanguage.startsWith('ja')) { return 'ja'; }
    if (vscodeLanguage.startsWith('zh')) { return 'zh-CN'; }
    return 'en';
}

/**
 * i18n 초기화
 */
export function initializeI18n(): void {
    if (initialized) {
        return;
    }

    currentLanguage = resolveLanguage();
    initialized = true;
}

/**
 * 언어 변경 (설정 변경 시 호출)
 */
export async function changeLanguage(language: string): Promise<void> {
    currentLanguage = isValidLanguage(language) ? language : 'en';
}

/**
 * 현재 언어 조회
 */
export function getCurrentLanguage(): string {
    return currentLanguage;
}

/**
 * 지원하는 언어 목록
 */
export const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' }
];

/**
 * 언어 코드가 유효한지 확인
 */
export function isValidLanguage(language: string): boolean {
    return SUPPORTED_LANGUAGES.some(lang => lang.code === language);
}

/**
 * 번역 키 가져오기
 * @param key 번역 키 (점 표기법, 예: 'metrics.total_commits')
 * @param defaultValue 기본값
 */
export function t(key: string, defaultValue?: string): string {
    const localized = lookupTranslation(resources[currentLanguage], key);
    const fallback = lookupTranslation(resources.en, key);
    return localized ?? fallback ?? defaultValue ?? key;
}

function lookupTranslation(source: Record<string, any> | undefined, key: string): string | undefined {
    if (!source) { return undefined; }

    const value = key.split('.').reduce<any>((current, part) => {
        if (!current || typeof current !== 'object') { return undefined; }
        return current[part];
    }, source);

    return typeof value === 'string' ? value : undefined;
}
