import React from 'react';
import { UserProfile } from '../types';
import { useI18n } from '../i18n/I18nContext';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  profile: UserProfile;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isSyncing?: boolean;
  saveError?: string | null;
  activeTab?: string;
}

const Header: React.FC<HeaderProps> = ({ profile, theme, toggleTheme, isSyncing, saveError, activeTab = 'home' }) => {
  const { t, getPageMeta } = useI18n();
  const page = getPageMeta(activeTab);

  return (
    <header className="sticky top-0 z-40 bg-mrx-panel/92 dark:bg-mrx-sidebar-dark/90 backdrop-blur-md border-b border-mrx-line dark:border-mrx-line-dark shadow-mrx-sm dark:shadow-none h-16 md:h-[4.5rem] flex items-center justify-between px-4 md:px-8 shrink-0">
      <div className="min-w-0">
        <h1 className="text-base md:text-lg font-bold text-gray-900 dark:text-zinc-100 tracking-tight truncate">
          {page.title}
        </h1>
        <p className="text-[11px] text-clinical-600 dark:text-zinc-500 truncate">
          {isSyncing ? t('common.saving') : saveError ? t('common.saveError') : page.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <div className="lg:hidden flex items-center gap-1.5">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <LanguageSelector align="right" />
        </div>

        <div className="hidden sm:block text-right pl-3 border-l border-mrx-line dark:border-mrx-line-dark">
          <div className="text-sm font-semibold text-gray-900 dark:text-zinc-100 leading-tight truncate max-w-[140px]">
            {profile.name || profile.email.split('@')[0]}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-zinc-500">
            {profile.age_years ? `${profile.age_years} ${t('common.years')}` : t('common.activeProfile')}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
