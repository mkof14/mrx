
import React, { useState } from 'react';
import { UserProfile, AIVoice, ELEVENLABS_VOICE_OPTIONS, normalizePreferredVoice } from '../types';
import PageShell from './PageShell';
import PageCard, { PageSectionTitle } from './PageCard';
import LanguageSelector from './LanguageSelector';
import { useI18n } from '../i18n/I18nContext';
import { api } from '../services/apiClient';
import { PageGuide, SettingRow } from './ui/PageGuide';
import PwaInstallCard from './PwaInstallCard';

interface SettingsProps {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  clearAllData: () => void;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ profile, setProfile, theme, toggleTheme, clearAllData, onLogout }) => {
  const { t } = useI18n();
  const voices: AIVoice[] = ELEVENLABS_VOICE_OPTIONS;
  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      const data = await api.data.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mrx-export-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setExportStatus(t('settings.exportOk'));
    } catch {
      setExportStatus(t('settings.exportFail'));
    }
  };

  return (
    <PageShell tabId="settings" narrow>
      <PageGuide icon="⚙️" title={t('page.settings.guideTitle')} text={t('page.settings.guideText')} className="mb-1" />

      <PwaInstallCard />

      <PageCard padding="md" className="space-y-1">
        <SettingRow icon="🌍" title={t('common.language')} desc={t('settings.languageDesc')}>
          <LanguageSelector onChange={(code) => setProfile({ ...profile, preferred_language: code })} />
        </SettingRow>
        <SettingRow icon="🌙" title={t('settings.darkMode')} desc={t('settings.darkModeDesc')}>
          <button
            onClick={toggleTheme}
            className="relative w-14 h-7 bg-slate-200 dark:bg-slate-800 rounded-full p-1 transition-all"
          >
            <div className={`w-5 h-5 bg-clinical-500 rounded-full shadow transition-transform ${theme === 'dark' ? 'translate-x-7' : ''}`} />
          </button>
        </SettingRow>
        <SettingRow icon="🎙️" title={t('settings.voiceSection')} desc={t('settings.voiceDesc')}>
          <select
            value={normalizePreferredVoice(profile.preferred_voice)}
            onChange={(e) => setProfile({ ...profile, preferred_voice: e.target.value as AIVoice })}
            className="mrx-input text-sm py-2"
          >
            {voices.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </SettingRow>
        <SettingRow icon="⏩" title={t('settings.speechSpeed')} desc={t('settings.speedDesc')}>
          <div className="flex flex-wrap gap-1">
            {speeds.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setProfile({ ...profile, speech_speed: s })}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border ${profile.speech_speed === s ? 'bg-clinical-600 border-clinical-600 text-white' : 'bg-mrx-inset dark:bg-mrx-inset-dark border-transparent text-gray-500'}`}
              >
                {s}x
              </button>
            ))}
          </div>
        </SettingRow>
      </PageCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <PageCard padding="sm" className="space-y-3">
          <PageSectionTitle>{t('tools.billingTitle')}</PageSectionTitle>
          <p className="text-xs text-slate-500">{t('tools.billingDesc')}</p>
          <p className="text-xs font-semibold">{profile.is_subscribed ? '✓ Active' : '— Not subscribed'}</p>
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await api.billing.checkout();
                if (res.url) window.location.href = res.url;
                else if (res.mock) {
                  const confirmed = await api.billing.confirmMock();
                  if (confirmed.profile) setProfile({ ...profile, ...(confirmed.profile as UserProfile) });
                }
              } catch {
                /* ignore */
              }
            }}
            className="mrx-btn-primary w-full text-sm py-2.5"
          >
            {t('tools.billingBtn')}
          </button>
        </PageCard>

        <PageCard padding="sm" className="space-y-3">
          <PageSectionTitle>{t('safety.emergencyNumber')}</PageSectionTitle>
          <p className="text-xs text-slate-500">{t('settings.emergencyDesc')}</p>
          <select
            value={profile.emergency_region || ''}
            onChange={(e) =>
              setProfile({
                ...profile,
                emergency_region: (e.target.value || null) as UserProfile['emergency_region']
              })
            }
            className="mrx-input text-sm"
          >
            <option value="">Auto (from language)</option>
            <option value="US">US — 911</option>
            <option value="EU">EU — 112</option>
            <option value="RU">RU — 103</option>
            <option value="UK">UK — 999</option>
            <option value="IL">IL — 101</option>
            <option value="CN">CN — 120</option>
          </select>
        </PageCard>

        <PageCard padding="sm" className="md:col-span-2 space-y-3">
          <PageSectionTitle>{t('settings.exportTitle')}</PageSectionTitle>
          <p className="text-xs text-slate-500">{t('settings.exportDesc')}</p>
          <button onClick={handleExport} className="mrx-btn-primary text-sm py-2.5 px-5">
            {t('settings.exportBtn')}
          </button>
          {exportStatus && <p className="text-xs text-gray-500">{exportStatus}</p>}
        </PageCard>

        <PageCard padding="sm" className="space-y-2">
          <PageSectionTitle>{t('settings.account')}</PageSectionTitle>
          <button onClick={onLogout} className="w-full py-3 rounded-xl bg-mrx-inset dark:bg-mrx-inset-dark text-sm font-semibold border border-mrx-line dark:border-mrx-line-dark hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all">{t('settings.logout')}</button>
          <button onClick={() => confirm(t('settings.deleteConfirm')) && clearAllData()} className="w-full py-3 rounded-xl bg-rose-500/10 text-rose-600 text-sm font-semibold border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all">{t('settings.deleteBtn')}</button>
        </PageCard>
      </div>
    </PageShell>
  );
};

export default Settings;
