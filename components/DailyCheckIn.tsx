
import React from 'react';
import { SymptomEntry, Medication } from '../types';
import { SYMPTOM_CATEGORIES } from '../constants';
import { useI18n } from '../i18n/I18nContext';
import PageShell from './PageShell';
import PageCard, { PageSectionTitle } from './PageCard';
import { PageGuide } from './ui/PageGuide';

interface Props {
  medications: Medication[];
  onSubmit: (entry: SymptomEntry) => void;
  draft: {
    scores: Record<string, number>;
    factors: { alcohol: any; stress: boolean };
  };
  setDraft: React.Dispatch<React.SetStateAction<{
    scores: Record<string, number>;
    factors: { alcohol: any; stress: boolean };
  }>>;
}

const DailyCheckIn: React.FC<Props> = ({ onSubmit, draft, setDraft }) => {
  const { t } = useI18n();
  const { scores } = draft;

  const updateScore = (id: string, value: number) => {
    setDraft((prev) => ({ ...prev, scores: { ...prev.scores, [id]: value } }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: SymptomEntry = {
      log_iso: new Date().toISOString(),
      sleep_hours: 8,
      alcohol: draft.factors.alcohol,
      high_stress: draft.factors.stress,
      new_supplement: false,
      symptom_scales: { ...scores } as SymptomEntry['symptom_scales'],
      notes: ''
    };
    onSubmit(entry);
  };

  const avgScore =
    Object.values(scores).reduce((a, b) => a + b, 0) / Math.max(1, Object.values(scores).length);

  return (
    <PageShell tabId="checkin" narrow>
      <PageGuide icon="📝" title={t('page.checkin.guideTitle')} text={t('page.checkin.guideText')} className="mb-1" />
      <form onSubmit={handleSubmit} className="space-y-4">
        <PageCard padding="sm" className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-amber-500/5 to-violet-500/5">
          <div>
            <PageSectionTitle>{t('checkin.header')}</PageSectionTitle>
            <p className="text-xs text-slate-500 mt-1">{t('checkin.headerDesc')}</p>
          </div>
          <div className="flex items-center gap-4 text-center">
            <div>
              <p className="text-2xl font-black text-clinical-600">{avgScore.toFixed(1)}</p>
              <p className="text-[10px] text-slate-400">{t('home.stability.title')}</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />{t('checkin.scaleLow')}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />{t('checkin.scaleHigh')}</span>
            </div>
          </div>
        </PageCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SYMPTOM_CATEGORIES.map((cat) => {
            const val = scores[cat.id] || 0;
            const intensityColor = val > 7 ? 'text-red-500' : val > 3 ? 'text-amber-500' : 'text-blue-500';

            return (
              <PageCard key={cat.id} padding="sm" hover>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: `${cat.accent}22` }}
                  >
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{cat.label}</p>
                    <p className="text-[10px] text-slate-400 truncate">{cat.simpleHint}</p>
                  </div>
                  <span className={`text-2xl font-black tabular-nums ${intensityColor}`}>{val}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={val}
                  onChange={(e) => updateScore(cat.id, parseInt(e.target.value, 10))}
                  className="bio-slider w-full"
                  style={{ accentColor: cat.accent }}
                />
              </PageCard>
            );
          })}
        </div>

        <button type="submit" className="w-full mrx-btn-primary py-4 sticky bottom-24 lg:bottom-8 z-20 shadow-lg">
          {t('checkin.save')}
        </button>
      </form>
    </PageShell>
  );
};

export default DailyCheckIn;
