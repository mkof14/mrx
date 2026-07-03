
import React from 'react';
import { NAV_STRUCTURE } from '../i18n/I18nContext';
import { useI18n } from '../i18n/I18nContext';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin?: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, isAdmin = false }) => {
  const { t } = useI18n();
  const items = NAV_STRUCTURE.filter((item) => {
    if (!item.mobile || 'action' in item) return false;
    if ('adminOnly' in item && item.adminOnly && !isAdmin) return false;
    return true;
  });

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-mrx-panel/98 dark:bg-mrx-sidebar-dark/95 backdrop-blur-md border-t border-mrx-line dark:border-mrx-line-dark shadow-mrx-lg dark:shadow-none flex justify-around items-center h-[4.25rem] px-1 z-50">
      {items.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors rounded-xl mx-0.5 ${
              isActive
                ? 'text-clinical-600 dark:text-clinical-500 bg-clinical-50 dark:bg-transparent shadow-mrx-sm dark:shadow-none'
                : 'text-gray-500 dark:text-zinc-500'
            }`}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="text-[10px] font-semibold">{t(item.shortKey)}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
