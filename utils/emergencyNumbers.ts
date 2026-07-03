import type { Locale } from '../i18n/languages';

export type EmergencyRegion = 'US' | 'EU' | 'RU' | 'UK' | 'IL' | 'CN' | 'DEFAULT';

const BY_REGION: Record<EmergencyRegion, { number: string; label: string }> = {
  US: { number: '911', label: '911' },
  EU: { number: '112', label: '112' },
  RU: { number: '103', label: '103 or 112' },
  UK: { number: '999', label: '999 or 112' },
  IL: { number: '101', label: '101' },
  CN: { number: '120', label: '120' },
  DEFAULT: { number: '112', label: '112' }
};

const LOCALE_REGION: Partial<Record<Locale, EmergencyRegion>> = {
  en: 'US',
  es: 'EU',
  de: 'EU',
  fr: 'EU',
  ru: 'RU',
  uk: 'UK',
  he: 'IL',
  zh: 'CN',
  ar: 'DEFAULT'
};

export function emergencyForLocale(locale: Locale, profileRegion?: EmergencyRegion | null) {
  const region = profileRegion || LOCALE_REGION[locale] || 'DEFAULT';
  return BY_REGION[region] || BY_REGION.DEFAULT;
}
