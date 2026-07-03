import React, { useState } from 'react';
import PageShell from './PageShell';
import PageCard from './PageCard';
import { useI18n } from '../i18n/I18nContext';
import RemindersPanel from './RemindersPanel';
import CaregiverInvitePanel from './CaregiverInvitePanel';
import PwaInstallCard from './PwaInstallCard';
import type { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  onNavigate: (tab: string) => void;
}

type Panel = null | 'reminders' | 'caregiver' | 'pwa';

const ToolsHub: React.FC<Props> = ({ profile, setProfile, onNavigate }) => {
  const { t } = useI18n();
  const [panel, setPanel] = useState<Panel>(null);

  const cards: {
    icon: string;
    titleKey: 'tools.card1Title' | 'tools.card2Title' | 'tools.card3Title' | 'tools.card4Title' | 'tools.card5Title' | 'tools.card6Title' | 'tools.card7Title' | 'tools.card8Title';
    descKey: 'tools.card1Desc' | 'tools.card2Desc' | 'tools.card3Desc' | 'tools.card4Desc' | 'tools.card5Desc' | 'tools.card6Desc' | 'tools.card7Desc' | 'tools.card8Desc';
    action: () => void;
    accent: string;
  }[] = [
    {
      icon: '🔔',
      titleKey: 'tools.card1Title',
      descKey: 'tools.card1Desc',
      action: () => setPanel('reminders'),
      accent: 'bg-amber-500/10 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200'
    },
    {
      icon: '📤',
      titleKey: 'tools.card2Title',
      descKey: 'tools.card2Desc',
      action: () => onNavigate('reports'),
      accent: 'bg-emerald-500/10 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200'
    },
    {
      icon: '👨‍👩‍👧',
      titleKey: 'tools.card3Title',
      descKey: 'tools.card3Desc',
      action: () => setPanel('caregiver'),
      accent: 'bg-violet-500/10 border-violet-200 dark:border-violet-900 text-violet-800 dark:text-violet-200'
    },
    {
      icon: '📷',
      titleKey: 'tools.card4Title',
      descKey: 'tools.card4Desc',
      action: () => {
        sessionStorage.setItem('mrx_med_input', 'barcode');
        onNavigate('meds');
      },
      accent: 'bg-blue-500/10 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200'
    },
    {
      icon: '🎙️',
      titleKey: 'tools.card5Title',
      descKey: 'tools.card5Desc',
      action: () => onNavigate('assistant'),
      accent: 'bg-indigo-500/10 border-indigo-200 dark:border-indigo-900 text-indigo-800 dark:text-indigo-200'
    },
    {
      icon: '📲',
      titleKey: 'tools.card6Title',
      descKey: 'tools.card6Desc',
      action: () => setPanel('pwa'),
      accent: 'bg-cyan-500/10 border-cyan-200 dark:border-cyan-900 text-cyan-800 dark:text-cyan-200'
    },
    {
      icon: '🆘',
      titleKey: 'tools.card7Title',
      descKey: 'tools.card7Desc',
      action: () => onNavigate('safety'),
      accent: 'bg-rose-500/10 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200'
    },
    {
      icon: '💳',
      titleKey: 'tools.card8Title',
      descKey: 'tools.card8Desc',
      action: () => onNavigate('settings'),
      accent: 'bg-slate-500/10 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
    }
  ];

  if (panel === 'reminders') {
    return (
      <PageShell tabId="tools" narrow>
        <button type="button" onClick={() => setPanel(null)} className="text-sm font-semibold text-clinical-600 mb-3">
          ← {t('common.back')}
        </button>
        <RemindersPanel />
      </PageShell>
    );
  }

  if (panel === 'caregiver') {
    return (
      <PageShell tabId="tools" narrow>
        <button type="button" onClick={() => setPanel(null)} className="text-sm font-semibold text-clinical-600 mb-3">
          ← {t('common.back')}
        </button>
        <CaregiverInvitePanel />
      </PageShell>
    );
  }

  if (panel === 'pwa') {
    return (
      <PageShell tabId="tools" narrow>
        <button type="button" onClick={() => setPanel(null)} className="text-sm font-semibold text-clinical-600 mb-3">
          ← {t('common.back')}
        </button>
        <PwaInstallCard />
      </PageShell>
    );
  }

  return (
    <PageShell tabId="tools">
      <PageCard padding="sm" className="bg-gradient-to-br from-clinical-500/10 via-transparent to-violet-500/10">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{t('tools.intro')}</p>
      </PageCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.map((card) => (
          <button
            key={card.titleKey}
            type="button"
            onClick={card.action}
            className={`text-left rounded-2xl border p-4 transition-all hover:scale-[1.01] hover:shadow-mrx-sm ${card.accent}`}
          >
            <span className="text-3xl block mb-2">{card.icon}</span>
            <h3 className="font-bold text-sm">{t(card.titleKey)}</h3>
            <p className="text-xs mt-1 opacity-80 leading-relaxed">{t(card.descKey)}</p>
          </button>
        ))}
      </div>

      <PageCard padding="sm" className="bg-mrx-inset dark:bg-mrx-inset-dark">
        <h3 className="text-sm font-bold mb-2">{t('tools.privacyTitle')}</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-3">{t('tools.privacyDesc')}</p>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(profile.ai_audit_consent)}
            onChange={(e) => setProfile({ ...profile, ai_audit_consent: e.target.checked })}
            className="w-4 h-4 rounded accent-clinical-600"
          />
          <span className="text-xs font-medium">{t('tools.auditConsent')}</span>
        </label>
      </PageCard>
    </PageShell>
  );
};

export default ToolsHub;
