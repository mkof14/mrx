import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LOCALE, getLocaleMeta, isLocale, type Locale } from './languages';
import {
  NAV_STRUCTURE,
  PAGE_CHIP_KEYS,
  PAGE_TAB_MAP,
  translate,
  type TranslationKey
} from './translations';

const LOCALE_STORAGE_KEY = 'mrx_locale';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
  getPageMeta: (tabId: string) => { title: string; subtitle: string; icon: string; color: string };
  getPageChips: (tabId: string) => string[];
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved && isLocale(saved)) return saved;
    } catch {
      /* ignore */
    }
    return DEFAULT_LOCALE;
  });

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
  }, []);

  const meta = getLocaleMeta(locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = meta.dir;
  }, [locale, meta.dir]);

  const t = useCallback((key: TranslationKey) => translate(locale, key), [locale]);

  const getPageMeta = useCallback(
    (tabId: string) => {
      const page = PAGE_TAB_MAP[tabId];
      if (!page) {
        return {
          title: t('page.home.title'),
          subtitle: t('page.home.subtitle'),
          icon: '🏠',
          color: '#3b82f6'
        };
      }
      return {
        title: t(page.titleKey),
        subtitle: t(page.subtitleKey),
        icon: page.icon,
        color: page.color
      };
    },
    [t]
  );

  const getPageChips = useCallback(
    (tabId: string) => {
      const keys = PAGE_CHIP_KEYS[tabId];
      if (!keys) return [];
      return keys.map((k) => t(k));
    },
    [t]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, getPageMeta, getPageChips, dir: meta.dir }),
    [locale, setLocale, t, getPageMeta, getPageChips, meta.dir]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export { NAV_STRUCTURE };
