
import React, { useState, useEffect } from 'react';
import PageShell from './PageShell';
import PageCard from './PageCard';
import { useI18n } from '../i18n/I18nContext';
import type { TranslationKey } from '../i18n/translations';

interface LegalProps {
  initialSection?: string;
}

const Legal: React.FC<LegalProps> = ({ initialSection = 'privacy' }) => {
  const { t } = useI18n();
  const [activeSection, setActiveSection] = useState(initialSection);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  const sections = [
    { id: 'features', label: t('legal.nav.features'), icon: '✨' },
    { id: 'dashboard', label: t('legal.nav.dashboard'), icon: '🏠' },
    { id: 'reports', label: t('legal.nav.reports'), icon: '📋' },
    { id: 'safety', label: t('legal.nav.safety'), icon: '🛡️' },
    { id: 'privacy', label: t('legal.nav.privacy'), icon: '🔒' },
    { id: 'terms', label: t('legal.nav.terms'), icon: '📜' },
    { id: 'governance', label: t('legal.nav.governance'), icon: '⚕️' },
    { id: 'help', label: t('legal.nav.help'), icon: '❓' },
    { id: 'compliance', label: t('legal.nav.compliance'), icon: '⚖️' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'features':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('legal.nav.features')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 bg-mrx-inset dark:bg-mrx-inset-dark rounded-2xl border border-mrx-line dark:border-mrx-line-dark">
                <h4 className="text-lg font-bold text-blue-600 mb-2">{t('home.cap1')}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{t('home.cap1desc')}</p>
              </div>
              <div className="p-4 bg-mrx-inset dark:bg-mrx-inset-dark rounded-2xl border border-mrx-line dark:border-mrx-line-dark">
                <h4 className="text-lg font-bold text-emerald-600 mb-2">{t('page.checkin.title')}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{t('page.checkin.subtitle')}</p>
              </div>
              <div className="p-4 bg-mrx-inset dark:bg-mrx-inset-dark rounded-2xl border border-mrx-line dark:border-mrx-line-dark">
                <h4 className="text-lg font-bold text-purple-600 mb-2">{t('meds.scan')}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{t('page.meds.subtitle')}</p>
              </div>
              <div className="p-4 bg-mrx-inset dark:bg-mrx-inset-dark rounded-2xl border border-mrx-line dark:border-mrx-line-dark">
                <h4 className="text-lg font-bold text-rose-600 mb-2">{t('voice.title')}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{t('voice.subtitle')}</p>
              </div>
            </div>
          </div>
        );
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('legal.nav.dashboard')}</h2>
            <p className="text-base text-slate-500 leading-relaxed">{t('page.home.subtitle')}</p>
            <div className="p-10 bg-slate-900 rounded-3xl text-white">
              <h4 className="text-xl font-bold text-clinical-500 mb-4">{t('home.stability.title')}</h4>
              <p className="text-sm text-slate-300 leading-relaxed">{t('faq.q4a')}</p>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('legal.nav.reports')}</h2>
            <div className="p-10 bg-blue-600 rounded-3xl text-white space-y-4">
              <h4 className="text-2xl font-bold leading-snug">{t('page.reports.title')}</h4>
              <p className="text-sm text-blue-100 leading-relaxed">{t('page.reports.subtitle')}</p>
            </div>
            <ul className="space-y-4 text-slate-600 dark:text-slate-400 text-sm">
              <li>• {t('report.modMeds')}</li>
              <li>• {t('report.modSummary')}</li>
              <li>• {t('report.modSafety')}</li>
              <li>• {t('report.modTimeline')}</li>
            </ul>
          </div>
        );
      case 'safety':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('legal.nav.safety')}</h2>
            <div className="bg-rose-500/10 border border-rose-500/20 p-10 rounded-3xl space-y-4">
              <h4 className="text-xl font-bold text-rose-600">{t('page.safety.title')}</h4>
              <p className="text-sm text-rose-900 dark:text-rose-200 leading-relaxed">{t('page.safety.subtitle')}</p>
            </div>
            <p className="text-sm text-slate-500">{t('faq.q7a')}</p>
          </div>
        );
      case 'privacy':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('legal.nav.privacy')}</h2>
            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-6">
              <p>{t('page.legal.subtitle')}</p>
              <div className="space-y-4">
                <h4 className="text-slate-900 dark:text-white font-bold">{t('faq.q2q')}</h4>
                <p>{t('faq.q2a')}</p>
                <h4 className="text-slate-900 dark:text-white font-bold">{t('settings.exportTitle')}</h4>
                <p>{t('settings.exportDesc')}</p>
                <h4 className="text-slate-900 dark:text-white font-bold">{t('settings.deleteBtn')}</h4>
                <p>{t('faq.q8a')}</p>
              </div>
            </div>
          </div>
        );
      case 'terms':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('legal.nav.terms')}</h2>
            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-6">
              <p>{t('common.disclaimer')}</p>
              <div className="space-y-4">
                <h4 className="text-slate-900 dark:text-white font-bold">{t('faq.q3q')}</h4>
                <p>{t('faq.q3a')}</p>
                <h4 className="text-slate-900 dark:text-white font-bold">{t('profile.medHistory')}</h4>
                <p>{t('page.profile.subtitle')}</p>
              </div>
            </div>
          </div>
        );
      case 'governance':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('legal.nav.governance')}</h2>
            <div className="p-10 bg-slate-900 rounded-3xl text-white space-y-4">
               <p className="text-sm text-slate-300 leading-relaxed">{t('faq.q1a')}</p>
            </div>
          </div>
        );
      case 'help':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('legal.nav.help')}</h2>
            <div className="space-y-6">
              {(
                [
                  { q: 'faq.q5q' as TranslationKey, a: 'faq.q5a' as TranslationKey },
                  { q: 'faq.q6q' as TranslationKey, a: 'faq.q6a' as TranslationKey },
                  { q: 'faq.q8q' as TranslationKey, a: 'faq.q8a' as TranslationKey }
                ] as const
              ).map(({ q, a }, i) => (
                <div key={i} className="p-8 bg-mrx-inset dark:bg-mrx-inset-dark rounded-3xl border border-mrx-line dark:border-mrx-line-dark">
                   <h5 className="font-bold text-sm text-blue-600 mb-2">{t(q)}</h5>
                   <p className="text-sm text-slate-500">{t(a)}</p>
                </div>
              ))}
              <div className="p-10 border-2 border-dashed border-mrx-line dark:border-mrx-line-dark rounded-3xl text-center space-y-4">
                 <p className="text-sm text-slate-400">{t('faq.moreTitle')}</p>
                 <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-2xl font-semibold text-sm">{t('faq.contact')}</button>
              </div>
            </div>
          </div>
        );
      case 'compliance':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('legal.nav.compliance')}</h2>
            <div className="space-y-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>{t('footer.disclaimer')}</p>
              <div className="p-10 bg-mrx-inset dark:bg-mrx-inset-dark rounded-3xl border border-mrx-line dark:border-mrx-line-dark space-y-4">
                <h5 className="font-bold text-slate-900 dark:text-white">{t('diag.envTitle')}</h5>
                <ul className="space-y-2 text-sm">
                  <li>• {t('diag.testBtn')}</li>
                  <li>• JWT {t('settings.account')}</li>
                  <li>• {t('faq.q2a').slice(0, 80)}…</li>
                </ul>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <PageShell tabId="legal" narrow>
    <div className="flex flex-col lg:flex-row gap-8">
      <nav className="lg:w-64 shrink-0 flex flex-col gap-2">
        {sections.map(s => (
          <button 
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-3 p-4 rounded-2xl text-xs font-semibold transition-all ${activeSection === s.id ? 'bg-clinical-600 text-white shadow-mrx-sm' : 'hover:bg-mrx-inset dark:hover:bg-mrx-inset-dark text-gray-400'}`}
          >
            <span className="text-lg">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </nav>

      <PageCard className="flex-1 min-h-[500px]">
        {renderContent()}
      </PageCard>
    </div>
    </PageShell>
  );
};

export default Legal;
