import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import MrxLogo from './MrxLogo';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';

interface FooterProps {
  onOpenLegal?: (section?: string) => void;
  onOpenFAQ?: () => void;
  onLanguageChange?: (code: string) => void;
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
  isAuthenticated?: boolean;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

const Footer: React.FC<FooterProps> = ({
  onOpenLegal,
  onOpenFAQ,
  onLanguageChange,
  theme,
  toggleTheme,
  isAuthenticated = false,
  onSignIn,
  onSignOut
}) => {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="no-print mt-10 pb-20 lg:pb-12 px-4 sm:px-6 border-t border-mrx-line dark:border-mrx-line-dark bg-mrx-sidebar/70 dark:bg-mrx-sidebar-dark/70 backdrop-blur-md w-full relative z-30">
      <div className="max-w-7xl mx-auto pt-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <MrxLogo size="md" />
            <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed max-w-md">
              {t('footer.mission')}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('footer.navigation')}</h4>
            <nav className="flex flex-col gap-2">
              <button onClick={() => onOpenLegal?.('features')} className="text-xs font-semibold text-left text-gray-600 dark:text-zinc-300 hover:text-clinical-600 transition-colors">{t('footer.features')}</button>
              <button onClick={() => onOpenLegal?.('dashboard')} className="text-xs font-semibold text-left text-gray-600 dark:text-zinc-300 hover:text-clinical-600 transition-colors">{t('footer.overview')}</button>
              <button onClick={() => onOpenLegal?.('reports')} className="text-xs font-semibold text-left text-gray-600 dark:text-zinc-300 hover:text-clinical-600 transition-colors">{t('footer.doctor')}</button>
              <button onClick={() => onOpenLegal?.('safety')} className="text-xs font-semibold text-left text-gray-600 dark:text-zinc-300 hover:text-clinical-600 transition-colors">{t('footer.interactions')}</button>
              <button onClick={onOpenFAQ} className="text-xs font-semibold text-left text-gray-600 dark:text-zinc-300 hover:text-clinical-600 transition-colors">{t('footer.faq')}</button>
              {isAuthenticated && onSignOut ? (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="text-xs font-bold text-left text-rose-600 dark:text-rose-400 hover:text-rose-700 transition-colors mt-1"
                >
                  {t('nav.signOut')} →
                </button>
              ) : onSignIn ? (
                <button
                  type="button"
                  onClick={onSignIn}
                  className="text-xs font-bold text-left text-clinical-600 hover:text-clinical-700 transition-colors mt-1"
                >
                  {t('nav.signIn')} →
                </button>
              ) : null}
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('footer.compliance')}</h4>
            <nav className="flex flex-col gap-2">
              <button onClick={() => onOpenLegal?.('privacy')} className="text-xs font-semibold text-left text-gray-600 dark:text-zinc-300 hover:text-clinical-600 transition-colors">{t('footer.privacy')}</button>
              <button onClick={() => onOpenLegal?.('terms')} className="text-xs font-semibold text-left text-gray-600 dark:text-zinc-300 hover:text-clinical-600 transition-colors">{t('footer.terms')}</button>
              <button onClick={() => onOpenLegal?.('governance')} className="text-xs font-semibold text-left text-gray-600 dark:text-zinc-300 hover:text-clinical-600 transition-colors">{t('footer.governance')}</button>
              <button onClick={() => onOpenLegal?.('help')} className="text-xs font-semibold text-left text-gray-600 dark:text-zinc-300 hover:text-clinical-600 transition-colors">{t('footer.help')}</button>
              <button onClick={() => onOpenLegal?.('compliance')} className="text-xs font-semibold text-left text-gray-600 dark:text-zinc-300 hover:text-clinical-600 transition-colors">{t('footer.complianceLink')}</button>
            </nav>
          </div>
        </div>

        {/* Language + theme — above disclaimer so menu opens upward */}
        <div className="relative z-[400] flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-5 mrx-card dark:bg-mrx-panel-dark rounded-2xl">
          <p className="text-xs text-gray-500 dark:text-zinc-500">{t('common.language')} · {t('common.theme')}</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {toggleTheme && theme && <ThemeToggle theme={theme} onToggle={toggleTheme} />}
            <LanguageSelector align="right" dropup onChange={(code) => onLanguageChange?.(code)} />
            {isAuthenticated && onSignOut ? (
              <button
                type="button"
                onClick={onSignOut}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                {t('nav.signOut')}
              </button>
            ) : onSignIn ? (
              <button type="button" onClick={onSignIn} className="mrx-btn-rainbow px-4 py-2 text-xs">
                {t('nav.signIn')}
              </button>
            ) : null}
          </div>
        </div>

        <div className="p-4 mrx-card dark:bg-mrx-inset-dark rounded-2xl shadow-mrx-sm dark:shadow-none">
          <div className="flex flex-col md:flex-row gap-4 items-center text-center md:text-left">
            <div className="text-3xl">🚑</div>
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-rose-500 uppercase tracking-widest">{t('footer.disclaimerTitle')}</h5>
              <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">{t('footer.disclaimer')}</p>
            </div>
          </div>
        </div>

        <p className="text-[10px] font-medium text-gray-400 text-center">© {currentYear} {t('footer.copyright')}</p>
      </div>
    </footer>
  );
};

export default Footer;
