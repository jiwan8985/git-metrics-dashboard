/**
 * i18n 초기화 및 설정
 * 다국어 지원을 위한 i18next 설정
 */

import i18next from 'i18next';

// 번역 리소스
const resources = {
  en: {
    translation: require('./locales/en.json')
  },
  ko: {
    translation: require('./locales/ko.json')
  },
  ja: {
    translation: require('./locales/ja.json')
  },
  'zh-CN': {
    translation: require('./locales/zh-CN.json')
  }
};

/**
 * i18n 초기화
 * @param language 초기 언어 (기본값: 'en')
 */
export function initializeI18n(language: string = 'en'): void {
  if (i18next.isInitialized) {
    return;
  }

  i18next.init({
    resources,
    lng: language,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React는 XSS 방지를 기본적으로 수행
    },
    react: {
      useSuspense: false
    }
  });
}

/**
 * 언어 변경
 * @param language 변경할 언어
 */
export async function changeLanguage(language: string): Promise<void> {
  await i18next.changeLanguage(language);
}

/**
 * 현재 언어 조회
 */
export function getCurrentLanguage(): string {
  return i18next.language;
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
 * @param key 번역 키 (점 표기법 사용, 예: 'metrics.total_commits')
 * @param defaultValue 기본값
 */
export function t(key: string, defaultValue?: string): string {
  const result = i18next.t(key);
  if (result === key && defaultValue) {
    return defaultValue;
  }
  return result;
}

/**
 * 특정 네임스페이스의 번역 가져오기
 */
export function getNamespace(namespace: string): Record<string, any> {
  return i18next.getResourceBundle(i18next.language, 'translation')[namespace] || {};
}

export default i18next;
