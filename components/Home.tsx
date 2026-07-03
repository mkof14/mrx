import React, { useMemo } from 'react';
import { Medication, SymptomEntry, RiskColor } from '../types';
import { BORDER_COLOR_MAP } from '../constants';
import PageShell from './PageShell';
import PageCard, { PageSectionTitle } from './PageCard';
import { useI18n } from '../i18n/I18nContext';
import {
  MED_COLORS,
  StatPill,
  QuickActionGrid,
  EmptyState,
  LiveDot,
  SectionLabel
} from './ui/MrxUI';

interface Props {
  medications: Medication[];
  checkins: SymptomEntry[];
  analysisResult: any;
  isSyncing: boolean;
  aiError?: string | null;
  onNavigateToReports?: () => void;
  stabilityIndex: number;
  onNavigate?: (tab: string) => void;
}

const Home: React.FC<Props> = ({
  medications,
  checkins,
  analysisResult,
  aiError,
  onNavigateToReports,
  stabilityIndex,
  onNavigate
}) => {
  const { t } = useI18n();

  const summary = analysisResult?.executive_summary?.summary_plain;
  const safetyFlags = analysisResult?.safety_flags || [];
  const interactions = analysisResult?.interaction_findings || [];
  const smartAdvice = (analysisResult?.executive_summary?.smart_advice || []).slice(0, 2);

  const criticalInteractions = useMemo(
    () => interactions.filter((i: any) => i.severity_color === 'RED' || i.severity_color === 'ORANGE').length,
    [interactions]
  );

  const warningCount = safetyFlags.length + criticalInteractions;
  const wellnessPct = Math.round(stabilityIndex * 100);
  const wellnessColor = wellnessPct >= 80 ? '#10b981' : wellnessPct >= 50 ? '#f59e0b' : '#ef4444';

  const lastCheckin = checkins[0];
  const lastLogLabel = useMemo(() => {
    if (!lastCheckin) return t('home.dashboard.noLog');
    const d = new Date(lastCheckin.log_iso);
    if (d.toDateString() === new Date().toDateString()) return t('home.dashboard.today');
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  }, [lastCheckin, t]);

  const topSymptoms = useMemo(() => {
    if (!lastCheckin) return [];
    return Object.entries(lastCheckin.symptom_scales)
      .filter(([, v]) => v != null && (v as number) >= 5)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 3)
      .map(([k, v]) => `${k.replace(/_/g, ' ')} ${v}/10`);
  }, [lastCheckin]);

  const handleQuick = (tab: string) => {
    if (tab === 'reports') onNavigateToReports?.();
    else onNavigate?.(tab);
  };

  const hasData = medications.length > 0 || checkins.length > 0;

  if (!hasData) {
    return (
      <PageShell tabId="home">
        <EmptyState
          icon="💊"
          title={t('home.empty.title')}
          description={t('page.meds.subtitle')}
          ctaLabel={`${t('home.cta.addMed')} →`}
          onCta={() => onNavigate?.('meds')}
          extra={
            <div className="flex justify-center gap-3 text-2xl opacity-80 pt-2">
              <span>⌨️</span><span>📷</span><span>📋</span><span>🎤</span>
            </div>
          }
        />
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <PageCard key={i} padding="xs" className="text-center">
              <span className="w-7 h-7 rounded-lg bg-clinical-600 text-white text-xs font-bold inline-flex items-center justify-center mb-2">{i}</span>
              <p className="text-xs font-bold text-slate-800 dark:text-white">{t(`home.step${i}` as any)}</p>
            </PageCard>
          ))}
        </div>
        <PageCard padding="sm">
          <SectionLabel className="mb-3">{t('home.quickTitle')}</SectionLabel>
          <QuickActionGrid t={t} onAction={handleQuick} />
        </PageCard>
      </PageShell>
    );
  }

  return (
    <PageShell tabId="home">
      {aiError && (
        <div className="rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 px-4 py-2.5 text-sm text-rose-700">{aiError}</div>
      )}

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <StatPill label={t('home.dashboard.meds')} value={medications.length} color="#3b82f6" onClick={() => onNavigate?.('meds')} />
        <StatPill label={t('home.dashboard.wellness')} value={`${wellnessPct}%`} color={wellnessColor} onClick={() => onNavigate?.('checkin')} />
        <StatPill label={t('home.dashboard.warnings')} value={warningCount || t('home.dashboard.none')} color={warningCount ? '#ef4444' : '#94a3b8'} onClick={() => onNavigate?.('safety')} />
        <StatPill label={t('home.dashboard.interactions')} value={interactions.length || t('home.dashboard.none')} color={criticalInteractions ? '#f59e0b' : '#94a3b8'} onClick={() => onNavigate?.('interactions')} />
        <StatPill label={t('home.dashboard.lastLog')} value={lastLogLabel} sub={topSymptoms[0]} color="#8b5cf6" onClick={() => onNavigate?.('checkin')} />
      </div>

      {medications.length > 0 && checkins.length === 0 && (
        <button type="button" onClick={() => onNavigate?.('checkin')} className="w-full flex items-center justify-between rounded-xl bg-amber-500 text-white px-4 py-3 text-sm font-semibold hover:bg-amber-600">
          <span>{t('home.banner.medsTracked').replace('{count}', String(medications.length))}</span>
          <span>{t('nav.checkin')} →</span>
        </button>
      )}

      <button
        type="button"
        onClick={() => onNavigate?.('tools')}
        className="w-full flex items-center gap-4 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 px-4 py-4 text-left hover:scale-[1.01] transition-transform"
      >
        <span className="text-3xl">🧰</span>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{t('nav.tools')}</p>
          <p className="text-xs text-slate-500 mt-0.5">{t('page.tools.subtitle')}</p>
        </div>
        <span className="ml-auto text-indigo-600 font-bold text-sm">→</span>
      </button>

      <PageCard padding="sm">
        <SectionLabel className="mb-3">{t('home.quickTitle')}</SectionLabel>
        <QuickActionGrid t={t} onAction={handleQuick} />
      </PageCard>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 space-y-4">
          {medications.length > 0 && (
            <PageCard padding="sm">
              <div className="flex items-center justify-between mb-3">
                <PageSectionTitle>{t('home.yourMeds')}</PageSectionTitle>
                <button type="button" onClick={() => onNavigate?.('meds')} className="text-xs font-semibold text-clinical-600 hover:underline">
                  {t('home.viewAll')} →
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {medications.slice(0, 8).map((med, idx) => {
                  const c = MED_COLORS[idx % MED_COLORS.length];
                  return (
                    <div
                      key={med.id}
                      className="shrink-0 flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-xl border border-mrx-line dark:border-mrx-line-dark bg-mrx-inset/30 min-w-[130px]"
                      style={{ borderLeftWidth: 3, borderLeftColor: c }}
                    >
                      <span className="text-lg">💊</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{med.display_name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{med.current_dose.amount} {med.current_dose.unit}</p>
                      </div>
                    </div>
                  );
                })}
                <button type="button" onClick={() => onNavigate?.('meds')} className="shrink-0 w-10 rounded-xl border-2 border-dashed border-mrx-line flex items-center justify-center text-slate-300 hover:border-clinical-500 hover:text-clinical-500">+</button>
              </div>
            </PageCard>
          )}

          <PageCard padding="sm" className="bg-gradient-to-br from-clinical-500/5 to-transparent">
            <LiveDot label={t('home.summaryTitle')} />
            <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100 leading-snug mt-2">{summary || t('home.summaryFallback')}</p>
          </PageCard>

          {safetyFlags.length > 0 && (
            <div className="space-y-2">
              <SectionLabel>{t('home.recentWarnings')}</SectionLabel>
              {safetyFlags.slice(0, 2).map((flag: any, i: number) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onNavigate?.('safety')}
                  className={`w-full text-left rounded-xl border-2 px-4 py-3 flex gap-3 items-start ${BORDER_COLOR_MAP[flag.risk_color as RiskColor] || 'border-slate-200'}`}
                >
                  <span>⚠️</span>
                  <p className="text-sm leading-snug">{flag.trigger_plain}</p>
                </button>
              ))}
            </div>
          )}

          {smartAdvice.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {smartAdvice.map((advice: string, i: number) => (
                <PageCard key={i} padding="xs" className="flex gap-2 items-start bg-mrx-inset/40">
                  <span>💡</span>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">{advice}</p>
                </PageCard>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-3">
          <PageCard padding="sm" className="text-center">
            <SectionLabel className="mb-2">{t('home.stability.title')}</SectionLabel>
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="40" strokeWidth="7" fill="transparent" className="text-gray-200 dark:text-zinc-700" stroke="currentColor" />
                <circle cx="48" cy="48" r="40" strokeWidth="7" fill="transparent" stroke={wellnessColor} strokeDasharray={251} strokeDashoffset={251 - 251 * stabilityIndex} strokeLinecap="round" className="transition-all duration-700" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-black">{wellnessPct}%</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">{wellnessPct >= 80 ? t('home.stability.good') : wellnessPct >= 50 ? t('home.stability.ok') : t('home.stability.bad')}</p>
          </PageCard>

          {criticalInteractions > 0 && (
            <button type="button" onClick={() => onNavigate?.('interactions')} className="w-full rounded-xl border-2 border-orange-300 bg-orange-50 dark:bg-orange-900/20 p-4 text-left">
              <p className="text-2xl font-black text-orange-600">{criticalInteractions}</p>
              <p className="text-xs font-semibold text-orange-800 mt-1">{t('home.dashboard.interactions')}</p>
            </button>
          )}

          <button type="button" onClick={onNavigateToReports} className="w-full rounded-xl bg-clinical-600 hover:bg-clinical-700 text-white p-4 text-left transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <p className="font-bold text-sm">{t('nav.reports')}</p>
                <p className="text-[10px] opacity-80">{t('home.reportHint')}</p>
              </div>
            </div>
          </button>

          {lastCheckin && topSymptoms.length > 0 && (
            <PageCard padding="sm">
              <SectionLabel className="mb-2">{t('home.dashboard.lastLog')}</SectionLabel>
              <ul className="space-y-1">
                {topSymptoms.map((s) => (
                  <li key={s} className="text-xs text-slate-600 capitalize flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />{s}
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => onNavigate?.('timeline')} className="text-[10px] font-semibold text-clinical-600 mt-2 hover:underline">{t('nav.timeline')} →</button>
            </PageCard>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default Home;
