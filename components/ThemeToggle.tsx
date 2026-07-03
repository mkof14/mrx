import React from 'react';
import { useI18n } from '../i18n/I18nContext';

interface Props {
  theme: 'light' | 'dark';
  onToggle: () => void;
  className?: string;
}

const ThemeToggle: React.FC<Props> = ({ theme, onToggle, className = '' }) => {
  const { t } = useI18n();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-10 h-10 rounded-xl mrx-card dark:bg-mrx-panel-dark flex items-center justify-center text-lg hover:ring-2 hover:ring-clinical-200 dark:hover:ring-clinical-800 transition-all shadow-mrx-sm dark:shadow-none ${className}`}
      aria-label={isDark ? t('common.themeLight') : t('common.themeDark')}
      title={isDark ? t('common.themeLight') : t('common.themeDark')}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};

export default ThemeToggle;
