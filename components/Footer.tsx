import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import type { TranslationKey } from '../i18n/keys';
import MrxLogo from './MrxLogo';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';

interface FooterProps {
  onOpenLegal?: (section?: string) => void;
  onOpenFAQ?: () => void;
  onLanguageChange?: (code: string) => void;
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
  onOpenAdmin?: () => void;
}

type NavItem = {
  icon: string;
  labelKey: TranslationKey;
  onClick: () => void;
  accent?: string;
};

const Footer: React.FC<FooterProps> = ({
  onOpenLegal,
  onOpenFAQ,
  onLanguageChange,
  theme,
  toggleTheme,
  onOpenAdmin
}) => {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  const highlights = [
    { icon: '💊', titleKey: 'footer.highlight1Title' as TranslationKey, textKey: 'footer.highlight1Text' as TranslationKey, color: 'from-clinical-500/20 to-clinical-600/5 border-clinical-400/30' },
    { icon: '🔍', titleKey: 'footer.highlight2Title' as TranslationKey, textKey: 'footer.highlight2Text' as TranslationKey, color: 'from-emerald-500/20 to-emerald-600/5 border-emerald-400/30' },
    { icon: '📋', titleKey: 'footer.highlight3Title' as TranslationKey, textKey: 'footer.highlight3Text' as TranslationKey, color: 'from-violet-500/20 to-violet-600/5 border-violet-400/30' }
  ];

  const sectionLinks: NavItem[] = [
    { icon: '🏠', labelKey: 'footer.overview', onClick: () => onOpenLegal?.('dashboard') },
    { icon: '📋', labelKey: 'footer.doctor', onClick: () => onOpenLegal?.('reports') },
    { icon: '⚠️', labelKey: 'footer.interactions', onClick: () => onOpenLegal?.('safety') },
    { icon: '❓', labelKey: 'footer.faq', onClick: () => onOpenFAQ?.() }
  ];

  if (onOpenAdmin) {
    sectionLinks.push({
      icon: '🛡️',
      labelKey: 'nav.admin',
      onClick: onOpenAdmin,
      accent: 'text-clinical-600 dark:text-clinical-400'
    });
  }

  const legalLinks: NavItem[] = [
    { icon: '🔒', labelKey: 'footer.privacy', onClick: () => onOpenLegal?.('privacy') },
    { icon: '📜', labelKey: 'footer.terms', onClick: () => onOpenLegal?.('terms') },
    { icon: '⚖️', labelKey: 'footer.governance', onClick: () => onOpenLegal?.('governance') },
    { icon: '💬', labelKey: 'footer.help', onClick: () => onOpenLegal?.('help') },
    { icon: '✅', labelKey: 'footer.complianceLink', onClick: () => onOpenLegal?.('compliance') }
  ];

  return (
    <footer className="no-print mt-10 pb-20 lg:pb-12 px-4 sm:px-6 border-t border-mrx-line dark:border-mrx-line-dark relative z-30 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-mrx-sidebar/90 via-mrx-canvas/80 to-mrx-sidebar/90 dark:from-mrx-sidebar-dark/95 dark:via-mrx-canvas-dark/90 dark:to-mrx-sidebar-dark/95 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-clinical-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-500/8 blur-[90px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto pt-10 space-y-8 relative">
        {/* Brand + corporate copy */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 space-y-4">
            <MrxLogo size="md" />
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-zinc-50 leading-snug max-w-xl">
              {t('footer.tagline')}
            </p>
            <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
              {t('footer.about')}
            </p>
            <p className="text-xs font-medium text-clinical-700 dark:text-clinical-300 bg-clinical-500/10 border border-clinical-400/25 rounded-xl px-4 py-2.5 inline-block">
              {t('footer.madeFor')}
            </p>
          </div>

          <div className="lg:col-span-2 mrx-card dark:bg-mrx-panel-dark rounded-2xl p-5 border border-mrx-line dark:border-mrx-line-dark shadow-mrx-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{t('footer.contactLabel')}</p>
            <a
              href={`mailto:${t('footer.contactEmail')}`}
              className="text-sm font-bold text-clinical-600 dark:text-clinical-400 hover:underline"
            >
              {t('footer.contactEmail')}
            </a>
            <p className="text-xs text-gray-500 dark:text-zinc-500 mt-2 leading-relaxed">{t('footer.contactNote')}</p>
          </div>
        </div>

        {/* Highlight cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {highlights.map(({ icon, titleKey, textKey, color }) => (
            <div
              key={titleKey}
              className={`rounded-2xl border bg-gradient-to-br ${color} p-4 flex gap-3 items-start backdrop-blur-sm`}
            >
              <span className="text-2xl leading-none shrink-0">{icon}</span>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-zinc-100">{t(titleKey)}</p>
                <p className="text-xs text-gray-600 dark:text-zinc-400 mt-0.5 leading-relaxed">{t(textKey)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="mrx-card dark:bg-mrx-panel-dark rounded-2xl p-5 border border-mrx-line dark:border-mrx-line-dark">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span>📂</span> {t('footer.navigation')}
            </h4>
            <nav className="grid grid-cols-1 gap-1">
              {sectionLinks.map(({ icon, labelKey, onClick, accent }) => (
                <button
                  key={labelKey}
                  type="button"
                  onClick={onClick}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all hover:bg-white/70 dark:hover:bg-white/5 hover:translate-x-0.5 ${
                    accent || 'text-gray-700 dark:text-zinc-300 hover:text-clinical-600'
                  }`}
                >
                  <span className="text-base leading-none">{icon}</span>
                  {t(labelKey)}
                </button>
              ))}
            </nav>
          </div>

          <div className="mrx-card dark:bg-mrx-panel-dark rounded-2xl p-5 border border-mrx-line dark:border-mrx-line-dark">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span>⚖️</span> {t('footer.compliance')}
            </h4>
            <nav className="grid grid-cols-1 gap-1">
              {legalLinks.map(({ icon, labelKey, onClick }) => (
                <button
                  key={labelKey}
                  type="button"
                  onClick={onClick}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-gray-700 dark:text-zinc-300 hover:bg-white/70 dark:hover:bg-white/5 hover:text-clinical-600 hover:translate-x-0.5 transition-all"
                >
                  <span className="text-base leading-none">{icon}</span>
                  {t(labelKey)}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Language + theme */}
        <div className="relative z-[400] flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-5 mrx-card dark:bg-mrx-panel-dark rounded-2xl border border-mrx-line dark:border-mrx-line-dark">
          <p className="text-xs text-gray-500 dark:text-zinc-500">{t('common.language')} · {t('common.theme')}</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {toggleTheme && theme && <ThemeToggle theme={theme} onToggle={toggleTheme} />}
            <LanguageSelector align="right" dropup onChange={(code) => onLanguageChange?.(code)} />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-5 mrx-card dark:bg-mrx-inset-dark rounded-2xl border border-rose-200/40 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 shadow-mrx-sm dark:shadow-none">
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="w-11 h-11 rounded-xl bg-rose-500/15 flex items-center justify-center text-2xl shrink-0">🚑</div>
            <div className="space-y-1.5">
              <h5 className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">{t('footer.disclaimerTitle')}</h5>
              <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed">{t('footer.disclaimer')}</p>
            </div>
          </div>
        </div>

        <div className="text-center space-y-1 pb-2">
          <p className="text-[10px] font-medium text-gray-400">
            © {currentYear} {t('footer.copyright')}. {t('footer.legalNote')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
