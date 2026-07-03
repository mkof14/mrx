
import React, { useMemo, useState } from 'react';
import { SymptomEntry, Medication, UserProfile } from '../types';
import { COLOR_MAP } from '../constants';
import { buildSafetyAlerts, hasEmergencyAlert } from '../utils/safety';
import { emergencyForLocale } from '../utils/emergencyNumbers';
import PageShell from './PageShell';
import PageCard, { PageSectionTitle } from './PageCard';
import { useI18n } from '../i18n/I18nContext';
import { EmptyState, SectionLabel, StatPill } from './ui/MrxUI';

interface Props {
  checkins: SymptomEntry[];
  medications: Medication[];
  analysisResult?: any;
  stabilityIndex?: number;
  profile?: UserProfile;
}

const SafetyCenter: React.FC<Props> = ({ checkins, medications, analysisResult, stabilityIndex = 1, profile }) => {
  const { t, locale } = useI18n();
  const [showEmergencyOverlay, setShowEmergencyOverlay] = useState(false);

  const emergency = useMemo(
    () => emergencyForLocale(locale, profile?.emergency_region),
    [locale, profile?.emergency_region]
  );

  const alerts = useMemo(
    () => buildSafetyAlerts(checkins, medications, analysisResult, stabilityIndex),
    [checkins, medications, analysisResult, stabilityIndex]
  );

  const urgentCount = alerts.filter((a) => a.sev === 'URGENT' || a.sev === 'EMERGENCY').length;
  const hasEmergency = hasEmergencyAlert(alerts);

  return (
    <PageShell tabId="safety">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <StatPill label={t('home.dashboard.warnings')} value={alerts.length || t('home.dashboard.none')} color={alerts.length ? '#ef4444' : '#10b981'} />
        <StatPill label={t('home.dashboard.meds')} value={medications.length} color="#3b82f6" />
        <StatPill label={t('home.dashboard.interactions')} value={analysisResult?.verified_interaction_count ?? 0} color="#f59e0b" />
        {urgentCount > 0 && <StatPill label={t('safety.emergencyTitle')} value={urgentCount} color="#dc2626" />}
      </div>

      {hasEmergency && (
        <PageCard padding="sm" className="bg-rose-600 text-white border-rose-500">
          <PageSectionTitle className="text-white mb-3">{t('safety.alert')}</PageSectionTitle>
          <button type="button" onClick={() => setShowEmergencyOverlay(true)} className="w-full bg-white text-rose-600 py-3 rounded-xl font-semibold text-sm">
            {t('safety.emergencyTitle')}
          </button>
        </PageCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <SectionLabel>{t('page.safety.title')}</SectionLabel>
          {alerts.length === 0 ? (
            <EmptyState icon="🛡️" title={t('safety.allClear')} description={t('page.safety.subtitle')} />
          ) : (
            alerts.map((alert) => (
              <PageCard key={alert.id} padding="sm" className={`border-2 ${COLOR_MAP[alert.color]} border-current/20`}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-semibold opacity-70 uppercase">{alert.type}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5">{alert.sev}</span>
                </div>
                <p className="text-sm font-semibold leading-relaxed">{alert.text}</p>
                {alert.action && <p className="text-xs text-slate-500 mt-2">{alert.action}</p>}
              </PageCard>
            ))
          )}
        </div>

        <PageCard padding="sm" className="bg-mrx-inset/50 dark:bg-mrx-inset-dark/50 h-fit space-y-4">
          <PageSectionTitle className="mb-2">{t('footer.disclaimerTitle')}</PageSectionTitle>
          <p className="text-xs text-slate-500 leading-relaxed">{t('footer.disclaimer')}</p>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-500/5 p-4">
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-300 mb-2">{t('safety.emergencyNumber')}</p>
            <p className="text-2xl font-black text-rose-600 tabular-nums">{emergency.label}</p>
            <a
              href={`tel:${emergency.number}`}
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-rose-600 text-white py-3 text-sm font-bold"
            >
              {t('tools.emergencyCall')} ({emergency.number})
            </a>
          </div>
        </PageCard>
      </div>

      {showEmergencyOverlay && (
        <div className="fixed inset-0 z-[2000] bg-rose-700 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">{t('safety.emergencyTitle')}</h1>
          <p className="text-lg text-white mb-4 max-w-md">{t('safety.emergencyBody')}</p>
          <a
            href={`tel:${emergency.number}`}
            className="mb-6 w-full max-w-xs bg-white text-rose-700 py-4 rounded-xl font-bold text-lg"
          >
            {t('tools.emergencyCall')} — {emergency.label}
          </a>
          <button type="button" onClick={() => setShowEmergencyOverlay(false)} className="mrx-btn-primary bg-white/20 text-white border border-white/30">
            {t('auth.close')}
          </button>
        </div>
      )}
    </PageShell>
  );
};

export default SafetyCenter;
