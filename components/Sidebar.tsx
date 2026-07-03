import React from 'react';
import { NAV_STRUCTURE } from '../i18n/I18nContext';
import { useI18n } from '../i18n/I18nContext';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import MrxLogo from './MrxLogo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onLanguageChange?: (code: string) => void;
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  onLanguageChange,
  theme,
  toggleTheme
}) => {
  const { t } = useI18n();

  return (
    <aside
      className={`hidden lg:flex flex-col bg-mrx-sidebar dark:bg-mrx-sidebar-dark text-gray-600 dark:text-zinc-400 shrink-0 border-r border-mrx-line dark:border-mrx-line-dark shadow-mrx-sm dark:shadow-none transition-all duration-300 relative z-50 ${
        isCollapsed ? 'w-[4.5rem]' : 'w-64'
      }`}
    >
      <div className={`p-4 flex flex-col gap-3 ${isCollapsed ? 'items-center' : ''}`}>
        <div className={`flex items-center w-full ${isCollapsed ? 'justify-center' : 'justify-between gap-2'}`}>
          <div className={`flex items-center min-w-0 ${isCollapsed ? '' : 'gap-3'}`}>
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-10 h-10 bg-clinical-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0 hover:bg-clinical-500 transition-colors shadow-mrx-sm"
              aria-label="Toggle sidebar"
            >
              M
            </button>
            {!isCollapsed && <MrxLogo size="md" showIcon={false} className="flex-1" />}
          </div>
          {!isCollapsed && (
            <div className="flex items-center gap-1.5 shrink-0">
              {toggleTheme && theme && <ThemeToggle theme={theme} onToggle={toggleTheme} />}
              <LanguageSelector align="right" onChange={(code) => onLanguageChange?.(code)} />
            </div>
          )}
        </div>
        {isCollapsed && (
          <div className="flex flex-col items-center gap-2">
            {toggleTheme && theme && <ThemeToggle theme={theme} onToggle={toggleTheme} />}
            <LanguageSelector onChange={(code) => onLanguageChange?.(code)} />
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar pb-2">
        {NAV_STRUCTURE.filter((item) => !('action' in item)).map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              title={t(item.labelKey)}
              className={`w-full flex items-center rounded-xl transition-all py-3 ${
                isCollapsed ? 'justify-center px-0' : 'px-3 gap-3'
              } ${
                isActive
                  ? 'mrx-nav-active font-semibold'
                  : 'hover:bg-white/80 dark:hover:bg-mrx-inset-dark/70 text-gray-600 dark:text-zinc-400 hover:shadow-mrx-sm dark:hover:shadow-none'
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              {!isCollapsed && (
                <span className="font-semibold text-sm truncate">{t(item.labelKey)}</span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
