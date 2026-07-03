
import React, { useState, useMemo, useEffect } from 'react';
import { Medication, RiskColor, UserProfile } from '../types';

import { COLOR_MAP, BORDER_COLOR_MAP, TEXT_COLOR_MAP } from '../constants';
import {
  countMedPairs,
  findInteractionForPair,
  mergeInteractionLists,
  type InteractionFinding
} from '../utils/interactions';
import PageShell from './PageShell';
import PageCard from './PageCard';
import { EmptyState, SectionLabel, StatPill } from './ui/MrxUI';
import { useI18n } from '../i18n/I18nContext';
import { api } from '../services/apiClient';

interface Props {
  medications: Medication[];
  profile: UserProfile;
  analysisResult: any;
  onNavigate?: (tab: string) => void;
}

const InteractionMap: React.FC<Props> = ({ medications, analysisResult, onNavigate }) => {
  const { t } = useI18n();
  const [selectedCell, setSelectedCell] = useState<InteractionFinding | null>(null);
  const [hoveredMedId, setHoveredMedId] = useState<string | null>(null);
  const [verified, setVerified] = useState<InteractionFinding[]>([]);
  const [loadingVerified, setLoadingVerified] = useState(false);

  const activeMeds = useMemo(
    () => medications.filter((m) => m.status === 'ACTIVE'),
    [medications]
  );

  useEffect(() => {
    if (activeMeds.length < 2) {
      setVerified([]);
      return;
    }
    let cancelled = false;
    setLoadingVerified(true);
    api.medications
      .interactions(activeMeds)
      .then((res) => {
        if (!cancelled) setVerified((res.interactions || []) as InteractionFinding[]);
      })
      .catch(() => {
        if (!cancelled) setVerified([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingVerified(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeMeds]);

  const interactions = useMemo(
    () =>
      mergeInteractionLists(
        verified,
        (analysisResult?.interaction_findings || []) as InteractionFinding[]
      ),
    [verified, analysisResult]
  );

  const pairCount = countMedPairs(activeMeds);

  const getInteraction = (med1: Medication, med2: Medication) =>
    findInteractionForPair(med1, med2, interactions);

  if (activeMeds.length < 1) {
    return (
      <PageShell tabId="interactions" narrow>
        <EmptyState
          icon="🧩"
          title={t('interactions.emptyTitle')}
          description={t('interactions.emptyDesc')}
          ctaLabel={onNavigate ? `${t('home.quick.addMed')} →` : undefined}
          onCta={onNavigate ? () => onNavigate('meds') : undefined}
        />
      </PageShell>
    );
  }

  if (activeMeds.length === 1) {
    return (
      <PageShell tabId="interactions" narrow>
        <PageCard padding="sm" className="text-center space-y-4">
          <span className="text-5xl">💊</span>
          <p className="text-sm font-semibold text-slate-800 dark:text-white">{t('interactions.needTwoMeds')}</p>
          <div className="rounded-xl bg-mrx-inset dark:bg-mrx-inset-dark p-4 text-left">
            <p className="text-xs text-slate-500 mb-1">{t('home.yourMeds')}</p>
            <p className="font-bold">{activeMeds[0].display_name}</p>
          </div>
          {onNavigate && (
            <button type="button" onClick={() => onNavigate('meds')} className="mrx-btn-primary px-6 py-3">
              {t('home.quick.addMed')} →
            </button>
          )}
        </PageCard>
      </PageShell>
    );
  }

  return (
    <PageShell tabId="interactions">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <StatPill label={t('home.dashboard.meds')} value={activeMeds.length} color="#3b82f6" />
        <StatPill
          label={t('page.interactions.chip2')}
          value={t('interactions.pairsCount').replace('{count}', String(pairCount))}
          color="#8b5cf6"
        />
        <StatPill
          label={t('home.dashboard.interactions')}
          value={interactions.length || t('home.dashboard.none')}
          color={interactions.length ? '#f59e0b' : '#10b981'}
        />
      </div>

      {loadingVerified && (
        <PageCard padding="sm" className="flex items-center gap-3 text-sm text-slate-500">
          <div className="w-5 h-5 border-2 border-clinical-600 border-t-transparent rounded-full animate-spin" />
          {t('interactions.loading')}
        </PageCard>
      )}

      {!analysisResult && !loadingVerified && (
        <PageCard padding="sm" className="bg-amber-500/5 border-amber-200 dark:border-amber-900">
          <p className="text-sm text-amber-800 dark:text-amber-200">{t('interactions.analysisHint')}</p>
          {onNavigate && (
            <button type="button" onClick={() => onNavigate('checkin')} className="text-xs font-bold text-clinical-600 mt-2 hover:underline">
              {t('timeline.emptyCta')} →
            </button>
          )}
        </PageCard>
      )}

      {interactions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {interactions.map((int, i) => (
            <PageCard
              key={`${int.ingredient_a}-${int.ingredient_b}-${i}`}
              padding="sm"
              hover
              className={`cursor-pointer border-2 ${BORDER_COLOR_MAP[(int.severity_color || 'GRAY') as RiskColor]}`}
              onClick={() => setSelectedCell(int)}
            >
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">{int.severity_color === 'RED' ? '🆘' : '⚠️'}</span>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {int.ingredient_a} + {int.ingredient_b}
                  </h4>
                  <p className={`text-[10px] font-semibold mt-1 ${TEXT_COLOR_MAP[(int.severity_color || 'GRAY') as RiskColor]}`}>
                    {int.severity_color || 'INFO'}
                    {int.source === 'rxnav' ? ' · RxNav' : int.source === 'ai' ? ' · AI' : ''}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                {int.summary_plain}
              </p>
            </PageCard>
          ))}
        </div>
      )}

      {!loadingVerified && interactions.length === 0 && (
        <PageCard padding="sm" className="text-center py-6">
          <span className="text-4xl">🛡️</span>
          <p className="text-sm font-semibold text-emerald-600 mt-3">{t('interactions.noKnown')}</p>
        </PageCard>
      )}

      <PageCard padding="sm" className="overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <SectionLabel>{t('page.interactions.title')}</SectionLabel>
            <p className="text-xs text-slate-500 mt-1">{t('page.interactions.subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { label: t('interactions.legendCritical'), color: 'RED' },
              { label: t('interactions.legendWarning'), color: 'ORANGE' },
              { label: t('interactions.legendMinor'), color: 'YELLOW' }
            ].map((legend) => (
              <div key={legend.color} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${COLOR_MAP[legend.color as RiskColor]}`} />
                <span className="text-[10px] font-semibold text-slate-500">{legend.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar pb-2">
          <table className="w-full border-separate border-spacing-1 min-w-[320px]">
            <thead>
              <tr>
                <th className="p-2 w-24" />
                {activeMeds.map((med) => (
                  <th
                    key={med.id}
                    className={`p-2 text-[9px] font-bold uppercase tracking-wide text-left min-w-[72px] max-w-[100px] truncate ${
                      hoveredMedId === med.id ? 'text-amber-500' : 'text-slate-400'
                    }`}
                    title={med.display_name}
                  >
                    {med.display_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeMeds.map((medRow, idx) => (
                <tr key={medRow.id}>
                  <td
                    className={`p-2 text-[9px] font-bold uppercase text-right truncate max-w-[100px] ${
                      hoveredMedId === medRow.id ? 'text-amber-500' : 'text-slate-500'
                    }`}
                    title={medRow.display_name}
                    onMouseEnter={() => setHoveredMedId(medRow.id)}
                    onMouseLeave={() => setHoveredMedId(null)}
                  >
                    {medRow.display_name}
                  </td>
                  {activeMeds.map((medCol, idy) => {
                    const interaction = getInteraction(medRow, medCol);
                    const riskColor = (interaction?.severity_color || 'GRAY') as RiskColor;
                    const isSelf = idx === idy;

                    return (
                      <td key={medCol.id} className="p-1">
                        <button
                          type="button"
                          disabled={isSelf}
                          onMouseEnter={() => setHoveredMedId(medRow.id)}
                          onMouseLeave={() => setHoveredMedId(null)}
                          onClick={() => interaction && setSelectedCell(interaction)}
                          className={`w-full h-10 rounded-lg transition-all border flex items-center justify-center text-[8px] font-bold ${
                            isSelf
                              ? 'bg-mrx-inset dark:bg-mrx-inset-dark opacity-30 cursor-not-allowed border-transparent'
                              : interaction
                                ? `${BORDER_COLOR_MAP[riskColor]} ${COLOR_MAP[riskColor]} hover:scale-105`
                                : 'border-emerald-200 dark:border-emerald-900 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {isSelf ? '—' : interaction ? interaction.severity_color : 'OK'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageCard>

      {selectedCell && (
        <div className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-md flex items-center justify-center p-6">
          <div className="mrx-card dark:bg-mrx-panel-dark max-w-2xl w-full rounded-2xl overflow-hidden shadow-mrx-lg">
            <div className="bg-mrx-inset dark:bg-mrx-inset-dark p-5 border-b border-mrx-line dark:border-mrx-line-dark">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-xs font-semibold text-clinical-500 mb-1">{t('page.interactions.title')}</p>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                    {selectedCell.ingredient_a} + {selectedCell.ingredient_b}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCell(null)}
                  className="w-9 h-9 rounded-xl bg-mrx-panel dark:bg-mrx-panel-dark text-lg hover:bg-gray-200 dark:hover:bg-zinc-700"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-base text-gray-700 dark:text-zinc-300 leading-relaxed">{selectedCell.summary_plain}</p>
              {selectedCell.mechanism && (
                <div className="p-4 bg-mrx-inset dark:bg-mrx-inset-dark rounded-2xl border border-mrx-line dark:border-mrx-line-dark">
                  <p className="text-sm text-gray-600 dark:text-zinc-400">{selectedCell.mechanism}</p>
                </div>
              )}
              {selectedCell.watch_for && selectedCell.watch_for.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-rose-500">{t('page.interactions.chip3')}</p>
                  {selectedCell.watch_for.map((s, j) => (
                    <div
                      key={j}
                      className="flex items-center gap-3 p-3 rounded-xl bg-rose-500/5 text-rose-600 border border-rose-500/10 text-sm"
                    >
                      <span>🚨</span> {s}
                    </div>
                  ))}
                </div>
              )}
              <button type="button" onClick={() => setSelectedCell(null)} className="w-full mrx-btn-primary py-4">
                {t('auth.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default InteractionMap;
