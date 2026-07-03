
import React, { useMemo } from 'react';
import { Medication, SymptomEntry, MedicationEvent, Viewpoint } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SYMPTOM_CATEGORIES } from '../constants';
import PageShell from './PageShell';
import PageCard, { PageSectionTitle } from './PageCard';
import { EmptyState, StatPill, ViewpointTabs } from './ui/MrxUI';
import { useI18n } from '../i18n/I18nContext';

interface Props {
  medications: Medication[];
  checkins: SymptomEntry[];
  events: MedicationEvent[];
  theme: 'light' | 'dark';
  viewpoint: Viewpoint;
  onViewpointChange: (v: Viewpoint) => void;
  onNavigate?: (tab: string) => void;
}

const VIEWPOINT_LINES: Record<Viewpoint, Array<{ key: string; stroke: string }>> = {
  [Viewpoint.CONSERVATIVE]: [
    { key: 'anxiety', stroke: '#ec7063' },
    { key: 'palpitations', stroke: '#e74c3c' },
    { key: 'sleep_quality', stroke: '#af7ac5' }
  ],
  [Viewpoint.BALANCED]: [
    { key: 'sleep_quality', stroke: '#af7ac5' },
    { key: 'mood_low', stroke: '#48c9b0' },
    { key: 'anxiety', stroke: '#ec7063' }
  ],
  [Viewpoint.EXPLORATORY]: [
    { key: 'sleep_quality', stroke: '#af7ac5' },
    { key: 'mood_low', stroke: '#48c9b0' },
    { key: 'anxiety', stroke: '#ec7063' },
    { key: 'irritability', stroke: '#f39c12' },
    { key: 'libido_low', stroke: '#9b59b6' }
  ]
};

const EVENT_ICONS: Record<string, string> = {
  START: '▶️',
  STOP: '⏹️',
  PAUSE: '⏸️',
  RESUME: '▶️',
  DOSE_INCREASE: '⬆️',
  DOSE_DECREASE: '⬇️',
  MISSED_DOSE: '⚠️'
};

function symptomLabel(id: string): string {
  return SYMPTOM_CATEGORIES.find((c) => c.id === id)?.label || id.replace(/_/g, ' ');
}

function symptomIcon(id: string): string {
  return SYMPTOM_CATEGORIES.find((c) => c.id === id)?.icon || '📊';
}

const Timeline: React.FC<Props> = ({
  medications,
  checkins,
  events,
  theme,
  viewpoint,
  onViewpointChange,
  onNavigate
}) => {
  const { t } = useI18n();
  const isDark = theme === 'dark';

  const sortedCheckins = useMemo(
    () => [...checkins].sort((a, b) => new Date(b.log_iso).getTime() - new Date(a.log_iso).getTime()),
    [checkins]
  );

  const chartData = useMemo(
    () =>
      [...checkins]
        .sort((a, b) => new Date(a.log_iso).getTime() - new Date(b.log_iso).getTime())
        .map((c) => ({
          date: new Date(c.log_iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
          ...Object.fromEntries(
            Object.entries(c.symptom_scales).map(([k, v]) => [k, v ?? 0])
          )
        })),
    [checkins]
  );

  const recentEvents = useMemo(
    () =>
      [...events]
        .sort((a, b) => new Date(b.event_iso).getTime() - new Date(a.event_iso).getTime())
        .slice(0, 8),
    [events]
  );

  const avgLatest = useMemo(() => {
    if (!sortedCheckins[0]) return 0;
    const vals = Object.values(sortedCheckins[0].symptom_scales).filter((v): v is number => v != null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }, [sortedCheckins]);

  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const lines = VIEWPOINT_LINES[viewpoint];

  if (checkins.length === 0) {
    return (
      <PageShell tabId="timeline" narrow>
        <EmptyState
          icon="📈"
          title={t('page.timeline.title')}
          description={t('page.timeline.subtitle')}
          ctaLabel={onNavigate ? `${t('timeline.emptyCta')} →` : undefined}
          onCta={onNavigate ? () => onNavigate('checkin') : undefined}
        />
      </PageShell>
    );
  }

  return (
    <PageShell tabId="timeline">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <StatPill label={t('page.timeline.chip1')} value={checkins.length} color="#06b6d4" />
        <StatPill
          label={t('home.stability.title')}
          value={avgLatest.toFixed(1)}
          color={avgLatest > 5 ? '#f59e0b' : '#10b981'}
        />
        <StatPill label={t('home.dashboard.meds')} value={medications.length} color="#3b82f6" />
        <StatPill label={t('page.timeline.chip2')} value={events.length || t('home.dashboard.none')} color="#8b5cf6" />
      </div>

      <ViewpointTabs options={Object.values(Viewpoint)} value={viewpoint} onChange={onViewpointChange} />

      <PageCard padding="sm">
        <PageSectionTitle className="mb-1">{t('timeline.chartTitle')}</PageSectionTitle>
        <p className="text-xs text-slate-500 mb-4">{t('page.timeline.subtitle')}</p>
        <div className="h-[260px] sm:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: textColor }} dy={8} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: textColor }} width={28} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  padding: '12px',
                  backgroundColor: isDark ? '#121216' : '#ffffff',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '12px' }} />
              {lines.map((line) => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  stroke={line.stroke}
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                  name={symptomLabel(line.key)}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </PageCard>

      {recentEvents.length > 0 && (
        <PageCard padding="sm">
          <PageSectionTitle className="mb-3">{t('timeline.medChange')}</PageSectionTitle>
          <div className="space-y-2">
            {recentEvents.map((ev) => {
              const med = medications.find((m) => m.id === ev.med_id);
              return (
                <div
                  key={ev.event_id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-violet-500/5 border border-violet-500/15"
                >
                  <span className="text-xl">{EVENT_ICONS[ev.event_type] || '💊'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{med?.display_name || t('home.dashboard.meds')}</p>
                    <p className="text-[10px] text-slate-500">
                      {ev.event_type.replace(/_/g, ' ')} ·{' '}
                      {new Date(ev.event_iso).toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </PageCard>
      )}

      <PageCard padding="sm">
        <PageSectionTitle className="mb-3">{t('timeline.logHistory')}</PageSectionTitle>
        <div className="space-y-3">
          {sortedCheckins.slice(0, 14).map((entry) => {
            const topSymptoms = Object.entries(entry.symptom_scales)
              .filter(([, v]) => v != null && (v as number) > 0)
              .sort((a, b) => (b[1] as number) - (a[1] as number));

            return (
              <div
                key={entry.log_iso}
                className="rounded-xl border border-mrx-line dark:border-mrx-line-dark p-4 bg-mrx-inset/30 dark:bg-mrx-inset-dark/30"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {new Date(entry.log_iso).toLocaleDateString(undefined, {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </p>
                  {entry.high_stress && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700">
                      stress
                    </span>
                  )}
                </div>

                {topSymptoms.length === 0 ? (
                  <p className="text-xs text-emerald-600 font-medium">{t('safety.allClear')}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {topSymptoms.map(([key, val]) => (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-mrx-panel-dark border border-mrx-line dark:border-mrx-line-dark"
                      >
                        <span>{symptomIcon(key)}</span>
                        {symptomLabel(key)} {val}/10
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PageCard>
    </PageShell>
  );
};

export default Timeline;
