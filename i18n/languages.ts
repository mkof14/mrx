export type Locale = 'en' | 'es' | 'de' | 'fr' | 'zh' | 'he' | 'ar' | 'uk' | 'ru';

export interface LocaleMeta {
  code: Locale;
  label: string;
  nativeLabel: string;
  flag: string;
  speechCode: string;
  dir: 'ltr' | 'rtl';
}

export const LOCALES: LocaleMeta[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇺🇸', speechCode: 'en-US', dir: 'ltr' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', flag: '🇪🇸', speechCode: 'es-ES', dir: 'ltr' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', flag: '🇩🇪', speechCode: 'de-DE', dir: 'ltr' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', flag: '🇫🇷', speechCode: 'fr-FR', dir: 'ltr' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文', flag: '🇨🇳', speechCode: 'zh-CN', dir: 'ltr' },
  { code: 'he', label: 'Hebrew', nativeLabel: 'עברית', flag: '🇮🇱', speechCode: 'he-IL', dir: 'rtl' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', flag: '🇸🇦', speechCode: 'ar-SA', dir: 'rtl' },
  { code: 'uk', label: 'Ukrainian', nativeLabel: 'Українська', flag: '🇺🇦', speechCode: 'uk-UA', dir: 'ltr' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский', flag: '🇷🇺', speechCode: 'ru-RU', dir: 'ltr' }
];

export const DEFAULT_LOCALE: Locale = 'en';

export function getLocaleMeta(code: Locale): LocaleMeta {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0];
}

export function isLocale(value: string): value is Locale {
  return LOCALES.some((l) => l.code === value);
}
