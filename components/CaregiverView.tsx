import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';

const CaregiverView: React.FC<{ token: string }> = ({ token }) => {
  const { t } = useI18n();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/share/caregiver/${token}`)
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setData(d)))
      .catch(() => setError('Network error'));
  }, [token]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-mrx-canvas dark:bg-mrx-canvas-dark">
        <p className="text-rose-600 font-semibold">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mrx-canvas dark:bg-mrx-canvas-dark">
        <div className="w-10 h-10 border-4 border-clinical-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mrx-canvas dark:bg-mrx-canvas-dark p-4 max-w-lg mx-auto space-y-4">
      <div className="mrx-card dark:bg-mrx-panel-dark rounded-2xl p-5 border border-mrx-line dark:border-mrx-line-dark">
        <p className="text-xs text-violet-600 font-semibold">{t('tools.caregiverViewBadge')}</p>
        <h1 className="text-xl font-bold mt-1">{data.patientName}</h1>
        <p className="text-sm text-slate-500">{data.label}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="mrx-card dark:bg-mrx-panel-dark rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-clinical-600">{data.medications?.length ?? 0}</p>
          <p className="text-[10px] text-slate-500">{t('home.dashboard.meds')}</p>
        </div>
        <div className="mrx-card dark:bg-mrx-panel-dark rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-emerald-600">{data.wellness ?? '—'}%</p>
          <p className="text-[10px] text-slate-500">{t('home.dashboard.wellness')}</p>
        </div>
      </div>

      {data.medications?.length > 0 && (
        <div className="mrx-card dark:bg-mrx-panel-dark rounded-2xl p-4 space-y-2">
          <h2 className="text-sm font-bold">{t('home.yourMeds')}</h2>
          {data.medications.map((m: { name: string }, i: number) => (
            <p key={i} className="text-sm text-slate-600 dark:text-slate-300">
              💊 {m.name}
            </p>
          ))}
        </div>
      )}

      {data.warnings?.length > 0 && (
        <div className="rounded-2xl p-4 bg-rose-500/10 border border-rose-500/20">
          <h2 className="text-sm font-bold text-rose-600 mb-2">{t('home.recentWarnings')}</h2>
          {data.warnings.map((w: { title?: string; summary_plain?: string }, i: number) => (
            <p key={i} className="text-xs text-rose-700 dark:text-rose-300 mb-1">
              {w.title || w.summary_plain}
            </p>
          ))}
        </div>
      )}

      <p className="text-[11px] text-slate-400 text-center">{t('report.footerDisclaimer')}</p>
    </div>
  );
};

export default CaregiverView;
